/**
 * RMP INTERIOR - Enterprise Business Management System
 * Full app.js Code (Database + UI + Backup + Projects)
 */

// --- Step 1: Database Schema & Service Architecture ---
const RMP_DB_SCHEMA = {
    settings: {
        companyName: "RMP INTERIOR",
        tagline: "Built with Vision. Designed with Care."
    },
    leads: [],
    customers: [],
    projects: [],
    quotations: [],
    expenses: [],
    vendors: [],
    inventory: [],
    employees: [],
    documents: [],
    siteProgress: []
};

class RMPDatabase {
    constructor() {
        this.dbName = "RMP_ERP_SYSTEM_DB";
        this.initDB();
    }

    initDB() {
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify(RMP_DB_SCHEMA));
        }
    }

    async getCollection(collectionName) {
        return new Promise((resolve) => {
            const db = JSON.parse(localStorage.getItem(this.dbName));
            resolve(db[collectionName] || []);
        });
    }

    async addRecord(collectionName, data) {
        return new Promise((resolve, reject) => {
            try {
                const db = JSON.parse(localStorage.getItem(this.dbName));
                const newRecord = {
                    id: 'RMP_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now(),
                    createdAt: new Date().toISOString(),
                    ...data
                };
                
                if (Array.isArray(db[collectionName])) {
                    db[collectionName].push(newRecord);
                } else {
                    db[collectionName] = { ...db[collectionName], ...data };
                }
                
                localStorage.setItem(this.dbName, JSON.stringify(db));
                resolve(newRecord);
            } catch (error) {
                reject(error);
            }
        });
    }

    async deleteRecord(collectionName, id) {
        return new Promise((resolve) => {
            const db = JSON.parse(localStorage.getItem(this.dbName));
            db[collectionName] = db[collectionName].filter(item => item.id !== id);
            localStorage.setItem(this.dbName, JSON.stringify(db));
            resolve(true);
        });
    }
}

const db = new RMPDatabase();

// --- Step 4: UI & Navigation Logic ---
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const themeToggle = document.getElementById('themeToggle');
const moduleContainer = document.getElementById('moduleContainer');
const pageTitle = document.getElementById('pageTitle');
const navItems = document.querySelectorAll('.nav-item');

mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

if(localStorage.getItem('rmp_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
        localStorage.setItem('rmp_theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('rmp_theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

function loadModule(moduleName) {
    navItems.forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('onclick').includes(moduleName)) {
            item.classList.add('active');
        }
    });

    if(window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }

    let content = '';
    switch(moduleName) {
        case 'dashboard':
            pageTitle.innerText = "Executive Dashboard";
            content = `
                <div class="dashboard-cards">
                    <div class="card"><i class="fas fa-bullseye"></i> <div class="card-info"><h3>Total Leads</h3> <p id="dash-leads">0</p></div></div>
                    <div class="card"><i class="fas fa-project-diagram"></i> <div class="card-info"><h3>Active Projects</h3> <p id="dash-projects">0</p></div></div>
                    <div class="card"><i class="fas fa-rupee-sign"></i> <div class="card-info"><h3>Monthly Revenue</h3> <p id="dash-revenue">₹0</p></div></div>
                    <div class="card"><i class="fas fa-wallet"></i> <div class="card-info"><h3>Total Expenses</h3> <p id="dash-expenses">₹0</p></div></div>
                </div>
                <div style="margin-top: 30px; background: var(--card-bg); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <h3 style="color: var(--secondary-color); margin-bottom: 10px;">Welcome to RMP INTERIOR ERP System</h3>
                    <p style="color: var(--text-muted);">Please select a module from the sidebar menu to manage your business operations.</p>
                </div>
            `;
            moduleContainer.innerHTML = content;
            updateDashboardData();
            break;
            
       case 'leads':
            pageTitle.innerText = "Lead Management (CRM)";
            loadLeadsModule();
            return;  
        case 'projects':
            pageTitle.innerText = "Project Management";
            loadProjectsModule();
            return;
     case 'expenses':
            pageTitle.innerText = "Expense Management";
            loadExpensesModule();
            return;   
        case 'backup':
            pageTitle.innerText = "Data Backup & Restore";
            loadBackupModule();
            return;

        default:
            let formattedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            pageTitle.innerText = formattedName + " Management";
            content = `
                <div style="padding: 25px; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color); text-align: center;">
                    <i class="fas fa-tools" style="font-size: 3rem; color: var(--border-color); margin-bottom: 15px;"></i>
                    <h2 style="color: var(--text-main); margin-bottom: 10px;">${formattedName} Module</h2>
                    <p style="color: var(--text-muted);">This module is currently being built. Database architecture is already connected.</p>
                </div>`;
            moduleContainer.innerHTML = content;
    }
}

