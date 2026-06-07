/**
 * RMP INTERIOR - Enterprise Business Management System
 * Step 1: Database Schema & Service Architecture
 */

// 1. Initial Database Schema (தரவுத்தள கட்டமைப்பு)
const RMP_DB_SCHEMA = {
    settings: {
        companyName: "RMP INTERIOR",
        tagline: "Built with Vision. Designed with Care.",
        email: "",
        phone: "",
        address: "",
        gstNumber: "",
        bankDetails: {},
        logoBase64: "",
        signatureBase64: ""
    },
    leads: [],          // CRM: Add New Lead, Status Pipeline
    customers: [],      // Customer Database & Contact Details
    projects: [],       // Project Creation, Timeline, Budget, Work Log
    quotations: [],     // Item-wise Pricing, GST, Terms
    expenses: [],       // Material, Labour, Misc Expenses
    vendors: [],        // Supplier Database
    inventory: [],      // Material List, Stock Quantity
    employees: [],      // Attendance, Roles, Task Assignment
    documents: [],      // Stored Drawings, Agreements (Base64 or Links)
    siteProgress: []    // Site Photos, Date-wise Progress History
};

// 2. Database Service Class (எதிர்கால Cloud Migration-க்கு ஏற்ற Modular வடிவமைப்பு)
class RMPDatabase {
    constructor() {
        this.dbName = "RMP_ERP_SYSTEM_DB";
        this.initDB();
    }

    // Database-ஐ LocalStorage-ல் உருவாக்குதல்
    initDB() {
        if (!localStorage.getItem(this.dbName)) {
            localStorage.setItem(this.dbName, JSON.stringify(RMP_DB_SCHEMA));
            console.log("RMP Database Initialized Successfully.");
        }
    }

    // Cloud Migration-க்கு தயார்படுத்தப்பட்ட Async Get Method
    async getCollection(collectionName) {
        return new Promise((resolve) => {
            const db = JSON.parse(localStorage.getItem(this.dbName));
            resolve(db[collectionName] || []);
        });
    }

