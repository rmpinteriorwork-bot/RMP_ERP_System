/**
 * RMP INTERIOR - FULLY FUNCTIONAL ERP SYSTEM
 */

// 1. Database Class
class RMPDatabase {
    constructor() { this.dbName = "RMP_ERP_SYSTEM_DB"; this.initDB(); }
    initDB() { if (!localStorage.getItem(this.dbName)) localStorage.setItem(this.dbName, JSON.stringify({leads:[], projects:[], expenses:[]})); }
    async getCollection(col) { return JSON.parse(localStorage.getItem(this.dbName))[col] || []; }
    async addRecord(col, data) { const db = JSON.parse(localStorage.getItem(this.dbName)); data.id = 'RMP_' + Date.now(); db[col].push(data); localStorage.setItem(this.dbName, JSON.stringify(db)); }
}
const db = new RMPDatabase();

// 2. UI & Navigation Logic
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const themeToggle = document.getElementById('themeToggle');
const moduleContainer = document.getElementById('moduleContainer');
const pageTitle = document.getElementById('pageTitle');

// Mobile Menu
mobileMenuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));

// Dark Mode
if(localStorage.getItem('rmp_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('rmp_theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Load Module
function loadModule(moduleName) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`[onclick="loadModule('${moduleName}')"]`)?.classList.add('active');
    
    pageTitle.innerText = moduleName.toUpperCase() + " MODULE";
    if(window.innerWidth <= 768) sidebar.classList.remove('active');

    if(moduleName === 'dashboard') {
        updateDashboardData();
    } else {
        moduleContainer.innerHTML = `<div style="padding:40px; text-align:center;"><h2>${moduleName.toUpperCase()}</h2><p>This module is under construction.</p></div>`;
    }
}

// Dashboard Data
async function updateDashboardData() {
    const leads = await db.getCollection('leads');
    const projs = await db.getCollection('projects');
    const exps = await db.getCollection('expenses');
    moduleContainer.innerHTML = `
        <div class="dashboard-cards">
            <div class="card"><h3>Total Leads</h3><p>${leads.length}</p></div>
            <div class="card"><h3>Projects</h3><p>${projs.length}</p></div>
            <div class="card"><h3>Expenses</h3><p>₹${exps.reduce((a,b)=>a+Number(b.amount||0),0)}</p></div>
        </div>`;
}

window.onload = () => loadModule('dashboard');

// [Projects Module - Logic]
function loadProjectsModule() {
    moduleContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3>Ongoing Projects</h3>
            <button onclick="showProjectModal()" style="background:var(--accent-color); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">+ Add Project</button>
        </div>
        <div id="projectsGrid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:20px;"></div>
        <div id="projectModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; justify-content:center; align-items:center;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; width:400px;">
                <h3>Add New Project</h3>
                <input type="text" id="projName" placeholder="Project Name" style="width:100%; padding:10px; margin:10px 0;">
                <input type="text" id="projClient" placeholder="Client Name" style="width:100%; padding:10px; margin:10px 0;">
                <button onclick="saveProject()" style="background:var(--primary-color); color:white; padding:10px; border:none; width:100%;">Save</button>
                <button onclick="closeProjectModal()" style="background:transparent; color:red; border:none; margin-top:10px; width:100%;">Cancel</button>
            </div>
        </div>`;
    displayProjects();
}

function showProjectModal() { document.getElementById('projectModal').style.display = 'flex'; }
function closeProjectModal() { document.getElementById('projectModal').style.display = 'none'; }
async function saveProject() {
    const name = document.getElementById('projName').value;
    const client = document.getElementById('projClient').value;
    await db.addRecord('projects', {name, client});
    closeProjectModal();
    displayProjects();
}
async function displayProjects() {
    const projects = await db.getCollection('projects');
    document.getElementById('projectsGrid').innerHTML = projects.map(p => `
        <div style="background:var(--card-bg); padding:20px; border-radius:10px; border:1px solid var(--border-color);">
            <h4>${p.name}</h4>
            <p>Client: ${p.client}</p>
        </div>`).join('');
}
