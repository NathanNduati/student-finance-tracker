// app.js - Single Page Application Controller
import { loadData } from './storage.js';
import { initState, addExpense, deleteExpense, updateBudgetLimit, getExpenses } from './state.js';
import { updateDashboardSummary, renderExpensesTable } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize State and Data
    const savedRecords = loadData();
    initState(savedRecords);
    refreshScreen();

    // 2. Defensive Navigation Router (Won't crash if sections are missing)
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main > section');

    if (navLinks.length > 0 && sections.length > 0) {
        // Show only the dashboard section right at the start
        sections.forEach(sec => {
            sec.style.display = (sec.id === 'dashboard') ? 'block' : 'none';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            });
        });
    }

    // 3. Defensive Expense Form Event Handler
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const descEl = document.getElementById('desc');
            const costEl = document.getElementById('cost');
            const catEl = document.getElementById('cat');

            if (descEl && costEl && catEl) {
                const today = new Date().toLocaleDateString();
                addExpense(descEl.value, costEl.value, catEl.value, today);
                form.reset();
                refreshScreen();
            }
        });
    }

    // 4. Defensive Budget Saver
    const budgetBtn = document.getElementById('btn-update-budget');
    const budgetInput = document.getElementById('budget-limit');
    if (budgetBtn && budgetInput) {
        budgetBtn.addEventListener('click', () => {
            updateBudgetLimit(budgetInput.value);
            refreshScreen();
        });
    }

    // --- Core Helper Triggers ---
    function refreshScreen() {
        // Only attempt rendering if container element exists safely in DOM
        if (document.getElementById('expense-records')) {
            renderExpensesTable(getExpenses(), handleTrashClick);
        }
        updateDashboardSummary();
    }

    function handleTrashClick(idToDestroy) {
        deleteExpense(idToDestroy);
        refreshScreen();
    }
});