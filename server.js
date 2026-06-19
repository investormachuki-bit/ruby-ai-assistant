import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ENV
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CRM
app.get("/crm", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "crm.html"));
});

// Privacy Policy (required by Meta)
app.get("/privacy", (req, res) => {
  res.send(`
    <h1>Privacy Policy</h1>
    <p>
      Ruby AI respects your privacy. We collect only data needed for
      customer communication, lesson booking, and service delivery.
      We do not sell or share your data with third parties.
    </p>
  `);
});

// Webhook verify
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WEBHOOK VERIFIED");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Webhook receive
app.post("/webhook", async (req, res) => {
  try {
    console.log("Incoming webhook:", JSON.stringify(req.body, null, 2));

    const value = req.body?.entry?.[0]?.changes?.[0]?.value;

    // Ignore statuses
    if (value?.statuses && !value?.messages) {
  console.log("Status update only");
  return res.sendStatus(200);
}

    const incomingMessage = value?.messages?.[0];

    if (!incomingMessage) {
      console.log("No incoming message");
      return res.sendStatus(200);
    }

    const from = incomingMessage.from;
    const text = incomingMessage.text?.body?.trim().toLowerCase();

    console.log("FROM:", from);
    console.log("TEXT:", text);

    // Check session
    let { data: session } = await supabase
      .from("whatsapp_sessions")
      .select("*")
      .eq("phone", from)
      .single();

    console.log("SESSION:", session);

    // New user
    if (!session) {
      await supabase.from("whatsapp_sessions").insert([
        {
          phone: from,
          step: "location",
          data: {}
        }
      ]);

      await sendMessage(
        from,
`Welcome to Sauti Tamu Music School 🎵

Before we continue, are you located in Nairobi?

Reply YES or NO.`
      );

      return res.sendStatus(200);
    }

    // Step 1: Location
    if (session.step === "location") {
      if (text === "no") {
        await sendMessage(
          from,
          "Currently we only serve Nairobi clients. Thank you."
        );
        return res.sendStatus(200);
      }

      if (text === "yes") {
        await supabase
          .from("whatsapp_sessions")
          .update({ step: "instrument" })
          .eq("phone", from);

        await sendMessage(
          from,
`Great 🎵

Which instrument are you interested in?

1. Piano
2. Guitar
3. Violin
4. Drums
5. Voice`
        );

        return res.sendStatus(200);
      }
    }

    // Step 2: Instrument
    if (session.step === "instrument") {
      const instruments = {
        "1": "Piano",
        "2": "Guitar",
        "3": "Violin",
        "4": "Drums",
        "5": "Voice"
      };

      const chosen = instruments[text];

      if (!chosen) {
        await sendMessage(from, "Reply with 1, 2, 3, 4 or 5.");
        return res.sendStatus(200);
      }

      await supabase
        .from("whatsapp_sessions")
        .update({
          step: "student_type",
          data: {
            ...session.data,
            instrument: chosen
          }
        })
        .eq("phone", from);

      await sendMessage(
        from,
`Who is the student?

1. Child
2. Adult`
      );

      return res.sendStatus(200);
    }

    // Step 3: Student type
    if (session.step === "student_type") {
      const studentType =
        text === "1"
          ? "Child"
          : text === "2"
          ? "Adult"
          : null;

      if (!studentType) {
        await sendMessage(from, "Reply 1 for Child or 2 for Adult.");
        return res.sendStatus(200);
      }

      await supabase
        .from("whatsapp_sessions")
        .update({
          step: "age",
          data: {
            ...session.data,
            student_type: studentType
          }
        })
        .eq("phone", from);

      await sendMessage(from, "How old is the student?");
      return res.sendStatus(200);
    }

    // Step 4: Age
    if (session.step === "age") {
      await supabase
        .from("whatsapp_sessions")
        .update({
          step: "schedule",
          data: {
            ...session.data,
            age: text
          }
        })
        .eq("phone", from);

      await sendMessage(
        from,
`Preferred lesson time?

1. Weekday
2. Weekend
3. Flexible`
      );

      return res.sendStatus(200);
    }

    // Step 5: Schedule
    if (session.step === "schedule") {
      const schedules = {
        "1": "Weekday",
        "2": "Weekend",
        "3": "Flexible"
      };

      const chosen = schedules[text];

      if (!chosen) {
        await sendMessage(from, "Reply 1, 2 or 3.");
        return res.sendStatus(200);
      }

      const finalData = {
        ...session.data,
        schedule: chosen
      };

      // Save lead
      await supabase.from("leads").insert([
        {
          organization_id: "b2f35575-ff3f-4be4-85b3-c5ca90c35213",
          name: "WhatsApp Lead",
          phone: from,
          interest: finalData.instrument,
          status: "Qualified"
        }
      ]);

      // Delete session
      await supabase
        .from("whatsapp_sessions")
        .delete()
        .eq("phone", from);

      await sendMessage(
        from,
`Great 🎵

Book your FREE trial lesson here:

https://calendar.app.google/YUyShyEXNa4DVoqcA`
      );

      return res.sendStatus(200);
    }

    return res.sendStatus(200);
  } catch (error) {
    console.log("Webhook error:", error.response?.data || error.message);
    return res.sendStatus(500);
  }
});

// Send message helper
async function sendMessage(to, body) {
  await axios.post(
    `https://graph.facebook.com/v25.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
