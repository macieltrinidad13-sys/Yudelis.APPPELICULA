/**
 * Proyecto: CineStream - Catálogo de Películas TMDB
 * Estudiante: Yudelis Trinidad
 * Tecnología: Vanilla JavaScript / TMDB API
 */

// 1. CONFIGURACIÓN GLOBAL
const API_KEY = "8b6f3be24e8bdc289b2de662a85ee91f"; // Clave directa
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

let currentPage = 1;
let currentSearch = '';

// Referencias al DOM
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const autocomplete = document.getElementById('autocomplete-results');
const sectionTitle = document.getElementById('sectionTitle');

// 2. FUNCIÓN PRINCIPAL DE CARGA
async function getMovies(page = 1, query = '') {
    // Definir endpoint según si hay búsqueda o es el inicio (populares)
    let url = query 
        ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}&page=${page}`
        : `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${page}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.results) {
            // TMDB entrega 20. Tomamos las primeras 12 por página según el requisito UI.
            renderMovies(data.results.slice(0, 12));
        }
    } catch (err) {
        console.error("Error en la conexión:", err);
        movieGrid.innerHTML = `<h3 class="text-white text-center w-100">No se pudieron cargar los datos.</h3>`;
    }
}

// 3. RENDERIZADO DE CARDS (UI/UX)
function renderMovies(movies) {
    movieGrid.innerHTML = '';
    
    movies.forEach(movie => {
        const { title, poster_path, vote_average, overview } = movie;
        
        // Psicología de color: Badge amarillo (#ffc107) para resaltar el rating
        const cardHTML = `
            <div class="col">
                <div class="card h-100 shadow-sm">
                    <img src="${poster_path ? IMG_PATH + poster_path : 'https://via.placeholder.com/500x750?text=Sin+Imagen'}" 
                         class="card-img-top" alt="${title}">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title m-0 text-truncate" style="max-width: 80%;">${title}</h5>
                            <span class="badge bg-warning text-dark">${vote_average.toFixed(1)}</span>
                        </div>
                        <p class="card-text text-secondary mb-3 small">
                            ${overview ? overview.substring(0, 95) + '...' : 'Sin sinopsis disponible actualmente.'}
                        </p>
                    </div>
                </div>
            </div>
        `;
        movieGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// 4. BÚSQUEDA DINÁMICA (Autocomplete autodesplegable)
searchInput.addEventListener('input', async (e) => {
    const val = e.target.value;
    
    if (val.length > 2) {
        try {
            const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${val}`);
            const data = await res.json();
            showAutocomplete(data.results.slice(0, 5));
        } catch (err) { console.error(err); }
    } else {
        autocomplete.classList.add('d-none');
    }
});

function showAutocomplete(movies) {
    autocomplete.innerHTML = '';
    if (movies.length === 0) {
        autocomplete.classList.add('d-none');
        return;
    }

    autocomplete.classList.remove('d-none');
    movies.forEach(movie => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerHTML = `<i class="fa-solid fa-magnifying-glass me-2 small"></i> ${movie.title}`;
        div.onclick = () => {
            searchInput.value = movie.title;
            currentSearch = movie.title;
            currentPage = 1;
            sectionTitle.innerText = `Resultados para: "${movie.title}"`;
            getMovies(1, movie.title);
            autocomplete.classList.add('d-none');
        };
        autocomplete.appendChild(div);
    });
}

// Cerrar autocompletado al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target)) autocomplete.classList.add('d-none');
});

// 5. LÓGICA DE PAGINACIÓN
document.getElementById('nextPage').onclick = () => {
    currentPage++;
    updatePaginationUI();
};

document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        updatePaginationUI();
    }
};

function updatePaginationUI() {
    document.getElementById('currentPage').innerText = currentPage;
    getMovies(currentPage, currentSearch);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Inicialización
window.onload = () => getMovies();