async function updateDashboardData() {
    try {
        const leads = await db.getCollection('leads');
        const projects = await db.getCollection('projects');
        const expenses = await db.getCollection('expenses');
        
        document.getElementById('dash-leads').innerText = leads.length;
        document.getElementById('dash-projects').innerText = projects.length;
        
        // மொத்த செலவுகளைக் கணக்கிடுதல்
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        document.getElementById('dash-expenses').innerText = "₹" + totalExpenses.toLocaleString('en-IN');
    } catch(err) {
        console.log("Error loading dashboard data:", err);
    }
}
window.onload = () => {
    loadModule('dashboard');
};

// --- Step 5: Backup & Restore Module ---
function loadBackupModule() {
    const backupContent = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div style="background: var(--card-bg); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color); text-align: center;">
                <i class="fas fa-cloud-download-alt" style="font-size: 3rem; color: var(--accent-color); margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">Backup Database</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">Download all your business data securely to your computer.</p>
                <button onclick="exportDatabase()" style="background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: 500;">
                    <i class="fas fa-download"></i> Download Full Backup (JSON)
                </button>
            </div>
            <div style="background: var(--card-bg); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color); text-align: center;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">Restore Database</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">Upload a previously saved JSON backup file to restore your system data.</p>
                <input type="file" id="restoreFileInput" accept=".json" style="display: none;" onchange="importDatabase(event)">
                <button onclick="document.getElementById('restoreFileInput').click()" style="background: var(--secondary-color); color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: 500;">
                    <i class="fas fa-upload"></i> Select Backup File
                </button>
            </div>
        </div>
    `;
    document.getElementById('moduleContainer').innerHTML = backupContent;
}

function exportDatabase() {
    const dbData = localStorage.getItem('RMP_ERP_SYSTEM_DB');
    if (!dbData) return alert("No data found to backup!");
    const blob = new Blob([dbData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RMP_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!confirm("WARNING: Restoring will overwrite all current data. Do you want to proceed?")) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (importedData && typeof importedData === 'object' && 'settings' in importedData) {
                localStorage.setItem('RMP_ERP_SYSTEM_DB', JSON.stringify(importedData));
                alert("Database Restored Successfully!");
                window.location.reload();
            } else {
                alert("Invalid Backup File!");
            }
        } catch (error) {
            alert("Error reading file.");
        }
    };
    reader.readAsText(file);
}

// --- Step 6: Project Management Module ---
function loadProjectsModule() {
    const content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Ongoing & Upcoming Projects</h3>
            <button onclick="showProjectModal()" style="background: var(--accent-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;"><i class="fas fa-plus"></i> Add New Project</button>
        </div>
        <div id="projectsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;"></div>

        <div id="projectModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; justify-content: center; align-items: center;">
            <div style="background: var(--card-bg); padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 20px; color: var(--text-main);">Create New Project</h3>
                <form id="projectForm" onsubmit="saveProject(event)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Project Name (e.g. Modular Kitchen)</label>
                        <input type="text" id="projName" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Client Name</label>
                        <input type="text" id="projClient" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Start Date</label>
                            <input type="date" id="projDate" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Budget (₹)</label>
                            <input type="number" id="projBudget" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="closeProjectModal()" style="padding: 10px 15px; border-radius: 5px; border: 1px solid var(--border-color); background: transparent; color: var(--text-main); cursor: pointer;">Cancel</button>
                        <button type="submit" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Save Project</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.getElementById('moduleContainer').innerHTML = content;
    displayProjects();
}

async function displayProjects() {
    const projects = await db.getCollection('projects');
    const grid = document.getElementById('projectsGrid');
    
    if(projects.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color);"><i class="fas fa-folder-open" style="font-size: 3rem; color: var(--border-color); margin-bottom: 15px;"></i><p style="color: var(--text-muted);">No active projects found. Click "Add New Project" to start.</p></div>';
        return;
    }

    grid.innerHTML = projects.map(p => `
        <div style="background: var(--card-bg); padding: 20px; border-radius: 10px; border: 1px solid var(--border-color); box-shadow: var(--shadow); transition: transform 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                <div>
                    <h4 style="color: var(--text-main); font-size: 1.1rem; margin-bottom: 5px;">${p.name}</h4>
                    <p style="color: var(--text-muted); font-size: 0.85rem;"><i class="fas fa-user" style="margin-right: 5px;"></i> ${p.client}</p>
                </div>
                <span style="background: rgba(52, 152, 219, 0.1); color: var(--accent-color); padding: 5px 10px; border-radius: 15px; font-size: 0.75rem; font-weight: 600;">In Progress</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 15px; color: var(--text-main); background: var(--bg-color); padding: 10px; border-radius: 5px;">
                <span><i class="far fa-calendar-alt" style="color: var(--text-muted);"></i> ${p.startDate}</span>
                <span style="font-weight: 600;"><i class="fas fa-rupee-sign" style="color: var(--text-muted);"></i> ${Number(p.budget).toLocaleString('en-IN')}</span>
            </div>
            <div style="border-top: 1px solid var(--border-color); padding-top: 15px; display: flex; justify-content: space-between;">
                 <button onclick="alert('Task management coming soon!')" style="color: var(--accent-color); background: none; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 500;"><i class="fas fa-tasks"></i> Tasks</button>
                 <button onclick="deleteProject('${p.id}')" style="color: var(--secondary-color); background: none; border: none; cursor: pointer; font-size: 0.9rem; font-weight: 500;"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        </div>
    `).reverse().join('');
}

function showProjectModal() { document.getElementById('projectModal').style.display = 'flex'; }
function closeProjectModal() { 
    document.getElementById('projectModal').style.display = 'none'; 
    document.getElementById('projectForm').reset(); 
}

async function saveProject(event) {
    event.preventDefault();
    const newProject = {
        name: document.getElementById('projName').value,
        client: document.getElementById('projClient').value,
        startDate: document.getElementById('projDate').value,
        budget: document.getElementById('projBudget').value,
        status: 'In Progress'
    };
    
    await db.addRecord('projects', newProject);
    closeProjectModal();
    displayProjects();
    updateDashboardData();
}

async function deleteProject(id) {
    if(confirm('Are you sure you want to delete this project?')) {
        await db.deleteRecord('projects', id);
        displayProjects();
        updateDashboardData();
    }
}
// --- Step 7: Lead Management (CRM) Module ---

function loadLeadsModule() {
    const content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Lead Tracking Pipeline</h3>
            <button onclick="showLeadModal()" style="background: var(--accent-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;"><i class="fas fa-plus"></i> Add New Lead</button>
        </div>
        
        <div style="background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color); overflow-x: auto; box-shadow: var(--shadow);">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Date</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Name</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Phone</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Requirement</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Status</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Actions</th>
                    </tr>
                </thead>
                <tbody id="leadsTableBody">
                    </tbody>
            </table>
        </div>

        <div id="leadModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; justify-content: center; align-items: center;">
            <div style="background: var(--card-bg); padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 20px; color: var(--text-main);">Add New Lead</h3>
                <form id="leadForm" onsubmit="saveLead(event)">
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Customer Name</label>
                        <input type="text" id="leadName" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Phone Number</label>
                        <input type="tel" id="leadPhone" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Requirement (e.g. Modular Kitchen, Wardrobe)</label>
                        <input type="text" id="leadReq" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Initial Status</label>
                        <select id="leadStatus" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                            <option value="New Inquiry">New Inquiry</option>
                            <option value="Site Visit Planned">Site Visit Planned</option>
                            <option value="Quotation Sent">Quotation Sent</option>
                        </select>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="closeLeadModal()" style="padding: 10px 15px; border-radius: 5px; border: 1px solid var(--border-color); background: transparent; color: var(--text-main); cursor: pointer;">Cancel</button>
                        <button type="submit" style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Save Lead</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('moduleContainer').innerHTML = content;
    displayLeads();
}

async function displayLeads() {
    const leads = await db.getCollection('leads');
    const tbody = document.getElementById('leadsTableBody');
    
    if(leads.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No leads found. Click "Add New Lead" to get started.</td></tr>';
        return;
    }

    // Status-க்கு ஏற்ற நிறங்கள்
    const statusColors = {
        'New Inquiry': '#e74c3c',
        'Site Visit Planned': '#f39c12',
        'Quotation Sent': '#3498db',
        'Converted': '#2ecc71',
        'Lost': '#95a5a6'
    };

    tbody.innerHTML = leads.map(l => `
        <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.3s;">
            <td style="padding: 15px; color: var(--text-main);">${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
            <td style="padding: 15px; color: var(--text-main); font-weight: 500;">${l.name}</td>
            <td style="padding: 15px; color: var(--text-main);">${l.phone}</td>
            <td style="padding: 15px; color: var(--text-main);">${l.requirement}</td>
            <td style="padding: 15px;">
                <select onchange="updateLeadStatus('${l.id}', this.value)" style="padding: 5px 10px; border-radius: 15px; border: 1px solid ${statusColors[l.status]}; color: ${statusColors[l.status]}; background: transparent; font-weight: 600; cursor: pointer; outline: none;">
                    <option value="New Inquiry" ${l.status === 'New Inquiry' ? 'selected' : ''}>New Inquiry</option>
                    <option value="Site Visit Planned" ${l.status === 'Site Visit Planned' ? 'selected' : ''}>Site Visit Planned</option>
                    <option value="Quotation Sent" ${l.status === 'Quotation Sent' ? 'selected' : ''}>Quotation Sent</option>
                    <option value="Converted" ${l.status === 'Converted' ? 'selected' : ''}>Converted</option>
                    <option value="Lost" ${l.status === 'Lost' ? 'selected' : ''}>Lost</option>
                </select>
            </td>
            <td style="padding: 15px;">
                <button onclick="deleteLead('${l.id}')" style="color: var(--secondary-color); background: none; border: none; cursor: pointer; font-size: 1rem;"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).reverse().join('');
}

