window.onload = function () {
  let nodes = [];
  let edges = [];
  let count = 1;
  let selectedNode = null;

  const app = document.getElementById("app");
  const addMessageBtn = document.getElementById("addMessage");
  const addQuestionBtn = document.getElementById("addQuestion");
  const saveFlowBtn = document.getElementById("saveFlow");

  const SUPABASE_URL = "https://osnrnrgnegqpbiknsgit.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbnJucmduZWdxcGJpa25zZ2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODI2MTUsImV4cCI6MjA5NzI1ODYxNX0._zOqjvIhaRCwGHBpEY1q4guGxMmXOATFj4F4rEF-dYc";

  function getColor(type, id) {
    if (selectedNode === id) return "#cce5ff";
    if (type === "Condition") return "#fff3cd";
    if (type === "End") return "#d4edda";
    return "#ffffff";
  }

  function render() {
    app.innerHTML = "";

    nodes.forEach((node) => {
      const div = document.createElement("div");

      div.innerText = `${node.type}: ${node.label}`;
      div.style.padding = "15px";
      div.style.margin = "10px";
      div.style.border = "2px solid #333";
      div.style.borderRadius = "8px";
      div.style.width = "240px";
      div.style.background = getColor(node.type, node.id);
      div.style.cursor = "pointer";

      // Single click = select/link
      div.onclick = function () {
        if (!selectedNode) {
          selectedNode = node.id;
        } else {
          if (selectedNode !== node.id) {
            edges.push({
              from: selectedNode,
              to: node.id
            });
          }
          selectedNode = null;
        }
        render();
      };

      // Double click = edit
      div.ondblclick = function () {
        const newText = prompt("Edit node text:", node.label);
        if (newText && newText.trim() !== "") {
          node.label = newText;
          render();
        }
      };

      // Long press = delete
      let pressTimer;
      div.onmousedown = function () {
        pressTimer = window.setTimeout(() => {
          nodes = nodes.filter((n) => n.id !== node.id);
          edges = edges.filter(
            (e) => e.from !== node.id && e.to !== node.id
          );
          render();
        }, 1200);
      };

      div.onmouseup = function () {
        clearTimeout(pressTimer);
      };

      app.appendChild(div);
    });

    // Edge display
    const edgeBox = document.createElement("div");
    edgeBox.style.marginTop = "30px";
    edgeBox.style.padding = "10px";
    edgeBox.style.background = "#f8f9fa";

    const edgeTitle = document.createElement("h3");
    edgeTitle.innerText = "Connections";
    edgeBox.appendChild(edgeTitle);

    edges.forEach((edge) => {
      const line = document.createElement("div");
      line.innerText = `Node ${edge.from} → Node ${edge.to}`;
      line.style.margin = "5px 0";
      edgeBox.appendChild(line);
    });

    app.appendChild(edgeBox);
  }

  function addNode(type) {
    nodes.push({
      id: count,
      type: type,
      label: `${type} ${count}`
    });

    count++;
    render();
  }

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
      const errorText = await res.text();
      alert(errorText);
    }
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

  const SUPABASE_URL = "https://osnrnrgnegqpbiknsgit.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbnJucmduZWdxcGJpa25zZ2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODI2MTUsImV4cCI6MjA5NzI1ODYxNX0._zOqjvIhaRCwGHBpEY1q4guGxMmXOATFj4F4rEF-dYc";

