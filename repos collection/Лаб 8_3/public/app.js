// CRUD рецептов + список с пагинацией/сортировкой/поиском через query к GET /items.
const form = document.getElementById("recipeForm");
const formTitle = document.getElementById("formTitle");
const cancelEditButton = document.getElementById("cancelEdit");
const loadItemsButton = document.getElementById("loadItems");
const tableBody = document.getElementById("tableBody");
const message = document.getElementById("message");
const searchTitleInput = document.getElementById("searchTitle");
const sortByTitleSelect = document.getElementById("sortByTitle");
const pageSizeSelect = document.getElementById("pageSize");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

const fields = {
  id: document.getElementById("recipeId"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  category: document.getElementById("category"),
  cookTimeMinutes: document.getElementById("cookTimeMinutes")
};

// Состояние списка на клиенте (сервер возвращает скорректированную страницу).
const listState = {
  page: 1,
  limit: Number(pageSizeSelect.value),
  sort: sortByTitleSelect.value,
  q: ""
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

// Унифицированный fetch: разбор JSON и выброс ошибки при не-2xx ответе.
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

function updatePagination(pagination) {
  pageInfo.textContent = `Страница ${pagination.page} из ${pagination.totalPages}`;
  prevPageButton.disabled = pagination.page <= 1;
  nextPageButton.disabled = pagination.page >= pagination.totalPages;
}

// Собираем URL запроса к API в соответствии с фильтрами панели инструментов.
function buildListQuery() {
  const params = new URLSearchParams({
    page: String(listState.page),
    limit: String(listState.limit),
    sort: listState.sort
  });

  if (listState.q) {
    params.set("q", listState.q);
  }

  return `/items?${params.toString()}`;
}

// Загрузка страницы списка: сервер отдаёт { items, pagination, filters }.
async function loadItems() {
  try {
    const result = await request(buildListQuery());
    renderTable(result.items);
    updatePagination(result.pagination);
    listState.page = result.pagination.page;
    showMessage(`Найдено записей: ${result.pagination.totalItems}`);
  } catch (error) {
    showMessage(error.message, true);
  }
}

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
    listState.page = 1;
    await loadItems();
  } catch (error) {
    showMessage(error.message, true);
  }
});

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
      listState.page = 1;
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

searchTitleInput.addEventListener("input", () => {
  listState.q = searchTitleInput.value.trim();
  listState.page = 1;
  loadItems();
});

sortByTitleSelect.addEventListener("change", () => {
  listState.sort = sortByTitleSelect.value;
  listState.page = 1;
  loadItems();
});

pageSizeSelect.addEventListener("change", () => {
  listState.limit = Number(pageSizeSelect.value);
  listState.page = 1;
  loadItems();
});

prevPageButton.addEventListener("click", () => {
  if (listState.page <= 1) {
    return;
  }
  listState.page -= 1;
  loadItems();
});

nextPageButton.addEventListener("click", () => {
  listState.page += 1;
  loadItems();
});

loadItems();
