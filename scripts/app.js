// app.js - main controller for coordinating events and view routes
import { loadData, saveData, exportStateToJSON, validateAndImportJSON } from './storage.js';
import { initState, addExpense, deleteExpense, updateBudgetLimit, getExpenses, setCurrency, updateExchangeRates } from './state.js';
import { updateDashboardSummary, renderExpensesTable } from './ui.js';
import { validateExpenseForm } from './validators.js';
import { compileSearchRegex, sortRecords } from './search.js';

document.addEventListener('DOMContentLoaded', () => {
    // track state for search text and active sort columns
    let activeSort = 'date';
    let ascOrder = false; 
    let queryText = '';

    // load layout data from storage
    const initialRecords = loadData();
    initState(initialRecords);
    refreshScreen();

    // HANDMADE TAB ROUTER
    const links = document.querySelectorAll('nav ul li a');
    const tabs = document.querySelectorAll('main > section');

    if (links.length > 0 && tabs.length > 0) {
        tabs.forEach(t => {
            t.style.display = (t.id === 'dashboard') ? 'block' : 'none';
        });

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);

                // manual standard for loop to toggle display strings
                for (let i = 0; i < tabs.length; i++) {
                    if (tabs[i].id === target) {
                        tabs[i].style.display = 'block';
                    } else {
                        tabs[i].style.display = 'none';
                    }
                }
            });
        });
    }

    // NEW TRANSACTION SUBMIT HANDLER
    const expenseForm = document.getElementById('expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const itemDesc = document.getElementById('desc').value;
            const itemCost = document.getElementById('cost').value;
            const itemCat = document.getElementById('cat').value;
            const itemDate = document.getElementById('date-bought').value;

            // reset validation errors spans
            document.getElementById('desc-error').textContent = '';
            document.getElementById('cost-error').textContent = '';
            document.getElementById('date-error').textContent = '';

            const check = validateExpenseForm(itemDesc, itemCost, itemDate, itemCat);

            if (check.isValid === true) {
                addExpense(itemDesc, itemCost, itemCat, itemDate);
                expenseForm.reset();
                refreshScreen();
            } else {
                if (check.errors.desc) document.getElementById('desc-error').textContent = check.errors.desc;
                if (check.errors.cost) document.getElementById('cost-error').textContent = check.errors.cost;
                if (check.errors.date) document.getElementById('date-error').textContent = check.errors.date;
            }
        });
    }

    // UPDATE BUDGET LIMIT 
    const saveBudgetBtn = document.getElementById('btn-update-budget');
    if (saveBudgetBtn) {
        saveBudgetBtn.addEventListener('click', () => {
            const limitInput = document.getElementById('budget-limit').value;
            updateBudgetLimit(limitInput);
            refreshScreen();
        });
    }

    // UPDATE EXCHANGES AND TARGET CURRENCY
    const ratesBtn = document.getElementById('btn-save-rates');
    if (ratesBtn) {
        ratesBtn.addEventListener('click', () => {
            const selectBox = document.getElementById('currency-select').value;
            const usdVal = document.getElementById('rate-usd').value;
            const eurVal = document.getElementById('rate-eur').value;

            updateExchangeRates(usdVal, eurVal);
            setCurrency(selectBox);
            refreshScreen();
        });
    }

    // DOWNLOAD STATE SNAPSHOT
    const exportDataBtn = document.getElementById('btn-export');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const backup = loadData();
            exportStateToJSON(backup);
        });
    }

    // UPLOAD DATA FILE SNAPSHOT
    const importDataInput = document.getElementById('file-import');
    if (importDataInput) {
        importDataInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const parsed = validateAndImportJSON(text);

                if (parsed) {
                    saveData(parsed);
                    initState(parsed);
                    refreshScreen();
                    alert("Data backup imported successfully!");
                } else {
                    alert("Error: Bad file backup data structure layout.");
                }
            };
            reader.readAsText(file);
        });
    }

    // LISTEN TO TYPING EVENTS IN SEARCH BOX
    const inputSearch = document.getElementById('search-box');
    if (inputSearch) {
        inputSearch.addEventListener('input', (e) => {
            queryText = e.target.value;
            refreshScreen();
        });
    }

    // SORT BUTTON CLICK TRIGGERS
    const actionSortBtns = document.querySelectorAll('.sort-buttons button');
    actionSortBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const col = btn.getAttribute('data-sort');
            if (activeSort === col) {
                ascOrder = !ascOrder;
            } else {
                activeSort = col;
                ascOrder = true;
            }
            refreshScreen();
        });
    });

    // operational refresh utility macro
    function refreshScreen() {
        let rows = getExpenses();

        const regexCompiler = compileSearchRegex(queryText);
        if (regexCompiler) {
            rows = rows.filter(x => regexCompiler.test(x.desc) || regexCompiler.test(x.cat));
        }

        const sorted = sortRecords(rows, activeSort, ascOrder);
        renderExpensesTable(sorted, runDeleteAction, regexCompiler);
        updateDashboardSummary();
    }

    function runDeleteAction(id) {
        deleteExpense(id);
        refreshScreen();
    }
});