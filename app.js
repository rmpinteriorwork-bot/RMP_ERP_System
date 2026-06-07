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
