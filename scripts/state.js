// state.js - The Brains of the Operation
// Written by Nathan Nduati (So I can finally track my campus cash)

import { saveData } from './storage.js';

// Global app state variables
let expensesList = [];
let maxMonthlyBudget = 0;

// Hydrate our state engine with whatever is saved in the locker
export function initState(savedExpenses) {
    expensesList = savedExpenses;
}

// Security layers so other files can peek at data without breaking it
export function getExpenses() {
    return expensesList;
}

export function getBudgetLimit() {
    return maxMonthlyBudget;
}

// --- APP ACTIONS ---

// Adds a new expense item to the active runtime list
export function addExpense(description, amount, category, date) {
    const uniqueId = 'item_' + Date.now(); // Keeps items separated perfectly
    
    const newRecord = {
        id: uniqueId,
        desc: description,
        cost: parseFloat(amount),
        cat: category,
        date: date
    };

    expensesList.push(newRecord);
    saveData(expensesList); // Syncing to local storage immediately
    return newRecord;
}

// Drops an item from the list by filtering it out
export function deleteExpense(id) {
    expensesList = expensesList.filter(item => item.id !== id);
    saveData(expensesList); // Sync the update
}

// Set our upper budget cap
export function updateBudgetLimit(amount) {
    maxMonthlyBudget = parseFloat(amount) || 0;
}

// --- MATH & ACCOUNTING ---

// Loops through the checklist to tally up the grand total
export function calculateTotalSpent() {
    let runningTotal = 0;
    
    for (let i = 0; i < expensesList.length; i++) {
        runningTotal += expensesList[i].cost;
    }
    
    return runningTotal;
}