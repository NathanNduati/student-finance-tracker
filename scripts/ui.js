// ui.js - DOM Rendering Engine
import { calculateTotalSpent, getBudgetLimit, getCurrentCurrency, convertAmount } from './state.js';
import { highlightText } from './search.js'; // <-- Import the highlighter function

function getSymbol(currencyCode) {
    if (currencyCode === 'USD') return '$';
    if (currencyCode === 'EUR') return '€';
    return 'Kshs ';
}

export function updateDashboardSummary() {
    const totalSpentDisplay = document.getElementById('total-spent');
    const budgetDisplay = document.getElementById('budget-status');
    
    const activeCurrency = getCurrentCurrency();
    const symbol = getSymbol(activeCurrency);

    const currentTotal = convertAmount(calculateTotalSpent());
    const allowedBudget = convertAmount(getBudgetLimit());

    if (totalSpentDisplay) {
        totalSpentDisplay.textContent = `${symbol}${currentTotal.toFixed(2)}`;
    }

    if (budgetDisplay) {
        const rawBudget = getBudgetLimit();
        
        if (rawBudget === 0) {
            budgetDisplay.textContent = "No budget set";
            budgetDisplay.style.color = "#94a3b8";
            budgetDisplay.setAttribute('aria-live', 'polite');
        } else if (currentTotal > allowedBudget) {
            budgetDisplay.textContent = `Over Budget! (Max: ${symbol}${allowedBudget.toFixed(2)})`;
            budgetDisplay.style.color = "#ef4444";
            budgetDisplay.setAttribute('aria-live', 'assertive');
        } else {
            const moneyLeft = allowedBudget - currentTotal;
            budgetDisplay.textContent = `${symbol}${moneyLeft.toFixed(2)} Remaining`;
            budgetDisplay.style.color = "#10b981";
            budgetDisplay.setAttribute('aria-live', 'polite');
        }
    }
}

// Render dynamic rows inside your expense records view (with optional search regex)
export function renderExpensesTable(expenses, deleteAction, activeSearchRegex = null) {
    // Targets the exact 'table-output' element from your index.html
    const tableBody = document.getElementById('table-output');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (expenses.length === 0) {
        tableBody.innerHTML = '<p style="padding: 1rem; color: #94a3b8;">No records match your view.</p>';
        return;
    }

    const activeCurrency = getCurrentCurrency();
    const symbol = getSymbol(activeCurrency);

    expenses.forEach(item => {
        const row = document.createElement('div');
        row.className = 'expense-card-row';
        
        const displayedCost = convertAmount(item.cost);
        
        // Highlight matched text in the description or category if a search is active
        const cleanDesc = highlightText(item.desc, activeSearchRegex);
        const cleanCat = highlightText(item.cat, activeSearchRegex);
        
        row.innerHTML = `
            <div class="expense-details" style="padding: 0.75rem 0;">
                <strong>${cleanDesc}</strong>
                <span class="category-badge" style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; margin-left: 0.5rem;">${cleanCat}</span>
                <small style="display: block; color: #94a3b8; margin-top: 4px;">${item.date}</small>
            </div>
            <div class="expense-cost-actions" style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-weight: 600;">${symbol}${displayedCost.toFixed(2)}</span>
                <button class="delete-btn" style="background: #ef4444; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px;">Delete</button>
            </div>
        `;

        row.querySelector('.delete-btn').addEventListener('click', () => {
            if(confirm("Are you sure you want to delete this record?")) {
                deleteAction(item.id);
            }
        });

        tableBody.appendChild(row);
    });
}