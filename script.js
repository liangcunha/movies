document.addEventListener('DOMContentLoaded', function() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-pua825hCuHGSxgEMd9bzvSylThv1xzF-ULY6q3z8yYUk9SzFE8ZA27a3-qR3NtTtFASvc7ypzehi/pub?output=csv';
    const movieListContainer = document.getElementById('movie-list');
    const sortBySelect = document.getElementById('sort-by');
    const filterPlatformSelect = document.getElementById('filter-platform');
    const searchTitleInput = document.getElementById('search-title');
    const lastUpdatedElement = document.getElementById('last-updated');

    const lastUpdatedDate = '15-05-2025';

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    if (lastUpdatedElement) {
        lastUpdatedElement.textContent = `Última atualização: ${formatDate(lastUpdatedDate)}`;
    }

    let allMovies = [];

    fetch(csvUrl)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const headers = rows[0].split(',').map(header => header.trim().replace(/^"/, '').replace(/"$/, ''));
            const moviesData = rows.slice(1).map(row => {
                const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                return values ? values.map(v => v.trim().replace(/^"/, '').replace(/"$/, '')) : [];
            });

            allMovies = moviesData.map(rowValues => {
                const movie = {};
                headers.forEach((header, index) => {
                    movie[header] = rowValues[index] || '';
                });
                return movie;
            });

            populatePlatformFilter(allMovies);
            displayMovies(allMovies);
        })
        .catch(error => {
            console.error('Erro ao buscar os dados:', error);
            movieListContainer.innerHTML = '<p>Erro ao carregar os filmes.</p>';
        });

    function populatePlatformFilter(movies) {
        const platforms = [...new Set(movies.map(movie => movie.plataforma).filter(Boolean))];
        platforms.forEach(platform => {
            const option = document.createElement('option');
            option.value = platform;
            option.textContent = platform;
            filterPlatformSelect.appendChild(option);
        });
    }

    sortBySelect.addEventListener('change', applyFiltersAndSort);
    filterPlatformSelect.addEventListener('change', applyFiltersAndSort);
    searchTitleInput.addEventListener('input', applyFiltersAndSort);

    function applyFiltersAndSort() {
        const sortBy = sortBySelect.value;
        const selectedPlatform = filterPlatformSelect.value;
        const searchTerm = searchTitleInput.value.toLowerCase();

        let filteredMovies = [...allMovies];

        if (selectedPlatform) {
            filteredMovies = filteredMovies.filter(movie => movie.plataforma === selectedPlatform);
        }

        if (searchTerm) {
            filteredMovies = filteredMovies.filter(movie =>
                movie.titulo.toLowerCase().includes(searchTerm)
            );
        }

        let sortedMovies = [...filteredMovies];

        switch (sortBy) {
            case 'titulo':
                sortedMovies.sort((a, b) => a.titulo.localeCompare(b.titulo));
                break;
            case 'ano':
                sortedMovies.sort((a, b) => {
                    const yearA = parseInt(a.ano);
                    const yearB = parseInt(b.ano);
                    return isNaN(yearA) ? 1 : isNaN(yearB) ? -1 : yearA - yearB;
                });
                break;
            case 'nota':
                sortedMovies.sort((a, b) => parseFloat(b.nota) - parseFloat(a.nota));
                break;
        }
        displayMovies(sortedMovies);
    }

    function displayMovies(movies) {
        movieListContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            let posterHtml = '';
            if (movie.capa_url) {
                const imageUrlMatch = movie.capa_url.match(/=image\("([^"]+)"\)/i);
                const imageUrl = imageUrlMatch ? imageUrlMatch[1] : movie.capa_url;
                posterHtml = `<div class="poster-container"><img src="${imageUrl}" alt="Pôster de ${movie.titulo}"></div>`;
            }

            const linkHtml = movie.link ? `<p><a href="${movie.link}" target="_blank">Assistir Agora</a></p>` : '';
            const anoHtml = movie.ano ? `<p><strong>Ano:</strong> ${movie.ano}</p>` : '';

            movieCard.innerHTML = `
                <span class="movie-number">${movie.numero}</span>
                ${posterHtml}
                <h3>${movie.titulo}</h3>
                ${anoHtml}
                ${movie.sinopse ? `<p><strong>Sinopse:</strong> ${movie.sinopse}</p>` : ''}
                ${movie.nota ? `<p><strong>Minha Nota:</strong> ${movie.nota}</p>` : ''}
                ${movie.plataforma ? `<p><strong>Plataforma:</strong> ${movie.plataforma}</p>` : ''}
                ${movie.idioma_legenda ? `<p><strong>Idioma/Legenda:</strong> ${movie.idioma_legenda}</p>` : ''}
                ${linkHtml}
            `;
            movieListContainer.appendChild(movieCard);
        });
    }
});