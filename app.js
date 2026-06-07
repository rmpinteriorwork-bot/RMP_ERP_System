/**
 * RMP INTERIOR - Complete Enterprise Management System
 * Modules: Dashboard, Leads, Projects, Quotations, Expenses, Inventory, Vendors, Backup
 */

// --- CORE DATABASE (LocalStorage) ---
class Database {
    constructor() {
        this.dbName = 'RMP_ERP_DB';
        this.tables = ['leads', 'projects', 'quotations', 'expenses', 'inventory', 'vendors', 'settings'];
        this.init();
    }
    init() {
        if (!localStorage.getItem(this.dbName)) {
            const emptyDB = {};
            this.tables.forEach(t => emptyDB[t] = []);
            emptyDB.settings = [{ companyName: "RMP INTERIOR", email: "", phone: "", gst: "" }];
            localStorage.setItem(this.dbName, JSON.stringify(emptyDB));
        }
    }
    get(table) { return JSON.parse(localStorage.getItem(this.dbName))[table] || []; }
    save(table, data) {
        const db = JSON.parse(localStorage.getItem(this.dbName));
        data.id = data.id || 'RMP_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
        data.date = data.date || new Date().toLocaleDateString('en-IN');
        
        const index = db[table].findIndex(item => item.id === data.id);
        if (index > -1) db[table][index] = data;
        else db[table].push(data);
        
        localStorage.setItem(this.dbName, JSON.stringify(db));
    }
    delete(table, id) {
        const db = JSON.parse(localStorage.getItem(this.dbName));
        db[table] = db[table].filter(item => item.id !== id);
        localStorage.setItem(this.dbName, JSON.stringify(db));
    }
}
const db = new Database();

// --- UI CONTROLLER ---
const UI = {
    container: document.getElementById('moduleContainer'),
    title: document.getElementById('pageTitle'),
    modal: document.getElementById('globalModal'),
    modalBody: document.getElementById('modalBody'),
    
    openModal(html) {
        this.modalBody.innerHTML = html;
        this.modal.style.display = 'flex';
    },
    closeModal() {
        this.modal.style.display = 'none';
        this.modalBody.innerHTML = '';
    },
    formatCurrency(num) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num || 0);
    }
};

// --- MENU DEFINITIONS ---
const modules = [
    { id: 'dashboard', icon: 'fa-chart-pie', name: 'Dashboard', render: renderDashboard },
    { id: 'leads', icon: 'fa-users', name: 'Leads (CRM)', render: renderLeads },
    { id: 'quotations', icon: 'fa-file-invoice-dollar', name: 'Quotations', render: renderQuotations },
    { id: 'projects', icon: 'fa-hard-hat', name: 'Projects & Sites', render: renderProjects },
    { id: 'expenses', icon: 'fa-wallet', name: 'Expenses', render: renderExpenses },
    { id: 'vendors', icon: 'fa-truck', name: 'Vendors', render: renderVendors },
    { id: 'inventory', icon: 'fa-boxes-stacked', name: 'Inventory', render: renderInventory },
    { id: 'backup', icon: 'fa-database', name: 'Backup & Restore', render: renderBackup },
    { id: 'settings', icon: 'fa-cog', name: 'Settings', render: renderSettings }
];

// Initialize Menu & Theme
document.getElementById('navMenu').innerHTML = modules.map(m => `
    <a class="nav-item" onclick="loadModule('${m.id}')" id="nav-${m.id}">
        <i class="fas ${m.icon}"></i> ${m.name}
    </a>
`).join('');

document.getElementById('mobileMenuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('active'));
const themeBtn = document.getElementById('themeToggle');
if(localStorage.getItem('theme') === 'dark') { document.body.classList.add('dark-mode'); themeBtn.innerHTML = '<i class="fas fa-sun"></i>'; }
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

function loadModule(id) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`nav-${id}`).classList.add('active');
    const mod = modules.find(m => m.id === id);
    UI.title.innerText = mod.name;
    UI.container.innerHTML = '';
    if(window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('active');
    mod.render();
}

