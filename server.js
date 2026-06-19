require("dotenv").config();
const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ORGANIZATION_ID = "b2f35575-ff3f-4be4-85b3-c5ca90c35213";


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
    console.log(
      "Send message error:",
      error.response?.data || error.message
    );
  }
}


// VERIFY WEBHOOK
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


// RECEIVE WEBHOOK
app.post("/webhook", async (req, res) => {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;

    console.log("Incoming webhook:", JSON.stringify(value, null, 2));

    // Ignore status updates
    if (value?.statuses && !value?.messages) {
      console.log("Status update only");
      return res.sendStatus(200);
    }

    const incomingMessage = value?.messages?.[0];

    if (!incomingMessage) {
      console.log("No message found");
      return res.sendStatus(200);
    }

    const from = incomingMessage.from;
    const text = incomingMessage.text?.body?.trim();

    console.log("FROM:", from);
    console.log("TEXT:", text);

    // FIND EXISTING SESSION
    let { data: session } = await supabase
      .from("conversation_sessions")
      .select("*")
      .eq("phone", from)
      .single();

    // START NEW SESSION
    if (!session) {
      const { data: firstStep } = await supabase
        .from("qualification_steps")
        .select("*")
        .eq("organization_id", ORGANIZATION_ID)
        .order("step_order", { ascending: true })
        .limit(1)
        .single();

      const { data: newSession } = await supabase
        .from("conversation_sessions")
        .insert({
          organization_id: ORGANIZATION_ID,
          phone: from,
          current_step: firstStep.step_name,
          current_step_order: firstStep.step_order,
          collected_data: {},
          status: "active"
        })
        .select()
        .single();

      await sendMessage(from, firstStep.question);

      return res.sendStatus(200);
    }

    // SAVE USER REPLY
    await supabase.from("messages").insert({
      conversation_id: session.id,
      role: "user",
      content: text
    });

    // UPDATE COLLECTED DATA
    const updatedData = {
      ...(session.collected_data || {}),
      [session.current_step]: text
    };

    const nextStepOrder = session.current_step_order + 1;

    const { data: nextStep } = await supabase
      .from("qualification_steps")
      .select("*")
      .eq("organization_id", ORGANIZATION_ID)
      .eq("step_order", nextStepOrder)
      .single();

    // END OF FLOW
    if (!nextStep) {
      await supabase
        .from("conversation_sessions")
        .update({
          collected_data: updatedData,
          status: "completed"
        })
        .eq("id", session.id);

      await supabase.from("leads").insert({
        organization_id: ORGANIZATION_ID,
        phone: from,
        status: "Qualified"
      });

      await sendMessage(
        from,
        "Thank you. Your SaaS consultation request has been received successfully. Our team will contact you shortly."
      );

      return res.sendStatus(200);
    }

    // UPDATE SESSION
    await supabase
      .from("conversation_sessions")
      .update({
        current_step: nextStep.step_name,
        current_step_order: nextStep.step_order,
        collected_data: updatedData
      })
      .eq("id", session.id);

    // SAVE BOT QUESTION
    await supabase.from("messages").insert({
      conversation_id: session.id,
      role: "assistant",
      content: nextStep.question
    });

    // SEND NEXT QUESTION
    await sendMessage(from, nextStep.question);

    return res.sendStatus(200);

  } catch (error) {
    console.log(
      "Webhook error:",
      error.response?.data || error.message
    );

    return res.sendStatus(500);
  }
});


// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
