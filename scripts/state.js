// state.js - Centralized State Management Engine
import { saveData } from './storage.js';

let state = {
    expenses: [],
    budgetLimit: 0,
    currencyRates: { USD: 0.0077, EUR: 0.0071 }, // Manual exchange rates relative to 1 Kshs
    currentCurrency: 'Kshs'                      // Active display currency
};

// 1. Core State Initializer
export function initState(loadedData) {
    state = { ...state, ...loadedData };
}

// 2. Data Getters
export function getExpenses() {
    return state.expenses;
}

export function getBudgetLimit() {
    return state.budgetLimit;
}

export function getCurrentCurrency() {
    return state.currentCurrency;
}

// 3. CURRENCY ACTIONS
// Updates which currency the app is currently displaying
export function setCurrency(currencyCode) {
    if (currencyCode === 'Kshs' || state.currencyRates[currencyCode]) {
        state.currentCurrency = currencyCode;
        saveData(state);
    }
}

// Updates the manual conversion rates in the settings configuration
export function updateExchangeRates(usdRate, eurRate) {
    if (usdRate > 0) state.currencyRates.USD = parseFloat(usdRate);
    if (eurRate > 0) state.currencyRates.EUR = parseFloat(eurRate);
    saveData(state);
}

// Converts any Kshs amount into the currently active display currency
export function convertAmount(amountInKshs) {
    if (state.currentCurrency === 'Kshs') return amountInKshs;
    const rate = state.currencyRates[state.currentCurrency] || 1;
    return amountInKshs * rate;
}

// 4. DATA MANIPULATION ACTIONS
// Adds a new expense item with unique IDs and rubric timestamps
export function addExpense(desc, cost, cat, date) {
    const numericCost = parseFloat(cost);
    if (isNaN(numericCost)) return;

    // Generate a unique incremental serial ID (e.g., rec_171829384)
    const uniqueId = `rec_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const newRecord = {
        id: uniqueId,
        desc: desc.trim(),
        cost: numericCost, // Internally always store everything in base currency (Kshs)
        cat: cat,
        date: date,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      state.expenses.push(newRecord);
      saveData(state);
}

// Deletes a specific item via its record ID
export function deleteExpense(idToDestroy) {
    state.expenses = state.expenses.filter(item => item.id !== idToDestroy);
    saveData(state);
}

// Updates an existing budget cap limit value
export function updateBudgetLimit(newLimit) {
    const parsedLimit = parseFloat(newLimit);
    state.budgetLimit = isNaN(parsedLimit) ? 0 : parsedLimit;
    saveData(state);
}

// Computes the raw sum total spent in baseline currency (Kshs)
export function calculateTotalSpent() {
    return state.expenses.reduce((sum, item) => sum + item.cost, 0);
}