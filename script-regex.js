// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    MAX_MATCHES_DISPLAY: 100
};

let state = {
    pattern: '',
    flags: '',
    testString: '',
    matches: []
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
    toggleLibrary: document.getElementById('toggleLibrary'),
    libraryContent: document.getElementById('libraryContent'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    console.log('🚀 DevToolkit RegEx Tester initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Real-time testing
    elements.regexPattern.addEventListener('input', testRegex);
    elements.regexFlags.addEventListener('input', handleFlagsInput);
    elements.testString.addEventListener('input', testRegex);
    
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
    elements.toggleLibrary.addEventListener('click', toggleLibrary);
    
    // Library items
    document.querySelectorAll('.library-item').forEach(item => {
        item.addEventListener('click', loadPattern);
    });
}

// ========================================
// CORE REGEX TESTING
// ========================================

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
                    fullMatch: match
                });
            }
        }
        
        // Update state
        state.matches = matches;
        
        // Display results
        displayHighlightedText(testString, matches);
        displayMatchDetails(matches);
        
        // Update status
        if (matches.length > 0) {
            showStatus(`✓ Pattern is valid`, 'success');
            elements.matchCount.textContent = `${matches.length} match${matches.length !== 1 ? 'es' : ''}`;
        } else {
            showStatus('Pattern is valid but no matches found', 'ready');
            elements.matchCount.textContent = '0 matches';
        }
        
    } catch (error) {
        // Invalid regex
        showStatus(`✗ Invalid pattern: ${error.message}`, 'error');
        elements.matchCount.textContent = '0 matches';
        clearResults();
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
        const groupsHtml = match.groups.length > 0 
            ? `
                <div class="match-groups">
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
            pattern: '^[\\w\\.-]+@[\\w\\.-]+\\.\\w+$',
            flags: 'gim',
            text: `Contact us:
support@devtoolkit.io
john.doe@example.com
invalid-email@
jane_smith@company.co.uk
admin@test.dev

Phone: 555-123-4567
Website: https://devtoolkit.io`
        },
        {
            pattern: '\\b\\d{3}-\\d{3}-\\d{4}\\b',
            flags: 'g',
            text: `Customer contacts:
John: 555-123-4567
Jane: 555-987-6543
Support: 1-800-DEVTOOL (not a match)
Emergency: 911 (not a match)
Office: 555-555-5555`
        },
        {
            pattern: 'https?:\\/\\/[^\\s]+',
            flags: 'g',
            text: `Check out these sites:
https://devtoolkit.io
http://example.com
https://github.com/username/repo
ftp://notamatch.com
www.alsonomatch.com
Visit https://regex101.com for more info!`
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
    showToast('Sample loaded ✓');
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
// START APP
// ========================================
init();
