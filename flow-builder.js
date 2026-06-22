window.onload = function () {
  let nodes = [];
  let edges = [];
  let count = 1;
  let selectedNode = null;

  const app = document.getElementById("app");

  const addMessageBtn = document.getElementById("addMessage");
  const addQuestionBtn = document.getElementById("addQuestion");
  const addConditionBtn = document.getElementById("addCondition");
  const addEndBtn = document.getElementById("addEnd");
  const saveFlowBtn = document.getElementById("saveFlow");
  const loadFlowBtn = document.getElementById("loadFlow");

  const SUPABASE_URL = "https://osnrnrgnegqpbiknsgit.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbnJucmduZWdxcGJpa25zZ2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODI2MTUsImV4cCI6MjA5NzI1ODYxNX0._zOqjvIhaRCwGHBpEY1q4guGxMmXOATFj4F4rEF-dYc";
  const TENANT_ID = "8eaca035-c542-4ffb-bf0a-112442006376";

  function getColor(type, id) {
    if (selectedNode === id) return "#cce5ff";
    if (type === "Condition") return "#fff3cd";
    if (type === "End") return "#d4edda";
    if (type === "Question") return "#f8d7da";
    return "#ffffff";
  }

  function render() {
    app.innerHTML = "";

    nodes.forEach((node) => {
      const div = document.createElement("div");

      div.style.padding = "15px";
      div.style.margin = "10px";
      div.style.border = "2px solid #333";
      div.style.borderRadius = "8px";
      div.style.width = "280px";
      div.style.background = getColor(node.type, node.id);
      div.style.cursor = "pointer";

      let text = `${node.type}: ${node.label}`;

      if (node.options && node.options.length > 0) {
        text += "\nOptions:";
        node.options.forEach((opt) => {
          text += `\n- ${opt}`;
        });
      }

      div.innerText = text;

      div.onclick = function () {
        if (!selectedNode) {
          selectedNode = node.id;
        } else {
          if (selectedNode !== node.id) {
            let condition = "";

            const sourceNode = nodes.find(n => n.id === selectedNode);

            if (sourceNode?.options?.length > 0) {
              condition = prompt(
                `Choose option: ${sourceNode.options.join(", ")}`
              ) || "";
            }

            edges.push({
              from: selectedNode,
              to: node.id,
              condition: condition
            });
          }

          selectedNode = null;
        }

        render();
      };

      div.ondblclick = function () {
        const newText = prompt("Edit node text:", node.label);

        if (newText) {
          node.label = newText;
        }

        if (node.type === "Question") {
          const optionsInput = prompt(
            "Enter options separated by commas:",
            node.options ? node.options.join(",") : ""
          );

          node.options = optionsInput
            ? optionsInput.split(",").map(o => o.trim())
            : [];
        }

        render();
      };

      app.appendChild(div);
    });

    const edgeBox = document.createElement("div");
    edgeBox.style.marginTop = "30px";
    edgeBox.style.padding = "15px";
    edgeBox.style.background = "#f8f9fa";

    const title = document.createElement("h3");
    title.innerText = "Connections";
    edgeBox.appendChild(title);

    edges.forEach((edge) => {
      const line = document.createElement("div");

      line.innerText = edge.condition
        ? `${edge.from} → (${edge.condition}) → ${edge.to}`
        : `${edge.from} → ${edge.to}`;

      edgeBox.appendChild(line);
    });

    app.appendChild(edgeBox);
  }

  function addNode(type) {
    const node = {
      id: count,
      type: type,
      label: `${type} ${count}`
    };

    if (type === "Question") {
      node.options = [];
    }

    nodes.push(node);

    count++;
    render();
  }

  async function saveFlow() {
    const flowName = prompt("Enter Flow Name");

    const payload = {
      tenant_id: TENANT_ID,
      flow_name: flowName,
      nodes,
      edges
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
      alert("Saved");
    }
  }

  async function loadFlow() {
    const flowName = prompt("Enter Flow Name");

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/flow_builders?flow_name=eq.${flowName}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const data = await res.json();

    if (data.length > 0) {
      nodes = data[0].nodes || [];
      edges = data[0].edges || [];
      count = Math.max(...nodes.map(n => n.id)) + 1;

      render();
    }
  }

  addMessageBtn.onclick = () => addNode("Message");
  addQuestionBtn.onclick = () => addNode("Question");
  addConditionBtn.onclick = () => addNode("Condition");
  addEndBtn.onclick = () => addNode("End");
  saveFlowBtn.onclick = saveFlow;
  loadFlowBtn.onclick = loadFlow;

  render();
};

  const SUPABASE_URL = "https://osnrnrgnegqpbiknsgit.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbnJucmduZWdxcGJpa25zZ2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODI2MTUsImV4cCI6MjA5NzI1ODYxNX0._zOqjvIhaRCwGHBpEY1q4guGxMmXOATFj4F4rEF-dYc";

