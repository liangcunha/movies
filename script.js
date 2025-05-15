const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-pua825hCuHGSxgEMd9bzvSylThv1xzF-ULY6q3z8yYUk9SzFE8ZA27a3-qR3NtTtFASvc7ypzehi/pubhtmlhttps://docs.google.com/spreadsheets/d/e/2PACX-1vS-pua825hCuHGSxgEMd9bzvSylThv1xzF-ULY6q3z8yYUk9SzFE8ZA27a3-qR3NtTtFASvc7ypzehi/pub?output=tsv';

async function carregarFilmes() {
  try {
    const res = await fetch(sheetURL);
    const tsvText = await res.text();

    const lines = tsvText.trim().split('\n');
    const filmes = [];

    // Pula o cabeçalho na linha 0 teste
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      if (cols.length < 7) continue; // ignora linhas incompletas

      const filme = {
        titulo: cols[0],
        nota: parseFloat(cols[1]),
        sinopse: cols[2],
        plataforma: cols[3],
        idioma_legenda: cols[4], // "dublado", "legendado" ou "ambos"
        capa_url: cols[5],
        link: cols[6],
      };
      filmes.push(filme);
    }

    // Ordena por nota decrescente
    filmes.sort((a, b) => b.nota - a.nota);

    mostrarFilmes(filmes);
  } catch (err) {
    console.error('Erro ao carregar filmes:', err);
  }
}

function mostrarFilmes(filmes) {
  const container = document.getElementById('movieGrid');
  container.innerHTML = ''; // limpa conteúdo

  filmes.forEach(filme => {
    const card = document.createElement('div');
    card.classList.add('movie-card');

    card.innerHTML = `
      <img src="${filme.capa_url}" alt="Capa do filme ${filme.titulo}" />
      <h3>${filme.titulo} <span>(${filme.nota.toFixed(1)})</span></h3>
      <p>${filme.sinopse}</p>
      <p><strong>Plataforma:</strong> ${filme.plataforma}</p>
      <p><strong>Idioma/Legenda:</strong> ${iconeIdioma(filme.idioma_legenda)}</p>
      <a href="${filme.link}" target="_blank">Assistir</a>
    `;

    container.appendChild(card);
  });
}

function iconeIdioma(text) {
  switch(text.toLowerCase()) {
    case 'dublado': return '🎙️ Dublado';
    case 'legendado': return '📄 Legendado';
    case 'ambos': return '🎙️📄 Dublado/Legendado';
    default: return '';
  }
}

// Chama o carregamento ao abrir a página
carregarFilmes();
