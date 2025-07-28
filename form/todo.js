function getUserEmail() {
    return localStorage.getItem('userEmail');
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

if (!getUserEmail()) {
    redirectToLogin();
}

const todoListElem = document.getElementById('todo-list');
const todoForm = document.getElementById('todo-form');
const todoContent = document.getElementById('todo-content');
const logoutBtn = document.getElementById('logout-btn');

async function fetchTodos() {
    const email = getUserEmail();
    const response = await fetch(`http://localhost:5000/get_todos?email=${encodeURIComponent(email)}`);
    const todos = await response.json();
    todoListElem.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        if (todo.completed) {
            li.classList.add('completed');
        }
        // Todo text
        const textSpan = document.createElement('span');
        textSpan.textContent = todo.content;
        li.appendChild(textSpan);

        // Buttons container
        const btnDiv = document.createElement('div');
        btnDiv.className = 'todo-buttons';

        // Complete button
        const completeBtn = document.createElement('button');
        completeBtn.textContent = todo.completed ? 'Undo' : 'Complete';
        completeBtn.onclick = async () => {
            await fetch('http://localhost:5000/update_todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todo.id, completed: !todo.completed })
            });
            fetchTodos();
        };
        btnDiv.appendChild(completeBtn);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
            await fetch('http://localhost:5000/delete_todo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: todo.id })
            });
            fetchTodos();
        };
        btnDiv.appendChild(deleteBtn);

        li.appendChild(btnDiv);
        todoListElem.appendChild(li);
    });
}

todoForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const content = todoContent.value.trim();
    if (!content) return;
    await fetch('http://localhost:5000/add_todo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: getUserEmail(), content })
    });
    todoContent.value = '';
    fetchTodos();
});

logoutBtn.addEventListener('click', function() {
    localStorage.removeItem('userEmail');
    redirectToLogin();
});

fetchTodos(); 