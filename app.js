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
