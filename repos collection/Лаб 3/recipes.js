// Пустой хэш (объект) для хранения рецептов
let recipes = {};

// ---------- Библиотечные функции (не изменять!) ----------

/**
 * Добавляет пару ключ-значение в хэш
 * @param {string} key - название рецепта
 * @param {string} value - описание рецепта
 */
function AddValue(key, value) {
    recipes[key] = value;
}

/**
 * Удаляет пару с указанным ключом
 * @param {string} key - название рецепта
 */
function DeleteValue(key) {
    delete recipes[key];
}

/**
 * Возвращает описание рецепта или строку "нет информации"
 * @param {string} key - название рецепта
 * @returns {string}
 */
function GetValueInfo(key) {
    if (recipes.hasOwnProperty(key)) {
        return `${key}: ${recipes[key]}`;
    } else {
        return "нет информации";
    }
}

/**
 * Возвращает строку со всеми парами, разделёнными переводом строки
 * @returns {string}
 */
function ListValues() {
    let result = [];
    for (let key in recipes) {
        result.push(`${key}: ${recipes[key]}`);
    }
    return result.join('\n');
}

// ---------- Функции-обработчики для кнопок ----------

function onAdd() {
    let key = prompt("Введите название рецепта:");
    if (!key) return; // если отмена или пусто
    let value = prompt("Введите описание рецепта:");
    if (value === null) return; // отмена
    AddValue(key, value);
    console.log(`✅ Добавлен рецепт: ${key}`);
}

function onDelete() {
    let key = prompt("Введите название рецепта для удаления:");
    if (!key) return;
    if (recipes.hasOwnProperty(key)) {
        DeleteValue(key);
        console.log(`🗑️ Рецепт "${key}" удалён.`);
    } else {
        console.log(`❌ Рецепт "${key}" не найден.`);
    }
}

function onGet() {
    let key = prompt("Введите название рецепта для получения информации:");
    if (!key) return;
    let info = GetValueInfo(key);
    console.log(info);
}

function onList() {
    let list = ListValues();
    if (list === "") {
        console.log("📋 Список рецептов пуст.");
    } else {
        console.log("📋 Все рецепты:\n" + list);
    }
}