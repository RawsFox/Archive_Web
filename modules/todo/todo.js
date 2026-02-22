// MENU RÉTRACTABLE
const sidebar = document.querySelector(".sidebar");
const toggleBtn = document.getElementById("toggle-menu");

toggleBtn.onclick = () => {
    sidebar.classList.toggle("collapsed");
    toggleBtn.textContent = sidebar.classList.contains("collapsed") ? "⮞" : "⮜";
};

// MODAL
const modal = document.getElementById("modal");
const addBtn = document.getElementById("add-btn");
const closeBtn = document.getElementById("close-btn");
const saveBtn = document.getElementById("save-btn");
const input = document.getElementById("todo-input");

addBtn.onclick = () => modal.classList.remove("hidden");
closeBtn.onclick = () => modal.classList.add("hidden");

// CHARGEMENT TODO
fetch("../../data/todo.json")
    .then(r => r.json())
    .then(data => {
        data.todos.forEach(addTodoToList);
    });

// AJOUT TACHE
saveBtn.onclick = () => {
    const text = input.value.trim();
    if (!text) return;

    addTodoToList(text);
    input.value = "";
    modal.classList.add("hidden");
};

// FONCTION D'AJOUT
function addTodoToList(text) {
    const li = document.createElement("li");

    li.innerHTML = `
        <span>${text}</span>
        <button class="delete-btn">✖</button>
    `;

    li.querySelector(".delete-btn").onclick = () => li.remove();

    document.getElementById("todo-list").appendChild(li);
}
