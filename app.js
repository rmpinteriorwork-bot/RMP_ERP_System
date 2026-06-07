/**
 * RMP INTERIOR - COMPLETE ERP SYSTEM (100% WORKING UI & DATABASE)
 */

// --- 1. DATABASE ---
class RMPDatabase {
    constructor() { this.dbName = "RMP_ERP_SYSTEM_DB"; this.initDB(); }
    initDB() { 
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify({leads:[], projects:[], expenses:[], inventory:[], quotations:[]})); 
        }
    }
    async getCollection(col) { 
        const db = JSON.parse(localStorage.getItem(this.dbName));
        return db[col] || []; 
    }
    async addRecord(col, data) { 
        const db = JSON.parse(localStorage.getItem(this.dbName)); 
        data.id = 'RMP_' + Date.now(); 
        data.createdAt = new Date().toLocaleDateString('en-IN');
        if(!db[col]) db[col] = [];
        db[col].push(data); 
        localStorage.setItem(this.dbName, JSON.stringify(db)); 
    }
    async deleteRecord(col, id) {
        const db = JSON.parse(localStorage.getItem(this.dbName));
        db[col] = db[col].filter(item => item.id !== id);
        localStorage.setItem(this.dbName, JSON.stringify(db));
    }
}
const db = new RMPDatabase();

// --- 2. UI & NAVIGATION ---
const moduleContainer = document.getElementById('moduleContainer');
const pageTitle = document.getElementById('pageTitle');
const sidebar = document.getElementById('sidebar');

document.getElementById('mobileMenuBtn').addEventListener('click', () => sidebar.classList.toggle('active'));

// Dark Mode
const themeToggle = document.getElementById('themeToggle');
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

function loadModule(moduleName) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeItem = document.querySelector(`[onclick="loadModule('${moduleName}')"]`);
    if(activeItem) activeItem.classList.add('active');
    
    if(window.innerWidth <= 768) sidebar.classList.remove('active');

    switch(moduleName) {
        case 'dashboard': updateDashboardData(); break;
        case 'leads': loadLeadsModule(); break;
        case 'projects': loadProjectsModule(); break;
        case 'expenses': loadExpensesModule(); break;
        case 'inventory': loadInventoryModule(); break;
        case 'quotations': loadQuotationsModule(); break;
        case 'backup': loadBackupModule(); break;
        default: 
            pageTitle.innerText = moduleName.toUpperCase() + " MODULE";
            moduleContainer.innerHTML = `<div style="padding:40px; text-align:center;"><h2>${moduleName.toUpperCase()}</h2><p>This module will be built next.</p></div>`;
    }
}

// --- 3. DASHBOARD ---
async function updateDashboardData() {
    pageTitle.innerText = "EXECUTIVE DASHBOARD";
    const leads = await db.getCollection('leads'); 
    const projs = await db.getCollection('projects');
    const exps = await db.getCollection('expenses');
    const totalExp = exps.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

    moduleContainer.innerHTML = `
        <div class="dashboard-cards" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px,1fr)); gap:20px;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; border:1px solid var(--border-color);">
                <h3 style="color:var(--text-muted);">Total Leads</h3><h2 style="font-size:2rem; color:var(--primary-color);">${leads.length}</h2>
            </div>
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; border:1px solid var(--border-color);">
                <h3 style="color:var(--text-muted);">Active Projects</h3><h2 style="font-size:2rem; color:var(--accent-color);">${projs.length}</h2>
            </div>
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; border:1px solid var(--border-color);">
                <h3 style="color:var(--text-muted);">Total Expenses</h3><h2 style="font-size:2rem; color:var(--secondary-color);">₹${totalExp.toLocaleString('en-IN')}</h2>
            </div>
        </div>`;
}

