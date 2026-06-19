import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TENANT_ID = "8eaca035-c542-4ffb-bf0a-112442006376";


// SEND WHATSAPP MESSAGE
async function sendMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v23.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.log("Send error:", error.response?.data || error.message);
  }
}


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

    console.log("Incoming:", JSON.stringify(value, null, 2));

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


    // FIND SESSION
    const { data: session } = await supabase
      .from("conversation_sessions")
      .select("*")
      .eq("phone", from)
      .maybeSingle();


    // START FLOW
    if (!session) {
      const { data: flow } = await supabase
        .from("flows")
        .select("*")
        .eq("tenant_id", TENANT_ID)
        .eq("trigger_type", "keyword")
        .eq("trigger_value", text.toLowerCase())
        .eq("is_active", true)
        .single();

      if (!flow) {
        await sendMessage(
          from,
          "No active flow found. Please type HI to begin."
        );
        return res.sendStatus(200);
      }

      // GET FIRST NODE
      const { data: firstNode } = await supabase
        .from("flow_nodes")
        .select("*")
        .eq("flow_id", flow.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      await supabase.from("conversation_sessions").insert({
        organization_id: "b2f35575-ff3f-4be4-85b3-c5ca90c35213",
        phone: from,
        current_node_id: firstNode.id,
        collected_data: {},
        status: "active"
      });

      await sendMessage(from, firstNode.content.text);

      return res.sendStatus(200);
    }


    // SESSION COMPLETE
    if (session.status === "completed") {
      await sendMessage(
        from,
        "Your request is already recorded. Reply HI to start again."
      );
      return res.sendStatus(200);
    }


    // GET CURRENT NODE
    const { data: currentNode } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("id", session.current_node_id)
      .single();


    // SAVE USER RESPONSE
    const updatedData = {
      ...(session.collected_data || {}),
      [currentNode.title]: text
    };


    // FIND NEXT EDGE
    const { data: edge } = await supabase
      .from("flow_edges")
      .select("*")
      .eq("source_node_id", currentNode.id)
      .single();


    // END FLOW
    if (!edge) {
      await supabase
        .from("conversation_sessions")
        .update({
          collected_data: updatedData,
          status: "completed"
        })
        .eq("id", session.id);

      await sendMessage(
        from,
        "Thank you. Your request has been completed."
      );

      return res.sendStatus(200);
    }


    // GET NEXT NODE
    const { data: nextNode } = await supabase
      .from("flow_nodes")
      .select("*")
      .eq("id", edge.target_node_id)
      .single();


    // UPDATE SESSION
    await supabase
      .from("conversation_sessions")
      .update({
        current_node_id: nextNode.id,
        collected_data: updatedData
      })
      .eq("id", session.id);


    // SAVE MESSAGES
    await supabase.from("messages").insert({
      conversation_id: session.id,
      role: "user",
      content: text
    });

    await supabase.from("messages").insert({
      conversation_id: session.id,
      role: "assistant",
      content: nextNode.content.text
    });


    // SEND NEXT MESSAGE
    await sendMessage(from, nextNode.content.text);

    // FINAL NODE
    if (nextNode.type === "end") {
      await supabase
        .from("conversation_sessions")
        .update({
          status: "completed"
        })
        .eq("id", session.id);
    }

    return res.sendStatus(200);

  } catch (error) {
    console.log("Webhook error:", error.response?.data || error.message);
    return res.sendStatus(500);
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

      