// --- 1. DASHBOARD ---
function renderDashboard() {
    const leads = db.get('leads');
    const projs = db.get('projects');
    const exps = db.get('expenses');
    
    const activeProjs = projs.filter(p => p.status !== 'Completed').length;
    const totalExp = exps.reduce((sum, e) => sum + Number(e.amount), 0);

    UI.container.innerHTML = `
        <div class="grid-cards">
            <div class="card"><h3>Total Leads</h3><h2>${leads.length}</h2></div>
            <div class="card"><h3>Active Projects</h3><h2 style="color:var(--accent-color)">${activeProjs}</h2></div>
            <div class="card"><h3>Completed Projects</h3><h2 style="color:var(--secondary-color)">${projs.length - activeProjs}</h2></div>
            <div class="card"><h3>Total Expenses</h3><h2 style="color:var(--danger-color)">${UI.formatCurrency(totalExp)}</h2></div>
        </div>
        <div class="table-wrapper">
            <h3 style="margin-bottom:15px">Recent Activities</h3>
            <p style="color:var(--text-muted)">System is active and tracking all metrics.</p>
        </div>
    `;
}

// --- 2. LEADS (CRM) ---
function renderLeads() {
    const data = db.get('leads');
    UI.container.innerHTML = `
        <div style="margin-bottom: 20px;"><button class="btn btn-primary" onclick="showLeadModal()"><i class="fas fa-plus"></i> Add Lead</button></div>
        <div class="table-wrapper">
            <table>
                <tr><th>Date</th><th>Client Name</th><th>Phone</th><th>Requirement</th><th>Status</th><th>Action</th></tr>
                ${data.map(d => `
                    <tr>
                        <td>${d.date}</td><td><strong>${d.name}</strong></td><td>${d.phone}</td><td>${d.req}</td>
                        <td><span class="badge ${d.status === 'Won' ? 'badge-active' : (d.status === 'Lost' ? 'badge-closed' : 'badge-new')}">${d.status}</span></td>
                        <td><button class="icon-btn" onclick="deleteRecord('leads', '${d.id}', renderLeads)" style="color:var(--danger-color)"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `).join('') || '<tr><td colspan="6">No leads found</td></tr>'}
            </table>
        </div>
    `;
}
function showLeadModal() {
    UI.openModal(`
        <div class="modal-header"><h3>New Lead</h3><button class="icon-btn" onclick="UI.closeModal()"><i class="fas fa-times"></i></button></div>
        <input type="text" id="lName" class="input-control" placeholder="Client Name">
        <input type="text" id="lPhone" class="input-control" placeholder="Phone Number">
        <input type="text" id="lReq" class="input-control" placeholder="Requirement (e.g., Kitchen Interior)">
        <select id="lStatus" class="input-control"><option value="New">New</option><option value="Follow-up">Follow-up</option><option value="Site Visit">Site Visit</option><option value="Won">Won</option><option value="Lost">Lost</option></select>
        <button class="btn btn-primary" style="width:100%" onclick="saveLead()">Save Lead</button>
    `);
}
function saveLead() {
    db.save('leads', { name: document.getElementById('lName').value, phone: document.getElementById('lPhone').value, req: document.getElementById('lReq').value, status: document.getElementById('lStatus').value });
    UI.closeModal(); renderLeads();
}

