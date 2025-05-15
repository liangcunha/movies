document.addEventListener('DOMContentLoaded', function() {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-pua825hCuHGSxgEMd9bzvSylThv1xzF-ULY6q3z8yYUk9SzFE8ZA27a3-qR3NtTtFASvc7ypzehi/pub?output=csv';
    const movieListContainer = document.getElementById('movie-list');

    fetch(csvUrl)
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const headers = rows[0].split(',').map(header => header.trim().replace(/^"/, '').replace(/"$/, ''));
            const moviesData = rows.slice(1).map(row => {
                const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                return values ? values.map(v => v.trim().replace(/^"/, '').replace(/"$/, '')) : [];
            });

            const movies = moviesData.map(rowValues => {
                const movie = {};
                headers.forEach((header, index) => {
                    movie[header] = rowValues[index] || '';
                });
                return movie;
            });

            displayMovies(movies);
        })
        .catch(error => {
            console.error('Erro ao buscar os dados:', error);
            movieListContainer.innerHTML = '<p>Erro ao carregar os filmes.</p>';
        });

    function displayMovies(movies) {
        movieListContainer.innerHTML = '';
        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            let posterHtml = '';
            let imageUrl = '';
            if (movie.capa_url) {
                const imageUrlMatch = movie.capa_url.match(/=image\("([^"]+)"\)/i);
                imageUrl = imageUrlMatch ? imageUrlMatch[1] : movie.capa_url;
                console.log("URL da capa:", imageUrl);
                posterHtml = `<div class="poster-container"><img src="${imageUrl}" alt="Pôster de ${movie.titulo}"></div>`;
            } else {
                console.log("URL da capa não encontrada para:", movie.titulo);
            }

            const linkHtml = movie.link ? `<p><a href="${movie.link}" target="_blank">Ver mais</a></p>` : '';

            movieCard.innerHTML = `
                ${posterHtml}
                <h3>${movie.titulo}</h3>
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