    // Cloud Migration-க்கு தயார்படுத்தப்பட்ட Async Add Method
    async addRecord(collectionName, data) {
        return new Promise((resolve, reject) => {
            try {
                const db = JSON.parse(localStorage.getItem(this.dbName));
                const newRecord = {
                    id: this.generateId(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    ...data
                };
                
                if (Array.isArray(db[collectionName])) {
                    db[collectionName].push(newRecord);
                } else {
                    db[collectionName] = { ...db[collectionName], ...data }; // For Settings
                }
                
                localStorage.setItem(this.dbName, JSON.stringify(db));
                resolve(newRecord);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Update Record
    async updateRecord(collectionName, id, updatedData) {
        return new Promise((resolve, reject) => {
            try {
                const db = JSON.parse(localStorage.getItem(this.dbName));
                const index = db[collectionName].findIndex(item => item.id === id);
                
                if (index !== -1) {
                    db[collectionName][index] = {
                        ...db[collectionName][index],
                        ...updatedData,
                        updatedAt: new Date().toISOString()
                    };
                    localStorage.setItem(this.dbName, JSON.stringify(db));
                    resolve(db[collectionName][index]);
                } else {
                    reject(new Error("Record not found"));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Delete Record
    async deleteRecord(collectionName, id) {
        return new Promise((resolve) => {
            const db = JSON.parse(localStorage.getItem(this.dbName));
            db[collectionName] = db[collectionName].filter(item => item.id !== id);
            localStorage.setItem(this.dbName, JSON.stringify(db));
            resolve(true);
        });
    }

    // Unique ID Generator
    generateId() {
        return 'RMP_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
}

// ஆப்பில் எங்கும் பயன்படுத்திக் கொள்ள Global Instance
const db = new RMPDatabase();

/* Usage Example (எதிர்காலத்தில் Firebase-க்கு மாற்றும் போது இந்த Functions-ஐ மட்டும் மாற்றினால் போதும்):
db.addRecord('leads', { name: "New Client", phone: "9876543210", status: "New" }).then(console.log);
db.getCollection('leads').then(console.log);
*/

// --- Step 4: UI & Navigation Logic ---

// DOM Elements (HTML-ல் உள்ள பகுதிகளை JavaScript-உடன் இணைத்தல்)
const sidebar = document.getElementById('sidebar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const themeToggle = document.getElementById('themeToggle');
const moduleContainer = document.getElementById('moduleContainer');
const pageTitle = document.getElementById('pageTitle');
const navItems = document.querySelectorAll('.nav-item');

// 1. Mobile Menu Toggle (மொபைலில் மெனுவை திறக்க/மூட)
mobileMenuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// 2. Dark Mode Toggle (டார்க் மோடு வசதி)
// ஏற்கனவே செலக்ட் செய்த தீம் உள்ளதா எனச் சரிபார்க்க
if(localStorage.getItem('rmp_theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
        localStorage.setItem('rmp_theme', 'dark'); // செட்டிங்கை சேவ் செய்ய
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('rmp_theme', 'light');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});

// 3. Dynamic Module Loader (ஒவ்வொரு மெனுவிற்கும் ஏற்ற பக்கத்தை லோட் செய்ய)
function loadModule(moduleName) {
    // Sidebar-ல் எந்த மெனு ஆக்டிவாக உள்ளது என மாற்றுதல்
    navItems.forEach(item => {
        item.classList.remove('active');
        if(item.getAttribute('onclick').includes(moduleName)) {
            item.classList.add('active');
        }
    });

    // மொபைலில் ஏதேனும் ஒரு மெனுவை க்ளிக் செய்தவுடன் Sidebar-ஐ மூடுதல்
    if(window.innerWidth <= 768) {
        sidebar.classList.remove('active');
    }

    // பக்கங்களுக்கான உள்ளடக்கம் (Module Content)
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
            break;
            
        case 'leads':
            pageTitle.innerText = "Lead Management (CRM)";
            content = `
                <div style="background: var(--card-bg); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3>Lead Tracking</h3>
                        <button style="background: var(--accent-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;"><i class="fas fa-plus"></i> Add New Lead</button>
                    </div>
                    <p style="color: var(--text-muted);">Lead Database structure is ready. UI implementation is in progress.</p>
                </div>`;
            break;
            
        case 'projects':
            pageTitle.innerText = "Project Management";
            content = `
                <div style="background: var(--card-bg); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color);">
                    <h3>Modular Kitchen & Interior Projects</h3>
                    <p style="color: var(--text-muted); margin-top: 10px;">Manage timelines, milestones, and site tracking here.</p>
                </div>`;
            break;
         case 'backup':
            pageTitle.innerText = "Data Backup & Restore";
            loadBackupModule();
            return; // இது முக்கியம்   
        default:
            // மற்ற அனைத்து மாட்யூல்களுக்கான பொதுவான தற்காலிகப் பக்கம்
            let formattedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
            pageTitle.innerText = formattedName + " Management";
            content = `
                <div style="padding: 25px; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--border-color); text-align: center;">
                    <i class="fas fa-tools" style="font-size: 3rem; color: var(--border-color); margin-bottom: 15px;"></i>
                    <h2 style="color: var(--text-main); margin-bottom: 10px;">${formattedName} Module</h2>
                    <p style="color: var(--text-muted);">This module is currently being built. Database architecture is already connected.</p>
                </div>`;
    }

    // HTML-ல் உள்ளிடுதல்
    moduleContainer.innerHTML = content;
    
    // Dashboard லோட் ஆகும் போது Database-ல் இருந்து டேட்டாவை எடுத்தல்
    if(moduleName === 'dashboard') {
        updateDashboardData();
    }
}

// Database-ல் இருந்து தகவல்களைப் பெறுவதற்கான Function
async function updateDashboardData() {
    try {
        // நாம் Step 1-ல் உருவாக்கிய 'db' (RMPDatabase) மூலமாக டேட்டாவை எடுத்தல்
        const leads = await db.getCollection('leads');
        const projects = await db.getCollection('projects');
        
        document.getElementById('dash-leads').innerText = leads.length;
        document.getElementById('dash-projects').innerText = projects.length;
        // வருமானம் மற்றும் செலவுகளை இங்கு கால்குலேட் செய்யலாம்
    } catch(err) {
        console.log("Error loading dashboard data:", err);
    }
}

// ஆப் திறக்கும் போது தானாகவே Dashboard-ஐ லோட் செய்ய
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
                <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">Download all your business data (Leads, Projects, Finances) securely to your computer.</p>
                <button onclick="exportDatabase()" style="background: var(--primary-color); color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: 500; transition: background 0.3s;">
                    <i class="fas fa-download"></i> Download Full Backup (JSON)
                </button>
            </div>

            <div style="background: var(--card-bg); padding: 25px; border-radius: 10px; border: 1px solid var(--border-color); text-align: center;">
                <i class="fas fa-cloud-upload-alt" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">Restore Database</h3>
                <p style="color: var(--text-muted); margin-bottom: 20px; font-size: 0.9rem;">Upload a previously saved JSON backup file to restore your system data.</p>
                <input type="file" id="restoreFileInput" accept=".json" style="display: none;" onchange="importDatabase(event)">
                <button onclick="document.getElementById('restoreFileInput').click()" style="background: var(--secondary-color); color: white; border: none; padding: 12px 25px; border-radius: 5px; cursor: pointer; width: 100%; font-weight: 500; transition: background 0.3s;">
                    <i class="fas fa-upload"></i> Select Backup File
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('moduleContainer').innerHTML = backupContent;
}

// 1. Export (Download Backup)
function exportDatabase() {
    try {
        const dbData = localStorage.getItem('RMP_ERP_SYSTEM_DB');
        if (!dbData) {
            alert("No data found to backup!");
            return;
        }

        const blob = new Blob([dbData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        
        // கோப்பிற்கான பெயர்: RMP_Backup_தேதி
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = \`RMP_ERP_Backup_\${date}.json\`;
        
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("Backup Downloaded Successfully! Please keep this file safe.");
    } catch (error) {
        console.error("Backup Failed:", error);
        alert("Error creating backup. Please try again.");
    }
}

// 2. Import (Restore Backup)
function importDatabase(event) {
    const file = event.target.files[0];
    if (!file) return;

    // உறுதி செய்தல்
    if (!confirm("WARNING: Restoring will overwrite all current data. Do you want to proceed?")) {
        event.target.value = ''; // Reset input
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            // சிறிய அளவிலான சரிபார்ப்பு (பழைய டேட்டாவா என்பதை உறுதி செய்ய)
            if (importedData && typeof importedData === 'object' && 'settings' in importedData) {
                localStorage.setItem('RMP_ERP_SYSTEM_DB', JSON.stringify(importedData));
                alert("Database Restored Successfully! The page will now reload.");
                window.location.reload(); // மாற்றங்கள் உடனடியாகத் தெரிய பக்கத்தை ரீலோட் செய்தல்
            } else {
                alert("Invalid Backup File! Please upload a valid RMP ERP backup JSON file.");
            }
        } catch (error) {
            console.error("Restore Failed:", error);
            alert("Error reading file. The file might be corrupted.");
        }
    };
    reader.readAsText(file);
}

// பழைய loadModule ஃபங்ஷனில் Backup பகுதியை இணைக்க வேண்டும்
// (app.js-ல் நீங்கள் ஏற்கனவே உள்ள loadModule ஃபங்ஷனைத் தேடி, அதில் switch(moduleName) பகுதிக்குள் இதைச் சேர்க்கவும்)
