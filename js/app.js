let dataSeries = [];

// =======================
// CHARGEMENT JSON
// =======================
async function chargerBibliotheque() {
    const response = await fetch("./data/bibliotheque.json");
    dataSeries = await response.json();
    afficherSeries(dataSeries);
    activerRecherche();
    activerTriSeries();
}

// =======================
// PAGE SÉRIES
// =======================
function afficherSeries(series) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";
    document.querySelector(".toolbar").style.display = "flex";

    series.forEach(serie => {
        const div = document.createElement("div");
        div.classList.add("carte-serie");

        div.innerHTML = `
            <h2>${serie.serie}</h2>
            <p>${serie.tomes.length} tome(s)</p>
        `;

        div.onclick = () => afficherTomes(dataSeries, serie);
        container.appendChild(div);
    });
}

// =======================
// PAGE SÉRIE
// =======================
function afficherTomes(series, serie) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";
    document.querySelector(".toolbar").style.display = "none";

    // Barre série
    const header = document.createElement("div");
    header.classList.add("serie-header");

    const retour = document.createElement("div");
    retour.classList.add("serie-retour");
    retour.textContent = "←";
    retour.onclick = () => afficherSeries(series);

    const titre = document.createElement("h1");
    titre.classList.add("serie-titre");
    titre.textContent = serie.serie;

    const statut = document.createElement("span");
    statut.classList.add("serie-statut");
    statut.textContent = serie.statut;

    const s = serie.statut.toLowerCase();
    if (s === "en cours") statut.classList.add("statut-en-cours");
    if (s === "terminée" || s === "terminee") statut.classList.add("statut-terminee");
    if (s === "abandonnée" || s === "abandonnee") statut.classList.add("statut-abandonnee");

    header.append(retour, titre, statut);
    container.appendChild(header);

    // Grille tomes
    const grille = document.createElement("div");
    grille.classList.add("grille-tomes");
    container.appendChild(grille);

    serie.tomes.forEach(tome => {
        const div = document.createElement("div");
        div.classList.add("carte-tome");

        div.innerHTML = `
            <img src="${tome.cover}">
            <h3>${tome.nom}</h3>
            <p>Tome ${tome.tome}</p>
        `;

        div.onclick = () => afficherFicheTome(series, serie, tome);
        grille.appendChild(div);
    });
}

// =======================
// PAGE TOME
// =======================
function afficherFicheTome(series, serie, tome) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";
    document.querySelector(".toolbar").style.display = "none";

    const retour = document.createElement("div");
    retour.classList.add("retour-fleche");
    retour.textContent = "←";
    retour.onclick = () => afficherTomes(series, serie);
    container.appendChild(retour);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche-tome-layout");

    fiche.innerHTML = `
        <div class="fiche-cover">
            <img src="${tome.cover}">
            <div class="fiche-nav-tomes">
                <button class="nav-tome-btn" id="prev">← Tome précédent</button>
                <button class="nav-tome-btn" id="next">Tome suivant →</button>
            </div>
        </div>

        <div class="fiche-right">
            <h2>${tome.nom}</h2>
            <p><strong>Série :</strong> ${serie.serie}</p>
            <p><strong>Tome :</strong> ${tome.tome}</p>
            ${tome.résumé ? `<p><strong>Résumé :</strong> ${tome.résumé}</p>` : ""}
            ${tome.sommaire ? `<p><strong>Sommaire :</strong> ${tome.sommaire}</p>` : ""}
            ${tome.auteur ? `<p><strong>Auteur :</strong> ${tome.auteur}</p>` : ""}
        </div>
    `;

    container.appendChild(fiche);

    const index = serie.tomes.indexOf(tome);

    document.getElementById("prev").onclick = () => {
        if (index > 0) afficherFicheTome(series, serie, serie.tomes[index - 1]);
    };

    document.getElementById("next").onclick = () => {
        if (index < serie.tomes.length - 1) afficherFicheTome(series, serie, serie.tomes[index + 1]);
    };
}

// =======================
// RECHERCHE
// =======================
function activerRecherche() {
    const input = document.getElementById("search-input");

    input.oninput = () => {
        const q = input.value.toLowerCase().trim();
        if (!q) return afficherSeries(dataSeries);

        const resultats = [];

        dataSeries.forEach(serie => {
            serie.tomes.forEach(tome => {
                const texte = `
                    ${serie.serie}
                    ${tome.nom}
                    ${tome.auteur || ""}
                    ${tome.résumé || ""}
                `.toLowerCase();

                if (texte.includes(q)) resultats.push({ serie, tome });
            });
        });

        afficherResultatsRecherche(resultats);
    };
}

function afficherResultatsRecherche(resultats) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";
    document.querySelector(".toolbar").style.display = "flex";

    const grille = document.createElement("div");
    grille.classList.add("grille-tomes");
    container.appendChild(grille);

    resultats.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("carte-tome");

        div.innerHTML = `
            <img src="${item.tome.cover}">
            <h3>${item.tome.nom}</h3>
            <p>${item.serie.serie}</p>
        `;

        div.onclick = () => afficherFicheTome(dataSeries, item.serie, item.tome);
        grille.appendChild(div);
    });
}

// =======================
// TRI DES SÉRIES
// =======================
function activerTriSeries() {
    const select = document.getElementById("tri-select");

    select.onchange = () => {
        let copie = [...dataSeries];

        if (select.value === "serie-az") copie.sort((a, b) => a.serie.localeCompare(b.serie));
        if (select.value === "serie-za") copie.sort((a, b) => b.serie.localeCompare(a.serie));
        if (select.value === "tomes-plus") copie.sort((a, b) => b.tomes.length - a.tomes.length);
        if (select.value === "tomes-moins") copie.sort((a, b) => a.tomes.length - b.tomes.length);

        afficherSeries(copie);
    };
}

// =======================
// LANCEMENT
// =======================
chargerBibliotheque();