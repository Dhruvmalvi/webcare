// admin.js - Admin Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const currentTabTitle = document.getElementById('current-tab-title');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active to clicked nav item
            item.classList.add('active');

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show corresponding tab content
            const tabId = item.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // Update Header Title
            currentTabTitle.textContent = item.textContent.trim();
            
            // Refresh data when switching to specific tabs
            if(tabId === 'messages') loadMessages();
            if(tabId === 'projects') loadProjects();
            if(tabId === 'dashboard') updateDashboardStats();
        });
    });

    // --- Messages Logic ---
    const messagesTableBody = document.getElementById('messages-table-body');
    const noMessagesAlert = document.getElementById('no-messages-alert');
    const clearMessagesBtn = document.getElementById('clear-messages');

    async function loadMessages() {
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();
            
            if (messages.length === 0) {
                messagesTableBody.innerHTML = '';
                noMessagesAlert.style.display = 'flex';
                document.querySelector('#messages-tab .admin-table').style.display = 'none';
            } else {
                noMessagesAlert.style.display = 'none';
                document.querySelector('#messages-tab .admin-table').style.display = 'table';
                messagesTableBody.innerHTML = '';

                messages.reverse().forEach((msg) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${msg.date ? new Date(msg.date).toLocaleDateString() : 'N/A'}</td>
                        <td>${msg.name}</td>
                        <td><a href="mailto:${msg.email}" style="color: var(--primary)">${msg.email}</a></td>
                        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${msg.message}</td>
                        <td>
                            <button class="action-btn delete" onclick="deleteMessage('${msg.id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    `;
                    messagesTableBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    }

    window.deleteMessage = async function(id) {
        if(confirm("Are you sure you want to delete this message?")) {
            await fetch(`/api/messages/${id}`, { method: 'DELETE' });
            loadMessages();
            updateDashboardStats();
        }
    }

    clearMessagesBtn.addEventListener('click', async () => {
        if(confirm("Clear all messages? This cannot be undone.")) {
            await fetch('/api/messages', { method: 'DELETE' });
            loadMessages();
            updateDashboardStats();
        }
    });

    // --- Projects Logic ---
    const projectsTableBody = document.getElementById('projects-table-body');
    const noProjectsAlert = document.getElementById('no-projects-alert');
    const addProjectBtn = document.getElementById('add-project-btn');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    const projectFormContainer = document.getElementById('project-form-container');
    const addProjectForm = document.getElementById('add-project-form');

    addProjectBtn.addEventListener('click', () => {
        projectFormContainer.style.display = 'block';
    });

    cancelProjectBtn.addEventListener('click', () => {
        projectFormContainer.style.display = 'none';
        addProjectForm.reset();
    });

    async function loadProjects() {
        try {
            const response = await fetch('/api/projects');
            const projects = await response.json();
            
            if (projects.length === 0) {
                projectsTableBody.innerHTML = '';
                noProjectsAlert.style.display = 'flex';
                document.querySelector('#projects-tab .admin-table').style.display = 'none';
            } else {
                noProjectsAlert.style.display = 'none';
                document.querySelector('#projects-tab .admin-table').style.display = 'table';
                projectsTableBody.innerHTML = '';

                projects.forEach((proj) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${proj.title}</strong></td>
                        <td>${proj.tech}</td>
                        <td>
                            ${proj.github ? `<a href="${proj.github}" target="_blank" class="action-btn"><i class="fa-brands fa-github"></i></a>` : ''}
                            ${proj.live ? `<a href="${proj.live}" target="_blank" class="action-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>` : ''}
                        </td>
                        <td>
                            <button class="action-btn delete" onclick="deleteProject('${proj.id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    `;
                    projectsTableBody.appendChild(tr);
                });
            }
        } catch (err) {
            console.error('Failed to load projects', err);
        }
    }

    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newProject = {
            title: document.getElementById('proj-title').value,
            image: document.getElementById('proj-img').value,
            description: document.getElementById('proj-desc').value,
            tech: document.getElementById('proj-tech').value,
            github: document.getElementById('proj-github').value,
            live: document.getElementById('proj-live').value
        };

        await fetch('/api/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProject)
        });
        
        addProjectForm.reset();
        projectFormContainer.style.display = 'none';
        loadProjects();
        updateDashboardStats();
    });

    window.deleteProject = async function(id) {
        if(confirm("Delete this project?")) {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            loadProjects();
            updateDashboardStats();
        }
    }

    // --- Dashboard Stats Logic ---
    async function updateDashboardStats() {
        try {
            const msgRes = await fetch('/api/messages');
            const messages = await msgRes.json();
            
            const projRes = await fetch('/api/projects');
            const projects = await projRes.json();

            const viewsRes = await fetch('/api/views');
            const viewsData = await viewsRes.json();
            
            document.getElementById('stat-messages').textContent = messages.length;
            document.getElementById('stat-projects').textContent = projects.length;
            
            const viewsEl = document.getElementById('stat-views');
            if (viewsEl) {
                viewsEl.textContent = viewsData.views.toLocaleString();
            }
        } catch (err) {
            console.error('Failed to update stats', err);
        }
    }

    // Initial load
    updateDashboardStats();

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('admin_token');
            window.location.href = 'login.html';
        });
    }
});
