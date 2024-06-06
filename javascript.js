let enterInput = document.querySelector(".input");
let button = document.querySelector(".button");
let done = document.querySelectorAll(".list");
let taskIdCounter = 0; // счетчик для id задач
let taskArray = []; // массив для задач

//  функция для добавления задачи в список
function addTask() {
  let li = document.createElement("li");
  li.textContent = enterInput.value;
  li.setAttribute("draggable", "true");
  li.classList.add("task"); // Добавляем класс task
  li.addEventListener("dragstart", handleDragStart);
  li.id = "task-" + taskIdCounter++;
  enterInput.value = "";
  document.querySelector(".ul").appendChild(li);
  taskArray.push({
    id: li.id,
    textContent: li.textContent,
    container: 0,
    order: taskArray.length,
  }); // Добавляем задачу в массив
  saveTasks();
  updateLocalStorage();
}
// функция определения начала перетаскивания
function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.id);
}
// перебор всех элементов с классом лист и применение функции для каждого из них
done.forEach((done) => {
  done.addEventListener("dragover", handleDragOver);
  done.addEventListener("drop", handleDrop);
  done.addEventListener("drageleave", handleDragLeave);
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
  if (draggableElement) {
    // Проверяем что t.target является допустимым контейнером
    let dropTarget = e.target;
    while (dropTarget && !dropTarget.classList.contains("list")) {
      dropTarget = dropTarget.parentNode;
    }
    if (dropTarget) {
      dropTarget.appendChild(draggableElement);
      updateLocalStorage(); // Вызов функции обновления localStorage
    } else {
      console.error("Drop target is not a valid container");
    }
  } else {
    console.error("draggableElement not found");
  }
}

//  Функция для выполнения события DragLeave
function handleDragLeave(e) {}
// Сохранение данных массива в localStorage
function saveTasks() {
  // Сохраняем только данные о задачах, а не DOM-элементы
  const tasksData = taskArray.map((task) => ({
    id: task.id,
    textContent: task.textContent,
  }));
  localStorage.setItem("taskArray", JSON.stringify(tasksData));
}
// Получение данных из localStorage и преобразовав массив
function getTasks() {
  document.querySelector(".ul").innerHTML = ""; // Очистка списка
  let dataLocalStorage = JSON.parse(localStorage.getItem("taskArray"));
  if (dataLocalStorage) {
    //Очистка массива и элементов задач
    taskArray = [];
    document.querySelectorAll(".task").forEach((task) => task.remove());
    // Находим максимальный id среди сохранённых задач
    const maxId = dataLocalStorage.reduce((max, taskData) => {
      const currentId = parseInt(taskData.id.replace("task-", ""), 10);
      return currentId > max ? currentId : max;
    }, 0);
    // Устанавливаем taskIdCounter на значение, следующее за максимальным id
    taskIdCounter = maxId + 1;
    // Восстанавливаем состояние каждой задачи
    dataLocalStorage
      .sort((a, b) => a.order - b.order) // Сортируем задачи по их порядку
      .forEach((taskData) => {
        const list = document.querySelectorAll(".list")[taskData.container]; // Получаем контейнер по сохраненному индексу
        if (list) {
          let li = document.createElement("li");
          li.textContent = taskData.textContent;
          li.setAttribute("draggable", "true");
          // li.setAttribute("class", "list");
          li.classList.add("task"); //Добавляем класс task
          li.id = taskData.id;
          li.addEventListener("dragstart", handleDragStart);
          // document.querySelector(".ul").appendChild(li);
          list.appendChild(li); // Добавляем элемент в его последний контейнер
          taskArray.push(li); //запушили задачу в массив
        }
      });
  }
}

function updateLocalStorage() {
  const lists = document.querySelectorAll(".list");
  const tasksData = [];

  lists.forEach((list, index) => {
    const tasks = list.querySelectorAll("li.task");
    tasks.forEach((task, order) => {
      tasksData.push({
        id: task.id,
        textContent: task.textContent,
        container: index, // Индекс контейнера, куда была перенесена задача
        order: order, // Порядок задачи в контейнере
      });
    });
  });

  localStorage.setItem("taskArray", JSON.stringify(tasksData));
}

// document.addEventListener("DOMContentLoaded", getTasks);

document.addEventListener("DOMContentLoaded", () => {
  getTasks(); // Восстановление задач
  // Назначение событий drag-and-drop для контейнеров
  let containers = document.querySelectorAll(".list");
  containers.forEach((container) => {
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("drop", handleDrop);
    container.addEventListener("dragleave", handleDragLeave);
  });
});
