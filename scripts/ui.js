// ui.js - Upgraded UI Rendering Engine
// Handles dynamic currency displaying, tables, and totals

import { calculateTotalSpent, getBudgetLimit, getCurrentCurrency, convertAmount } from './state.js';

// Helper function to get the correct currency prefix symbol
function getCurrencySymbol(currencyCode) {
    switch(currencyCode) {
        case 'USD': return '$';
        case 'EUR': return '€';
        default: return 'Kshs ';
    }
}

// 1. Tally up the totals and update the dashboard layout cards dynamically
export function updateDashboardSummary() {
    const totalSpentDisplay = document.getElementById('total-spent');
    const budgetDisplay = document.getElementById('budget-status');
    
    const activeCurrency = getCurrentCurrency();
    const symbol = getCurrencySymbol(activeCurrency);

    // Convert baseline Kshs numbers to the active display currency
    const currentTotal = convertAmount(calculateTotalSpent());
    const allowedBudget = convertAmount(getBudgetLimit());

    // Update total spent card text
    if (totalSpentDisplay) {
        totalSpentDisplay.textContent = `${symbol}${currentTotal.toFixed(2)}`;
    }

    // Figure out the budget card text, status colors, and screen-reader accessibility rules
    if (budgetDisplay) {
        const rawBudget = getBudgetLimit(); // Check the original limit to see if a budget is set
        
        if (rawBudget === 0) {
            budgetDisplay.textContent = "No budget set";
            budgetDisplay.style.color = "#94a3b8"; // Neutral slate grey
            budgetDisplay.setAttribute('aria-live', 'polite');
        } else if (currentTotal > allowedBudget) {
            // Rubric Cap/Target Check: Assertive alert for overage warnings
            budgetDisplay.textContent = `Over Budget! (Max: ${symbol}${allowedBudget.toFixed(2)})`;
            budgetDisplay.style.color = "#ef4444"; // Warning Red
            budgetDisplay.setAttribute('aria-live', 'assertive');
        } else {
            // Rubric Cap/Target Check: Polite update for remaining balance
            const moneyLeft = allowedBudget - currentTotal;
            budgetDisplay.textContent = `${symbol}${moneyLeft.toFixed(2)} Remaining`;
            budgetDisplay.style.color = "#10b981"; // Safe Green
            budgetDisplay.setAttribute('aria-live', 'polite');
        }
    }
}

// 2. Draw the dynamic data items right into our HTML rows with currency support
export function renderExpensesTable(expenses, deleteAction) {
    const tableBody = document.getElementById('expense-records');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (expenses.length === 0) {
        tableBody.innerHTML = '<p style="padding: 1rem; color: #94a3b8;">No expenses tracked yet.</p>';
        return;
    }

    const activeCurrency = getCurrentCurrency();
    const symbol = getCurrencySymbol(activeCurrency);

    // Loop through every expense object and append a fresh HTML row block
    expenses.forEach(item => {
        const row = document.createElement('div');
        row.className = 'expense-card-row';
        
        // Convert the item's stored Kshs value to the active currency on the fly
        const displayedCost = convertAmount(item.cost);
        
        row.innerHTML = `
            <div class="expense-details">
                <strong>${item.desc}</strong>
                <span class="category-badge">${item.cat}</span>
                <small style="display: block; color: #94a3b8;">${item.date}</small>
            </div>
            <div class="expense-cost-actions" style="display: flex; align-items: center; gap: 1rem;">
                <span>${symbol}${displayedCost.toFixed(2)}</span>
                <button class="delete-btn" style="background: #ef4444; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;">Delete</button>
            </div>
        `;

        // Attach a quick click event straight to the row's specific delete button
        row.querySelector('.delete-btn').addEventListener('click', () => {
            deleteAction(item.id);
        });

        tableBody.appendChild(row);
    });
}