// storage.js - Advanced Data & JSON File Engine

// 1. Core Browser Storage Accessors
export function saveData(data) {
    localStorage.setItem('nathan_finance_data', JSON.stringify(data));
}

export function loadData() {
    const rawData = localStorage.getItem('nathan_finance_data');
    if (!rawData) {
        return {
            expenses: [],
            budgetLimit: 0,
            currencyRates: { USD: 0.0077, EUR: 0.0071 }, // Default manual rates relative to Kshs
            currentCurrency: 'Kshs'
        };
    }
    try {
        return JSON.parse(rawData);
    } catch (e) {
        console.error("Corrupted storage format. Resetting cache.");
        return { expenses: [], budgetLimit: 0, currencyRates: { USD: 0.0077, EUR: 0.0071 }, currentCurrency: 'Kshs' };
    }
}

// 2. EXPORT DATA TO JSON FILE
// Generates a downloadable text file from the current state object
export function exportStateToJSON(stateObject) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateObject, null, 2));
    const downloadAnchor = document.createElement('a');
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `campus_finance_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    
    downloadAnchor.click();
    downloadAnchor.remove(); // Clean up DOM immediately
}

// 3. IMPORT & VALIDATE JSON STRUCTURE
// Reads raw text input from a file upload, parses it, and validates every single property key
export function validateAndImportJSON(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);

        // Rule A: Root object checks
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
        if (!('expenses' in parsed) || !Array.isArray(parsed.expenses)) return false;
        if (!('budgetLimit' in parsed) || typeof parsed.budgetLimit !== 'number') return false;

        // Rule B: Deep validation on every single expense object inside the array
        for (const item of parsed.expenses) {
            if (typeof item !== 'object' || item === null) return false;
            
            const requiredKeys = ['id', 'desc', 'cost', 'cat', 'date', 'createdAt', 'updatedAt'];
            const hasAllKeys = requiredKeys.every(key => key in item);
            if (!hasAllKeys) return false;

            // Type checks for data fields
            if (typeof item.id !== 'string' || !item.id.startsWith('rec_')) return false;
            if (typeof item.desc !== 'string' || typeof item.cat !== 'string') return false;
            if (typeof item.cost !== 'number' || isNaN(item.cost)) return false;
        }

        return parsed; // Validation passes completely! Return the structured state object.
    } catch (error) {
        return false; // Invalid JSON format syntax entirely
    }
}