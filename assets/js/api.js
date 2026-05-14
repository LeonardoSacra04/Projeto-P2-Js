// ─── RAWG API WRAPPER ───────────────────────────────────────────────────────
// Substitua pela sua chave em https://rawg.io/apidocs
const RAWG_KEY = 'b3b0db1042ec4be1b8fc13ebffe0f382';
const BASE_URL = 'https://api.rawg.io/api';

// Converte rating (0-5) para exibição
function formatRating(rating) {
    return rating ? rating.toFixed(1) : 'N/A';
}

// Simula preço em BRL baseado no Metacritic/rating (RAWG não fornece preços reais)
function simulatePrice(game) {
    const base = game.metacritic || Math.round((game.rating || 3) * 20);
    const price = 19.99 + (base * 1.8);
    return Math.min(price, 299.99).toFixed(2).replace('.', ',');
}

// Retorna desconto simulado para promoções
function simulateDiscount() {
    const discounts = [10, 20, 25, 30, 40, 50, 60, 75];
    return discounts[Math.floor(Math.random() * discounts.length)];
}

// Retorna gênero legível
function getGenre(game) {
    if (!game.genres || game.genres.length === 0) return 'Jogo';
    return game.genres.slice(0, 2).map(g => g.name).join(' / ');
}

// ─── ENDPOINTS ───────────────────────────────────────────────────────────────

// Jogos populares (melhor avaliados geral)
async function fetchPopularGames(count = 8) {
    const url = `${BASE_URL}/games?key=${RAWG_KEY}&ordering=-rating&page_size=${count}&metacritic=70,100`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// Lançamentos recentes
async function fetchNewReleases(count = 8) {
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    const from = threeMonthsAgo.toISOString().split('T')[0];
    const to   = today.toISOString().split('T')[0];

    const url = `${BASE_URL}/games?key=${RAWG_KEY}&dates=${from},${to}&ordering=-added&page_size=${count}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// "Promoções" – jogos bem avaliados mas mais antigos (simulado)
async function fetchSaleGames(count = 8) {
    const url = `${BASE_URL}/games?key=${RAWG_KEY}&ordering=-added&page_size=${count}&dates=2018-01-01,2022-12-31&metacritic=75,100`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// Detalhes de um jogo específico
async function fetchGameDetails(id) {
    const [detailRes, screenshotsRes] = await Promise.all([
        fetch(`${BASE_URL}/games/${id}?key=${RAWG_KEY}`),
        fetch(`${BASE_URL}/games/${id}/screenshots?key=${RAWG_KEY}`)
    ]);
    const detail = await detailRes.json();
    const screenshots = await screenshotsRes.json();
    return { ...detail, screenshots: screenshots.results || [] };
}

// Busca por texto
async function searchGames(query, count = 6) {
    if (!query || query.length < 2) return [];
    const url = `${BASE_URL}/games?key=${RAWG_KEY}&search=${encodeURIComponent(query)}&page_size=${count}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// ─── CARD BUILDER ────────────────────────────────────────────────────────────
function buildGameCard(game, showDiscount = false) {
    const price = simulatePrice(game);
    const genre = getGenre(game);
    const rating = formatRating(game.rating);
    const slug = game.slug || game.id;

    let priceHTML;
    if (showDiscount) {
        const disc = simulateDiscount();
        const original = (parseFloat(price.replace(',', '.')) * (100 / (100 - disc))).toFixed(2).replace('.', ',');
        priceHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                <span class="game-card__price--original">R$ ${original}</span>
                <span class="game-card__discount">-${disc}%</span>
                <span class="game-card__price">R$ ${price}</span>
            </div>`;
    } else {
        priceHTML = `<span class="game-card__price">R$ ${price}</span>`;
    }

    const card = document.createElement('a');
    card.href = `pages/jogo.html?id=${slug}`;
    card.className = 'game-card';
    card.innerHTML = `
        <img class="game-card__thumb" src="${game.background_image || ''}" alt="${game.name}" loading="lazy" onerror="this.src='assets/imagens/placeholder.jpg'">
        <div class="game-card__body">
            <div class="game-card__title">${game.name}</div>
            <div class="game-card__meta">
                <span class="game-card__rating">★ ${rating}</span>
                <span class="game-card__sep"></span>
                <span class="game-card__genre">${genre}</span>
            </div>
            ${priceHTML}
        </div>`;
    return card;
}

function clearAndFill(containerId, games, showDiscount = false) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    games.forEach(g => el.appendChild(buildGameCard(g, showDiscount)));
}