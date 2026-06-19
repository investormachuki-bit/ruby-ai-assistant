import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TENANT_ID = process.env.DEFAULT_TENANT_ID;

app.get("/", (req, res) => {
  res.send("Ruby Flow Engine Running");
});


// WEBHOOK VERIFY
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});


// WEBHOOK RECEIVE
app.post("/webhook", async (req, res) => {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;

    console.log("VALUE OBJECT:", JSON.stringify(value, null, 2));

    // Ignore statuses
    if (value?.statuses && !value?.messages) {
      console.log("Status update only");
      return res.sendStatus(200);
    }

    const incomingMessage = value?.messages?.[0];

    if (!incomingMessage) {
      return res.sendStatus(200);
    }

    const from = incomingMessage.from;
    const text = incomingMessage.text?.body?.trim();

    console.log("FROM:", from);
    console.log("TEXT:", text);

    // 1. FIND OR CREATE CONTACT
    let { data: contact } = await supabase
      .from("contacts")
      .select("*")
      .eq("phone", from)
      .eq("tenant_id", TENANT_ID)
      .single();

    if (!contact) {
      const { data: newContact } = await supabase
        .from("contacts")
        .insert([
          {
            tenant_id: TENANT_ID,
            phone: from
          }
        ])
        .select()
        .single();

      contact = newContact;
    }

    // 2. FIND OPEN CONVERSATION
    let { data: conversation } = await supabase
      .from("conversations")
      .select("*")
      .eq("contact_id", contact.id)
      .eq("status", "open")
      .single();

    // 3. CREATE NEW CONVERSATION IF NONE
    if (!conversation) {
      const { data: flow } = await supabase
        .from("flows")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .eq("is_active", true)
        .single();

      const { data: firstNode } = await supabase
        .from("flow_nodes")
        .select("*")
        .eq("flow_id", flow.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      const { data: channel } = await supabase
        .from("channels")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .eq("type", "whatsapp")
        .single();

      const { data: newConversation } = await supabase
        .from("conversations")
        .insert([
          {
            tenant_id: TENANT_ID,
            contact_id: contact.id,
            channel_id: channel.id,
            current_node_id: firstNode.id,
            status: "open"
          }
        ])
        .select()
        .single();

      conversation = newConversation;

      await sendMessage(from, firstNode.content.question);

      return res.sendStatus(200);
    }

    // SAVE CUSTOMER MESSAGE
    await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        sender_type: "customer",
        content: text
      }
    ]);

    // CURRENT NODE
    const { data: currentNode } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("id", conversation.current_node_id)
      .single();

    // SAVE DATA TO CONTACT METADATA
    const fieldName = currentNode.content?.field;

    const updatedMetadata = {
      ...(contact.metadata || {}),
      [fieldName]: text
    };

    await supabase
      .from("contacts")
      .update({
        metadata: updatedMetadata
      })
      .eq("id", contact.id);

    // FIND NEXT NODE THROUGH EDGE
    const { data: edge } = await supabase
      .from("flow_edges")
      .select("*")
      .eq("source_node_id", currentNode.id)
      .single();

    // END FLOW
    if (!edge) {
      await supabase
        .from("conversations")
        .update({
          status: "closed"
        })
        .eq("id", conversation.id);

      await supabase.from("leads").insert([
        {
          tenant_id: TENANT_ID,
          phone: from,
          data: updatedMetadata,
          status: "qualified",
          source: "whatsapp"
        }
      ]);

      await sendMessage(
        from,
        "Thank you. Your information has been received successfully."
      );

      return res.sendStatus(200);
    }

    // LOAD NEXT NODE
    const { data: nextNode } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("id", edge.target_node_id)
      .single();

    // UPDATE CONVERSATION POINTER
    await supabase
      .from("conversations")
      .update({
        current_node_id: nextNode.id
      })
      .eq("id", conversation.id);

    // SAVE BOT MESSAGE
    await supabase.from("messages").insert([
      {
        conversation_id: conversation.id,
        sender_type: "bot",
        content: nextNode.content.question
      }
    ]);

    // SEND NEXT QUESTION
    await sendMessage(from, nextNode.content.question);

    return res.sendStatus(200);

  } catch (error) {
    console.log(
      "Webhook error:",
      error.response?.data || error.message
    );

    return res.sendStatus(500);
  }
});


async function sendMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: {
        body
      }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
