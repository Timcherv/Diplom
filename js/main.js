// Глобальные переменные для данных
let holidays = [];
let products = [];
let recipes = [];

// Загрузка JSON-файлов
async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Ошибка загрузки ${url}: ${response.status}`);
    }
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
        
        // Преобразуем строки дат в массивы [день, месяц] для удобства
        holidays = holidays.map(holiday => ({
            ...holiday,
            date_start: holiday.date_start.split('.').map(Number),
            date_end: holiday.date_end.split('.').map(Number)
        }));
        
        // Преобразуем сезоны (start/end уже числа)
        products = products.map(product => ({
            ...product,
            season: {
                start: product.season_start,
                end: product.season_end
            }
        }));
        
        console.log('Данные загружены из JSON-файлов', { holidays, products, recipes });
        return { holidays, products, recipes };
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return { holidays: [], products: [], recipes: [] };
    }
}

// Определение текущего сезона
function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
}

// Определение текущего праздника
function getCurrentHoliday() {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1;
    
    return holidays.find(holiday => {
        const [startDay, startMonth] = holiday.date_start;
        const [endDay, endMonth] = holiday.date_end;
        
        const startDate = new Date(today.getFullYear(), startMonth - 1, startDay);
        let endDate = new Date(today.getFullYear(), endMonth - 1, endDay);
        
        // Если праздник переходит через год (например, Новый год)
        if (endDate < startDate) {
            endDate = new Date(today.getFullYear() + 1, endMonth - 1, endDay);
        }
        
        // Для праздников, начинающихся в конце года, а заканчивающихся в начале следующего
        let currentDate = today;
        if (currentMonth < startMonth && startMonth > endMonth) {
            currentDate = new Date(today.getFullYear() + 1, currentMonth - 1, currentDay);
        }
        
        return currentDate >= startDate && currentDate <= endDate;
    });
}

// Получение сезонных продуктов
function getSeasonalProducts() {
    const currentMonth = new Date().getMonth() + 1;
    return products.filter(product => {
        const { start, end } = product.season;
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

// Случайные рецепты для главной
function getRandomRecipes(count = 4) {
    const seasonalProductIds = getSeasonalProducts().map(p => p.id);
    const seasonalRecipes = recipes.filter(r => r.product_id && seasonalProductIds.includes(r.product_id));
    const currentHoliday = getCurrentHoliday();
    const holidayRecipes = currentHoliday ? getRecipesForHoliday(currentHoliday.id) : [];
    const all = [...new Set([...seasonalRecipes, ...holidayRecipes])];
    const shuffled = all.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Проверка, является ли дата праздничной
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