// --- 4. LEADS MODULE ---
function loadLeadsModule() {
    pageTitle.innerText = "LEADS MANAGEMENT";
    moduleContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Customer Inquiries</h3>
            <button onclick="document.getElementById('leadModal').style.display='flex'" style="background:var(--accent-color); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">+ Add Lead</button>
        </div>
        <div style="overflow-x:auto; background:var(--card-bg); border-radius:10px; border:1px solid var(--border-color);">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <tr style="border-bottom:1px solid var(--border-color);"><th style="padding:15px;">Date</th><th style="padding:15px;">Name</th><th style="padding:15px;">Phone</th><th style="padding:15px;">Requirement</th><th style="padding:15px;">Action</th></tr>
                <tbody id="leadsBody"></tbody>
            </table>
        </div>
        <div id="leadModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:1000;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; width:350px;">
                <h3>New Lead</h3>
                <input type="text" id="lName" placeholder="Name" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="text" id="lPhone" placeholder="Phone" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="text" id="lReq" placeholder="Requirement (e.g., Kitchen)" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <button onclick="saveLead()" style="width:100%; padding:10px; background:var(--primary-color); color:white; border:none; border-radius:5px;">Save</button>
                <button onclick="document.getElementById('leadModal').style.display='none'" style="width:100%; padding:10px; background:transparent; color:red; border:none; margin-top:5px;">Cancel</button>
            </div>
        </div>`;
    displayLeads();
}
async function saveLead() {
    await db.addRecord('leads', { name: document.getElementById('lName').value, phone: document.getElementById('lPhone').value, req: document.getElementById('lReq').value });
    document.getElementById('leadModal').style.display='none'; displayLeads();
}
async function displayLeads() {
    const data = await db.getCollection('leads');
    document.getElementById('leadsBody').innerHTML = data.length ? data.map(d => `<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:15px;">${d.createdAt}</td><td style="padding:15px;">${d.name}</td><td style="padding:15px;">${d.phone}</td><td style="padding:15px;">${d.req}</td><td style="padding:15px;"><button onclick="deleteData('leads','${d.id}', displayLeads)" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td></tr>`).reverse().join('') : `<tr><td colspan="5" style="padding:20px; text-align:center;">No leads found.</td></tr>`;
}

// --- 5. PROJECTS MODULE ---
function loadProjectsModule() {
    pageTitle.innerText = "PROJECTS MANAGEMENT";
    moduleContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Ongoing Projects</h3>
            <button onclick="document.getElementById('projModal').style.display='flex'" style="background:var(--accent-color); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">+ Add Project</button>
        </div>
        <div id="projGrid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:20px;"></div>
        <div id="projModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:1000;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; width:350px;">
                <h3>New Project</h3>
                <input type="text" id="pName" placeholder="Project Name" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="text" id="pClient" placeholder="Client Name" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="number" id="pBudget" placeholder="Budget (₹)" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <button onclick="saveProject()" style="width:100%; padding:10px; background:var(--primary-color); color:white; border:none; border-radius:5px;">Save</button>
                <button onclick="document.getElementById('projModal').style.display='none'" style="width:100%; padding:10px; background:transparent; color:red; border:none; margin-top:5px;">Cancel</button>
            </div>
        </div>`;
    displayProjects();
}
async function saveProject() {
    await db.addRecord('projects', { name: document.getElementById('pName').value, client: document.getElementById('pClient').value, budget: document.getElementById('pBudget').value });
    document.getElementById('projModal').style.display='none'; displayProjects();
}
async function displayProjects() {
    const data = await db.getCollection('projects');
    document.getElementById('projGrid').innerHTML = data.length ? data.map(d => `<div style="background:var(--card-bg); padding:20px; border-radius:10px; border:1px solid var(--border-color);"><h4>${d.name}</h4><p style="color:var(--text-muted); margin:10px 0;">Client: ${d.client}</p><p>Budget: ₹${Number(d.budget).toLocaleString('en-IN')}</p><div style="margin-top:15px; text-align:right;"><button onclick="deleteData('projects','${d.id}', displayProjects)" style="color:red; background:none; border:none; cursor:pointer;">Delete</button></div></div>`).reverse().join('') : `<p>No projects found.</p>`;
}

// --- 6. EXPENSES MODULE ---
function loadExpensesModule() {
    pageTitle.innerText = "EXPENSES MANAGEMENT";
    moduleContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Company Expenses</h3>
            <button onclick="document.getElementById('expModal').style.display='flex'" style="background:var(--secondary-color); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">+ Add Expense</button>
        </div>
        <div style="overflow-x:auto; background:var(--card-bg); border-radius:10px; border:1px solid var(--border-color);">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <tr style="border-bottom:1px solid var(--border-color);"><th style="padding:15px;">Date</th><th style="padding:15px;">Reason</th><th style="padding:15px;">Amount</th><th style="padding:15px;">Action</th></tr>
                <tbody id="expBody"></tbody>
            </table>
        </div>
        <div id="expModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:1000;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; width:350px;">
                <h3>New Expense</h3>
                <input type="text" id="eReason" placeholder="Expense Reason (e.g., Plywood)" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="number" id="eAmount" placeholder="Amount (₹)" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <button onclick="saveExpense()" style="width:100%; padding:10px; background:var(--primary-color); color:white; border:none; border-radius:5px;">Save</button>
                <button onclick="document.getElementById('expModal').style.display='none'" style="width:100%; padding:10px; background:transparent; color:red; border:none; margin-top:5px;">Cancel</button>
            </div>
        </div>`;
    displayExpenses();
}
async function saveExpense() {
    await db.addRecord('expenses', { reason: document.getElementById('eReason').value, amount: document.getElementById('eAmount').value });
    document.getElementById('expModal').style.display='none'; displayExpenses();
}
async function displayExpenses() {
    const data = await db.getCollection('expenses');
    document.getElementById('expBody').innerHTML = data.length ? data.map(d => `<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:15px;">${d.createdAt}</td><td style="padding:15px;">${d.reason}</td><td style="padding:15px; font-weight:bold;">₹${Number(d.amount).toLocaleString('en-IN')}</td><td style="padding:15px;"><button onclick="deleteData('expenses','${d.id}', displayExpenses)" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td></tr>`).reverse().join('') : `<tr><td colspan="4" style="padding:20px; text-align:center;">No expenses recorded.</td></tr>`;
}

