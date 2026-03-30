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
        holidays = h.map(holiday => ({
            ...holiday,
            date_start: holiday.date_start.split('.').map(Number),
            date_end: holiday.date_end.split('.').map(Number)
        }));
        products = p;
        recipes = r;
        console.log('Данные загружены', { holidays, products, recipes });
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Определение текущего сезона (для смены темы)
function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

// Определение текущего праздника (рабочая версия)
function getCurrentHoliday() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    
    return holidays.find(holiday => {
        const [startDay, startMonth] = holiday.date_start;
        const [endDay, endMonth] = holiday.date_end;
        
        const startDate = new Date(today.getFullYear(), startMonth - 1, startDay);
        let endDate = new Date(today.getFullYear(), endMonth - 1, endDay);
        if (endDate < startDate) {
            endDate = new Date(today.getFullYear() + 1, endMonth - 1, endDay);
        }
        let currentDate = today;
        if (currentMonth < startMonth && startMonth > endMonth) {
            currentDate = new Date(today.getFullYear() + 1, currentMonth - 1, currentDay);
        }
        return currentDate >= startDate && currentDate <= endDate;
    });
}

// Проверка, является ли дата праздничной (для календаря)
function getHolidayForDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return holidays.find(holiday => {
        const [startDay, startMonth] = holiday.date_start;
        const [endDay, endMonth] = holiday.date_end;
        const startDate = new Date(year, startMonth - 1, startDay);
        let endDate = new Date(year, endMonth - 1, endDay);
        if (endDate < startDate) {
            endDate = new Date(year + 1, endMonth - 1, endDay);
        }
        const currentDate = new Date(year, month - 1, day);
        return currentDate >= startDate && currentDate <= endDate;
    });
}

// Получение сезонных продуктов
function getSeasonalProducts() {
    const currentMonth = new Date().getMonth() + 1;
    return products.filter(product => {
        const start = product.season_start;
        const end = product.season_end;
        if (start <= end) {
            return currentMonth >= start && currentMonth <= end;
        } else {
            return currentMonth >= start || currentMonth <= end;
        }
    });
}

// Рецепты для праздника
function getRecipesForHoliday(holidayId) {
    return recipes.filter(r => r.holiday_id == holidayId);
}

// Рецепты для продукта
function getRecipesForProduct(productId) {
    return recipes.filter(r => r.product_id == productId);
}

// Случайные рецепты для главной (из сезонных или праздничных)
function getRandomRecipes(count = 4) {
    const seasonalProductIds = getSeasonalProducts().map(p => p.id);
    const seasonalRecipes = recipes.filter(r => r.product_id && seasonalProductIds.includes(r.product_id));
    const currentHoliday = getCurrentHoliday();
    const holidayRecipes = currentHoliday ? getRecipesForHoliday(currentHoliday.id) : [];
    const all = [...new Map([...seasonalRecipes, ...holidayRecipes].map(r => [r.id, r])).values()];
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}