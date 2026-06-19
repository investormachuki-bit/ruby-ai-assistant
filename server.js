require("dotenv").config();

const express = require("express");
const axios = require("axios");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;


// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("Ruby AI WhatsApp backend running...");
});


// WEBHOOK VERIFICATION (Meta checks this)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});


// RECEIVE WHATSAPP MESSAGES
app.post("/webhook", async (req, res) => {
  try {
    console.log(
      "Incoming webhook:",
      JSON.stringify(req.body, null, 2)
    );

    const message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body?.trim();

    // Save lead into Supabase
    const { error } = await supabase.from("leads").insert([
      {
        phone: from,
        name: "WhatsApp Lead",
        interest: text,
        status: "New"
      }
    ]);

    if (error) {
      console.log("Supabase insert error:", error.message);
    }

    // Reply back
    await axios.post(
      `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: from,
        text: {
          body: `Welcome to Sauti Tamu 🎵

Are you in Nairobi? Reply YES or NO`
        }
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.sendStatus(200);

  } catch (error) {
    console.log("Webhook error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
