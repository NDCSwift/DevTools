// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    MAX_MATCHES_DISPLAY: 100,
    MAX_HISTORY_ITEMS: 10,
    HISTORY_STORAGE_KEY: 'regexHistory',
    DEBOUNCE_DELAY: 200
};

let state = {
    pattern: '',
    flags: '',
    testString: '',
    matches: [],
    replaceString: '',
    replaceEnabled: false,
    history: [],
    debounceTimer: null
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    regexPattern: document.getElementById('regexPattern'),
    regexFlags: document.getElementById('regexFlags'),
    testString: document.getElementById('testString'),
    highlightedOutput: document.getElementById('highlightedOutput'),
    matchesList: document.getElementById('matchesList'),
    statusBar: document.getElementById('statusBar'),
    statusText: document.getElementById('statusText'),
    matchCount: document.getElementById('matchCount'),

    // Flag checkboxes
    flagG: document.getElementById('flagG'),
    flagI: document.getElementById('flagI'),
    flagM: document.getElementById('flagM'),
    flagS: document.getElementById('flagS'),
    flagU: document.getElementById('flagU'),

    // Buttons
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    clearTestBtn: document.getElementById('clearTestBtn'),
    copyMatchesBtn: document.getElementById('copyMatchesBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),
    exportCsvBtn: document.getElementById('exportCsvBtn'),
    toggleLibrary: document.getElementById('toggleLibrary'),
    libraryContent: document.getElementById('libraryContent'),

    // Replace/Substitution
    enableReplace: document.getElementById('enableReplace'),
    replaceControls: document.getElementById('replaceControls'),
    replaceString: document.getElementById('replaceString'),
    replaceOutput: document.getElementById('replaceOutput'),
    copyReplaceBtn: document.getElementById('copyReplaceBtn'),

    // Pattern History
    toggleHistory: document.getElementById('toggleHistory'),
    historyContent: document.getElementById('historyContent'),
    historyList: document.getElementById('historyList'),

    // Explanation
    explanationContent: document.getElementById('explanationContent'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadHistory();
    attachEventListeners();
    console.log('🚀 DevToolkit RegEx Tester initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Real-time testing with debounce
    elements.regexPattern.addEventListener('input', debouncedTestRegex);
    elements.regexFlags.addEventListener('input', handleFlagsInput);
    elements.testString.addEventListener('input', debouncedTestRegex);

    // Flag checkboxes
    elements.flagG.addEventListener('change', handleFlagCheckbox);
    elements.flagI.addEventListener('change', handleFlagCheckbox);
    elements.flagM.addEventListener('change', handleFlagCheckbox);
    elements.flagS.addEventListener('change', handleFlagCheckbox);
    elements.flagU.addEventListener('change', handleFlagCheckbox);

    // Buttons
    elements.loadSampleBtn.addEventListener('click', loadSample);
    elements.clearTestBtn.addEventListener('click', clearTest);
    elements.copyMatchesBtn.addEventListener('click', copyMatches);
    elements.exportJsonBtn.addEventListener('click', () => exportMatches('json'));
    elements.exportCsvBtn.addEventListener('click', () => exportMatches('csv'));
    elements.toggleLibrary.addEventListener('click', toggleLibrary);

    // Replace/Substitution
    elements.enableReplace.addEventListener('change', toggleReplaceMode);
    elements.replaceString.addEventListener('input', performReplace);
    elements.copyReplaceBtn.addEventListener('click', copyReplaceResult);

    // History
    elements.toggleHistory.addEventListener('click', toggleHistory);

    // Library items
    document.querySelectorAll('.library-item').forEach(item => {
        item.addEventListener('click', loadPattern);
    });
}

// ========================================
// CORE REGEX TESTING
// ========================================

/**
 * Debounced version of testRegex for better performance
 */
function debouncedTestRegex() {
    clearTimeout(state.debounceTimer);
    state.debounceTimer = setTimeout(testRegex, CONFIG.DEBOUNCE_DELAY);
}

/**
 * Test the regex pattern against the test string
 */
function testRegex() {
    const pattern = elements.regexPattern.value;
    const flags = elements.regexFlags.value;
    const testString = elements.testString.value;

    // Update state
    state.pattern = pattern;
    state.flags = flags;
    state.testString = testString;

    // Clear if no pattern or test string
    if (!pattern || !testString) {
        clearResults();
        showStatus('Enter a pattern and test string to begin', 'ready');
        return;
    }

    try {
        // Create regex
        const regex = new RegExp(pattern, flags);

        // Find all matches
        const matches = [];
        let match;

        if (flags.includes('g')) {
            // Global flag: find all matches
            while ((match = regex.exec(testString)) !== null) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {},
                    fullMatch: match
                });

                // Prevent infinite loop on zero-length matches
                if (match.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                // Safety limit
                if (matches.length >= CONFIG.MAX_MATCHES_DISPLAY) {
                    break;
                }
            }
        } else {
            // No global flag: find first match only
            match = regex.exec(testString);
            if (match) {
                matches.push({
                    text: match[0],
                    index: match.index,
                    groups: match.slice(1),
                    namedGroups: match.groups || {},
                    fullMatch: match
                });
            }
        }

        // Update state
        state.matches = matches;

        // Display results
        displayHighlightedText(testString, matches);
        displayMatchDetails(matches);
        explainPattern(pattern, flags);

        // Update status
        if (matches.length > 0) {
            showStatus(`✓ Pattern is valid`, 'success');
            elements.matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;

            // Save to history (only when there are matches)
            saveToHistory(pattern, flags);
        } else {
            showStatus('Pattern is valid but no matches found', 'ready');
            elements.matchCount.textContent = '0 matches';
        }

        // Perform replace if enabled
        if (state.replaceEnabled) {
            performReplace();
        }

    } catch (error) {
        // Invalid regex - provide helpful error message
        const errorHint = getRegexErrorHint(error.message, pattern);
        showStatus(`✗ Invalid pattern: ${error.message}`, 'error');
        elements.matchCount.textContent = '0 matches';
        clearResults();
        elements.explanationContent.innerHTML = `
            <div class="explanation-error">
                <strong>Invalid Pattern:</strong> ${escapeHtml(error.message)}
                ${errorHint ? `<div class="error-hint">${errorHint}</div>` : ''}
            </div>
        `;
    }
}

/**
 * Display text with highlighted matches
 */
function displayHighlightedText(text, matches) {
    if (matches.length === 0) {
        elements.highlightedOutput.textContent = text;
        return;
    }

    // Sort matches by index (in case they're not in order)
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    let result = '';
    let lastIndex = 0;

    sortedMatches.forEach((match, i) => {
        // Add text before match
        result += escapeHtml(text.substring(lastIndex, match.index));

        // Add highlighted match
        result += `<mark class="match-highlight" data-index="${i + 1}">${escapeHtml(match.text)}</mark>`;

        lastIndex = match.index + match.text.length;
    });

    // Add remaining text
    result += escapeHtml(text.substring(lastIndex));

    elements.highlightedOutput.innerHTML = result;
}

/**
 * Display detailed match information
 */
function displayMatchDetails(matches) {
    if (matches.length === 0) {
        elements.matchesList.innerHTML = `
            <div class="matches-empty">
                No matches found. Try adjusting your pattern.
            </div>
        `;
        return;
    }

    const html = matches.map((match, index) => {
        // Named groups (show first if they exist)
        const namedGroupsHtml = Object.keys(match.namedGroups).length > 0
            ? `
                <div class="match-groups">
                    <div class="group-section-title">Named Groups:</div>
                    ${Object.entries(match.namedGroups).map(([name, value]) => `
                        <div class="match-group match-named-group">
                            <span class="group-label">${escapeHtml(name)}:</span>
                            <span class="group-value">${value !== undefined ? escapeHtml(value) : '(not captured)'}</span>
                        </div>
                    `).join('')}
                </div>
            `
            : '';

        // Regular numbered groups
        const groupsHtml = match.groups.length > 0
            ? `
                <div class="match-groups">
                    ${Object.keys(match.namedGroups).length > 0 ? '<div class="group-section-title">Numbered Groups:</div>' : ''}
                    ${match.groups.map((group, i) => `
                        <div class="match-group">
                            <span class="group-label">Group ${i + 1}:</span>
                            <span class="group-value">${group !== undefined ? escapeHtml(group) : '(not captured)'}</span>
                        </div>
                    `).join('')}
                </div>
            `
            : '';

        return `
            <div class="match-item">
                <div class="match-header">
                    <span class="match-index">Match ${index + 1}</span>
                    <span class="match-position">Position: ${match.index} - ${match.index + match.text.length - 1}</span>
                </div>
                <div class="match-text">${escapeHtml(match.text)}</div>
                ${namedGroupsHtml}
                ${groupsHtml}
            </div>
        `;
    }).join('');

    elements.matchesList.innerHTML = html;
}

/**
 * Clear results display
 */
function clearResults() {
    elements.highlightedOutput.textContent = '';
    elements.matchesList.innerHTML = `
        <div class="matches-empty">
            No matches yet. Enter a pattern and test string above.
        </div>
    `;
    elements.matchCount.textContent = '0 matches';
    elements.replaceOutput.textContent = '';
    elements.explanationContent.innerHTML = `
        <div class="explanation-empty">
            Enter a pattern above to see an explanation
        </div>
    `;
}

// ========================================
// FLAGS HANDLING
// ========================================

/**
 * Handle manual flag input
 */
function handleFlagsInput(e) {
    const flags = e.target.value;

    // Update checkboxes to match
    elements.flagG.checked = flags.includes('g');
    elements.flagI.checked = flags.includes('i');
    elements.flagM.checked = flags.includes('m');
    elements.flagS.checked = flags.includes('s');
    elements.flagU.checked = flags.includes('u');

    // Test regex
    testRegex();
}

/**
 * Handle flag checkbox changes
 */
function handleFlagCheckbox() {
    let flags = '';

    if (elements.flagG.checked) flags += 'g';
    if (elements.flagI.checked) flags += 'i';
    if (elements.flagM.checked) flags += 'm';
    if (elements.flagS.checked) flags += 's';
    if (elements.flagU.checked) flags += 'u';

    elements.regexFlags.value = flags;
    testRegex();
}

// ========================================
// PATTERN LIBRARY
// ========================================

/**
 * Toggle pattern library visibility
 */
function toggleLibrary() {
    elements.libraryContent.classList.toggle('hidden');
    const isOpen = !elements.libraryContent.classList.contains('hidden');
    elements.toggleLibrary.textContent = isOpen
        ? '📚 Hide Pattern Library'
        : '📚 Common Patterns Library';
}

/**
 * Load a pattern from the library
 */
function loadPattern(e) {
    const button = e.currentTarget;
    const pattern = button.dataset.pattern;
    const flags = button.dataset.flags;

    elements.regexPattern.value = pattern;
    elements.regexFlags.value = flags;

    // Update flag checkboxes
    elements.flagG.checked = flags.includes('g');
    elements.flagI.checked = flags.includes('i');
    elements.flagM.checked = flags.includes('m');
    elements.flagS.checked = flags.includes('s');
    elements.flagU.checked = flags.includes('u');

    testRegex();
    showToast('Pattern loaded from library ✓');
}

// ========================================
// SAMPLE DATA
// ========================================

/**
 * Load sample data for testing
 */
function loadSample() {
    const samples = [
        {
            name: 'Email with Capture Groups',
            pattern: '^([\\w\\.-]+)@([\\w\\.-]+)\\.(\\w+)$',
            flags: 'gim',
            text: `Contact us:
support@devtoolkit.io
john.doe@example.com
invalid-email@
jane_smith@company.co.uk
admin@test.dev
user+tag@mail-server.com

Phone: 555-123-4567
Website: https://devtoolkit.io`
        },
        {
            name: 'Phone Numbers with Named Groups',
            pattern: '\\b(?<area>\\d{3})-(?<exchange>\\d{3})-(?<number>\\d{4})\\b',
            flags: 'g',
            text: `Customer contacts:
John Smith: 555-123-4567
Jane Doe: 555-987-6543
Support Line: 1-800-DEVTOOL (not a match)
Emergency: 911 (not a match)
Office: 555-555-5555
Mobile: 555-321-9876`
        },
        {
            name: 'URLs with Protocol Extraction',
            pattern: '(https?):\\/\\/([^\\s\\/]+)([^\\s]*)',
            flags: 'g',
            text: `Check out these sites:
https://devtoolkit.io
http://example.com
https://github.com/username/repo
ftp://notamatch.com
www.alsonomatch.com
Visit https://regex101.com/library for more info!
https://stackoverflow.com/questions/12345`
        },
        {
            name: 'Date Extraction (YYYY-MM-DD)',
            pattern: '\\b(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})\\b',
            flags: 'g',
            text: `Event Schedule:
Conference: 2024-03-15
Workshop: 2024-03-16
Deadline: 2024-04-01
Meeting: 2024-12-31
Invalid: 24-03-15
Also Invalid: 2024/03/15`
        },
        {
            name: 'HTML Tag Matching',
            pattern: '<([a-z]+)([^>]*)>(.*?)<\\/\\1>',
            flags: 'gi',
            text: `<div class="container">Hello World</div>
<span>This is text</span>
<p>Paragraph content</p>
<a href="#">Link</a>
<img src="test.jpg"> (self-closing, no match)
<strong>Bold text</strong>`
        },
        {
            name: 'Password Validation with Lookaheads',
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            flags: 'gm',
            text: `Test these passwords:
Password123!
weakpass
ALLCAPS123!
NoSpecialChar123
short1!A
Valid1Pass!
AnotherGood1@
missingdigit!A`
        },
        {
            name: 'Log Parser with Named Groups',
            pattern: '\\[(?<timestamp>[\\d:\\-\\s]+)\\]\\s+(?<level>\\w+):\\s+(?<message>.*)',
            flags: 'g',
            text: `[2024-01-15 10:30:45] INFO: Application started
[2024-01-15 10:30:46] DEBUG: Loading configuration
[2024-01-15 10:30:47] WARN: Cache miss for key: user_123
[2024-01-15 10:30:48] ERROR: Failed to connect to database
[2024-01-15 10:30:49] INFO: Retrying connection
Not a valid log line
[2024-01-15 10:30:50] SUCCESS: Connection established`
        },
        {
            name: 'CSS Color Extractor',
            pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b',
            flags: 'g',
            text: `body { background: #ffffff; }
.header { color: #333; }
.button { border: 1px solid #ff5733; }
.text { color: #abc; }
Invalid: #gg1234
Valid: #FfFfFf
Short form: #f0f`
        }
    ];

    const sample = samples[Math.floor(Math.random() * samples.length)];

    elements.regexPattern.value = sample.pattern;
    elements.regexFlags.value = sample.flags;
    elements.testString.value = sample.text;

    // Update flag checkboxes
    elements.flagG.checked = sample.flags.includes('g');
    elements.flagI.checked = sample.flags.includes('i');
    elements.flagM.checked = sample.flags.includes('m');
    elements.flagS.checked = sample.flags.includes('s');
    elements.flagU.checked = sample.flags.includes('u');

    testRegex();
    showToast(`Sample loaded: ${sample.name} ✓`);
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Clear test string
 */
function clearTest() {
    elements.testString.value = '';
    testRegex();
    showToast('Test string cleared');
}

/**
 * Copy all matches to clipboard
 */
async function copyMatches() {
    if (state.matches.length === 0) {
        showToast('No matches to copy');
        return;
    }

    const matchesText = state.matches.map(m => m.text).join('\n');

    try {
        await navigator.clipboard.writeText(matchesText);
        showToast(`Copied ${state.matches.length} match${state.matches.length !== 1 ? 'es' : ''} to clipboard! ⎘`);
    } catch (error) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = matchesText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`Copied ${state.matches.length} match${state.matches.length !== 1 ? 'es' : ''} to clipboard! ⎘`);
    }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get helpful hint for common regex errors
 */
function getRegexErrorHint(errorMessage, pattern) {
    const hints = {
        'Unterminated group': 'Check for unmatched parentheses ( ) in your pattern',
        'Unmatched': 'Check for unmatched brackets [ ], braces { }, or parentheses ( )',
        'Nothing to repeat': 'A quantifier (*,+,?,{}) was used without a preceding character or group',
        'Invalid group': 'Check your group syntax - use () for capture groups, (?:) for non-capturing',
        'Invalid escape': 'Backslash \\ must be followed by a valid escape character',
        'Range out of order': 'In character sets like [a-z], the first character must come before the second',
        'Incomplete quantifier': 'Quantifier {} syntax is incomplete - use {n}, {n,}, or {n,m}'
    };

    for (const [key, hint] of Object.entries(hints)) {
        if (errorMessage.includes(key)) {
            return hint;
        }
    }

    // Check for common issues by analyzing the pattern
    const openParens = (pattern.match(/\(/g) || []).length;
    const closeParens = (pattern.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        return `Found ${openParens} opening and ${closeParens} closing parentheses - they should match`;
    }

    const openBrackets = (pattern.match(/\[/g) || []).length;
    const closeBrackets = (pattern.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
        return `Found ${openBrackets} opening and ${closeBrackets} closing brackets - they should match`;
    }

    return null;
}

/**
 * Export matches in different formats
 */
function exportMatches(format) {
    if (state.matches.length === 0) {
        showToast('No matches to export');
        return;
    }

    let exportData = '';
    let filename = '';
    let mimeType = '';

    if (format === 'json') {
        exportData = JSON.stringify(state.matches.map(m => ({
            text: m.text,
            index: m.index,
            groups: m.groups,
            namedGroups: m.namedGroups
        })), null, 2);
        filename = 'regex-matches.json';
        mimeType = 'application/json';
    } else if (format === 'csv') {
        // CSV header
        const hasNamedGroups = state.matches.some(m => Object.keys(m.namedGroups).length > 0);
        const maxGroups = Math.max(...state.matches.map(m => m.groups.length));

        let csv = 'Match,Index,Text';
        for (let i = 1; i <= maxGroups; i++) {
            csv += `,Group ${i}`;
        }
        if (hasNamedGroups) {
            const allNamedKeys = new Set();
            state.matches.forEach(m => Object.keys(m.namedGroups).forEach(k => allNamedKeys.add(k)));
            allNamedKeys.forEach(key => csv += `,${key}`);
        }
        csv += '\n';

        // CSV rows
        state.matches.forEach((match, idx) => {
            csv += `${idx + 1},${match.index},"${match.text.replace(/"/g, '""')}"`;
            for (let i = 0; i < maxGroups; i++) {
                const group = match.groups[i];
                csv += `,"${group !== undefined ? String(group).replace(/"/g, '""') : ''}"`;
            }
            if (hasNamedGroups) {
                const allNamedKeys = new Set();
                state.matches.forEach(m => Object.keys(m.namedGroups).forEach(k => allNamedKeys.add(k)));
                allNamedKeys.forEach(key => {
                    const value = match.namedGroups[key];
                    csv += `,"${value !== undefined ? String(value).replace(/"/g, '""') : ''}"`;
                });
            }
            csv += '\n';
        });

        exportData = csv;
        filename = 'regex-matches.csv';
        mimeType = 'text/csv';
    }

    // Create download
    const blob = new Blob([exportData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Exported ${state.matches.length} matches as ${format.toUpperCase()} ✓`);
}

// ========================================
// REPLACE/SUBSTITUTION MODE
// ========================================

/**
 * Toggle replace mode on/off
 */
function toggleReplaceMode() {
    state.replaceEnabled = elements.enableReplace.checked;

    if (state.replaceEnabled) {
        elements.replaceControls.classList.remove('hidden');
        performReplace();
    } else {
        elements.replaceControls.classList.add('hidden');
    }
}

/**
 * Perform the replacement operation
 */
function performReplace() {
    if (!state.replaceEnabled || !state.pattern || !state.testString) {
        elements.replaceOutput.textContent = '';
        return;
    }

    try {
        const regex = new RegExp(state.pattern, state.flags);
        const replaceStr = elements.replaceString.value;
        state.replaceString = replaceStr;

        const result = state.testString.replace(regex, replaceStr);
        elements.replaceOutput.textContent = result;
    } catch (error) {
        elements.replaceOutput.textContent = 'Error performing replacement';
    }
}

/**
 * Copy replace result to clipboard
 */
async function copyReplaceResult() {
    const result = elements.replaceOutput.textContent;

    if (!result) {
        showToast('No replacement result to copy');
        return;
    }

    try {
        await navigator.clipboard.writeText(result);
        showToast('Replacement result copied to clipboard! ⎘');
    } catch (error) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = result;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Replacement result copied to clipboard! ⎘');
    }
}

// ========================================
// PATTERN HISTORY (localStorage)
// ========================================

/**
 * Load history from localStorage
 */
function loadHistory() {
    try {
        const stored = localStorage.getItem(CONFIG.HISTORY_STORAGE_KEY);
        if (stored) {
            state.history = JSON.parse(stored);
            displayHistory();
        }
    } catch (error) {
        console.error('Failed to load history:', error);
        state.history = [];
    }
}

/**
 * Save pattern to history
 */
function saveToHistory(pattern, flags) {
    if (!pattern) return;

    // Remove duplicate if exists
    state.history = state.history.filter(
        item => !(item.pattern === pattern && item.flags === flags)
    );

    // Add to front
    state.history.unshift({
        pattern,
        flags,
        timestamp: Date.now()
    });

    // Limit size
    if (state.history.length > CONFIG.MAX_HISTORY_ITEMS) {
        state.history = state.history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
    }

    // Save to localStorage
    try {
        localStorage.setItem(CONFIG.HISTORY_STORAGE_KEY, JSON.stringify(state.history));
        displayHistory();
    } catch (error) {
        console.error('Failed to save history:', error);
    }
}

/**
 * Display history list
 */
function displayHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = '<div class="history-empty">No recent patterns yet</div>';
        return;
    }

    const html = state.history.map((item, index) => {
        const date = new Date(item.timestamp);
        const timeAgo = formatTimeAgo(date);

        return `
            <div class="history-item" data-index="${index}">
                <div class="history-pattern">
                    <code>/${escapeHtml(item.pattern)}/${item.flags}</code>
                </div>
                <div class="history-meta">
                    <span class="history-time">${timeAgo}</span>
                    <button class="history-load" data-index="${index}" title="Load this pattern">Load</button>
                    <button class="history-delete" data-index="${index}" title="Delete from history">×</button>
                </div>
            </div>
        `;
    }).join('');

    elements.historyList.innerHTML = html;

    // Attach event listeners to history items
    elements.historyList.querySelectorAll('.history-load').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            loadFromHistory(index);
        });
    });

    elements.historyList.querySelectorAll('.history-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteFromHistory(index);
        });
    });
}

/**
 * Load a pattern from history
 */
function loadFromHistory(index) {
    const item = state.history[index];
    if (!item) return;

    elements.regexPattern.value = item.pattern;
    elements.regexFlags.value = item.flags;

    // Update flag checkboxes
    elements.flagG.checked = item.flags.includes('g');
    elements.flagI.checked = item.flags.includes('i');
    elements.flagM.checked = item.flags.includes('m');
    elements.flagS.checked = item.flags.includes('s');
    elements.flagU.checked = item.flags.includes('u');

    testRegex();
    showToast('Pattern loaded from history ✓');
}

/**
 * Delete a pattern from history
 */
function deleteFromHistory(index) {
    state.history.splice(index, 1);

    try {
        localStorage.setItem(CONFIG.HISTORY_STORAGE_KEY, JSON.stringify(state.history));
        displayHistory();
        showToast('Pattern deleted from history');
    } catch (error) {
        console.error('Failed to delete from history:', error);
    }
}

/**
 * Toggle history visibility
 */
function toggleHistory() {
    elements.historyContent.classList.toggle('hidden');
    const isOpen = !elements.historyContent.classList.contains('hidden');
    elements.toggleHistory.textContent = isOpen
        ? '🕐 Hide Recent Patterns'
        : '🕐 Recent Patterns';
}

/**
 * Format timestamp as "time ago"
 */
function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
}

// ========================================
// REGEX EXPLANATION
// ========================================

/**
 * Explain what the regex pattern does
 */
function explainPattern(pattern, flags) {
    if (!pattern) {
        elements.explanationContent.innerHTML = `
            <div class="explanation-empty">
                Enter a pattern above to see an explanation
            </div>
        `;
        return;
    }

    const explanations = [];

    // Analyze the pattern
    const parts = analyzePattern(pattern);

    // Build explanation HTML
    let html = '<div class="explanation-parts">';

    parts.forEach(part => {
        html += `
            <div class="explanation-part">
                <code class="explanation-token">${escapeHtml(part.token)}</code>
                <span class="explanation-desc">${part.description}</span>
            </div>
        `;
    });

    html += '</div>';

    // Add flags explanation if present
    if (flags) {
        html += '<div class="explanation-flags"><strong>Flags:</strong><ul>';
        if (flags.includes('g')) html += '<li><code>g</code> - Global: Find all matches</li>';
        if (flags.includes('i')) html += '<li><code>i</code> - Case insensitive</li>';
        if (flags.includes('m')) html += '<li><code>m</code> - Multiline: ^ and $ match line breaks</li>';
        if (flags.includes('s')) html += '<li><code>s</code> - Dotall: . matches newlines</li>';
        if (flags.includes('u')) html += '<li><code>u</code> - Unicode mode</li>';
        html += '</ul></div>';
    }

    elements.explanationContent.innerHTML = html;
}

/**
 * Analyze pattern and break it into explainable parts
 */
function analyzePattern(pattern) {
    const parts = [];
    let i = 0;

    while (i < pattern.length) {
        const char = pattern[i];
        let token = char;
        let description = '';
        let consumed = 1;

        // Character classes
        if (char === '\\' && i + 1 < pattern.length) {
            const next = pattern[i + 1];
            token = char + next;
            consumed = 2;

            switch (next) {
                case 'd': description = 'Any digit (0-9)'; break;
                case 'D': description = 'Any non-digit'; break;
                case 'w': description = 'Any word character (a-z, A-Z, 0-9, _)'; break;
                case 'W': description = 'Any non-word character'; break;
                case 's': description = 'Any whitespace character'; break;
                case 'S': description = 'Any non-whitespace character'; break;
                case 'b': description = 'Word boundary'; break;
                case 'B': description = 'Non-word boundary'; break;
                case 'n': description = 'Newline'; break;
                case 't': description = 'Tab'; break;
                case 'r': description = 'Carriage return'; break;
                default: description = `Escaped character: ${next}`; break;
            }
        }
        // Anchors
        else if (char === '^') {
            description = 'Start of string/line';
        }
        else if (char === '$') {
            description = 'End of string/line';
        }
        // Quantifiers
        else if (char === '*') {
            description = 'Match 0 or more times';
        }
        else if (char === '+') {
            description = 'Match 1 or more times';
        }
        else if (char === '?') {
            description = 'Match 0 or 1 time (optional)';
        }
        else if (char === '{') {
            // Find closing brace
            const closeBrace = pattern.indexOf('}', i);
            if (closeBrace !== -1) {
                token = pattern.substring(i, closeBrace + 1);
                consumed = token.length;
                const content = token.slice(1, -1);
                if (content.includes(',')) {
                    const [min, max] = content.split(',');
                    description = max ? `Match ${min} to ${max} times` : `Match ${min} or more times`;
                } else {
                    description = `Match exactly ${content} times`;
                }
            }
        }
        // Character sets
        else if (char === '[') {
            const closeSet = pattern.indexOf(']', i);
            if (closeSet !== -1) {
                token = pattern.substring(i, closeSet + 1);
                consumed = token.length;
                const isNegated = token[1] === '^';
                description = isNegated
                    ? `Match any character NOT in set: ${token.slice(2, -1)}`
                    : `Match any character in set: ${token.slice(1, -1)}`;
            }
        }
        // Groups
        else if (char === '(') {
            const closeGroup = findMatchingParen(pattern, i);
            if (closeGroup !== -1) {
                token = pattern.substring(i, closeGroup + 1);
                consumed = token.length;

                if (token.startsWith('(?:')) {
                    description = 'Non-capturing group';
                } else if (token.startsWith('(?=')) {
                    description = 'Positive lookahead';
                } else if (token.startsWith('(?!')) {
                    description = 'Negative lookahead';
                } else if (token.startsWith('(?<')) {
                    const nameMatch = token.match(/\(\?<(\w+)>/);
                    if (nameMatch) {
                        description = `Named capture group: "${nameMatch[1]}"`;
                    }
                } else {
                    description = 'Capture group';
                }
            }
        }
        // Alternation
        else if (char === '|') {
            description = 'OR (alternation)';
        }
        // Wildcard
        else if (char === '.') {
            description = 'Match any character (except newline)';
        }
        // Literal character
        else {
            description = `Literal character: "${char}"`;
        }

        if (description) {
            parts.push({ token, description });
        }

        i += consumed;
    }

    return parts;
}

/**
 * Find matching closing parenthesis
 */
function findMatchingParen(str, startPos) {
    let depth = 0;
    for (let i = startPos; i < str.length; i++) {
        if (str[i] === '(' && (i === 0 || str[i - 1] !== '\\')) depth++;
        if (str[i] === ')' && (i === 0 || str[i - 1] !== '\\')) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// ========================================
// UI HELPERS
// ========================================

/**
 * Show status message
 */
function showStatus(message, type = 'ready') {
    elements.statusText.textContent = message;
    elements.statusBar.className = 'status-bar';

    if (type === 'success') {
        elements.statusBar.classList.add('success');
    } else if (type === 'error') {
        elements.statusBar.classList.add('error');
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');

    setTimeout(() => {
        elements.toast.classList.add('hidden');
    }, CONFIG.TOAST_DURATION);
}

// ========================================
// KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter = Test regex (focus pattern input)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        testRegex();
    }

    // Ctrl/Cmd + K = Clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearTest();
    }
});

// ========================================
// ANALYTICS PLACEHOLDER
// ========================================
function trackEvent(category, action, label) {
    console.log('📊 Event:', category, action, label);
}

// Track usage
elements.regexPattern.addEventListener('input', () => trackEvent('Tool', 'Test', 'RegEx'));
elements.loadSampleBtn.addEventListener('click', () => trackEvent('Tool', 'LoadSample', 'RegEx'));
elements.copyMatchesBtn.addEventListener('click', () => trackEvent('Tool', 'CopyMatches', 'RegEx'));

// ========================================
// EDUCATIONAL CONTENT TOGGLE
// ========================================
const toggleEducationBtn = document.getElementById('toggleEducation');
const educationalContent = document.getElementById('educationalContent');

if (toggleEducationBtn && educationalContent) {
    toggleEducationBtn.addEventListener('click', () => {
        const isHidden = educationalContent.classList.contains('hidden');

        if (isHidden) {
            educationalContent.classList.remove('hidden');
            toggleEducationBtn.classList.add('active');
            toggleEducationBtn.querySelector('.toggle-text').textContent = 'Hide Learning Content';

            // Smooth scroll to educational section
            setTimeout(() => {
                document.getElementById('educationalSection').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        } else {
            educationalContent.classList.add('hidden');
            toggleEducationBtn.classList.remove('active');
            toggleEducationBtn.querySelector('.toggle-text').textContent = 'Learn More About Regular Expressions';
        }

        trackEvent('Educational', isHidden ? 'Expand' : 'Collapse', 'RegEx');
    });
}

// ========================================
// START APP
// ========================================
init();