// --- 7. INVENTORY MODULE ---
function loadInventoryModule() {
    pageTitle.innerText = "INVENTORY MANAGEMENT";
    moduleContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Material Stock</h3>
            <button onclick="document.getElementById('invModal').style.display='flex'" style="background:var(--accent-color); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">+ Add Item</button>
        </div>
        <div style="overflow-x:auto; background:var(--card-bg); border-radius:10px; border:1px solid var(--border-color);">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <tr style="border-bottom:1px solid var(--border-color);"><th style="padding:15px;">Item Name</th><th style="padding:15px;">Quantity</th><th style="padding:15px;">Action</th></tr>
                <tbody id="invBody"></tbody>
            </table>
        </div>
        <div id="invModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:1000;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; width:350px;">
                <h3>Add Stock</h3>
                <input type="text" id="iName" placeholder="Item Name" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="text" id="iQty" placeholder="Quantity (e.g., 5 Sheets)" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <button onclick="saveInventory()" style="width:100%; padding:10px; background:var(--primary-color); color:white; border:none; border-radius:5px;">Save</button>
                <button onclick="document.getElementById('invModal').style.display='none'" style="width:100%; padding:10px; background:transparent; color:red; border:none; margin-top:5px;">Cancel</button>
            </div>
        </div>`;
    displayInventory();
}
async function saveInventory() {
    await db.addRecord('inventory', { name: document.getElementById('iName').value, qty: document.getElementById('iQty').value });
    document.getElementById('invModal').style.display='none'; displayInventory();
}
async function displayInventory() {
    const data = await db.getCollection('inventory');
    document.getElementById('invBody').innerHTML = data.length ? data.map(d => `<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:15px;">${d.name}</td><td style="padding:15px;">${d.qty}</td><td style="padding:15px;"><button onclick="deleteData('inventory','${d.id}', displayInventory)" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td></tr>`).reverse().join('') : `<tr><td colspan="3" style="padding:20px; text-align:center;">No stock items.</td></tr>`;
}