// --- 3. QUOTATIONS ---
function renderQuotations() {
    const data = db.get('quotations');
    UI.container.innerHTML = `
        <div style="margin-bottom: 20px;"><button class="btn btn-secondary" onclick="showQuoteModal()"><i class="fas fa-file-invoice"></i> Create Quotation</button></div>
        <div class="table-wrapper">
            <table>
                <tr><th>Date</th><th>Client</th><th>Project</th><th>Total Value</th><th>Action</th></tr>
                ${data.map(d => `
                    <tr>
                        <td>${d.date}</td><td><strong>${d.client}</strong></td><td>${d.project}</td><td>${UI.formatCurrency(d.amount)}</td>
                        <td>
                            <button class="icon-btn" onclick="generatePDF('${d.id}')" style="color:var(--primary-color); margin-right:10px;"><i class="fas fa-file-pdf"></i></button>
                            <button class="icon-btn" onclick="deleteRecord('quotations', '${d.id}', renderQuotations)" style="color:var(--danger-color)"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('') || '<tr><td colspan="5">No quotations found</td></tr>'}
            </table>
        </div>
    `;
}
function showQuoteModal() {
    UI.openModal(`
        <div class="modal-header"><h3>Create Quotation</h3><button class="icon-btn" onclick="UI.closeModal()"><i class="fas fa-times"></i></button></div>
        <input type="text" id="qClient" class="input-control" placeholder="Client Name">
        <input type="text" id="qProject" class="input-control" placeholder="Project Description">
        <textarea id="qItems" class="input-control" rows="4" placeholder="Itemized Details (e.g., Wardrobe - 50000)"></textarea>
        <input type="number" id="qAmount" class="input-control" placeholder="Total Amount (₹)">
        <button class="btn btn-secondary" style="width:100%" onclick="saveQuote()">Save Quotation</button>
    `);
}
function saveQuote() {
    db.save('quotations', { client: document.getElementById('qClient').value, project: document.getElementById('qProject').value, items: document.getElementById('qItems').value, amount: document.getElementById('qAmount').value });
    UI.closeModal(); renderQuotations();
}

// --- 4. PROJECTS ---
function renderProjects() {
    const data = db.get('projects');
    UI.container.innerHTML = `
        <div style="margin-bottom: 20px;"><button class="btn btn-accent" style="background:var(--accent-color);color:white;" onclick="showProjectModal()"><i class="fas fa-hard-hat"></i> Start Project</button></div>
        <div class="grid-cards">
            ${data.map(d => `
                <div class="card">
                    <div style="display:flex;justify-content:space-between"><h3>${d.client}</h3><span class="badge ${d.status==='Completed'?'badge-active':'badge-new'}">${d.status}</span></div>
                    <h2>${d.name}</h2>
                    <div style="margin:15px 0; background:var(--bg-color); height:8px; border-radius:4px;"><div style="width:${d.progress}%; background:var(--accent-color); height:100%; border-radius:4px;"></div></div>
                    <p style="font-size:0.8rem; color:var(--text-muted)">Budget: ${UI.formatCurrency(d.budget)} | Adv: ${UI.formatCurrency(d.advance)}</p>
                    <button class="btn btn-danger" style="margin-top:10px; padding:5px 10px; font-size:0.8rem;" onclick="deleteRecord('projects', '${d.id}', renderProjects)">Delete</button>
                </div>
            `).join('') || '<p>No active projects.</p>'}
        </div>
    `;
}
function showProjectModal() {
    UI.openModal(`
        <div class="modal-header"><h3>New Project</h3><button class="icon-btn" onclick="UI.closeModal()"><i class="fas fa-times"></i></button></div>
        <input type="text" id="pName" class="input-control" placeholder="Project Name">
        <input type="text" id="pClient" class="input-control" placeholder="Client Name">
        <div style="display:flex; gap:10px;">
            <input type="number" id="pBudget" class="input-control" placeholder="Budget">
            <input type="number" id="pAdvance" class="input-control" placeholder="Advance">
        </div>
        <input type="number" id="pProgress" class="input-control" placeholder="Progress %" max="100">
        <select id="pStatus" class="input-control"><option>Ongoing</option><option>Completed</option></select>
        <button class="btn" style="background:var(--accent-color);color:white;width:100%" onclick="saveProject()">Save Project</button>
    `);
}
function saveProject() {
    db.save('projects', { name: document.getElementById('pName').value, client: document.getElementById('pClient').value, budget: document.getElementById('pBudget').value, advance: document.getElementById('pAdvance').value, progress: document.getElementById('pProgress').value, status: document.getElementById('pStatus').value });
    UI.closeModal(); renderProjects();
}

// --- 5. EXPENSES, 6. INVENTORY, 7. VENDORS (Generic Table Renderers for brevity) ---
function renderExpenses() { renderGeneric('expenses', 'Add Expense', ['Reason', 'Amount'], ['reason', 'amount'], true); }
function renderInventory() { renderGeneric('inventory', 'Add Stock', ['Item Name', 'Quantity'], ['name', 'qty']); }
function renderVendors() { renderGeneric('vendors', 'Add Vendor', ['Name', 'Material', 'Phone'], ['name', 'material', 'phone']); }

function renderGeneric(table, btnText, cols, keys, isCurrency=false) {
    const data = db.get(table);
    UI.container.innerHTML = `
        <div style="margin-bottom: 20px;"><button class="btn btn-primary" onclick="showGenericModal('${table}', '${keys.join(',')}')"><i class="fas fa-plus"></i> ${btnText}</button></div>
        <div class="table-wrapper">
            <table>
                <tr><th>Date</th>${cols.map(c=>`<th>${c}</th>`).join('')}<th>Action</th></tr>
                ${data.map(d => `<tr><td>${d.date}</td>${keys.map(k=>`<td>${isCurrency && k==='amount' ? UI.formatCurrency(d[k]) : d[k]}</td>`).join('')}<td><button class="icon-btn" onclick="deleteRecord('${table}', '${d.id}', render${table.charAt(0).toUpperCase()+table.slice(1)})" style="color:var(--danger-color)"><i class="fas fa-trash"></i></button></td></tr>`).join('') || `<tr><td colspan="${cols.length+2}">No records</td></tr>`}
            </table>
        </div>
    `;
}
function showGenericModal(table, keysStr) {
    const keys = keysStr.split(',');
    UI.openModal(`
        <div class="modal-header"><h3 style="text-transform:capitalize">Add ${table}</h3><button class="icon-btn" onclick="UI.closeModal()"><i class="fas fa-times"></i></button></div>
        ${keys.map(k => `<input type="text" id="g_${k}" class="input-control" placeholder="${k.toUpperCase()}">`).join('')}
        <button class="btn btn-primary" style="width:100%" onclick="saveGeneric('${table}', '${keysStr}')">Save</button>
    `);
}
function saveGeneric(table, keysStr) {
    const data = {};
    keysStr.split(',').forEach(k => data[k] = document.getElementById('g_'+k).value);
    db.save(table, data); UI.closeModal(); window['render'+table.charAt(0).toUpperCase()+table.slice(1)]();
}

// --- 8. PDF GENERATOR ---
function generatePDF(id) {
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    const q = db.get('quotations').find(x => x.id === id);
    const set = db.get('settings')[0];
    doc.setFontSize(22); doc.text(set.companyName || "RMP INTERIOR", 14, 20);
    doc.setFontSize(10); doc.text("Quotation / Estimate", 14, 30);
    doc.text(`Client: ${q.client}`, 14, 45); doc.text(`Project: ${q.project}`, 14, 52); doc.text(`Date: ${q.date}`, 150, 45);
    
    doc.autoTable({ startY: 60, head: [['Description']], body: q.items.split('\n').map(i => [i]), theme: 'grid' });
    doc.setFontSize(12); doc.text(`Total Amount: ${UI.formatCurrency(q.amount)}`, 14, doc.lastAutoTable.finalY + 15);
    doc.save(`Quotation_${q.client}.pdf`);
}

// --- 9. BACKUP & SETTINGS ---
function renderBackup() {
    UI.container.innerHTML = `
        <div class="grid-cards">
            <div class="card" style="text-align:center">
                <i class="fas fa-download" style="font-size:3rem;color:var(--primary-color);margin-bottom:15px"></i>
                <h3>Export Database</h3><p style="margin-bottom:15px">Save all data securely.</p>
                <button class="btn btn-primary" onclick="exportDB()">Download JSON</button>
            </div>
            <div class="card" style="text-align:center">
                <i class="fas fa-upload" style="font-size:3rem;color:var(--secondary-color);margin-bottom:15px"></i>
                <h3>Restore Database</h3><p style="margin-bottom:15px">Upload JSON backup.</p>
                <input type="file" id="importFile" style="display:none" onchange="importDB(event)">
                <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">Upload JSON</button>
            </div>
        </div>
    `;
}
function exportDB() {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([localStorage.getItem('RMP_ERP_DB')], {type:"application/json"}));
    a.download = "RMP_Backup.json"; a.click();
}
function importDB(e) {
    const reader = new FileReader();
    reader.onload = function(evt) { localStorage.setItem('RMP_ERP_DB', evt.target.result); alert("Restored!"); window.location.reload(); };
    reader.readAsText(e.target.files[0]);
}

function renderSettings() {
    const s = db.get('settings')[0] || {};
    UI.container.innerHTML = `
        <div class="card" style="max-width:600px">
            <h3>Company Settings</h3><br>
            <input type="text" id="sName" class="input-control" placeholder="Company Name" value="${s.companyName||''}">
            <input type="text" id="sEmail" class="input-control" placeholder="Email" value="${s.email||''}">
            <input type="text" id="sGst" class="input-control" placeholder="GST Number" value="${s.gst||''}">
            <button class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
        </div>
    `;
}
function saveSettings() {
    db.save('settings', { id: db.get('settings')[0]?.id, companyName: document.getElementById('sName').value, email: document.getElementById('sEmail').value, gst: document.getElementById('sGst').value });
    alert("Saved!");
}

// Global Delete Wrapper
function deleteRecord(table, id, cb) { if(confirm("Are you sure?")) { db.delete(table, id); cb(); } }

// Boot System
window.onload = () => loadModule('dashboard');
