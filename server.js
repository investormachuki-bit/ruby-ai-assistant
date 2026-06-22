import express from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(bodyParser.json());
app.use(express.static("."));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.get("/", (req, res) => {
  res.send("Ruby AI running...");
});

/*
=========================================
FLOW SAVE
=========================================
*/
app.post("/save-flow", async (req, res) => {
  try {
    const { tenant_id, flow_name, nodes, edges } = req.body;

    const { data, error } = await supabase
      .from("flow_builders")
      .insert([
        {
          tenant_id,
          flow_name,
          nodes,
          edges
        }
      ]);

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

/*
=========================================
GET FLOW
=========================================
*/
app.get("/flow/:tenant_id", async (req, res) => {
  const tenant_id = req.params.tenant_id;

  const { data, error } = await supabase
    .from("flow_builders")
    .select("*")
    .eq("tenant_id", tenant_id)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data[0]);
});

/*
=========================================
WHATSAPP WEBHOOK
=========================================
*/
app.post("/webhook", async (req, res) => {
  try {
    const incoming = req.body;

    const phone = incoming.phone;
    const message = incoming.message;
    const tenant_id = incoming.tenant_id;

    if (!phone || !tenant_id) {
      return res.status(400).json({
        error: "phone and tenant_id required"
      });
    }

    /*
    FIND SESSION
    */
    let { data: session } = await supabase
      .from("conversation_sessions")
      .select("*")
      .eq("phone", phone)
      .eq("tenant_id", tenant_id)
      .single();

    /*
    /*
CREATE SESSION IF NONE
*/
if (!session) {
  const { data: newSession, error: sessionError } = await supabase
    .from("conversation_sessions")
    .insert([
      {
  phone,
  organization_id: tenant_id,
  current_step: 0
}
    ])
    .select()
    .single();

  if (sessionError) {
    console.error("Session creation error:", sessionError);

    return res.status(500).json({
      error: sessionError.message
    });
  }

  session = newSession;
}

/*
SAFETY CHECK
*/
if (!session) {
  return res.status(500).json({
    error: "Session could not be created"
  });
}

    /*
    LOAD FLOW
    */
    const { data: flow } = await supabase
      .from("flow_builders")
      .select("*")
      .eq("organization_id", tenant_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!flow) {
      return res.json({
        reply: "No active flow found."
      });
    }

    const nodes = flow.nodes || [];

    /*
    SAVE USER MESSAGE
    */
    if (message) {
      await supabase.from("messages").insert([
        {
          tenant_id,
          phone,
          content: message,
          step: session.current_step
        }
      ]);
    }

    /*
    NEXT STEP
    */
    const nextNode = nodes[session.current_step];

    if (!nextNode) {
      return res.json({
        reply: "Flow completed."
      });
    }

    /*
    ADVANCE SESSION
    */
    await supabase
      .from("conversation_sessions")
      .update({
        current_step: session.current_step + 1
      })
      .eq("id", session.id);

    return res.json({
      reply: nextNode.label
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
});

/*
=========================================
PORT
=========================================
*/
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
