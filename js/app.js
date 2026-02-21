let dataSeries = []; // stockage global pour la recherche

async function chargerBibliotheque() {
    const url = "./data/bibliotheque.json"; // ✔️ CORRECTION GITHUB PAGES
    const response = await fetch(url);
    dataSeries = await response.json();
    afficherSeries(dataSeries);
    activerRecherche();
    activerTri();
}

/* 🌙 MODE SOMBRE */
function activerModeSombre() {
    const bouton = document.getElementById("theme-toggle");

    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark");
        bouton.textContent = "☀️ Mode clair";
    }

    bouton.addEventListener("click", () => {
        document.body.classList.toggle("dark");

        if (document.body.classList.contains("dark")) {
            bouton.textContent = "☀️ Mode clair";
            localStorage.setItem("theme", "dark");
        } else {
            bouton.textContent = "🌙 Mode sombre";
            localStorage.setItem("theme", "light");
        }
    });
}

activerModeSombre();

/* 🔽 AFFICHAGE DES SÉRIES */
function afficherSeries(series) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";

    document.getElementById("tri-tomes-container").style.display = "none";

    series.forEach(serie => {
        const div = document.createElement("div");
        div.classList.add("carte-serie");

        div.innerHTML = `
            <h2>${serie.serie}</h2>
            <p>${serie.tomes.length} tome(s)</p>
        `;

        div.addEventListener("click", () => afficherTomes(dataSeries, serie));
        container.appendChild(div);
    });
}

/* 🔽 AFFICHAGE DES TOMES */
function afficherTomes(series, serie) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";

    const boutonRetour = document.createElement("button");
    boutonRetour.textContent = "← Retour aux séries";
    boutonRetour.classList.add("btn-retour");
    boutonRetour.addEventListener("click", () => afficherSeries(series));
    container.appendChild(boutonRetour);

    const titre = document.createElement("h1");
    titre.textContent = serie.serie;
    container.appendChild(titre);

    document.getElementById("tri-tomes-container").style.display = "block";
    activerTriTomes(serie);

    const listeTomes = document.createElement("div");
    listeTomes.id = "liste-tomes";
    listeTomes.style.display = "flex";
    listeTomes.style.flexWrap = "wrap";
    listeTomes.style.gap = "20px";
    container.appendChild(listeTomes);

    afficherListeTomes(serie.tomes, serie, series);
}

/* 🔽 LISTE DES TOMES */
function afficherListeTomes(tomes, serie, series) {
    const liste = document.getElementById("liste-tomes");
    liste.innerHTML = "";

    tomes.forEach(tome => {
        const div = document.createElement("div");
        div.classList.add("carte-tome");

        div.innerHTML = `
            <img src="${tome.cover}" alt="${tome.nom}">
            <h3>${tome.nom}</h3>
            <p>Tome ${tome.tome}</p>
        `;

        div.addEventListener("click", () => afficherFicheTome(series, serie, tome));
        liste.appendChild(div);
    });
}

/* 🔍 BARRE DE RECHERCHE */
function activerRecherche() {
    const input = document.getElementById("search-input");

    input.addEventListener("input", () => {
        const q = input.value.toLowerCase().trim();

        if (q === "") {
            afficherSeries(dataSeries);
            return;
        }

        const resultats = [];

        dataSeries.forEach(serie => {
            serie.tomes.forEach(tome => {
                const texte = `
                    ${serie.serie}
                    ${tome.nom}
                    ${tome.auteur}
                    ${tome.dessinateur}
                    ${tome.editeur_vf}
                    ${tome.editeur_vo}
                    ${tome.univers}
                    ${tome.codebarre}
                    ${tome.tome}
                `.toLowerCase();

                if (texte.includes(q)) {
                    resultats.push({ serie, tome });
                }
            });
        });

        afficherResultatsRecherche(resultats);
    });
}

function afficherResultatsRecherche(resultats) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";

    document.getElementById("tri-tomes-container").style.display = "none";

    if (resultats.length === 0) {
        container.innerHTML = "<p>Aucun résultat trouvé.</p>";
        return;
    }

    resultats.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("carte-tome");

        div.innerHTML = `
            <img src="${item.tome.cover}" alt="${item.tome.nom}">
            <h3>${item.tome.nom}</h3>
            <p>${item.serie.serie}</p>
        `;

        div.addEventListener("click", () => afficherFicheTome(dataSeries, item.serie, item.tome));
        container.appendChild(div);
    });
}

/* 🔽 TRI DES SÉRIES */
function activerTri() {
    const select = document.getElementById("tri-select");

    select.addEventListener("change", () => {
        const valeur = select.value;

        let copie = [...dataSeries];

        switch (valeur) {
            case "serie-az":
                copie.sort((a, b) => a.serie.localeCompare(b.serie));
                break;

            case "serie-za":
                copie.sort((a, b) => b.serie.localeCompare(a.serie));
                break;

            case "tomes-plus":
                copie.sort((a, b) => b.tomes.length - a.tomes.length);
                break;

            case "tomes-moins":
                copie.sort((a, b) => a.tomes.length - b.tomes.length);
                break;
        }

        afficherSeries(copie);
    });
}

/* 🔽 TRI DES TOMES */
function activerTriTomes(serie) {
    const select = document.getElementById("tri-tomes-select");

    select.onchange = () => {
        let tomes = [...serie.tomes];
        const tri = select.value;

        switch (tri) {
            case "numero-asc":
                tomes.sort((a, b) => a.tome - b.tome);
                break;

            case "numero-desc":
                tomes.sort((a, b) => b.tome - a.tome);
                break;

            case "note-asc":
                tomes.sort((a, b) => (a.note || 0) - (b.note || 0));
                break;

            case "note-desc":
                tomes.sort((a, b) => (b.note || 0) - (a.note || 0));
                break;

            case "alpha-asc":
                tomes.sort((a, b) => a.nom.localeCompare(b.nom));
                break;

            case "alpha-desc":
                tomes.sort((a, b) => b.nom.localeCompare(a.nom));
                break;
        }

        afficherListeTomes(tomes, serie, dataSeries);
    };
}

chargerBibliotheque();