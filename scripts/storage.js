// storage.js
// Handles saving and loading data from the browser's Local Storage

const STORAGE_KEY = 'nathan_finance_data';

// Fetches the saved data, or returns an empty array if nothing is saved yet
export function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
}

// Converts your expenses into a string and locks it in the browser
export function saveData(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}