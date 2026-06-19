require("dotenv").config();

const express = require("express");
const axios = require("axios");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());


// SERVE FRONTEND FILES
app.use(express.static(path.join(__dirname, "public")));


// SUPABASE
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);


// ENV VARIABLES
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;


// HOME ROUTE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// CRM ROUTE
app.get("/crm", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "crm.html"));
});


// WEBHOOK VERIFICATION
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === VERIFY_TOKEN
    ) {
        console.log("WEBHOOK VERIFIED");
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
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

        // SAVE LEAD
        const { error } = await supabase
            .from("leads")
            .insert([
                {
                    organization_id:
                        "b2f35575-ff3f-4be4-85b3-c5ca90c35213",
                    name: "WhatsApp Lead",
                    phone: from,
                    interest: text,
                    status: "New"
                }
            ]);

        if (error) {
            console.log(
                "Supabase insert error:",
                error.message
            );
        }

        // REPLY TO USER
        await axios.post(
            `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: from,
                text: {
                    body:
`Welcome to Sauti Tamu Music School 🎵

Before we continue, are you located in Nairobi?

Reply YES or NO.`
                }
            },
            {
                headers: {
                    Authorization:
                        `Bearer ${WHATSAPP_TOKEN}`,
                    "Content-Type":
                        "application/json"
                }
            }
        );

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
    console.log(
        `Server running on port ${PORT}`
    );
});
