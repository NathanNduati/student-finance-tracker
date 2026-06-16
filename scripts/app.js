// app.js - Main Application Workflow Manager
import { loadData, saveData, exportStateToJSON, validateAndImportJSON } from './storage.js';
import { initState, addExpense, deleteExpense, updateBudgetLimit, getExpenses, setCurrency, updateExchangeRates } from './state.js';
import { updateDashboardSummary, renderExpensesTable } from './ui.js';
import { validateExpenseForm } from './validators.js'; // <-- Importing your custom validators

document.addEventListener('DOMContentLoaded', () => {
    // 1. Fire up database memory state
    const savedRecords = loadData();
    initState(savedRecords);
    refreshScreen();

    // 2. Single Page Navigation Router Logic
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('main > section');

    if (navLinks.length > 0 && sections.length > 0) {
        // Force default view to dashboard tab on load
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

    // 3. Add Expense Submission Form (WITH REGEX VALIDATION)
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const descEl = document.getElementById('desc');
            const costEl = document.getElementById('cost');
            const catEl = document.getElementById('cat');
            const dateEl = document.getElementById('date-bought');

            // Clear old error messages from the UI first
            document.querySelectorAll('.error-msg').forEach(span => span.textContent = '');

            if (descEl && costEl && catEl && dateEl) {
                const descVal = descEl.value;
                const costVal = costEl.value;
                const catVal = catEl.value;
                const pickedDate = dateEl.value ? dateEl.value : new Date().toLocaleDateString();
                
                // Run inputs through your Regex Checker function
                const validation = validateExpenseForm(descVal, costVal, pickedDate, catVal);

                if (validation.isValid) {
                    // Validation passed! Save it to storage.
                    addExpense(descVal, costVal, catVal, pickedDate);
                    form.reset();
                    refreshScreen();
                } else {
                    // Validation failed! Show the specific errors under the inputs
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

    // --- Helper Refresh Macros ---
    function refreshScreen() {
        const outputContainer = document.getElementById('table-output');
        if (outputContainer) {
            renderExpensesTable(getExpenses(), handleTrashClick);
        }
        updateDashboardSummary();
    }

    function handleTrashClick(idToDestroy) {
        deleteExpense(idToDestroy);
        refreshScreen();
    }
});