const canvas = document.getElementById("canvas");

let count = 0;

function addNode(type) {
  count++;

  const node = document.createElement("div");
  node.className = "node";
  node.innerText = `${type} ${count}`;

  node.style.left = "50px";
  node.style.top = `${count * 80}px`;

  makeDraggable(node);

  canvas.appendChild(node);
}

function makeDraggable(element) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  element.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.offsetX;
    offsetY = e.offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    element.style.left = `${e.pageX - offsetX}px`;
    element.style.top = `${e.pageY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
