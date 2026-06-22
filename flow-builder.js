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

      div.innerText = `${node.type}: ${node.label}`;
      div.style.padding = "15px";
      div.style.margin = "10px";
      div.style.border = "2px solid #333";
      div.style.borderRadius = "8px";
      div.style.width = "260px";
      div.style.background = getColor(node.type, node.id);
      div.style.cursor = "pointer";

      // Select node for linking
      div.onclick = function () {
        if (!selectedNode) {
          selectedNode = node.id;
        } else {
          if (selectedNode !== node.id) {
            let condition = "";

            const sourceNode = nodes.find(n => n.id === selectedNode);

            if (
              sourceNode &&
              (sourceNode.type === "Question" ||
               sourceNode.type === "Condition")
            ) {
              condition = prompt(
                "Enter condition for this path (e.g yes/no/high/low):"
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

      // Edit node
      div.ondblclick = function () {
        const newText = prompt("Edit node text:", node.label);

        if (newText && newText.trim() !== "") {
          node.label = newText;
          render();
        }
      };

      // Delete node
      let pressTimer;

      div.onmousedown = function () {
        pressTimer = setTimeout(() => {
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

    // Render connections
    const edgeBox = document.createElement("div");
    edgeBox.style.marginTop = "30px";
    edgeBox.style.padding = "15px";
    edgeBox.style.background = "#f8f9fa";
    edgeBox.style.borderTop = "2px solid #ddd";

    const edgeTitle = document.createElement("h3");
    edgeTitle.innerText = "Connections";
    edgeBox.appendChild(edgeTitle);

    if (edges.length === 0) {
      const empty = document.createElement("div");
      empty.innerText = "No connections yet";
      edgeBox.appendChild(empty);
    }

    edges.forEach((edge) => {
      const line = document.createElement("div");

      if (edge.condition) {
        line.innerText =
          `Node ${edge.from} → (${edge.condition}) → Node ${edge.to}`;
      } else {
        line.innerText =
          `Node ${edge.from} → Node ${edge.to}`;
      }

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

    if (!flowName) return;

    const payload = {
      tenant_id: TENANT_ID,
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

  async function loadFlow() {
    const flowName = prompt("Enter Flow Name to Load");

    if (!flowName) return;

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

      count =
        nodes.length > 0
          ? Math.max(...nodes.map((n) => Number(n.id))) + 1
          : 1;

      selectedNode = null;

      render();

      alert("Flow loaded successfully");
    } else {
      alert("Flow not found");
    }
  }

  addMessageBtn.onclick = () => addNode("Message");
  addQuestionBtn.onclick = () => addNode("Question");
  addConditionBtn.onclick = () => addNode("Condition");
  addEndBtn.onclick = () => addNode("End");
  saveFlowBtn.onclick = () => saveFlow();
  loadFlowBtn.onclick = () => loadFlow();

  render();
};

  const SUPABASE_URL = "https://osnrnrgnegqpbiknsgit.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbnJucmduZWdxcGJpa25zZ2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2ODI2MTUsImV4cCI6MjA5NzI1ODYxNX0._zOqjvIhaRCwGHBpEY1q4guGxMmXOATFj4F4rEF-dYc";

