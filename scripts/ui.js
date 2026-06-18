// ui.js - handle DOM updates, chart bars, and table drawing with inline editing
import { calculateTotalSpent, getBudgetLimit, getCurrentCurrency, convertAmount, getExpenses, editExpense } from './state.js';
import { highlightText } from './search.js';

function getSymbol(currency) {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return 'Kshs ';
}

export function updateDashboardSummary() {
    const spentText = document.getElementById('total-spent');
    const budgetText = document.getElementById('budget-status');
    const topCatText = document.getElementById('top-cat');
    
    const curr = getCurrentCurrency();
    const sym = getSymbol(curr);
    const list = getExpenses();

    const totalConverted = convertAmount(calculateTotalSpent());
    const budgetConverted = convertAmount(getBudgetLimit());

    if (spentText) {
        spentText.textContent = `${sym}${totalConverted.toFixed(2)}`;
    }

    if (topCatText) {
        if (!list || list.length === 0) {
            topCatText.textContent = "-";
        } else {
            const counts = {};
            list.forEach(item => { counts[item.cat] = (counts[item.cat] || 0) + 1; });
            const top = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            topCatText.textContent = `${top} (${counts[top]}x)`;
        }
    }

    if (budgetText) {
        const rawLimit = getBudgetLimit();
        if (rawLimit === 0) {
            budgetText.textContent = "No budget set";
            budgetText.style.color = "#94a3b8";
            budgetText.setAttribute('aria-live', 'polite');
        } else if (totalConverted > budgetConverted) {
            budgetText.textContent = `Over Budget! (Max: ${sym}${budgetConverted.toFixed(2)})`;
            budgetText.style.color = "#ef4444";
            budgetText.setAttribute('aria-live', 'assertive');
        } else {
            const remaining = budgetConverted - totalConverted;
            budgetText.textContent = `${sym}${remaining.toFixed(2)} Remaining`;
            budgetText.style.color = "#10b981";
            budgetText.setAttribute('aria-live', 'polite');
        }
    }

    renderTrendChart(list, sym);
}

function renderTrendChart(list, sym) {
    const chartBox = document.getElementById('trend-bar-chart');
    if (!chartBox) return;

    chartBox.innerHTML = '';
    const tracking = {};
    const labels = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayKey = String(d.getDate()).padStart(2, '0');
        const formattedKey = `${y}-${m}-${dayKey}`;

        tracking[formattedKey] = 0;
        labels.push({ dateKey: formattedKey, dayName: d.toLocaleDateString('en', { weekday: 'short' }) });
    }

    if (list && list.length > 0) {
        list.forEach(item => {
            if (tracking[item.date] !== undefined) {
                tracking[item.date] += item.cost;
            }
        });
    }

    const values = Object.values(tracking);
    const highestPoint = Math.max(...values, 1);

    labels.forEach(day => {
        const amountSpent = tracking[day.dateKey];
        const dispAmount = convertAmount(amountSpent);
        const maxBarHeightPixels = 80; 
        const barHeight = (amountSpent / highestPoint) * maxBarHeightPixels;

        const col = document.createElement('div');
        col.style.cssText = `display: flex; flex-direction: column; align-items: center; justify-content: flex-end; flex: 1; height: 140px; min-width: 35px;`;
        col.innerHTML = `
            <span style="font-size: 0.7rem; color: #64748b; margin-bottom: 4px; font-weight: 600; min-height: 14px; display: block; text-align: center;">
                ${amountSpent > 0 ? `${sym}${dispAmount.toFixed(0)}` : ''}
            </span>
            <div style="width: 20px; height: ${Math.max(barHeight, 6)}px; background: ${amountSpent > 0 ? '#2563eb' : '#cbd5e1'}; border-radius: 3px 3px 0 0; transition: height 0.2s ease;"></div>
            <span style="font-size: 0.75rem; color: #64748b; margin-top: 8px; font-weight: 600;">${day.dayName}</span>
        `;
        chartBox.appendChild(col);
    });
}

export function renderExpensesTable(list, refreshCallback) {
    const displayTarget = document.getElementById('table-output');
    if (!displayTarget) return;
    
    displayTarget.innerHTML = '';

    if (!list || list.length === 0) {
        displayTarget.innerHTML = '<p style="padding: 1.25rem; color: #94a3b8; text-align: center;">No expenses recorded.</p>';
        return;
    }

    const currentCurrency = getCurrentCurrency();
    const sym = getSymbol(currentCurrency);

    list.forEach(item => {
        const rowWrap = document.createElement('div');
        rowWrap.className = 'expense-card-row';
        rowWrap.style.cssText = "padding: 1rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;";
        
        const finalCost = convertAmount(item.cost);
        
        rowWrap.innerHTML = `
            <div class="expense-details">
                <strong class="item-title">${item.desc}</strong>
                <span class="category-badge" style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; margin-left: 0.5rem;">${item.cat}</span>
                <small style="display: block; color: #94a3b8; margin-top: 4px;">Date: ${item.date} | ID: ${item.id}</small>
            </div>
            <div class="expense-cost-actions" style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 600; margin-right: 0.5rem;">${sym}${finalCost.toFixed(2)}</span>
                <button class="edit-btn" style="background: #3b82f6; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: 0.8rem;">Edit</button>
                <button class="delete-btn" style="background: #ef4444; color: white; border: none; padding: 4px 8px; cursor: pointer; border-radius: 4px; font-size: 0.8rem;">Delete</button>
            </div>
        `;

        // Prompt window inline-edit mechanism to keep UI logic plain and student-like
        rowWrap.querySelector('.edit-btn').addEventListener('click', () => {
            const newDesc = prompt("Edit Description:", item.desc);
            if (newDesc === null) return;
            const newCost = prompt("Edit Cost Amount (Base Kshs):", item.cost);
            if (newCost === null) return;
            const newCat = prompt("Edit Category (Food, Books, Transport, Entertainment, Fees, Other):", item.cat);
            if (newCat === null) return;
            const newDate = prompt("Edit Date (YYYY-MM-DD):", item.date);
            if (newDate === null) return;

            editExpense(item.id, newDesc, newCost, newCat, newDate);
            refreshCallback();
        });

        rowWrap.querySelector('.delete-btn').addEventListener('click', () => {
            if (confirm("Remove this expense record?")) {
                // look globally for core delete handler assigned via app logic window context or parameters
                document.dispatchEvent(new CustomEvent('delete-record', { detail: item.id }));
            }
        });

        displayTarget.appendChild(rowWrap);
    });
}