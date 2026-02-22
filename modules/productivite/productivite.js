// --------- MENU RÉTRACTABLE ---------
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggle-menu");

toggleBtn.onclick = () => {
    sidebar.classList.toggle("collapsed");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "⮞" : "⮜";
};

// --------- MODAL ---------
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const saveBtn = document.getElementById("save-btn");
const closeBtn = document.getElementById("close-btn");

const modalTodoFields = document.getElementById("modal-todo-fields");
const modalHabitFields = document.getElementById("modal-habit-fields");

const todoTitleInput = document.getElementById("todo-title");
const todoDescInput = document.getElementById("todo-desc");
const todoDueInput = document.getElementById("todo-due");
const todoCategoryInput = document.getElementById("todo-category");
const todoPriorityInput = document.getElementById("todo-priority");

const habitNameInput = document.getElementById("habit-name");

let currentMode = null; // "todo" ou "habit"

// --------- DOM LISTES ---------
const todoListEl = document.getElementById("todo-list");
const todoDoneListEl = document.getElementById("todo-done-list");
const habitsListEl = document.getElementById("habits-list");
const sortSelect = document.getElementById("todo-sort");

// --------- LOCALSTORAGE KEYS ---------
const LS_TODOS = "todos_v2";
const LS_HABITS = "habits_v2";
const LS_HABIT_STREAK = "habit_streak";
const LS_HABIT_BEST = "habit_best";
const LS_HABIT_DATE = "habit_date";
const LS_HABIT_TODAY_COMPLETED = "habit_today_completed";

// --------- ÉTAT ---------
let todos = [];
let habits = [];

// --------- UTIL ---------
function todayString() {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function createId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// --------- CHARGEMENT INITIAL ---------
function loadState() {
    todos = JSON.parse(localStorage.getItem(LS_TODOS) || "[]");
    habits = JSON.parse(localStorage.getItem(LS_HABITS) || "[]");

    // Reset quotidien des habitudes
    const storedDate = localStorage.getItem(LS_HABIT_DATE);
    const today = todayString();

    if (storedDate !== today) {
        // nouveau jour → on remet toutes les habitudes à false
        habits = habits.map(h => ({ ...h, fait: false }));
        localStorage.setItem(LS_HABITS, JSON.stringify(habits));
        localStorage.setItem(LS_HABIT_DATE, today);
        localStorage.setItem(LS_HABIT_TODAY_COMPLETED, "false");
    } else {
        // même jour → on ne touche pas au flag today_completed
        if (localStorage.getItem(LS_HABIT_TODAY_COMPLETED) === null) {
            localStorage.setItem(LS_HABIT_TODAY_COMPLETED, "false");
        }
    }

    renderTodos();
    renderHabits();
    updateHabitScore();
    updateHabitStats();
}

// --------- SAUVEGARDE ---------
function saveTodos() {
    localStorage.setItem(LS_TODOS, JSON.stringify(todos));
}

function saveHabits() {
    localStorage.setItem(LS_HABITS, JSON.stringify(habits));
}

// --------- RENDER TODO ---------
function renderTodos() {
    todoListEl.innerHTML = "";
    todoDoneListEl.innerHTML = "";

    const sortBy = sortSelect.value;
    const sorted = [...todos].sort((a, b) => {
        if (sortBy === "created") {
            return new Date(a.created) - new Date(b.created);
        }
        if (sortBy === "due") {
            return (a.due || "").localeCompare(b.due || "");
        }
        if (sortBy === "category") {
            return (a.category || "").localeCompare(b.category || "");
        }
        if (sortBy === "priority") {
            return (a.priority || 3) - (b.priority || 3);
        }
        return 0;
    });

    sorted.forEach(todo => {
        const li = document.createElement("li");
        li.className = "todo-item";
        li.draggable = !todo.done;
        li.dataset.id = todo.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!todo.done;

        const main = document.createElement("div");
        main.className = "todo-main";

        const titleRow = document.createElement("div");
        titleRow.className = "todo-title-row";

        const titleSpan = document.createElement("span");
        titleSpan.className = "todo-title";
        titleSpan.textContent = todo.title;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✖";

        titleRow.appendChild(titleSpan);
        titleRow.appendChild(deleteBtn);

        const meta = document.createElement("div");
        meta.className = "todo-meta";
        const parts = [];
        if (todo.due) parts.push(`Échéance : ${todo.due}`);
        if (todo.category) parts.push(`Catégorie : ${todo.category}`);
        if (todo.priority) {
            const pLabel = todo.priority === 1 ? "Haute" : todo.priority === 2 ? "Normale" : "Basse";
            parts.push(`Priorité : ${pLabel}`);
        }
        if (parts.length) meta.textContent = "• " + parts.join("  •  ");

        const desc = document.createElement("div");
        desc.className = "todo-desc";
        if (todo.description) desc.textContent = todo.description;

        main.appendChild(titleRow);
        if (parts.length) main.appendChild(meta);
        if (todo.description) main.appendChild(desc);

        li.appendChild(checkbox);
        li.appendChild(main);

        // événements
        checkbox.onchange = () => {
            todo.done = checkbox.checked;
            saveTodos();
            renderTodos();
        };

        deleteBtn.onclick = () => {
            todos = todos.filter(t => t.id !== todo.id);
            saveTodos();
            renderTodos();
        };

        // drag & drop seulement pour non terminées
        if (!todo.done) {
            li.addEventListener("dragstart", onDragStart);
            li.addEventListener("dragend", onDragEnd);
            li.addEventListener("dragover", onDragOver);
        }

        if (todo.done) {
            todoDoneListEl.appendChild(li);
        } else {
            todoListEl.appendChild(li);
        }
    });
}

// --------- DRAG & DROP TODO ---------
let draggedId = null;

function onDragStart(e) {
    draggedId = e.currentTarget.dataset.id;
    e.currentTarget.classList.add("dragging");
}

function onDragEnd(e) {
    e.currentTarget.classList.remove("dragging");
    draggedId = null;
}

function onDragOver(e) {
    e.preventDefault();
    const target = e.currentTarget;
    const list = todoListEl;
    const draggingEl = list.querySelector(".dragging");
    if (!draggingEl || target === draggingEl) return;

    const rect = target.getBoundingClientRect();
    const offset = e.clientY - rect.top;
    const shouldInsertBefore = offset < rect.height / 2;

    if (shouldInsertBefore) {
        list.insertBefore(draggingEl, target);
    } else {
        list.insertBefore(draggingEl, target.nextSibling);
    }

    // mettre à jour l'ordre dans le tableau
    const ids = [...list.querySelectorAll(".todo-item")].map(li => li.dataset.id);
    todos.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    saveTodos();
}

// --------- RENDER HABITS ---------
function renderHabits() {
    habitsListEl.innerHTML = "";

    habits.forEach(habit => {
        const li = document.createElement("li");
        li.className = "habit-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = !!habit.fait;

        const span = document.createElement("span");
        span.textContent = habit.nom;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "✖";

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);

        checkbox.onchange = () => {
            habit.fait = checkbox.checked;
            saveHabits();
            updateHabitScore();
            updateHabitStatsOnChange();
        };

        deleteBtn.onclick = () => {
            habits = habits.filter(h => h.id !== habit.id);
            saveHabits();
            updateHabitScore();
            updateHabitStatsOnChange();
            renderHabits();
        };

        habitsListEl.appendChild(li);
    });
}

