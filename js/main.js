let holidays = [];
let products = [];
let recipes = [];

async function loadJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return await res.json();
}

async function loadAllData() {
    try {
        const [h, p, r] = await Promise.all([
            loadJSON('data/holidays.json'),
            loadJSON('data/products.json'),
            loadJSON('data/recipes.json')
        ]);
        holidays = h.map(hol => ({
            ...hol,
            date_start: hol.date_start.split('.').map(Number),
            date_end: hol.date_end.split('.').map(Number)
        }));
        products = p;
        recipes = r;
        console.log('Данные загружены', { holidays, products, recipes });
    } catch (err) {
        console.error('Ошибка загрузки данных:', err);
    }
}

function getCurrentSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return 'spring';
    if (m >= 6 && m <= 8) return 'summer';
    if (m >= 9 && m <= 11) return 'autumn';
    return 'winter';
}

function getCurrentHoliday() {
    const today = new Date();
    const curDay = today.getDate();
    const curMonth = today.getMonth() + 1;
    return holidays.find(h => {
        const [sD, sM] = h.date_start;
        const [eD, eM] = h.date_end;
        const start = new Date(today.getFullYear(), sM-1, sD);
        let end = new Date(today.getFullYear(), eM-1, eD);
        if (end < start) end = new Date(today.getFullYear()+1, eM-1, eD);
        let cur = today;
        if (curMonth < sM && sM > eM) cur = new Date(today.getFullYear()+1, curMonth-1, curDay);
        return cur >= start && cur <= end;
    });
}

function getHolidayForDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return holidays.find(h => {
        const [sD, sM] = h.date_start;
        const [eD, eM] = h.date_end;
        const start = new Date(year, sM-1, sD);
        let end = new Date(year, eM-1, eD);
        if (end < start) end = new Date(year+1, eM-1, eD);
        const cur = new Date(year, month-1, day);
        return cur >= start && cur <= end;
    });
}

function getSeasonalProducts() {
    const curMonth = new Date().getMonth() + 1;
    return products.filter(p => {
        const s = p.season_start;
        const e = p.season_end;
        if (s <= e) return curMonth >= s && curMonth <= e;
        else return curMonth >= s || curMonth <= e;
    });
}

function getRecipesForHoliday(id) {
    return recipes.filter(r => r.holiday_id == id);
}

function getRecipesForProduct(id) {
    return recipes.filter(r => r.product_id == id);
}

function getRandomRecipes(count = 4) {
    const seasonalIds = getSeasonalProducts().map(p => p.id);
    const seasonalRecipes = recipes.filter(r => r.product_id && seasonalIds.includes(r.product_id));
    const curHoliday = getCurrentHoliday();
    const holidayRecipes = curHoliday ? getRecipesForHoliday(curHoliday.id) : [];
    const all = [...new Map([...seasonalRecipes, ...holidayRecipes].map(r => [r.id, r])).values()];
    return all.sort(() => 0.5 - Math.random()).slice(0, count);
}