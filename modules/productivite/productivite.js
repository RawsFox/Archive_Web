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

// BOUTONS D'AJOUT
document.getElementById("add-todo").onclick = () => {
    currentType = "todo";
    modalTitle.textContent = "Nouvelle tâche";
    modalInput.value = "";
    modal.classList.remove("hidden");
};

document.getElementById("add-habit").onclick = () => {
    currentType = "habit";
    modalTitle.textContent = "Nouvelle habitude";
    modalInput.value = "";
    modal.classList.remove("hidden");
};

closeBtn.onclick = () => modal.classList.add("hidden");

// LOCALSTORAGE : CHARGEMENT INITIAL
const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
const savedHabits = JSON.parse(localStorage.getItem("habits") || "[]");

savedTodos.forEach(addTodo);
savedHabits.forEach(addHabit);

updateHabitScore();
updateHabitStats();

// SAUVEGARDE TODO
function saveTodos() {
    const items = [...document.querySelectorAll("#todo-list li span")].map(s => s.textContent);
    localStorage.setItem("todos", JSON.stringify(items));
}

// SAUVEGARDE HABITS
function saveHabits() {
    const items = [...document.querySelectorAll("#habits-list li")].map(li => ({
        nom: li.querySelector("span").textContent,
        fait: li.querySelector("input").checked
    }));
    localStorage.setItem("habits", JSON.stringify(items));
}

// AJOUT VIA MODAL
saveBtn.onclick = () => {
    const text = modalInput.value.trim();
    if (!text || !currentType) return;

    if (currentType === "todo") {
        addTodo(text);
        saveTodos();
    }

    if (currentType === "habit") {
        addHabit({ nom: text, fait: false });
        saveHabits();
        updateHabitScore();
        updateHabitStats();
    }

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

    const checkbox = li.querySelector("input");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.onchange = () => {
        saveTodos();
    };

    deleteBtn.onclick = () => {
        li.remove();
        saveTodos();
    };

    document.getElementById("todo-list").appendChild(li);
}

function addHabit(habit) {
    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox" ${habit.fait ? "checked" : ""}>
        <span>${habit.nom}</span>
        <button class="delete-btn">✖</button>
    `;

    const checkbox = li.querySelector("input");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.onchange = () => {
        saveHabits();
        updateHabitScore();
        updateHabitStats();
    };

    deleteBtn.onclick = () => {
        li.remove();
        saveHabits();
        updateHabitScore();
        updateHabitStats();
    };

    document.getElementById("habits-list").appendChild(li);
}

// SCORE HABITUDES

function updateHabitScore() {
    const habits = document.querySelectorAll("#habits-list li input[type='checkbox']");
    const total = habits.length;
    const done = [...habits].filter(h => h.checked).length;

    document.getElementById("habit-score").textContent = `${done} / ${total} complétées`;
}

// STATS HABITUDES

function updateHabitStats() {
    const habits = document.querySelectorAll("#habits-list li input[type='checkbox']");
    const total = habits.length;
    const done = [...habits].filter(h => h.checked).length;

    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("habit-progress").textContent = progress + "%";

    let streak = parseInt(localStorage.getItem("habit-streak") || "0");
    let best = parseInt(localStorage.getItem("habit-best") || "0");

    if (progress === 100 && total > 0) {
        streak++;
        if (streak > best) best = streak;
    } else if (progress < 100) {
        streak = 0;
    }

    localStorage.setItem("habit-streak", streak);
    localStorage.setItem("habit-best", best);

    document.getElementById("habit-streak").textContent = streak;
    document.getElementById("habit-best").textContent = best;
}
