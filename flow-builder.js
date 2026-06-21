const { ReactFlow, MiniMap, Controls, Background, addEdge } = window.ReactFlow;

let nodes = [];
let edges = [];
let nodeId = 1;

function addNode(type) {
  nodes.push({
    id: `${nodeId}`,
    type: "default",
    position: {
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 400
    },
    data: {
      label: `${type} ${nodeId}`
    }
  });

  nodeId++;
  renderFlow();
}

function saveFlow() {
  const flowData = {
    nodes,
    edges
  };

  console.log("Saved Flow:", flowData);
  alert("Flow saved successfully!");
}

function renderFlow() {
  const container = document.getElementById("app");

  ReactDOM.render(
    React.createElement(
      ReactFlow,
      {
        nodes,
        edges,

        onNodesChange: (changes) => {
          changes.forEach((change) => {
            if (change.type === "position" && change.position) {
              nodes = nodes.map((node) =>
                node.id === change.id
                  ? {
                      ...node,
                      position: change.position
                    }
                  : node
              );
            }
          });

          renderFlow();
        },

        onConnect: (params) => {
          edges = addEdge(params, edges);
          renderFlow();
        },

        fitView: true
      },

      React.createElement(MiniMap),
      React.createElement(Controls),
      React.createElement(Background)
    ),
    container
  );
}

renderFlow();
