class TLocalStorage {
    constructor(storageKey = "recipes_storage") {
        this.storageKey = storageKey;
        this.load();
    }

    // Загружает данные из localStorage в this.storage
    load() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.storage = JSON.parse(saved);
        } else {
            this.storage = {};
        }
    }

    // Сохраняет текущее состояние this.storage в localStorage
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.storage));
    }

    // Полностью очищает хранилище (и в памяти, и в localStorage)
    Reset() {
        this.storage = {};
        this.save();
    }

    // Добавляет или обновляет значение по ключу
    AddValue(key, value) {
        this.storage[key] = value;
        this.save();
    }

    // Возвращает значение по ключу, если оно есть, иначе undefined
    GetValue(key) {
        return this.storage[key];
    }

    // Удаляет значение по ключу
    DeleteValue(key) {
        if (this.storage[key] !== undefined) {
            delete this.storage[key];
            this.save();
        }
    }

    // Возвращает массив всех ключей
    GetKeys() {
        return Object.keys(this.storage);
    }
}

// Создаём экземпляр хранилища (используется во всех функциях ниже)
const recipesStorage = new TLocalStorage();

// --- Функции, вызываемые из HTML ---
function onAdd() {
    const key = prompt("Введите название рецепта:");
    if (!key) return;

    const value = prompt("Введите описание рецепта:");
    if (value === null) return;

    recipesStorage.AddValue(key, value);
    console.log(`Добавлен рецепт: "${key}"`);
}

function onDelete() {
    const key = prompt("Введите название рецепта для удаления:");
    if (!key) return;

    if (recipesStorage.GetValue(key) !== undefined) {
        recipesStorage.DeleteValue(key);
        console.log(`Рецепт "${key}" удалён.`);
    } else {
        console.log(`Рецепт "${key}" не найден.`);
    }
}

function onGet() {
    const key = prompt("Введите название рецепта для получения информации:");
    if (!key) return;

    const value = recipesStorage.GetValue(key);
    if (value !== undefined) {
        console.log(`${key}: ${value}`);
    } else {
        console.log("нет информации");
    }
}

function onList() {
    const keys = recipesStorage.GetKeys();
    if (keys.length === 0) {
        console.log("Список рецептов пуст.");
    } else {
        console.log("Перечень всех рецептов: " + keys.join(", "));
    }
}