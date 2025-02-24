const content = document.querySelector("#content");
const startBtn = document.querySelector("#startBtn");
const continueBtn = document.querySelector("#continueBtn");
const resetBtn = document.querySelector("#resetBtn");
const group = document.getElementById("group");

const animationTime = 3000; //Время выбора элемента
let surnames;
await getSurnames(group.value);

async function getSurnames(value)
{
  let path = `./data/${value}.json`;
  await fetch(path)
    .then(response => response.json())
    .then(data => surnames = data)
    .catch(error => console.error('Ошибка загрузки JSON:', error));
}

let remainingItems = [...surnames]; // Оставшиеся элементы
let isRunning = false; // Для предотвращения многократного запуска

// Инициализация
createItems();
startBtn.addEventListener("click", () => runCycle());
continueBtn.addEventListener("click", () => runCycle());
resetBtn.addEventListener("click", reset);

group.addEventListener("change", async () => {
  await getSurnames(group.value);
  reset();
})

function runCycle() {
  if (isRunning || remainingItems.length === 0) return; // Предотвращение повторного запуска
  isRunning = true;
  startBtn.style.display = "none";
  resetBtn.style.display = "none";

  const selectedIndex = [];
  const intervalTime = 100; // Интервал подсветки (мс)
  
   // Помечаем оставшиеся как перечеркнутые
   document.querySelectorAll(".item").forEach((item) => {
      if (!remainingItems.includes(item.dataset.id)) {
         item.classList.add("crossed-out");
      }
      item.classList.remove("selected");
   });

  // Анимация подсветки случайных блоков
  const highlightInterval = setInterval(() => {

    const randomIndex = randomInteger(0, remainingItems.length - 1);
    const element = document.querySelector(`[data-id="${remainingItems[randomIndex]}"]`);

    if (!selectedIndex.includes(randomIndex)) {
      element.classList.add("highlighted");
      setTimeout(() => element.classList.remove("highlighted"), intervalTime); // Убираем подсветку через 100 мс
    }
  }, intervalTime);

  // Окончательный выбор через {animationTime} секунд
  setTimeout(() => {
    clearInterval(highlightInterval);

    const randomIndex = randomInteger(0, remainingItems.length - 1);
    const selectedSurname = remainingItems[randomIndex];
    const selectedElement = document.querySelector(`[data-id="${selectedSurname}"]`);

    // Устанавливаем элемент как выбранный
    selectedElement.classList.add("selected");

     // Прокрутка к выбранному элементу
    selectedElement.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Удаляем выбранный элемент из массива оставшихся
    remainingItems.splice(randomIndex, 1);

    // Если нет оставшихся элементов, скрываем кнопку "Продолжить"
    if (remainingItems.length === 0)
      continueBtn.style.display = "none";
    else
      continueBtn.style.display = "block";

    // Показываем кнопку "Сброс"
    resetBtn.style.display = "block";

    isRunning = false; // Позволяем перезапускать цикл
  }, animationTime);
}

function reset() {
  // Удаляем все элементы
  content.innerHTML = "";

  // Сбрасываем массив оставшихся элементов
  remainingItems = [...surnames];

  // Пересоздаем элементы
  createItems();

  // Скрываем все кнопки, кроме "Старт"
  startBtn.style.display = "block";
  continueBtn.style.display = "none";
  resetBtn.style.display = "none";

  isRunning = false; // Обнуляем состояние запуска
}

function createItems() {
   remainingItems = shuffle([...surnames]);

   remainingItems.forEach((surname, index) => {
      const item = document.createElement("div");
      item.classList.add("item");
      item.dataset.id = surname; // Уникальный идентификатор для поиска
      item.textContent = surname;
      content.appendChild(item);
   });

   startBtn.style.display = "block";
   continueBtn.style.display = "none";
   resetBtn.style.display = "none";
}

// Генерация случайного числа
function randomInteger(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

// Перетасовка элементов массива
function shuffle(array) {
   for (let i = array.length - 1; i > 0; i--) {
     const j = randomInteger(0, i);
     [array[i], array[j]] = [array[j], array[i]];
   }
   return array;
 }

 content.addEventListener('click', (event) => {
  const target = event.target;
  
  if (target.classList.contains('item') && remainingItems.length > 1) {
      const itemId = target.dataset.id;
      remainingItems = remainingItems.filter(item => item !== itemId)
      content.removeChild(target);
  }
});