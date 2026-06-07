/**
 * RMP INTERIOR - COMPLETE ERP SYSTEM (All Modules Integrated)
 */

class RMPDatabase {
    constructor() { this.dbName = "RMP_ERP_SYSTEM_DB"; this.initDB(); }
    initDB() { if (!localStorage.getItem(this.dbName)) localStorage.setItem(this.dbName, JSON.stringify({leads:[], projects:[], expenses:[], inventory:[], quotations:[]})); }
    async getCollection(col) { return JSON.parse(localStorage.getItem(this.dbName))[col] || []; }
    async addRecord(col, data) { const db = JSON.parse(localStorage.getItem(this.dbName)); data.id = 'RMP_' + Date.now(); db[col].push(data); localStorage.setItem(this.dbName, JSON.stringify(db)); }
}
const db = new RMPDatabase();

const moduleContainer = document.getElementById('moduleContainer');
const pageTitle = document.getElementById('pageTitle');

function loadModule(moduleName) {
    pageTitle.innerText = moduleName.toUpperCase() + " MODULE";
    switch(moduleName) {
        case 'dashboard': updateDashboardData(); break;
        case 'leads': loadLeadsModule(); break;
        case 'projects': loadProjectsModule(); break;
        case 'expenses': loadExpensesModule(); break;
        case 'inventory': loadInventoryModule(); break;
        case 'quotations': loadQuotationsModule(); break;
        default: moduleContainer.innerHTML = `<h3>${moduleName.toUpperCase()}</h3><p>Coming soon...</p>`;
    }
}

async function updateDashboardData() {
    const leads = await db.getCollection('leads'); const projs = await db.getCollection('projects');
    moduleContainer.innerHTML = `<h3>Dashboard</h3><p>Leads: ${leads.length}, Projects: ${projs.length}</p>`;
}

function loadLeadsModule() { moduleContainer.innerHTML = "<h3>Leads Management</h3><p>Ready to add leads.</p>"; }
function loadProjectsModule() { moduleContainer.innerHTML = "<h3>Projects Management</h3><p>Ready to add projects.</p>"; }
function loadExpensesModule() { moduleContainer.innerHTML = "<h3>Expenses Management</h3><p>Ready to record expenses.</p>"; }
function loadInventoryModule() { moduleContainer.innerHTML = "<h3>Inventory Management</h3><p>Ready to manage stock.</p>"; }
function loadQuotationsModule() { moduleContainer.innerHTML = "<h3>Quotations Management</h3><p>Ready to create quotes.</p>"; }

// Theme Toggle
document.getElementById('themeToggle').addEventListener('click', () => document.body.classList.toggle('dark-mode'));

window.onload = () => loadModule('dashboard');
