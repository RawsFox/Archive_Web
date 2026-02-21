let dataSeries = [];

// Chargement du JSON
async function chargerBibliotheque() {
    const url = "./data/bibliotheque.json";
    const response = await fetch(url);
    dataSeries = await response.json();
    afficherSeries(dataSeries);
    activerRecherche();
    activerTriSeries();
    activerModeSombre();
}

function activerModeSombre() {
    const bouton = document.getElementById("theme-toggle");
    const theme = localStorage.getItem("theme") || "dark";

    if (theme === "light") {
        document.body.classList.add("light");
        bouton.textContent = "☀️";
    } else {
        bouton.textContent = "🌙";
    }

    bouton.addEventListener("click", () => {
        document.body.classList.toggle("light");
        const nouveauTheme = document.body.classList.contains("light") ? "light" : "dark";
        localStorage.setItem("theme", nouveauTheme);
        bouton.textContent = nouveauTheme === "light" ? "☀️" : "🌙";
    });
}

/* AFFICHAGE DES SÉRIES */

function afficherSeries(series) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";

    const triTomesSelect = document.getElementById("tri-tomes-select");
    triTomesSelect.style.display = "none";

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

/* PAGE SÉRIE */

function afficherTomes(series, serie) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";

    const triTomesSelect = document.getElementById("tri-tomes-select");
    triTomesSelect.style.display = "inline-block";
    triTomesSelect.value = "";

    const boutonRetour = document.createElement("button");
    boutonRetour.classList.add("btn-retour");
    boutonRetour.innerHTML = "← Retour aux séries";
    boutonRetour.addEventListener("click", () => {
        triTomesSelect.style.display = "none";
        afficherSeries(series);
    });
    container.appendChild(boutonRetour);

    const titre = document.createElement("h1");
    titre.classList.add("page-serie-titre");
    titre.textContent = serie.serie;
    container.appendChild(titre);

    const statut = document.createElement("p");
    statut.classList.add("page-serie-statut");
    statut.textContent = serie.statut || "Statut : inconnu";
    container.appendChild(statut);

    const grille = document.createElement("div");
    grille.classList.add("grille-tomes");
    grille.id = "grille-tomes";
    container.appendChild(grille);

    afficherListeTomes(serie.tomes, serie, series);
    activerTriTomes(serie);
}

/* LISTE DES TOMES */

function afficherListeTomes(tomes, serie, series) {
    const grille = document.getElementById("grille-tomes");
    grille.innerHTML = "";

    tomes.forEach(tome => {
        const div = document.createElement("div");
        div.classList.add("carte-tome");

        div.innerHTML = `
            <img src="${tome.cover}" alt="${tome.nom}">
            <h3>${tome.nom}</h3>
            <p>Tome ${tome.tome}</p>
        `;

        div.addEventListener("click", () => afficherFicheTome(series, serie, tome));
        grille.appendChild(div);
    });
}

/* FICHE TOME AVEC TOUTES LES INFOS DU JSON */

function afficherFicheTome(series, serie, tome) {
    const container = document.getElementById("liste-series");
    container.innerHTML = "";

    const triTomesSelect = document.getElementById("tri-tomes-select");
    triTomesSelect.style.display = "none";

    const boutonRetour = document.createElement("button");
    boutonRetour.classList.add("btn-retour");
    boutonRetour.innerHTML = "← Retour à la série";
    boutonRetour.addEventListener("click", () => afficherTomes(series, serie));
    container.appendChild(boutonRetour);

    const fiche = document.createElement("div");
    fiche.classList.add("fiche-tome-layout");

    fiche.innerHTML = `
        <div class="fiche-left">
            <div class="fiche-cover">
                <img src="${tome.cover}" alt="${tome.nom}">
            </div>

            <div class="fiche-nav-tomes">
                <button class="nav-tome-btn" id="tome-prev">← Tome précédent</button>
                <button class="nav-tome-btn" id="tome-next">Tome suivant →</button>
            </div>
        </div>

        <div class="fiche-right">
            <h2>${tome.nom}</h2>
            <p><strong>Série :</strong> ${serie.serie}</p>
            <p><strong>Tome :</strong> ${tome.tome}</p>
            ${tome.résumé ? `<p><strong>Résumé :</strong> ${tome.résumé}</p>` : ""}
            ${tome.sommaire ? `<p><strong>Sommaire :</strong> ${tome.sommaire}</p>` : ""}
            ${tome.auteur ? `<p><strong>Auteur :</strong> ${tome.auteur}</p>` : ""}
            ${tome.dessinateur && tome.dessinateur !== false ? `<p><strong>Dessinateur :</strong> ${tome.dessinateur}</p>` : ""}
            ${tome.editeur_vf ? `<p><strong>Éditeur VF :</strong> ${tome.editeur_vf}</p>` : ""}
            ${tome.editeur_vo ? `<p><strong>Éditeur VO :</strong> ${tome.editeur_vo}</p>` : ""}
            ${tome.univers && tome.univers !== false ? `<p><strong>Univers :</strong> ${tome.univers}</p>` : ""}
            <p><strong>Numérique :</strong> ${tome.numerique ? "Oui" : "Non"}</p>
            ${tome.codebarre ? `<p><strong>Code-barres :</strong> ${tome.codebarre}</p>` : ""}
            ${tome.note ? `<p><strong>Note :</strong> ${tome.note}/10</p>` : ""}
            ${tome.critique ? `<p><strong>Critique :</strong> ${tome.critique}</p>` : ""}
        </div>
    `;

    container.appendChild(fiche);

    const index = serie.tomes.indexOf(tome);

    const prevBtn = document.getElementById("tome-prev");
    const nextBtn = document.getElementById("tome-next");

    prevBtn.onclick = () => {
        if (index > 0) afficherFicheTome(series, serie, serie.tomes[index - 1]);
    };

    nextBtn.onclick = () => {
        if (index < serie.tomes.length - 1) afficherFicheTome(series, serie, serie.tomes[index + 1]);
    };
}

/* RECHERCHE */

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
                    ${tome.auteur || ""}
                    ${tome.dessinateur || ""}
                    ${tome.editeur_vf || ""}
                    ${tome.editeur_vo || ""}
                    ${tome.univers || ""}
                    ${tome.codebarre || ""}
                    ${tome.tome}
                    ${tome.résumé || ""}
                    ${tome.sommaire || ""}
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

    const triTomesSelect = document.getElementById("tri-tomes-select");
    triTomesSelect.style.display = "none";

    if (resultats.length === 0) {
        container.innerHTML = "<p>Aucun résultat trouvé.</p>";
        return;
    }

    const grille = document.createElement("div");
    grille.classList.add("grille-tomes");
    container.appendChild(grille);

    resultats.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("carte-tome");

        div.innerHTML = `
            <img src="${item.tome.cover}" alt="${item.tome.nom}">
            <h3>${item.tome.nom}</h3>
            <p>${item.serie.serie}</p>
        `;

        div.addEventListener("click", () => afficherFicheTome(dataSeries, item.serie, item.tome));
        grille.appendChild(div);
    });
}

/* TRI SÉRIES */

function activerTriSeries() {
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

/* TRI TOMES */

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