// Chargement du dernier livre
fetch("data/bibliotheque.json")
    .then(r => r.json())
    .then(data => {
        const allTomes = data.flatMap(s => s.tomes);
        const last = allTomes[allTomes.length - 1];

        document.getElementById("last-book-content").innerHTML = `
            <img src="${last.cover}" style="width:80px;border-radius:8px;">
            <p>${last.nom}</p>
        `;
    });

// Chargement de la dernière critique
fetch("data/bibliotheque.json")
    .then(r => r.json())
    .then(data => {
        const critiques = data
            .flatMap(s => s.tomes)
            .filter(t => t.critique);

        const last = critiques[critiques.length - 1];

        document.getElementById("last-review-content").innerHTML = `
            <p><strong>${last.nom}</strong></p>
            <p>${last.critique.substring(0, 80)}...</p>
        `;
    });
