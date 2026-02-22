// MENU RÉTRACTABLE
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggle-menu");

toggleBtn.onclick = () => {
    sidebar.classList.toggle("collapsed");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "⮞" : "⮜";
};

// 3 DERNIERS LIVRES
fetch("data/bibliotheque.json")
    .then(r => r.json())
    .then(data => {
        const allTomes = data.flatMap(s => s.tomes);
        const lastThree = allTomes.slice(-3).reverse();

        document.getElementById("last-books-content").innerHTML =
            lastThree.map(t => `<img src="${t.cover}" alt="cover">`).join("");
    });

// 3 DERNIÈRES CRITIQUES
fetch("data/bibliotheque.json")
    .then(r => r.json())
    .then(data => {
        const critiques = data
            .flatMap(s => s.tomes)
            .filter(t => t.critique);

        const lastThree = critiques.slice(-3).reverse();

        document.getElementById("last-review-list").innerHTML =
            lastThree.map(t => `<li>${t.nom}</li>`).join("");
    });

// BUDGET (EXEMPLE SIMPLE)
fetch("data/budget.json")
    .then(r => r.json())
    .then(data => {
        const revenus = (data.revenus || []).reduce((a, b) => a + b.montant, 0);
        const depenses = (data.depenses || []).reduce((a, b) => a + b.montant, 0);
        const solde = revenus - depenses;
        const pourcentage = revenus > 0 ? Math.min(100, (depenses / revenus) * 100) : 0;

        document.getElementById("rev-total").textContent = revenus + "€";
        document.getElementById("dep-total").textContent = depenses + "€";
        document.getElementById("solde").textContent = solde + "€";
        document.getElementById("progress-fill").style.width = pourcentage + "%";
    });

// SPORT (EXEMPLE SIMPLE)
fetch("data/sport.json")
    .then(r => r.json())
    .then(data => {
        document.getElementById("sport-kcal").textContent = data.kcal || 0;
        document.getElementById("sport-dist").textContent = (data.distance || 0) + " km";
        document.getElementById("sport-sessions").textContent = data.sessions || 0;
        document.getElementById("sport-intensity").textContent = (data.intensity || 0) + "%";
    });
