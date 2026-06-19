import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();

app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// VERIFY WEBHOOK

app.get("/webhook", (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {
        return res.status(200).send(challenge);
    }

    res.sendStatus(403);
});

// RECEIVE MESSAGES

app.post("/webhook", async (req, res) => {

    console.log(
        JSON.stringify(req.body, null, 2)
    );

    res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
    console.log(
        `Server running on port ${process.env.PORT}`
    );
});
