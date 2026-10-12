

class THashStorage {
    constructor() {
        this.storage = {}; 
    }

    
    Reset() {
        this.storage = {};
    }
ы
    AddValue(key, value) {
        this.storage[key] = value;
    }

    
    GetValue(key) {
        return this.storage[key];
    }

    // Удаляет значение по ключу
    DeleteValue(key) {
        delete this.storage[key];
    }

    // Возвращает массив всех ключей
    GetKeys() {
        return Object.keys(this.storage);
    }
}

const recipesStorage = new THashStorage();



function onAdd() {
    const key = prompt("Введите название рецепта:");
    if (!key) return; 

    const value = prompt("Введите описание рецепта:");
    if (value === null) return; 

    recipesStorage.AddValue(key, value);
    console.log(`✅ Добавлен рецепт: "${key}"`);
}

function onDelete() {
    const key = prompt("Введите название рецепта для удаления:");
    if (!key) return;

    if (recipesStorage.GetValue(key) !== undefined) {
        recipesStorage.DeleteValue(key);
        console.log(`🗑️ Рецепт "${key}" удалён.`);
    } else {
        console.log(`❌ Рецепт "${key}" не найден.`);
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