// app.js - Main Application Workflow Manager
import { loadData, saveData, exportStateToJSON, validateAndImportJSON } from './storage.js';
import { initState, addExpense, deleteExpense, updateBudgetLimit, getExpenses, setCurrency, updateExchangeRates } from './state.js';
import { updateDashboardSummary, renderExpensesTable } from './ui.js';
import { validateExpenseForm } from './validators.js';
import { compileSearchRegex, sortRecords } from './search.js'; // <-- Import sorting/search utilities

document.addEventListener('DOMContentLoaded', () => {
    // Search and Sort tracking state variables
    let currentSortColumn = 'date';
    let isSortAscending = false; // Default to newest dates first
    let activeSearchQuery = '';

    // 1. Fire up database memory state
    const savedRecords = loadData();
    initState(savedRecords);
    refreshScreen();

    // 2. Single Page Navigation Router Logic
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main > section');

    if (navLinks.length > 0 && sections.length > 0) {
        sections.forEach(sec => {
            sec.style.display = (sec.id === 'dashboard') ? 'block' : 'none';
        });

        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);

                sections.forEach(section => {
                    section.style.display = (section.id === targetId) ? 'block' : 'none';
                });
            });
        });
    }

    // 3. Add Expense Submission Form
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const descEl = document.getElementById('desc');
            const costEl = document.getElementById('cost');
            const catEl = document.getElementById('cat');
            const dateEl = document.getElementById('date-bought');

            document.querySelectorAll('.error-msg').forEach(span => span.textContent = '');

            if (descEl && costEl && catEl && dateEl) {
                const descVal = descEl.value;
                const costVal = costEl.value;
                const catVal = catEl.value;
                const pickedDate = dateEl.value ? dateEl.value : new Date().toLocaleDateString();
                
                const validation = validateExpenseForm(descVal, costVal, pickedDate, catVal);

                if (validation.isValid) {
                    addExpense(descVal, costVal, catVal, pickedDate);
                    form.reset();
                    refreshScreen();
                } else {
                    if (validation.errors.desc) document.getElementById('desc-error').textContent = validation.errors.desc;
                    if (validation.errors.cost) document.getElementById('cost-error').textContent = validation.errors.cost;
                    if (validation.errors.date) document.getElementById('date-error').textContent = validation.errors.date;
                }
            }
        });
    }

    // 4. Save General Budget Overage Cap Limit
    const budgetBtn = document.getElementById('btn-update-budget');
    const budgetInput = document.getElementById('budget-limit');
    if (budgetBtn && budgetInput) {
        budgetBtn.addEventListener('click', () => {
            updateBudgetLimit(budgetInput.value);
            refreshScreen();
        });
    }

    // 5. Save Currency Selection and Manual Exchange Configurations
    const saveCurrencyBtn = document.getElementById('btn-save-rates');
    if (saveCurrencyBtn) {
        saveCurrencyBtn.addEventListener('click', () => {
            const chosenCurrency = document.getElementById('currency-select').value;
            const currentUsdRate = document.getElementById('rate-usd').value;
            const currentEurRate = document.getElementById('rate-eur').value;

            updateExchangeRates(currentUsdRate, currentEurRate);
            setCurrency(chosenCurrency);
            refreshScreen();
        });
    }

    // 6. Data Backup Import & Export Handlers
    const exportBtn = document.getElementById('btn-export');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const currentData = loadData();
            exportStateToJSON(currentData);
        });
    }

    const importInput = document.getElementById('file-import');
    if (importInput) {
        importInput.addEventListener('change', (event) => {
            const uploadedFile = event.target.files[0];
            if (!uploadedFile) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const rawText = e.target.result;
                const validatedData = validateAndImportJSON(rawText);

                if (validatedData) {
                    saveData(validatedData);
                    initState(validatedData);
                    refreshScreen();
                    alert("Data backup imported successfully!");
                } else {
                    alert("Error: Invalid or corrupted JSON backup file structure.");
                }
            };
            reader.readAsText(uploadedFile);
        });
    }

    // 7. Live Search Input Typing Listener
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        searchBox.addEventListener('input', (e) => {
            activeSearchQuery = e.target.value;
            refreshScreen();
        });
    }

    // 8. Sorting Header Click Listeners
    const sortButtons = document.querySelectorAll('.sort-buttons button');
    sortButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSortColumn = button.getAttribute('data-sort');
            
            if (currentSortColumn === targetSortColumn) {
                // Toggle sorting direction if clicking the same column again
                isSortAscending = !isSortAscending;
            } else {
                currentSortColumn = targetSortColumn;
                isSortAscending = true;
            }
            refreshScreen();
        });
    });

    // --- Helper Refresh Macros ---
    function refreshScreen() {
        let records = getExpenses();

        // Safe evaluation of regex pattern strings
        const searchRegex = compileSearchRegex(activeSearchQuery);
        if (searchRegex) {
            records = records.filter(item => 
                searchRegex.test(item.desc) || searchRegex.test(item.cat)
            );
        }

        // Apply sorting criteria
        const sortedRecords = sortRecords(records, currentSortColumn, isSortAscending);

        // Render sorted and highlighted records to view window
        renderExpensesTable(sortedRecords, handleTrashClick, searchRegex);
        updateDashboardSummary();
    }

    function handleTrashClick(idToDestroy) {
        deleteExpense(idToDestroy);
        refreshScreen();
    }
});