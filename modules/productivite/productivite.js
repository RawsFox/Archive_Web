// MENU RÉTRACTABLE
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggle-menu");

toggleBtn.onclick = () => {
    sidebar.classList.toggle("collapsed");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "⮞" : "⮜";
};

// MODAL
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalInput = document.getElementById("modal-input");
const saveBtn = document.getElementById("save-btn");
const closeBtn = document.getElementById("close-btn");

let currentType = null;

// OUVERTURE MODAL
document.getElementById("add-todo").onclick = () => {
    currentType = "todo";
    modalTitle.textContent = "Nouvelle tâche";
    modal.classList.remove("hidden");
};

document.getElementById("add-habit").onclick = () => {
    currentType = "habit";
    modalTitle.textContent = "Nouvelle habitude";
    modal.classList.remove("hidden");
};

closeBtn.onclick = () => modal.classList.add("hidden");

// CHARGEMENT JSON
fetch("../../data/productivite.json")
    .then(r => r.json())
    .then(data => {
        data.todos.forEach(addTodo);
        data.habits.forEach(addHabit);
    });

// AJOUT
saveBtn.onclick = () => {
    const text = modalInput.value.trim();
    if (!text) return;

    if (currentType === "todo") addTodo(text);
    if (currentType === "habit") addHabit({ nom: text, fait: false });

    modalInput.value = "";
    modal.classList.add("hidden");
};

// FONCTIONS D'AJOUT
function addTodo(text) {
    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox">
        <span>${text}</span>
        <button class="delete-btn">✖</button>
    `;

    li.querySelector(".delete-btn").onclick = () => li.remove();

    document.getElementById("todo-list").appendChild(li);
}

function addHabit(habit) {
    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox" ${habit.fait ? "checked" : ""}>
        <span>${habit.nom}</span>
        <button class="delete-btn">✖</button>
    `;

    li.querySelector(".delete-btn").onclick = () => li.remove();

    document.getElementById("habits-list").appendChild(li);
}
