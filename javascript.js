let enterInput = document.querySelector(".input");
let button = document.querySelector(".button");
let done = document.querySelectorAll(".list");
let taskIdCounter = 0; // счетчик для id задач
let taskArray = []; // массив для задач

//  функция для добавления задачи в список
function addTask() {
  let taskContainer = document.createElement("div");
  taskContainer.classList.add("task-container");
  // Добавление элемента задачи 
  let taskContent = document.createElement("div");
  taskContent.classList.add("task-content");
  taskContent.textContent = enterInput.value;
  // Добавление кнопки удаления 
  let deleteButton = document.createElement("button");
  deleteButton.classList.add("delete-button");
  deleteButton.textContent = "X";
  deleteButton.addEventListener("click", deleteTask);
  // Добавление элементов в DOM
  taskContainer.appendChild(taskContent);
  taskContainer.appendChild(deleteButton);
  // Добавление атрибута draggable
  taskContainer.setAttribute("draggable", "true");
  taskContainer.classList.add("task");
  taskContainer.addEventListener("dragstart", handleDragStart);
  taskContainer.id = "task-" + taskIdCounter++;
  // Очистка поля ввода 
  enterInput.value = "";
  document.querySelector(".ul").appendChild(taskContainer);
  // Добавление задачи в массив
  taskArray.push({
    id: taskContainer.id, 
    textContent: taskContent.textContent, 
    container: 0, 
    order: taskArray.length, // порядеовый номер задчи
  });
  
  saveTasks();  
  updateLocalStorage(); 
}
// Функция для удаления задачи
function deleteTask(e) {
  let taskContainer = e.target.closest(".task-container");  //
  taskContainer.remove(); // Удаление задачи 
  updateLocalStorage();   // Обновление в локалном хранилище
}; 

// function addTask() {
//   let li = document.createElement("li");
//   li.textContent = enterInput.value;
//   li.setAttribute("draggable", "true");
//   li.classList.add("task"); // Добавляем класс task
//   li.addEventListener("dragstart", handleDragStart);
//   li.id = "task-" + taskIdCounter++;
//   enterInput.value = "";
//   document.querySelector(".ul").appendChild(li);
//   taskArray.push({
//     id: li.id,
//     textContent: li.textContent,
//     container: 0,
//     order: taskArray.length,
//   }); // Добавляем задачу в массив
//   saveTasks();
//   updateLocalStorage();
// }
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
// Сохранение данных массива в localStorage
function saveTasks() {
  const tasksData = taskArray.map((task) => ({
    id: task.id, 
    textContent: task.textContent, // Убедитесь, что сохраняется только текст задачи
    container: task.container,
    order: task.order,
  }));
  localStorage.setItem("taskArray", JSON.stringify(tasksData));
}
// Функция для обновления данных в lockalStorage
function updateLocalStorage() {
  const lists = document.querySelectorAll(".list");
  const tasksData = [];
// Перебираем все списки и задачи в них 
  lists.forEach((list, index) => {
    const tasks = list.querySelectorAll(".task-container");
    tasks.forEach((task, order) => {
      tasksData.push({
        id: task.id,
        textContent: task.querySelector('.task-content').textContent, //Сохраняем только текст задачи
        container: index, // Индекс контейнера, куда была перенесена задача
        order: order, // Порядок задачи в контейнере
      });
    });
  });

  localStorage.setItem("taskArray", JSON.stringify(tasksData));
}

// Получение данных из localStorage и преобразовав массив

// Получение данных из localStorage и преобразование массива
function getTasks() {
  document.querySelector(".ul").innerHTML = "";
  let dataLocalStorage = JSON.parse(localStorage.getItem("taskArray"));
  if (dataLocalStorage) {
    taskArray = [];
    document.querySelectorAll(".task").forEach((task) => task.remove());
    const maxId = dataLocalStorage.reduce((max, taskData) => {
      const currentId = parseInt(taskData.id.replace("task-", ""), 10);
      return currentId > max ? currentId : max;
    }, 0);
    taskIdCounter = maxId + 1;
    dataLocalStorage
      .sort((a, b) => a.order - b.order)
      .forEach((taskData) => {
        const list = document.querySelectorAll(".list")[taskData.container];
        if (list) {
          let taskContainer = document.createElement("div");
          taskContainer.classList.add("task-container");
          let taskContent = document.createElement("div");
          taskContent.classList.add("task-content");
          taskContent.textContent = taskData.textContent; // Восстановление только текста задачи
          let deleteButton = document.createElement("button");
          deleteButton.classList.add("delete-button");
          deleteButton.textContent = "X";
          deleteButton.addEventListener("click", deleteTask);
          taskContainer.appendChild(taskContent);
          taskContainer.appendChild(deleteButton);
          taskContainer.setAttribute("draggable", "true");
          taskContainer.classList.add("task");
          taskContainer.id = taskData.id;
          taskContainer.addEventListener("dragstart", handleDragStart);
          list.appendChild(taskContainer);
          taskArray.push(taskContainer);
        }
      });
  }
}


//


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