function showLeadModal() { document.getElementById('leadModal').style.display = 'flex'; }
function closeLeadModal() { 
    document.getElementById('leadModal').style.display = 'none'; 
    document.getElementById('leadForm').reset(); 
}

async function saveLead(event) {
    event.preventDefault();
    const newLead = {
        name: document.getElementById('leadName').value,
        phone: document.getElementById('leadPhone').value,
        requirement: document.getElementById('leadReq').value,
        status: document.getElementById('leadStatus').value
    };
    
    await db.addRecord('leads', newLead);
    closeLeadModal();
    displayLeads();
    if(typeof updateDashboardData === 'function') updateDashboardData();
}

// ஸ்டேட்டஸ் மாறும்போது (உதாரணமாக Dropdown-ல் Converted என மாற்றினால்) Database-ல் அப்டேட் செய்யும் வசதி
async function updateLeadStatus(id, newStatus) {
    await db.updateRecord('leads', id, { status: newStatus });
    displayLeads();
}

async function deleteLead(id) {
    if(confirm('Are you sure you want to delete this lead?')) {
        await db.deleteRecord('leads', id);
        displayLeads();
        if(typeof updateDashboardData === 'function') updateDashboardData();
    }
}

// --- Step 8: Expense Management Module ---

async function loadExpensesModule() {
    // Dropdown-ல் காட்டுவதற்காக Projects டேட்டாவை எடுத்தல்
    const projects = await db.getCollection('projects');
    let projectOptions = '<option value="">General / No Project Selected</option>';
    projects.forEach(p => {
        projectOptions += `<option value="${p.id}">${p.name} - ${p.client}</option>`;
    });

    const content = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3>Expense Tracking</h3>
            <button onclick="showExpenseModal()" style="background: var(--secondary-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: 500;"><i class="fas fa-plus"></i> Add Expense</button>
        </div>
        
        <div style="background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color); overflow-x: auto; box-shadow: var(--shadow);">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: rgba(0,0,0,0.05); border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Date</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Category</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Description</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Amount (₹)</th>
                        <th style="padding: 15px; color: var(--text-muted); font-weight: 500;">Action</th>
                    </tr>
                </thead>
                <tbody id="expensesTableBody">
                    </tbody>
            </table>
        </div>

        <div id="expenseModal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 2000; justify-content: center; align-items: center;">
            <div style="background: var(--card-bg); padding: 30px; border-radius: 10px; width: 90%; max-width: 500px; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <h3 style="margin-bottom: 20px; color: var(--text-main);">Add New Expense</h3>
                <form id="expenseForm" onsubmit="saveExpense(event)">
                    <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Date</label>
                            <input type="date" id="expDate" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                        </div>
                        <div style="flex: 1;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Category</label>
                            <select id="expCategory" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                                <option value="Material">Material (பொருட்கள்)</option>
                                <option value="Labour">Labour (கூலி)</option>
                                <option value="Transport">Transport (போக்குவரத்து)</option>
                                <option value="Miscellaneous">Miscellaneous (இதர)</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Link to Project (Optional)</label>
                        <select id="expProject" style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                            ${projectOptions}
                        </select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Description (e.g. Plywood, Carpenter advance)</label>
                        <input type="text" id="expDesc" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; color: var(--text-muted);">Amount (₹)</label>
                        <input type="number" id="expAmount" required style="width: 100%; padding: 10px; border: 1px solid var(--border-color); border-radius: 5px; background: var(--bg-color); color: var(--text-main);">
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                        <button type="button" onclick="closeExpenseModal()" style="padding: 10px 15px; border-radius: 5px; border: 1px solid var(--border-color); background: transparent; color: var(--text-main); cursor: pointer;">Cancel</button>
                        <button type="submit" style="background: var(--secondary-color); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('moduleContainer').innerHTML = content;
    
    // இன்றையை தேதியை Default ஆக செட் செய்ய
    document.getElementById('expDate').valueAsDate = new Date();
    
    displayExpenses();
}

