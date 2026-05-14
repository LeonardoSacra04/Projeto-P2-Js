const RAWG_KEY = 'b3b0db1042ec4be1b8fc13ebffe0f382';
const BASE_URL = 'https://api.rawg.io/api';


// formatar avaliacao
function avaliacao(rating)
{
    return nota ? nota.toFixed(1) : 'N/A';
}

//simulacao de preco api num tem
// function preco(game)
// {
//     const media = Math.round((jogo.rating || 3) * 20);
//     const preco = 19.99 + (media * 1.8);
//     return Math.min(preco, 299.99).toFixed(2).replace('.', ',');
// }

//pegar preco otra api
async function precoJogo(title) {
    try 
    {
        const url = `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.length > 0) {
            const priceUSD = data[0].cheapest;
            const priceBRL = (parseFloat(priceUSD) * 5.50).toFixed(2);
            return `R$ ${priceBRL.replace('.', ',')}`;
        }
        return 'N/A'; 
    } 
    catch (e) 
    {
        return 'N/A';
    }
}

//genero do jogo
function genero(game)
{
    if(game.genres == null || game.genres.length === 0) return 'jogo';
    return game.genres.slice(0, 2).map(genre => genre.name).join(`/`);
}

// jogos popurarissss
async function jogosPopulares(count = 4) 
{
    const url = `${BASE_URL}/games?key=${RAWG_KEY}&ordering=-rating&page_size=${count}&metacritic=70,100`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// lancamentos
async function lancamentos(count = 4) 
{
    const hoje = new Date();
    const tresMesesAtras = new Date(hoje);
    tresMesesAtras.setMonth(hoje.getMonth() - 3);

    const from = tresMesesAtras.toISOString().split('T')[0];
    const to = today.toISOString().split('T')[0];

    const url = `${BASE_URL}/games?key=${RAWG_KEY}&dates=${from},${to}&ordering=-added&page_size=${count}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

//promocoes