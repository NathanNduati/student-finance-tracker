// ui.js - DOM Rendering Engine
import { calculateTotalSpent, getBudgetLimit, getCurrentCurrency, convertAmount, getExpenses } from './state.js';
import { highlightText } from './search.js';

function getSymbol(currencyCode) {
    if (currencyCode === 'USD') return '$';
    if (currencyCode === 'EUR') return '€';
    return 'Kshs ';
}

// Main Dashboard Redraw Orchestrator
export function updateDashboardSummary() {
    const totalSpentDisplay = document.getElementById('total-spent');
    const budgetDisplay = document.getElementById('budget-status');
    const topCatDisplay = document.getElementById('top-cat');
    
    const activeCurrency = getCurrentCurrency();
    const symbol = getSymbol(activeCurrency);
    const expenses = getExpenses();

    const currentTotal = convertAmount(calculateTotalSpent());
    const allowedBudget = convertAmount(getBudgetLimit());

    // 1. Render Total Spent Card
    if (totalSpentDisplay) {
        totalSpentDisplay.textContent = `${symbol}${currentTotal.toFixed(2)}`;
    }

    // 2. Dynamic Top Category Counter
    if (topCatDisplay) {
        if (expenses.length === 0) {
            topCatDisplay.textContent = "-";
        } else {
            const counts = {};
            expenses.forEach(item => { counts[item.cat] = (counts[item.cat] || 0) + 1; });
            const topCategory = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
            topCatDisplay.textContent = `${topCategory} (${counts[topCategory]}x)`;
        }
    }

    // 3. Render Budget Status
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

    // 4. Render 7-Day Spending Chart
    renderTrendChart(expenses, symbol);
}

// Draws a lightweight visual bar graph using stable local date formatting
function renderTrendChart(expenses, currencySymbol) {
    const chartContainer = document.getElementById('trend-bar-chart');
    if (!chartContainer) return;

    chartContainer.innerHTML = '';

    const spendingMap = {};
    const displayLabels = [];

    // Safely generate the past 7 days tracking targets
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        
        // Formats to YYYY-MM-DD reliably without ISO conversion timezone crashes
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        spendingMap[dateKey] = 0;
        displayLabels.push({
            key: dateKey,
            shortLabel: d.toLocaleDateString('en', { weekday: 'short' })
        });
    }

    // Tally up matching records
    expenses.forEach(item => {
        if (spendingMap[item.date] !== undefined) {
            spendingMap[item.date] += item.cost;
        }
    });

    const rawAmounts = Object.values(spendingMap);
    const maxSpend = Math.max(...rawAmounts, 1);

    // Build the visual chart pillars
    displayLabels.forEach(dayObj => {
        const dailyTotalKshs = spendingMap[dayObj.key];
        const convertedTotal = convertAmount(dailyTotalKshs);
        const heightPercentage = (dailyTotalKshs / maxSpend) * 100;

        const barColumn = document.createElement('div');
        barColumn.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            height: 100%;
            justify-content: flex-end;
        `;

        barColumn.innerHTML = `
            <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 4px;">
                ${dailyTotalKshs > 0 ? `${currencySymbol}${convertedTotal.toFixed(0)}` : ''}
            </span>
            <div style="
                width: 50%; 
                height: ${Math.max(heightPercentage, 4)}%; 
                background: ${dailyTotalKshs > 0 ? '#2563eb' : '#e2e8f0'}; 
                border-radius: 4px 4px 0 0;
                transition: height 0.3s ease;
            "></div>
            <span style="font-size: 0.8rem; color: #64748b; font-weight: 500; margin-top: 8px;">
                ${dayObj.shortLabel}
            </span>
        `;
        chartContainer.appendChild(barColumn);
    });
}

// Render dynamic rows inside your expense records view
export function renderExpensesTable(expenses, deleteAction, activeSearchRegex = null) {
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