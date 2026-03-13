// Глобальные переменные для данных
let holidays = [];
let products = [];
let recipes = [];

// Загрузка CSV через PapaParse
async function loadCSV(url) {
    const response = await fetch(url);
    const csvText = await response.text();
    return new Promise((resolve) => {
        Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => resolve(result.data)
        });
    });
}

// Загрузка всех данных (ЗАМЕНИТЕ URL!)
async function loadAllData() {
    try {
        const [h, p, r] = await Promise.all([
            loadCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vT8ybbZU5WQhycMuMzzF50XDQnpG0L0cAE27rKfkaXTKGJYJVSyobaGXsnnEOM1Y8pEXwDXVQmYQ9uS/pub?gid=0&single=true&output=csv'),
            loadCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vT8ybbZU5WQhycMuMzzF50XDQnpG0L0cAE27rKfkaXTKGJYJVSyobaGXsnnEOM1Y8pEXwDXVQmYQ9uS/pub?gid=1386507885&single=true&output=csv'),
            loadCSV('https://docs.google.com/spreadsheets/d/e/2PACX-1vT8ybbZU5WQhycMuMzzF50XDQnpG0L0cAE27rKfkaXTKGJYJVSyobaGXsnnEOM1Y8pEXwDXVQmYQ9uS/pub?gid=528289495&single=true&output=csv')
        ]);
        
        holidays = h.map(item => ({
            ...item,
            date_start: item.date_start.split('.').map(Number),
            date_end: item.date_end.split('.').map(Number)
        }));
        
        products = p.map(item => ({
            ...item,
            season: {
                start: parseInt(item.season_start),
                end: parseInt(item.season_end)
            }
        }));
        
        recipes = r;
        return { holidays, products, recipes };
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        return { holidays: [], products: [], recipes: [] };
    }
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

// Определение текущего сезона
function getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
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



// Форматирование даты
function formatDate(date) {
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

<main class="container">
    <div class="main-layout">
        <!-- Левая колонка: календарь -->
        <aside class="calendar-sidebar">
            <section class="calendar-section">
                <h2 class="section-title">📅 Календарь праздников</h2>
                <div id="calendar" class="calendar"></div>
            </section>
        </aside>

        <!-- Правая колонка: основной контент -->
        <div class="main-content">
            <!-- Блок текущего праздника (или приветственный) -->
            <section id="current-holiday" class="hero">
                <h2 id="holiday-title"></h2>
                <p id="holiday-description"></p>
                <a id="holiday-link" href="" class="btn">Праздничные рецепты →</a>
            </section>

            <!-- Сезонные продукты -->
            <section>
                <h2 class="section-title">🍅 Сейчас в сезоне</h2>
                <div id="products-grid" class="grid"></div>
            </section>

            <!-- Рецепты недели -->
            <section>
                <h2 class="section-title">📖 Рецепты недели</h2>
                <div id="recipes-grid" class="grid"></div>
            </section>
        </div>
    </div>
</main>