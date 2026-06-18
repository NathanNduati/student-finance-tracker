// state.js - managing the local data array values and timestamps
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
    const currentISO = new Date().toISOString();
    const uniqueId = "rec_" + Math.floor(Math.random() * 100000).toString().padStart(4, '0');
    
    const newItem = {
        id: uniqueId,
        desc: desc,
        cost: parseFloat(cost) || 0,
        cat: cat,
        date: date,
        createdAt: currentISO,
        updatedAt: currentISO
    };
    expensesArray.push(newItem);
    saveToLocalStorageSync();
}

// Inline edit feature required by rubric section G
export function editExpense(id, newDesc, newCost, newCat, newDate) {
    for (let i = 0; i < expensesArray.length; i++) {
        if (expensesArray[i].id === id) {
            expensesArray[i].desc = newDesc;
            expensesArray[i].cost = parseFloat(newCost) || 0;
            expensesArray[i].cat = newCat;
            expensesArray[i].date = newDate;
            expensesArray[i].updatedAt = new Date().toISOString(); // refresh stamp
            break;
        }
    }
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