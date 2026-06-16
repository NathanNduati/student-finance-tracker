// search.js - Live Regex Search & Table Sorting Engine

// Safely compiles a user search string into a Regular Expression
export function compileSearchRegex(patternString) {
    if (!patternString.trim()) return null;
    try {
        // Compiles case-insensitive ('i') so "coffee" matches "Coffee"
        return new RegExp(patternString, 'i');
    } catch (error) {
        // If the user types an incomplete regex pattern (like a lone \), catch it so it doesn't crash the app
        return null;
    }
}

// Wraps matched text in <mark> tags without destroying HTML structure
export function highlightText(text, regex) {
    if (!regex || !text) return text;
    // Replaces the matched portion with a marked version of itself
    return text.replace(regex, (match) => `<mark>${match}</mark>`);
}

// Sorts an array of expense records based on the column and order chosen
export function sortRecords(records, sortBy, isAscending = true) {
    return [...records].sort((a, b) => {
        let valA, valB;

        if (sortBy === 'date') {
            valA = new Date(a.date);
            valB = new Date(b.date);
        } else if (sortBy === 'amount') {
            valA = a.cost;
            valB = b.cost;
        } else {
            // Default to sorting alphabetically by description
            valA = a.desc.toLowerCase();
            valB = b.desc.toLowerCase();
        }

        if (valA < valB) return isAscending ? -1 : 1;
        if (valA > valB) return isAscending ? 1 : -1;
        return 0;
    });
}