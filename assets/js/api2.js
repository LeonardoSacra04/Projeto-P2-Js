const RAWG_KEY = 'b3b0db1042ec4be1b8fc13ebffe0f382';
const BASE_URL = 'https://api.rawg.io/api';


//simulacao de preco api num tem
// function preco(game)
// {
//     const media = Math.round((jogo.rating || 3) * 20);
//     const preco = 19.99 + (media * 1.8);
//     return Math.min(preco, 299.99).toFixed(2).replace('.', ',');
// }

// formatar avaliacao
function avaliacao(rating) {
    return rating ? rating.toFixed(1) : 'N/A';
}

// genero do jogo
function genero(game) {
    if (!game.genres?.length) return 'jogo';
    return game.genres.slice(0, 2).map(g => g.name).join('/');
}

// pegar preco otra api
async function precoJogo(title) {
    try {
        const res = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=1`);
        const data = await res.json();
        if (data.length > 0)
            return `R$ ${(parseFloat(data[0].cheapest) * 5.50).toFixed(2).replace('.', ',')}`;
        return 'N/A';
    } catch { return 'N/A'; }
}

// jogos popurarissss
async function jogosPopulares(count = 4) {
    const res = await fetch(`${BASE_URL}/games?key=${RAWG_KEY}&ordering=-rating&page_size=${count}&metacritic=70,100`);
    const data = await res.json();
    return data.results || [];
}

// lancamentos
async function lancamentos(count = 4) {
    const hoje = new Date();
    const from = new Date(hoje.setMonth(hoje.getMonth() - 3)).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];
    const res = await fetch(`${BASE_URL}/games?key=${RAWG_KEY}&dates=${from},${to}&ordering=-added&page_size=${count}`);
    const data = await res.json();
    return data.results || [];
}

// promooooos
async function promocoes(count = 4) {
    try {
        const res = await fetch(`https://www.cheapshark.com/api/1.0/deals?sortBy=savings&desc=true&pageSize=${count}&upperPrice=30`);
        const data = await res.json();
        const jogos = await Promise.all(data.map(async (deal) => {
            const r = await fetch(`${BASE_URL}/games?key=${RAWG_KEY}&search=${encodeURIComponent(deal.title)}&page_size=1`);
            const jogo = (await r.json()).results?.[0];
            if (!jogo) return null;
            return {
                ...jogo,
                precoOriginal: `R$ ${(parseFloat(deal.normalPrice) * 5.50).toFixed(2).replace('.', ',')}`,
                precoPromocao: `R$ ${(parseFloat(deal.salePrice) * 5.50).toFixed(2).replace('.', ',')}`,
                desconto: Math.round(parseFloat(deal.savings))
            };
        }));
        return jogos.filter(Boolean);
    } catch { return []; }
}


async function renderCards(selectorId, jogos, isPromo = false) {
    const cards = document.querySelectorAll(`#${selectorId} .skeletonCard`);
    for (let i = 0; i < cards.length; i++) {
        const jogo = jogos[i];
        if (!jogo) continue;
        cards[i].querySelector('img').src = jogo.background_image || 'https://placehold.co/220x220';
        cards[i].querySelector('img').alt = jogo.name;
        cards[i].querySelector('h3').textContent = jogo.name;
        cards[i].querySelectorAll('p')[0].textContent = `${avaliacao(jogo.rating)} | ${genero(jogo)}`;
        cards[i].querySelectorAll('p')[1].innerHTML = isPromo
            ? `<s>${jogo.precoOriginal}</s> ${jogo.precoPromocao}`
            : await precoJogo(jogo.name);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    renderCards('popularGames',       await jogosPopulares());
    renderCards('lancamentosCarousel', await lancamentos());
    renderCards('promocoesCarousel',   await promocoes(), true);
});