async function displayExpenses() {
    const expenses = await db.getCollection('expenses');
    const tbody = document.getElementById('expensesTableBody');
    
    if(expenses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 30px; color: var(--text-muted);">No expenses recorded yet.</td></tr>';
        return;
    }

    // Category-க்கு ஏற்ற நிறங்கள்
    const catColors = {
        'Material': '#3498db',
        'Labour': '#e67e22',
        'Transport': '#9b59b6',
        'Miscellaneous': '#e74c3c'
    };

    tbody.innerHTML = expenses.map(e => `
        <tr style="border-bottom: 1px solid var(--border-color); transition: background 0.3s;">
            <td style="padding: 15px; color: var(--text-main);">${e.date}</td>
            <td style="padding: 15px;"><span style="background: ${catColors[e.category]}20; color: ${catColors[e.category]}; padding: 5px 10px; border-radius: 15px; font-size: 0.8rem; font-weight: 600;">${e.category}</span></td>
            <td style="padding: 15px; color: var(--text-main);">${e.description}</td>
            <td style="padding: 15px; color: var(--text-main); font-weight: 600;">₹${Number(e.amount).toLocaleString('en-IN')}</td>
            <td style="padding: 15px;">
                <button onclick="deleteExpense('${e.id}')" style="color: var(--secondary-color); background: none; border: none; cursor: pointer; font-size: 1rem;"><i class="fas fa-trash-alt"></i></button>
            </td>
        </tr>
    `).reverse().join('');
}

function showExpenseModal() { document.getElementById('expenseModal').style.display = 'flex'; }
function closeExpenseModal() { 
    document.getElementById('expenseModal').style.display = 'none'; 
    document.getElementById('expenseForm').reset(); 
    document.getElementById('expDate').valueAsDate = new Date();
}

async function saveExpense(event) {
    event.preventDefault();
    const newExpense = {
        date: document.getElementById('expDate').value,
        category: document.getElementById('expCategory').value,
        projectId: document.getElementById('expProject').value,
        description: document.getElementById('expDesc').value,
        amount: document.getElementById('expAmount').value
    };
    
    await db.addRecord('expenses', newExpense);
    closeExpenseModal();
    displayExpenses();
    if(typeof updateDashboardData === 'function') updateDashboardData();
}

async function deleteExpense(id) {
    if(confirm('Are you sure you want to delete this expense?')) {
        await db.deleteRecord('expenses', id);
        displayExpenses();
        if(typeof updateDashboardData === 'function') updateDashboardData();
    }
}
