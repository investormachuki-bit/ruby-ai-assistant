let nodes = [];
let count = 1;

const app = document.getElementById("app");

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
    div.style.cursor = "pointer";

    app.appendChild(div);
  });
}

function addNode(type) {
  nodes.push({
    id: count,
    type,
    label: `${type} ${count}`,
  });

  count++;
  render();
}

document.getElementById("addMessage").addEventListener("click", function () {
  addNode("Message");
});

document.getElementById("addQuestion").addEventListener("click", function () {
  addNode("Question");
});

render();
