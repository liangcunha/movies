document.addEventListener('DOMContentLoaded', function() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-pua825hCuHGSxgEMd9bzvSylThv1xzF-ULY6q3z8yYUk9SzFE8ZA27a3-qR3NtTtFASvc7ypzehi/pub?output=csv';
    const movieListContainer = document.getElementById('movie-list');

    fetch(csvUrl)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n').map(row => row.split(','));
            const headers = rows[0].map(header => header.trim());
            const movies = [];

            for (let i = 1; i < rows.length; i++) {
                const movieData = {};
                for (let j = 0; j < headers.length; j++) {
                    movieData[headers[j]] = rows[i][j] ? rows[i][j].trim() : '';
                }
                movies.push(movieData);
            }

            displayMovies(movies);
        })
        .catch(error => {
            console.error('Erro ao buscar os dados:', error);
            movieListContainer.innerHTML = '<p>Erro ao carregar os filmes.</p>';
        });

    function displayMovies(movies) {
        movieListContainer.innerHTML = ''; // Limpa a mensagem de "Carregando..."
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            let posterHtml = '';
            if (movie.capa_url) {
                posterHtml = `<div class="poster-container"><img src="${movie.capa_url}" alt="Pôster de ${movie.titulo}"></div>`;
            }

            movieCard.innerHTML = `
                ${posterHtml}
                <h3>${movie.titulo}</h3>
                ${movie.sinopse ? `<p><strong>Sinopse:</strong> ${movie.sinopse}</p>` : ''}
                ${movie.nota ? `<p><strong>Minha Nota:</strong> ${movie.nota}</p>` : ''}
                ${movie.plataforma ? `<p><strong>Plataforma:</strong> ${movie.plataforma}</p>` : ''}
                ${movie.idioma_legenda ? `<p><strong>Idioma/Legenda:</strong> ${movie.idioma_legenda}</p>` : ''}
                ${movie.link ? `<p><a href="${movie.link}" target="_blank">Ver mais</a></p>` : ''}
            `;
            movieListContainer.appendChild(movieCard);
        });
    }
});