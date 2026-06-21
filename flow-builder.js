window.onload = function () {
  let nodes = [];
  let count = 1;

  const app = document.getElementById("app");
  const addMessageBtn = document.getElementById("addMessage");
  const addQuestionBtn = document.getElementById("addQuestion");

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

  render();
};
