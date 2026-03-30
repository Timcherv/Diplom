// Глобальные переменные
let holidays = [];
let products = [];
let recipes = [];

// Загрузка JSON
async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Ошибка ${url}: ${response.status}`);
    return await response.json();
}

// Загрузка всех данных
async function loadAllData() {
    try {
        const [h, p, r] = await Promise.all([
            loadJSON('data/holidays.json'),
            loadJSON('data/products.json'),
            loadJSON('data/recipes.json')
        ]);
        holidays = h;
        products = p;
        recipes = r;
        console.log('Данные загружены', { holidays, products, recipes });
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Текущий сезон (для смены темы)
function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

// Получение сезонных продуктов (исправлено: используем season_start, season_end)
function getSeasonalProducts() {
    const currentMonth = new Date().getMonth() + 1;
    return products.filter(product => {
        const start = product.season_start;
        const end = product.season_end;
        if (start <= end) {
            return currentMonth >= start && currentMonth <= end;
        } else {
            // сезон переходит через год (например, сентябрь–май)
            return currentMonth >= start || currentMonth <= end;
        }
    });
}

// Получение случайных рецептов (4 штуки) из сезонных или праздничных
function getRandomRecipes(count = 4) {
    // Получаем ID сезонных продуктов
    const seasonalProductIds = getSeasonalProducts().map(p => p.id);
    // Рецепты, привязанные к сезонным продуктам
    const seasonalRecipes = recipes.filter(r => r.product_id && seasonalProductIds.includes(r.product_id));
    // Рецепты текущего праздника
    const currentHoliday = getCurrentHoliday();
    const holidayRecipes = currentHoliday ? recipes.filter(r => r.holiday_id == currentHoliday.id) : [];
    // Объединяем и убираем дубликаты
    const all = [...new Map([...seasonalRecipes, ...holidayRecipes].map(r => [r.id, r])).values()];
    // Перемешиваем и берём первые count
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Определение текущего праздника (пример)
function getCurrentHoliday() {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    return holidays.find(h => {
        const [startDay, startMonth] = h.date_start;
        const [endDay, endMonth] = h.date_end;
        const startDate = new Date(today.getFullYear(), startMonth-1, startDay);
        let endDate = new Date(today.getFullYear(), endMonth-1, endDay);
        if (endDate < startDate) endDate = new Date(today.getFullYear()+1, endMonth-1, endDay);
        let cur = today;
        if (month < startMonth && startMonth > endMonth) cur = new Date(today.getFullYear()+1, month-1, day);
        return cur >= startDate && cur <= endDate;
    });
}