const API_URL = 'http://20.81.138.59:3700/api';

// Manejo de registro
if (document.getElementById('register-form')) {
  const registerForm = document.getElementById('register-form');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (response.ok) {
        alert('Registro exitoso');
        window.location.href = 'login.html';
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
}

// Manejo de inicio de sesión
if (document.getElementById('login-form')) {
  const loginForm = document.getElementById('login-form');
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        alert('Inicio de sesión exitoso');
        window.location.href = 'tasks.html';
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
      console.error('Error:', error);
    }
  });
}

// Manejo de tareas
if (document.getElementById('task-form')) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
  }

  let editingTaskId = null;
  const modalBg = document.getElementById('modal-bg');
  const modalEdit = document.getElementById('modal-edit');
  const modalEditForm = document.getElementById('modal-edit-form');
  let modalEditingTaskId = null;

  const showModal = (task) => {
    document.getElementById('modal-edit-title').value = task.title;
    document.getElementById('modal-edit-desc').value = task.description;
    modalEditingTaskId = task._id;
    modalBg.style.display = 'block';
    modalEdit.style.display = 'block';
  };

  const closeModal = () => {
    modalBg.style.display = 'none';
    modalEdit.style.display = 'none';
    modalEditingTaskId = null;
    modalEditForm.reset();
  };

  modalEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('modal-edit-title').value;
    const description = document.getElementById('modal-edit-desc').value;
    if (!title || !description) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (modalEditingTaskId) {
      try {
        const response = await fetch(`${API_URL}/tasks/${modalEditingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({ title, description })
        });
        if (response.ok) {
          closeModal();
          loadTasks();
        } else {
          alert('Error al actualizar tarea');
        }
      } catch (error) {
        console.error('Error al actualizar tarea:', error);
      }
    }
  });

  document.querySelector('#modal-edit .cancel-modal-btn').onclick = closeModal;
  modalBg.onclick = closeModal;

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: { Authorization: token }
      });
      const tasks = await response.json();
      const taskList = document.getElementById('task-list');
      taskList.innerHTML = '';
      tasks.forEach(task => {
        const tr = document.createElement('tr');
        if (task.completed) tr.classList.add('completed');
        // Título
        const tdTitle = document.createElement('td');
        tdTitle.textContent = task.title;
        tr.appendChild(tdTitle);
        // Descripción
        const tdDesc = document.createElement('td');
        tdDesc.textContent = task.description;
        tr.appendChild(tdDesc);
        // Estado
        const tdStatus = document.createElement('td');
        const statusBtn = document.createElement('button');
        statusBtn.textContent = task.completed ? 'Completado' : 'Pendiente';
        statusBtn.className = task.completed ? 'status-completed' : 'status-pending';
        statusBtn.onclick = () => toggleStatus(task._id, !task.completed);
        tdStatus.appendChild(statusBtn);
        tr.appendChild(tdStatus);
        // Editar
        const tdEdit = document.createElement('td');
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.className = 'edit-btn';
        editBtn.onclick = () => showModal(task);
        tdEdit.appendChild(editBtn);
        tr.appendChild(tdEdit);
        // Eliminar
        const tdDelete = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = () => deleteTask(task._id);
        tdDelete.appendChild(deleteBtn);
        tr.appendChild(tdDelete);
        taskList.appendChild(tr);
      });
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: token }
      });
      if (response.ok) {
        loadTasks();
      } else {
        alert('Error al eliminar tarea');
      }
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
    }
  };

  const toggleStatus = async (taskId, completed) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ completed })
      });
      if (response.ok) {
        loadTasks();
      } else {
        alert('Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    }
  };

  const editTask = (task) => {
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.description;
    editingTaskId = task._id;
    document.getElementById('save-task-btn').textContent = 'Update';
  };

  document.getElementById('task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    if (!title || !description) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    if (editingTaskId) {
      // Actualizar tarea
      try {
        const response = await fetch(`${API_URL}/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({ title, description })
        });
        if (response.ok) {
          editingTaskId = null;
          document.getElementById('save-task-btn').textContent = 'Save';
          document.getElementById('task-form').reset();
          loadTasks();
        } else {
          alert('Error al actualizar tarea');
        }
      } catch (error) {
        console.error('Error al actualizar tarea:', error);
      }
    } else {
      // Crear tarea
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token
          },
          body: JSON.stringify({ title, description })
        });
        if (response.ok) {
          document.getElementById('task-form').reset();
          loadTasks();
        } else {
          alert('Error al crear tarea');
        }
      } catch (error) {
        console.error('Error al crear tarea:', error);
      }
    }
  });

  document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });

  loadTasks();
}