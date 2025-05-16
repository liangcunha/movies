const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-pua825hCuHGSxgEMd9bzvSylThv1xzF-ULY6q3z8yYUk9SzFE8ZA27a3-qR3NtTtFASvc7ypzehi/pub?output=csv';

const movieContainer = document.getElementById('movie-container');
const searchInput = document.getElementById('search');
const platformFilter = document.getElementById('platform-filter');
const ratingFilter = document.getElementById('rating-filter');
const languageFilter = document.getElementById('language-filter');

let allMovies = [];

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.classList.add('movie-card', 'rounded-2xl', 'shadow-lg', 'p-2', 'bg-white', 'dark:bg-gray-800', 'transition-transform', 'hover:scale-105');

  const imageUrl = movie.capa_url?.match(/^=image\("(.+?)"\)/)?.[1] || movie.capa_url || '';

  card.innerHTML = `
    <img src="${imageUrl}" alt="${movie.titulo}" class="w-full h-60 object-cover rounded-xl mb-2">
    <h3 class="text-xl font-semibold">${movie.titulo}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">${movie.ano}</p>
    <p class="text-sm">${movie.plataforma}</p>
    <p class="text-sm">Nota: ${movie.nota}</p>
    <p class="text-sm">Idioma: ${movie.idioma || 'não informado'}</p>
    <p><a href="movie.html?movie=${movie.numero}" target="_blank" class="text-blue-500 hover:underline">Ver Comentários</a></p>
  `;
  return card;
}

function displayMovies(movies) {
  movieContainer.innerHTML = '';
  if (movies.length === 0) {
    movieContainer.innerHTML = '<p class="col-span-full text-center">Nenhum filme encontrado.</p>';
    return;
  }
  movies.forEach(movie => {
    const card = createMovieCard(movie);
    movieContainer.appendChild(card);
  });
}

function filterMovies() {
  const searchText = searchInput.value.toLowerCase();
  const platform = platformFilter.value;
  const rating = parseFloat(ratingFilter.value);
  const language = languageFilter.value;

  const filtered = allMovies.filter(movie => {
    const matchesSearch = movie.titulo.toLowerCase().includes(searchText);
    const matchesPlatform = !platform || movie.plataforma === platform;
    const matchesRating = !rating || parseFloat(movie.nota) >= rating;
    const matchesLanguage = !language || (movie.idioma || '').toLowerCase() === language.toLowerCase();
    return matchesSearch && matchesPlatform && matchesRating && matchesLanguage;
  });

  displayMovies(filtered);
}

function populateFilters(movies) {
  const platforms = [...new Set(movies.map(m => m.plataforma).filter(Boolean))];
  const languages = [...new Set(movies.map(m => m.idioma?.toLowerCase()).filter(Boolean))];

  platforms.sort().forEach(p => {
    const opt = document.createElement('option');
    opt.value = p;
    opt.textContent = p;
    platformFilter.appendChild(opt);
  });

  languages.sort().forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.textContent = l.charAt(0).toUpperCase() + l.slice(1);
    languageFilter.appendChild(opt);
  });
}

fetch(csvUrl)
  .then(response => response.text())
  .then(data => {
    const rows = data.split('\n');
    const headers = rows[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    allMovies = rows.slice(1).map(row => {
      const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const movie = {};
      headers.forEach((h, i) => {
        movie[h] = values[i] ? values[i].trim().replace(/^"|"$/g, '') : '';
      });
      return movie;
    }).filter(m => m.titulo); // Remove linhas vazias

    populateFilters(allMovies);
    displayMovies(allMovies);
  });

searchInput.addEventListener('input', filterMovies);
platformFilter.addEventListener('change', filterMovies);
ratingFilter.addEventListener('change', filterMovies);
languageFilter.addEventListener('change', filterMovies);
