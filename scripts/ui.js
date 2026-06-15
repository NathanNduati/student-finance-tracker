// ui.js - The Display Team
// Written by Nathan Nduati - Handles drawing data onto the HTML page

import { calculateTotalSpent, getBudgetLimit } from './state.js';

// Tally up the totals and update the dashboard layout cards
export function updateDashboardSummary() {
    const totalSpentDisplay = document.getElementById('total-spent');
    const budgetDisplay = document.getElementById('budget-status');
    
    const currentTotal = calculateTotalSpent();
    const allowedBudget = getBudgetLimit();

    // 1. Update the total spent card text
    if (totalSpentDisplay) {
        totalSpentDisplay.textContent = `Kshs ${currentTotal.toFixed(2)}`;
    }

    // 2. Figure out the budget card text and status color
    if (budgetDisplay) {
        if (allowedBudget === 0) {
            budgetDisplay.textContent = "No budget set";
            budgetDisplay.style.color = "#94a3b8"; // Neutral slate grey
        } else if (currentTotal > allowedBudget) {
            budgetDisplay.textContent = `Over Budget! (Max: Kshs ${allowedBudget})`;
            budgetDisplay.style.color = "#ef4444"; // Warning Red
        } else {
            const moneyLeft = allowedBudget - currentTotal;
            budgetDisplay.textContent = `Kshs ${moneyLeft.toFixed(2)} Remaining`;
            budgetDisplay.style.color = "#10b981"; // Safe Green
        }
    }
}

// Draw the dynamic table items right into our HTML dashboard row container
export function renderExpensesTable(expenses, deleteAction) {
    const tableBody = document.getElementById('expense-records');
    
    if (!tableBody) return;
    
    // Clear out the previous text so items don't stack up infinitely on refresh
    tableBody.innerHTML = '';

    // If there is nothing in the array, show a friendly empty message
    if (expenses.length === 0) {
        tableBody.innerHTML = '<p style="padding: 1rem; color: #94a3b8;">No expenses tracked yet.</p>';
        return;
    }

    // Loop through every expense object and append a fresh HTML row block
    expenses.forEach(item => {
        const row = document.createElement('div');
        row.className = 'expense-card-row';
        
        row.innerHTML = `
            <div class="expense-details">
                <strong>${item.desc}</strong>
                <span class="category-badge">${item.cat}</span>
                <small style="display: block; color: #94a3b8;">${item.date}</small>
            </div>
            <div class="expense-cost-actions" style="display: flex; align-items: center; gap: 1rem;">
                <span>Kshs ${item.cost.toFixed(2)}</span>
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