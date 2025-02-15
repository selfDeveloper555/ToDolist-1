let enterInput = document.querySelector(".input");
let button = document.querySelector(".button");
let done = document.querySelectorAll(".list");
let taskIdCounter = 0; // счетчик для id задач
let taskArray = []; // массив для задач

// Инициализация IndexedDB
let db; // глобальная переменная для хранения соединения с базой данных
const DB_NAME = 'TodoListDB'; // имя базы данных
const STORE_NAME = 'tasks'; // имя хранилища объектов (таблицы)

/**
 * Инициализация базы данных IndexedDB
 * @returns {Promise} Промис, который резолвится после успешного создания/открытия БД
 */
function initDB() {
  return new Promise((resolve, reject) => {
    // Открываем или создаем базу данных версии 1
    const request = indexedDB.open(DB_NAME, 1);

    // Обработчик ошибки при открытии БД
    request.onerror = () => {
      console.error('Ошибка открытия базы данных');
      reject('Ошибка открытия базы данных');
    };

    // Обработчик успешного открытия БД
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    // Вызывается при создании новой БД или обновлении версии
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      // Создаем хранилище объектов, если его еще нет
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

//  функция для добавления задачи в список
function addTask() {
  // Добавление кнопки закрепить 
  let pinButton = document.createElement("button");
  pinButton.classList.add('pin-button');
  pinButton.textContent = "📌";
  pinButton.addEventListener("click", togglePin);
  // добавление контейнера задач
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
  taskContainer.appendChild(pinButton);
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
  saveTasks();  // сохранение задачи в lockalStorage
  updateLocalStorage(); // обновление lockalStorage
}

// функция для закрепления задачи
function togglePin(e) {
  const taskContainer = e.target.parentElement;
  taskContainer.classList.toggle('pinned'); // Переключение класса pinned
  // переключение возможности перетаскивания закрепленной задачи 
  if (taskContainer.classList.contains('pinned')) {
    taskContainer.setAttribute('draggable', "false");
  } else {
    taskContainer.setAttribute('draggable', 'true');
  }
  updateLocalStorage(); // Обновление localStorage
}
// Функция для удаления задачи
function deleteTask(e) {
  let taskContainer = e.target.closest(".task-container");

  if (taskContainer.classList.contains('pinned')) {
    return;
  }
  taskContainer.remove(); // Удаление задачи 
  updateLocalStorage();   // Обновление в локалном хранилище
}; 

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
  console.log('drop event:', e);
  e.preventDefault();
  const data = e.dataTransfer.getData("text/plain");
  const draggableElement = document.getElementById(data);
  if (draggableElement) {
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

/**
 * Сохранение задач в IndexedDB
 * Заменяет предыдущую функцию работы с localStorage
 */
function saveTasks() {
  // Подготавливаем данные для сохранения
  const tasksData = taskArray.map((task) => ({
    id: task.id,
    textContent: task.textContent,
    container: task.container,
    order: task.order,
    pinned: task.pinned
  }));

  // Создаем транзакцию записи
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  // Очищаем старые данные
  store.clear();
  
  // Сохраняем каждую задачу
  tasksData.forEach(task => {
    store.add(task);
  });
}

/**
 * Обновление данных в IndexedDB
 * Собирает актуальное состояние задач из DOM и сохраняет в БД
 */
function updateLocalStorage() {
  const lists = document.querySelectorAll(".list");
  const tasksData = [];

  // Собираем данные из DOM
  lists.forEach((list, index) => {
    const tasks = list.querySelectorAll(".task-container");
    tasks.forEach((task, order) => {
      tasksData.push({
        id: task.id,
        textContent: task.querySelector('.task-content').textContent,
        container: index,
        order: order,
        pinned: task.classList.contains("pinned"),
      });
    });
  });

  // Сохраняем в IndexedDB
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  store.clear();
  tasksData.forEach(task => {
    store.add(task);
  });
}

/**
 * Получение задач из IndexedDB и отображение их на странице
 * @returns {Promise} Промис, который резолвится после загрузки всех задач
 */
function getTasks() {
  return new Promise((resolve, reject) => {
    // Создаем транзакцию для чтения
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const dataLocalStorage = request.result;
      document.querySelector(".ul").innerHTML = "";
      
      if (dataLocalStorage && dataLocalStorage.length > 0) {
        taskArray = [];
        document.querySelectorAll(".task").forEach((task) => task.remove());
        
        // Находим максимальный ID для продолжения нумерации
        const maxId = dataLocalStorage.reduce((max, taskData) => {
          const currentId = parseInt(taskData.id.replace("task-", ""), 10);
          return currentId > max ? currentId : max;
        }, 0);
        
        taskIdCounter = maxId + 1;

        // Сортируем задачи по порядку и восстанавливаем их на странице
        dataLocalStorage
          .sort((a, b) => a.order - b.order)
          .forEach((taskData) => {
            const list = document.querySelectorAll(".list")[taskData.container];
            if (list) {
              let taskContainer = document.createElement("div");
              taskContainer.classList.add("task-container");
              
              if (taskData.pinned) {
                taskContainer.classList.add('pinned');
                taskContainer.setAttribute('draggable', 'false');
              } else {
                taskContainer.setAttribute('draggable', 'true');
              }

              let taskContent = document.createElement("div");
              taskContent.classList.add("task-content");
              taskContent.textContent = taskData.textContent;

              let deleteButton = document.createElement("button");
              deleteButton.classList.add("delete-button");
              deleteButton.textContent = "X";
              deleteButton.addEventListener("click", deleteTask);

              let pinButton = document.createElement('button');
              pinButton.classList.add('pin-button');
              pinButton.textContent = "📌";
              pinButton.addEventListener("click", togglePin);

              taskContainer.appendChild(taskContent);
              taskContainer.appendChild(deleteButton);
              taskContainer.appendChild(pinButton);
              taskContainer.classList.add("task");
              taskContainer.id = taskData.id;
              taskContainer.addEventListener("dragstart", handleDragStart);
              list.appendChild(taskContainer);

              taskArray.push({
                id: taskData.id,
                textContent: taskData.textContent,
                container: taskData.container,
                order: taskData.order,
                pinned: taskData.pinned
              });
            }
          });
      }
      resolve();
    };

    request.onerror = () => {
      console.error('Ошибка получения задач');
      reject('Ошибка получения задач');
    };
  });
}

/**
 * Инициализация приложения при загрузке страницы
 * Асинхронная функция для последовательной инициализации БД и загрузки задач
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initDB(); // Сначала инициализируем базу данных
    await getTasks(); // Затем загружаем сохраненные задачи
    
    // Инициализируем обработчики drag-and-drop
    let containers = document.querySelectorAll(".list");
    containers.forEach((container) => {
      container.addEventListener("dragover", handleDragOver);
      container.addEventListener("drop", handleDrop);
      container.addEventListener("dragleave", handleDragLeave);
    });
  } catch (error) {
    console.error('Ошибка инициализации:', error);
  }
}); 