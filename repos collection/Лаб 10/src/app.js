import { ajax } from "rxjs/ajax";
import { fromEvent, combineLatest, Subject, BehaviorSubject, merge, EMPTY } from "rxjs";
import { map, switchMap, startWith, filter, tap, withLatestFrom, catchError } from "rxjs/operators";
import "./style.css";

const form = document.getElementById("recipeForm");
const formTitle = document.getElementById("formTitle");
const cancelEditButton = document.getElementById("cancelEdit");
const tableBody = document.getElementById("tableBody");
const message = document.getElementById("message");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const refreshButton = document.getElementById("refreshButton");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");
const pageButtons = document.getElementById("pageButtons");
const pageInfo = document.getElementById("pageInfo");

const fields = {
  id: document.getElementById("recipeId"),
  title: document.getElementById("title"),
  description: document.getElementById("description"),
  category: document.getElementById("category"),
  cookTimeMinutes: document.getElementById("cookTimeMinutes")
};

const PAGE_SIZE = 5;
let totalPages = 1;

function getPageFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const pageRaw = Number(params.get("page"));
  return Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
}

function updatePageInUrl(page) {
  const params = new URLSearchParams(window.location.search);
  params.set("page", String(page));
  const nextUrl = `${window.location.pathname}?${params.toString()}`;
  if (window.location.search !== `?${params.toString()}`) {
    window.history.pushState({ page }, "", nextUrl);
  }
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? "#b91c1c" : "#047857";
}

function getErrorMessage(error) {
  return error?.response?.message || "Ошибка запроса";
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

function sortItems(items, sortType) {
  const sorted = [...items];
  switch (sortType) {
    case "id-desc":
      return sorted.sort((a, b) => b.id - a.id);
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title, "ru"));
    case "time-asc":
      return sorted.sort((a, b) => a.cookTimeMinutes - b.cookTimeMinutes);
    case "time-desc":
      return sorted.sort((a, b) => b.cookTimeMinutes - a.cookTimeMinutes);
    case "id-asc":
    default:
      return sorted.sort((a, b) => a.id - b.id);
  }
}

function renderTable(items) {
  tableBody.innerHTML = "";

  if (!items.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="5">Нет записей для отображения</td>';
    tableBody.appendChild(row);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td>
        <div class="recipe-title-cell">
          <img src="${getRecipeIcon(item)}" alt="Иконка рецепта" class="recipe-icon" />
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
  });
}

function renderPageButtons(currentPage, pages) {
  pageButtons.innerHTML = "";
  for (let page = 1; page <= pages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `page-number${page === currentPage ? " active" : ""}`;
    button.dataset.page = String(page);
    button.textContent = String(page);
    pageButtons.appendChild(button);
  }
}

const reloadItems$ = new Subject();
const page$ = new BehaviorSubject(getPageFromUrl());

const search$ = fromEvent(searchInput, "input").pipe(
  map((event) => event.target.value.trim().toLowerCase()),
  startWith("")
);

const sort$ = fromEvent(sortSelect, "change").pipe(
  map((event) => event.target.value),
  startWith("id-asc")
);

const refresh$ = fromEvent(refreshButton, "click");

const items$ = merge(refresh$, reloadItems$).pipe(
  startWith(null),
  switchMap(() => ajax.getJSON("/items")),
  tap((items) => showMessage(`Загружено записей: ${items.length}`)),
  catchError((error) => {
    showMessage(getErrorMessage(error), true);
    return EMPTY;
  })
);

combineLatest([items$, search$, sort$, page$])
  .pipe(
    map(([items, search, sortType, page]) => {
      const filtered = items.filter((item) =>
        `${item.title} ${item.category} ${item.description}`.toLowerCase().includes(search)
      );
      const sorted = sortItems(filtered, sortType);
      const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
      const currentPage = Math.min(page, pages);
      const startIndex = (currentPage - 1) * PAGE_SIZE;

      return {
        pageItems: sorted.slice(startIndex, startIndex + PAGE_SIZE),
        currentPage,
        pages,
        totalCount: sorted.length
      };
    })
  )
  .subscribe(({ pageItems, currentPage, pages, totalCount }) => {
    totalPages = pages;
    if (page$.value !== currentPage) {
      page$.next(currentPage);
      return;
    }

    updatePageInUrl(currentPage);
    pageInfo.textContent = `Страница ${currentPage} из ${pages}`;
    prevPageButton.disabled = currentPage <= 1;
    nextPageButton.disabled = currentPage >= pages;
    renderPageButtons(currentPage, pages);
    renderTable(pageItems);
    showMessage(`Показано ${pageItems.length} из ${totalCount}`);
  });

merge(search$, sort$).subscribe(() => page$.next(1));

fromEvent(prevPageButton, "click")
  .pipe(withLatestFrom(page$), map(([, page]) => Math.max(1, page - 1)))
  .subscribe((page) => page$.next(page));

fromEvent(nextPageButton, "click")
  .pipe(withLatestFrom(page$), map(([, page]) => Math.min(totalPages, page + 1)))
  .subscribe((page) => page$.next(page));

fromEvent(pageButtons, "click")
  .pipe(
    map((event) => event.target.closest("button[data-page]")),
    filter((button) => Boolean(button)),
    map((button) => Number(button.dataset.page)),
    filter((page) => Number.isInteger(page) && page >= 1 && page <= totalPages)
  )
  .subscribe((page) => page$.next(page));

fromEvent(window, "popstate")
  .pipe(map(() => getPageFromUrl()))
  .subscribe((page) => {
    page$.next(Math.min(Math.max(page, 1), totalPages));
  });

fromEvent(cancelEditButton, "click").subscribe(() => {
  resetForm();
  showMessage("Режим редактирования отменен");
});

fromEvent(form, "submit")
  .pipe(
    tap((event) => event.preventDefault()),
    map(() => {
      const payload = {
        title: fields.title.value.trim(),
        description: fields.description.value.trim(),
        category: fields.category.value.trim(),
        cookTimeMinutes: Number(fields.cookTimeMinutes.value)
      };

      if (fields.id.value) {
        return {
          mode: "edit",
          request: {
            url: `/items/${fields.id.value}`,
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: payload
          }
        };
      }

      return {
        mode: "create",
        request: {
          url: "/items",
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload
        }
      };
    }),
    switchMap(({ mode, request }) =>
      ajax(request).pipe(
        tap(() => {
          resetForm();
          reloadItems$.next(null);
          showMessage(mode === "edit" ? "Запись успешно обновлена" : "Запись успешно добавлена");
        }),
        catchError((error) => {
          showMessage(getErrorMessage(error), true);
          return EMPTY;
        })
      )
    )
  )
  .subscribe();

fromEvent(tableBody, "click")
  .pipe(
    map((event) => event.target.closest("button")),
    filter((button) => Boolean(button)),
    map((button) => ({
      action: button.dataset.action,
      id: button.dataset.id
    })),
    switchMap(({ action, id }) => {
      if (action === "edit") {
        return ajax.getJSON(`/items/${id}`).pipe(
          tap((recipe) => {
            fillForm(recipe);
            showMessage(`Редактирование записи #${id}`);
          }),
          catchError((error) => {
            showMessage(getErrorMessage(error), true);
            return EMPTY;
          })
        );
      }

      if (action === "delete") {
        return ajax({ url: `/items/${id}`, method: "DELETE" }).pipe(
          tap(() => {
            reloadItems$.next(null);
            showMessage("Запись удалена");
          }),
          catchError((error) => {
            showMessage(getErrorMessage(error), true);
            return EMPTY;
          })
        );
      }

      return EMPTY;
    })
  )
  .subscribe();
