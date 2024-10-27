let enterInput = document.querySelector(".input");
let button = document.querySelector(".button");
let done = document.querySelectorAll(".list");
let taskIdCounter = 0; // счетчик для id задач

function addTask() {
  let li = document.createElement("li");
  li.textContent = enterInput.value;
  li.setAttribute("draggable", "true");
  li.addEventListener("dragstart", handleDragStart);
  li.id = "task-" + taskIdCounter++;
  enterInput.value = "";
  document.querySelector(".ul").appendChild(li);
}
// функция определения начала перетаскивания
function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}
//
done.forEach((done) => {
  done.addEventListener("dragover", handleDragOver);
  done.addEventListener("drop", handleDrop);
  done.addEventListener("drageleave", handeDragLeave);
});
//  Функция для выполнения события DragOver
function handleDragOver(e) {
  e.preventDefault(); //  Позволяет выполнять событие Drop
}
//  функция для выполнения события Drop
function handleDrop(e) {
  e.preventDefault();
  const data = e.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);
  e.target.appendChild(draggableElement);
}
//  Функция для выполнения события DragLeave
function handeDragLeave(e) {}
// я вроде как подключил git на мак
