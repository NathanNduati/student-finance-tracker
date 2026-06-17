// state.js - managing the local data array values
let expensesArray = [];
let monthlyBudgetLimit = 0;
let activeCurrency = 'Kshs';

let rates = {
    USD: 0.0077,
    EUR: 0.0071
};

export function initState(loadedRecords) {
    if (loadedRecords && Array.isArray(loadedRecords.expenses)) {
        expensesArray = loadedRecords.expenses;
    } else {
        expensesArray = [];
    }
    
    if (loadedRecords && loadedRecords.budget) {
        monthlyBudgetLimit = parseFloat(loadedRecords.budget) || 0;
    } else {
        monthlyBudgetLimit = 0;
    }
}

export function getExpenses() {
    return expensesArray;
}

export function addExpense(desc, cost, cat, date) {
    const newItem = {
        id: Date.now(),
        desc: desc,
        cost: parseFloat(cost) || 0,
        cat: cat,
        date: date
    };
    expensesArray.push(newItem);
    saveToLocalStorageSync();
}

export function deleteExpense(id) {
    expensesArray = expensesArray.filter(x => x.id !== id);
    saveToLocalStorageSync();
}

export function updateBudgetLimit(amt) {
    monthlyBudgetLimit = parseFloat(amt) || 0;
    saveToLocalStorageSync();
}

export function getBudgetLimit() {
    return monthlyBudgetLimit;
}

export function calculateTotalSpent() {
    let sum = 0;
    for(let i = 0; i < expensesArray.length; i++) {
        sum += expensesArray[i].cost;
    }
    return sum;
}

export function setCurrency(code) {
    activeCurrency = code;
}

export function getCurrentCurrency() {
    return activeCurrency;
}

export function updateExchangeRates(usdRate, eurRate) {
    rates.USD = parseFloat(usdRate) || 0.0077;
    rates.EUR = parseFloat(eurRate) || 0.0071;
}

export function convertAmount(amtInKshs) {
    if (activeCurrency === 'USD') return amtInKshs * rates.USD;
    if (activeCurrency === 'EUR') return amtInKshs * rates.EUR;
    return amtInKshs;
}

function saveToLocalStorageSync() {
    const completeSnapshot = {
        expenses: expensesArray,
        budget: monthlyBudgetLimit
    };
    localStorage.setItem('campus_finance_records', JSON.stringify(completeSnapshot));
}