// --------- HABITS SCORE & STATS ---------
function updateHabitScore() {
    const total = habits.length;
    const done = habits.filter(h => h.fait).length;
    document.getElementById("habit-score").textContent = `${done} / ${total} complétées`;

    const progress = total > 0 ? Math.round((done / total) * 100) : 0;
    document.getElementById("habit-progress").textContent = progress + "%";
}

function updateHabitStats() {
    const streak = parseInt(localStorage.getItem(LS_HABIT_STREAK) || "0");
    const best = parseInt(localStorage.getItem(LS_HABIT_BEST) || "0");

    document.getElementById("habit-streak").textContent = streak;
    document.getElementById("habit-best").textContent = best;
}

// appelé uniquement quand l'utilisateur coche/décoche
function updateHabitStatsOnChange() {
    const total = habits.length;
    const done = habits.filter(h => h.fait).length;
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    const todayCompletedFlag = localStorage.getItem(LS_HABIT_TODAY_COMPLETED) === "true";
    let streak = parseInt(localStorage.getItem(LS_HABIT_STREAK) || "0");
    let best = parseInt(localStorage.getItem(LS_HABIT_BEST) || "0");

    if (progress === 100 && !todayCompletedFlag && total > 0) {
        streak++;
        if (streak > best) best = streak;
        localStorage.setItem(LS_HABIT_TODAY_COMPLETED, "true");
        localStorage.setItem(LS_HABIT_STREAK, streak);
        localStorage.setItem(LS_HABIT_BEST, best);
    }

    document.getElementById("habit-streak").textContent = streak;
    document.getElementById("habit-best").textContent = best;
}

// --------- OUVERTURE MODAL ---------
document.getElementById("add-todo").onclick = () => {
    currentMode = "todo";
    modalTitle.textContent = "Nouvelle tâche";
    modalTodoFields.style.display = "block";
    modalHabitFields.style.display = "none";

    todoTitleInput.value = "";
    todoDescInput.value = "";
    todoDueInput.value = "";
    todoCategoryInput.value = "";
    todoPriorityInput.value = "2";

    modal.classList.remove("hidden");
};

document.getElementById("add-habit").onclick = () => {
    currentMode = "habit";
    modalTitle.textContent = "Nouvelle habitude";
    modalTodoFields.style.display = "none";
    modalHabitFields.style.display = "block";

    habitNameInput.value = "";

    modal.classList.remove("hidden");
};

closeBtn.onclick = () => {
    modal.classList.add("hidden");
};

// --------- ENREGISTREMENT MODAL ---------
saveBtn.onclick = () => {
    if (currentMode === "todo") {
        const title = todoTitleInput.value.trim();
        if (!title) return;

        const todo = {
            id: createId(),
            title,
            description: todoDescInput.value.trim(),
            created: todayString(),
            due: todoDueInput.value || "",
            category: todoCategoryInput.value.trim(),
            priority: parseInt(todoPriorityInput.value || "3", 10),
            done: false
        };

        todos.push(todo);
        saveTodos();
        renderTodos();
    }

    if (currentMode === "habit") {
        const name = habitNameInput.value.trim();
        if (!name) return;

        const habit = {
            id: createId(),
            nom: name,
            fait: false
        };

        habits.push(habit);
        saveHabits();
        renderHabits();
        updateHabitScore();
        updateHabitStats();
    }

    modal.classList.add("hidden");
};

// --------- TRI TODO ---------
sortSelect.onchange = () => {
    renderTodos();
};

// --------- INIT ---------
loadState();
