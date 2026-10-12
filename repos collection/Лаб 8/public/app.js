// Клиентская логика: fetch к REST API того же хоста, обновление таблицы и формы.
const form = document.getElementById("recipeForm");
const formTitle = document.getElementById("formTitle");
const cancelEditButton = document.getElementById("cancelEdit");
const loadItemsButton = document.getElementById("loadItems");
const tableBody = document.getElementById("tableBody");
const message = document.getElementById("message");

const fields = {
  id: document.getElementById("recipeId"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  category: document.getElementById("category"),
  cookTimeMinutes: document.getElementById("cookTimeMinutes")
};

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#b91c1c" : "#047857";
}

function resetForm() {
  fields.id.value = "";
  fields.title.value = "";
  fields.description.value = "";
  fields.category.value = "";
  fields.cookTimeMinutes.value = "";
  formTitle.textContent = "Добавить рецепт";
}

function fillForm(recipe) {
  fields.id.value = recipe.id;
  fields.title.value = recipe.title;
  fields.description.value = recipe.description;
  fields.category.value = recipe.category;
  fields.cookTimeMinutes.value = recipe.cookTimeMinutes;
  formTitle.textContent = `Редактирование #${recipe.id}`;
}

// Обёртка над fetch: парсинг JSON и единообразная обработка ошибок от API.
async function request(url, options = {}) {
  const response = await fetch(url, options);
  let data = null;

  if (response.status !== 204) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage = data?.message || "Ошибка запроса";
    throw new Error(errorMessage);
  }

  return data;
}

function renderTable(items) {
  tableBody.innerHTML = "";

  for (const item of items) {
    const iconSrc = getRecipeIcon(item);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>
        <div class="recipe-title-cell">
          <img src="${iconSrc}" alt="Иконка рецепта" class="recipe-icon" />
          <span>${item.title}</span>
        </div>
      </td>
      <td>${item.category}</td>
      <td>${item.cookTimeMinutes} мин</td>
      <td>
        <button data-action="edit" data-id="${item.id}">Изменить</button>
        <button data-action="delete" data-id="${item.id}" class="secondary">Удалить</button>
      </td>
    `;
    tableBody.appendChild(row);
  }
}

function getRecipeIcon(item) {
  const source = `${item.title} ${item.category}`.toLowerCase();
  if (source.includes("суп") || source.includes("борщ")) {
    return "/images/icon-soup.svg";
  }
  if (source.includes("салат") || source.includes("овощ")) {
    return "/images/icon-salad.svg";
  }
  return "/images/icon-main.svg";
}

// Полный список без параметров (в лаб. 8 GET /items возвращает массив).
async function loadItems() {
  try {
    const items = await request("/items");
    renderTable(items);
    showMessage(`Загружено записей: ${items.length}`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

// POST для новой записи, PUT если в скрытом поле уже есть id (режим редактирования).

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: fields.title.value.trim(),
    description: fields.description.value.trim(),
    category: fields.category.value.trim(),
    cookTimeMinutes: Number(fields.cookTimeMinutes.value)
  };

  try {
    if (fields.id.value) {
      await request(`/items/${fields.id.value}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      showMessage("Запись успешно обновлена");
    } else {
      await request("/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      showMessage("Запись успешно добавлена");
    }

    resetForm();
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  }
});

// Делегирование: клики по кнопкам «Изменить»/«Удалить» в строках таблицы.
tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const action = button.dataset.action;

  try {
    if (action === "edit") {
      const recipe = await request(`/items/${id}`);
      fillForm(recipe);
      return;
    }

    if (action === "delete") {
      await request(`/items/${id}`, { method: "DELETE" });
      showMessage("Запись удалена");
      await loadItems();
    }
  } catch (error) {
    showMessage(error.message, true);
  }
});

cancelEditButton.addEventListener("click", () => {
  resetForm();
  showMessage("Режим редактирования отменен");
});

loadItemsButton.addEventListener("click", loadItems);

loadItems();