// --- 8. QUOTATIONS MODULE ---
function loadQuotationsModule() {
    pageTitle.innerText = "QUOTATIONS MANAGEMENT";
    moduleContainer.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
            <h3>Client Quotes</h3>
            <button onclick="document.getElementById('quoteModal').style.display='flex'" style="background:var(--secondary-color); color:white; padding:10px 20px; border:none; border-radius:5px; cursor:pointer;">+ Create Quote</button>
        </div>
        <div style="overflow-x:auto; background:var(--card-bg); border-radius:10px; border:1px solid var(--border-color);">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <tr style="border-bottom:1px solid var(--border-color);"><th style="padding:15px;">Date</th><th style="padding:15px;">Client</th><th style="padding:15px;">Amount</th><th style="padding:15px;">Action</th></tr>
                <tbody id="quoteBody"></tbody>
            </table>
        </div>
        <div id="quoteModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); justify-content:center; align-items:center; z-index:1000;">
            <div style="background:var(--card-bg); padding:20px; border-radius:10px; width:350px;">
                <h3>New Quote</h3>
                <input type="text" id="qClient" placeholder="Client Name" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <input type="number" id="qAmt" placeholder="Total Amount (₹)" style="width:100%; padding:10px; margin:10px 0; border:1px solid var(--border-color); background:var(--bg-color); color:var(--text-main);">
                <button onclick="saveQuote()" style="width:100%; padding:10px; background:var(--primary-color); color:white; border:none; border-radius:5px;">Save</button>
                <button onclick="document.getElementById('quoteModal').style.display='none'" style="width:100%; padding:10px; background:transparent; color:red; border:none; margin-top:5px;">Cancel</button>
            </div>
        </div>`;
    displayQuotations();
}
async function saveQuote() {
    await db.addRecord('quotations', { client: document.getElementById('qClient').value, amount: document.getElementById('qAmt').value });
    document.getElementById('quoteModal').style.display='none'; displayQuotations();
}
async function displayQuotations() {
    const data = await db.getCollection('quotations');
    document.getElementById('quoteBody').innerHTML = data.length ? data.map(d => `<tr style="border-bottom:1px solid var(--border-color);"><td style="padding:15px;">${d.createdAt}</td><td style="padding:15px;">${d.client}</td><td style="padding:15px;">₹${Number(d.amount).toLocaleString('en-IN')}</td><td style="padding:15px;"><button onclick="deleteData('quotations','${d.id}', displayQuotations)" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button></td></tr>`).reverse().join('') : `<tr><td colspan="4" style="padding:20px; text-align:center;">No quotes found.</td></tr>`;
}

// --- 9. BACKUP & RESTORE MODULE ---
function loadBackupModule() {
    pageTitle.innerText = "DATA BACKUP & RESTORE";
    moduleContainer.innerHTML = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:20px;">
            <div style="background:var(--card-bg); padding:30px; border-radius:10px; text-align:center; border:1px solid var(--border-color);">
                <i class="fas fa-download" style="font-size:3rem; color:var(--accent-color); margin-bottom:15px;"></i>
                <h3>Download Backup</h3>
                <p style="color:var(--text-muted); margin:10px 0;">Save your data to your computer securely.</p>
                <button onclick="exportDB()" style="padding:10px 20px; background:var(--primary-color); color:white; border:none; border-radius:5px; cursor:pointer;">Download File</button>
            </div>
            <div style="background:var(--card-bg); padding:30px; border-radius:10px; text-align:center; border:1px solid var(--border-color);">
                <i class="fas fa-upload" style="font-size:3rem; color:var(--secondary-color); margin-bottom:15px;"></i>
                <h3>Restore Backup</h3>
                <p style="color:var(--text-muted); margin:10px 0;">Upload a previously saved backup file.</p>
                <input type="file" id="restoreFile" style="display:none;" onchange="importDB(event)" accept=".json">
                <button onclick="document.getElementById('restoreFile').click()" style="padding:10px 20px; background:var(--secondary-color); color:white; border:none; border-radius:5px; cursor:pointer;">Upload File</button>
            </div>
        </div>`;
}
function exportDB() {
    const data = localStorage.getItem('RMP_ERP_SYSTEM_DB');
    if(!data) return alert("No data to backup!");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], {type: "application/json"}));
    a.download = "RMP_Backup_" + new Date().toLocaleDateString('en-IN').replace(/\//g,'-') + ".json";
    a.click();
}
function importDB(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            JSON.parse(evt.target.result); // Validate JSON
            localStorage.setItem('RMP_ERP_SYSTEM_DB', evt.target.result);
            alert("Data Restored Successfully!");
            window.location.reload();
        } catch(err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
}

// Global Delete Function
async function deleteData(collection, id, refreshFunction) {
    if(confirm("Are you sure you want to delete this?")) {
        await db.deleteRecord(collection, id);
        refreshFunction();
    }
}

// Init
window.onload = () => loadModule('dashboard');
