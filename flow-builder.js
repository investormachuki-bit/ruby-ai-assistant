window.onload = function () {
  let nodes = [];
  let edges = [];
  let count = 1;

  const app = document.getElementById("app");
  const addMessageBtn = document.getElementById("addMessage");
  const addQuestionBtn = document.getElementById("addQuestion");
  const saveFlowBtn = document.getElementById("saveFlow");

  const SUPABASE_URL = "YOUR_SUPABASE_URL";
  const SUPABASE_KEY = "YOUR_SUPABASE_ANON_KEY";

  async function saveFlow() {
    const flowName = prompt("Enter Flow Name");

    const payload = {
      tenant_id: "8eaca035-c542-4ffb-bf0a-112442006376",
      flow_name: flowName,
      nodes: nodes,
      edges: edges
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/flow_builders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Flow saved successfully");
    } else {
      alert("Failed to save flow");
    }
  }

  function render() {
    app.innerHTML = "";

    nodes.forEach((node) => {
      const div = document.createElement("div");
      div.innerText = node.label;
      div.style.padding = "15px";
      div.style.margin = "10px";
      div.style.border = "2px solid #333";
      div.style.borderRadius = "8px";
      div.style.width = "180px";
      div.style.background = "#fff";

      app.appendChild(div);
    });
  }

  function addNode(type) {
    nodes.push({
      id: count,
      type: type,
      label: type + " " + count
    });

    count++;
    render();
  }

  addMessageBtn.onclick = function () {
    addNode("Message");
  };

  addQuestionBtn.onclick = function () {
    addNode("Question");
  };

  saveFlowBtn.onclick = function () {
    saveFlow();
  };

  render();
};
