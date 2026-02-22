// 3 derniers livres
fetch("data/bibliotheque.json")
    .then(r => r.json())
    .then(data => {
        const allTomes = data.flatMap(s => s.tomes);
        const lastThree = allTomes.slice(-3).reverse();

        document.getElementById("last-books-content").innerHTML =
            lastThree.map(t => `
                <img src="${t.cover}" alt="cover">
            `).join("");
    });

// 3 dernières critiques
fetch("data/bibliotheque.json")
    .then(r => r.json())
    .then(data => {
        const critiques = data
            .flatMap(s => s.tomes)
            .filter(t => t.critique);

        const lastThree = critiques.slice(-3).reverse();

        document.getElementById("last-review-list").innerHTML =
            lastThree.map(t => `
                <li>${t.nom}</li>
            `).join("");
    });

// Navigation
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggle-menu");

toggleBtn.onclick = () => {
    sidebar.classList.toggle("collapsed");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "⮞" : "⮜";
};
