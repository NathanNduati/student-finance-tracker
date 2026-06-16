// validators.js - Form Input Regex Validation Engine

export const regexRules = {
    // 1. Description: No leading/trailing spaces, collapses double spaces
    desc: /^\S(?:.*\S)?$/,
    
    // 2. Amount: Positive integers or decimals up to 2 decimal places
    amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    
    // 3. Date: Strict YYYY-MM-DD format
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    
    // 4. Category: Only letters, spaces, and hyphens allowed
    category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    
    // Advanced Rule: Back-reference to catch accidental duplicate words (e.g., "Food Food")
    duplicateWord: /\b(\w+)\s+\1\b/
};

// Validates a single expense input batch before letting it pass to state
export function validateExpenseForm(desc, cost, date, cat) {
    const errors = {};

    if (!regexRules.desc.test(desc)) {
        errors.desc = "Description cannot have leading/trailing blank spaces.";
    } else if (regexRules.duplicateWord.test(desc)) {
        errors.desc = "Typo detected: You repeated the same word twice.";
    }

    if (!regexRules.amount.test(cost) || parseFloat(cost) <= 0) {
        errors.cost = "Enter a valid positive number (max 2 decimal places).";
    }

    if (!regexRules.date.test(date)) {
        errors.date = "Please select a valid date matching YYYY-MM-DD.";
    }

    if (!regexRules.category.test(cat)) {
        errors.cat = "Category can only contain letters, spaces, or hyphens.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}