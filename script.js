// Dados iniciais
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let works = JSON.parse(localStorage.getItem('works')) || [];

// Elementos da página
const welcomePage = document.getElementById('welcome-page');
const startBtn = document.getElementById('start-btn');
const loginPage = document.getElementById('login-page');
const registerPage = document.getElementById('register-page');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const goToRegister = document.getElementById('go-to-register');
const goToLogin = document.getElementById('go-to-login');
const logoutBtn = document.getElementById('logout-btn');
const userName = document.getElementById('user-name');
const worksContainer = document.getElementById('works-container');
const addWorkBtn = document.getElementById('add-work-btn');
const workModal = document.getElementById('work-modal');
const workForm = document.getElementById('work-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.querySelector('.close-modal');

// Funções de autenticação

function showWelcomePage() {
    welcomePage.style.display = 'flex';
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    dashboard.style.display = 'none';
}

function showLoginPage() {
    welcomePage.style.display = 'none'; // Adicionado
    loginPage.style.display = 'flex';
    registerPage.style.display = 'none';
    dashboard.style.display = 'none';
}


function showLoginPage() {
    loginPage.style.display = 'flex';
    registerPage.style.display = 'none';
    dashboard.style.display = 'none';
}

function showRegisterPage() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'flex';
    dashboard.style.display = 'none';
}

function showDashboard() {
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    dashboard.style.display = 'block';
    userName.textContent = currentUser.name;
    loadWorks();
}

function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showDashboard();
        return true;
    }
    return false;
}

function register(name, email, password) {
    // Verificar se o usuário já existe
    if (users.find(u => u.email === email)) {
        return false;
    }
    
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginPage();
}

// Funções de obras
function loadWorks() {
    const userWorks = works.filter(work => work.userId === currentUser.id);
    worksContainer.innerHTML = '';
    
    if (userWorks.length === 0) {
        worksContainer.innerHTML = '<p>Nenhuma obra cadastrada. Clique em "Adicionar Obra" para começar.</p>';
        return;
    }
    
    userWorks.forEach(work => {
        const workCard = document.createElement('div');
        workCard.className = 'work-card';
        
        let statusClass = '';
        let statusText = '';
        
        switch(work.status) {
            case 'planned':
                statusClass = 'status-planned';
                statusText = 'Planejada';
                break;
            case 'in-progress':
                statusClass = 'status-in-progress';
                statusText = 'Em Andamento';
                break;
            case 'completed':
                statusClass = 'status-completed';
                statusText = 'Concluída';
                break;
        }
        
        workCard.innerHTML = `
            <div class="work-header">
                <div class="work-title">${work.title}</div>
                <span class="work-status ${statusClass}">${statusText}</span>
            </div>
            <div class="work-body">
                <div class="work-info">
                    <span class="work-info-label">Local:</span> ${work.location}
                </div>
                <div class="work-info">
                    <span class="work-info-label">Orçamento:</span> R$ ${work.budget ? work.budget.toFixed(2) : 'Não informado'}
                </div>
                <div class="work-info">
                    <span class="work-info-label">Início:</span> ${formatDate(work.startDate)}
                </div>
                ${work.endDate ? `
                <div class="work-info">
                    <span class="work-info-label">Término Previsto:</span> ${formatDate(work.endDate)}
                </div>
                ` : ''}
                <div class="work-actions">
                    <button class="btn btn-warning edit-work" data-id="${work.id}">Editar</button>
                    <button class="btn btn-danger delete-work" data-id="${work.id}">Excluir</button>
                </div>
            </div>
        `;
        
        worksContainer.appendChild(workCard);
    });
    
    // Adicionar event listeners para os botões de editar e excluir
    document.querySelectorAll('.edit-work').forEach(btn => {
        btn.addEventListener('click', () => editWork(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-work').forEach(btn => {
        btn.addEventListener('click', () => deleteWork(btn.dataset.id));
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function openWorkModal(workId = null) {
    if (workId) {
        // Modo edição
        const work = works.find(w => w.id === workId);
        if (work) {
            document.getElementById('work-id').value = work.id;
            document.getElementById('work-title').value = work.title;
            document.getElementById('work-description').value = work.description || '';
            document.getElementById('work-location').value = work.location;
            document.getElementById('work-budget').value = work.budget || '';
            document.getElementById('work-start-date').value = work.startDate;
            document.getElementById('work-end-date').value = work.endDate || '';
            document.getElementById('work-status').value = work.status;
            modalTitle.textContent = 'Editar Obra';
        }
    } else {
        // Modo adição
        document.getElementById('work-form').reset();
        document.getElementById('work-id').value = '';
        modalTitle.textContent = 'Adicionar Obra';
    }
    
    workModal.style.display = 'flex';
}

function saveWork(workData) {
    if (workData.id) {
        // Atualizar obra existente
        const index = works.findIndex(w => w.id === workData.id);
        if (index !== -1) {
            works[index] = workData;
        }
    } else {
        // Adicionar nova obra
        workData.id = Date.now().toString();
        workData.userId = currentUser.id;
        works.push(workData);
    }
    
    localStorage.setItem('works', JSON.stringify(works));
    loadWorks();
    closeWorkModal();
}

function editWork(workId) {
    openWorkModal(workId);
}

function deleteWork(workId) {
    if (confirm('Tem certeza que deseja excluir esta obra?')) {
        works = works.filter(w => w.id !== workId);
        localStorage.setItem('works', JSON.stringify(works));
        loadWorks();
    }
}

function closeWorkModal() {
    workModal.style.display = 'none';
}

// lista de eventos
startBtn.addEventListener('click', showLoginPage);
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (login(email, password)) {
        showMessage('login-message', 'Login realizado com sucesso!', 'success');
    } else {
        showMessage('login-message', 'E-mail ou senha incorretos.', 'error');
    }
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    if (password !== confirmPassword) {
        showMessage('register-message', 'As senhas não coincidem.', 'error');
        return;
    }
    
    if (register(name, email, password)) {
        showMessage('register-message', 'Cadastro realizado com sucesso! Faça login.', 'success');
        setTimeout(() => {
            showLoginPage();
        }, 1500);
    } else {
        showMessage('register-message', 'Este e-mail já está cadastrado.', 'error');
    }
});

goToRegister.addEventListener('click', function(e) {
    e.preventDefault();
    showRegisterPage();
});

goToLogin.addEventListener('click', function(e) {
    e.preventDefault();
    showLoginPage();
});

logoutBtn.addEventListener('click', logout);

addWorkBtn.addEventListener('click', function() {
    openWorkModal();
});

workForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const workData = {
        id: document.getElementById('work-id').value,
        title: document.getElementById('work-title').value,
        description: document.getElementById('work-description').value,
        location: document.getElementById('work-location').value,
        budget: document.getElementById('work-budget').value ? parseFloat(document.getElementById('work-budget').value) : null,
        startDate: document.getElementById('work-start-date').value,
        endDate: document.getElementById('work-end-date').value || null,
        status: document.getElementById('work-status').value
    };
    
    saveWork(workData);
});

closeModalBtn.addEventListener('click', closeWorkModal);

workModal.addEventListener('click', function(e) {
    if (e.target === workModal) {
        closeWorkModal();
    }
});

// Função auxiliar para mostrar mensagens
function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.innerHTML = `<div class="message message-${type}">${message}</div>`;
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
        element.innerHTML = '';
    }, 3000);
}

// Inicialização
if (currentUser) {
    showDashboard();
} else {
    showWelcomePage(); // Agora inicia na tela de boas-vindas
}
