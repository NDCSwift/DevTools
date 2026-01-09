// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    MAX_FREE_HISTORY: 10,
    STORAGE_KEY: 'jsonFormatterHistory',
    TOAST_DURATION: 3000
};

let state = {
    history: [],
    currentIndent: 2
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    inputJson: document.getElementById('inputJson'),
    outputJson: document.getElementById('outputJson'),
    formatBtn: document.getElementById('formatBtn'),
    minifyBtn: document.getElementById('minifyBtn'),
    clearBtn: document.getElementById('clearBtn'),
    copyBtn: document.getElementById('copyBtn'),
    pasteBtn: document.getElementById('pasteBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    indentSize: document.getElementById('indentSize'),
    statusBar: document.getElementById('statusBar'),
    statusText: document.getElementById('statusText'),
    charCount: document.getElementById('charCount'),
    validBadge: document.getElementById('validBadge'),
    historyList: document.getElementById('historyList'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadHistoryFromStorage();
    attachEventListeners();
    updateCharCount();
    console.log('🚀 DevToolkit JSON Formatter initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    elements.formatBtn.addEventListener('click', formatJSON);
    elements.minifyBtn.addEventListener('click', minifyJSON);
    elements.clearBtn.addEventListener('click', clearAll);
    elements.copyBtn.addEventListener('click', copyOutput);
    elements.pasteBtn.addEventListener('click', pasteInput);
    elements.loadSampleBtn.addEventListener('click', loadSample);
    elements.indentSize.addEventListener('change', updateIndentSize);
    elements.inputJson.addEventListener('input', updateCharCount);

    // Auto-format on paste (optional UX enhancement)
    elements.inputJson.addEventListener('paste', () => {
        setTimeout(() => formatJSON(), 100);
    });
}

// ========================================
// CORE FUNCTIONS
// ========================================

/**
 * Format and validate JSON
 */
function formatJSON() {
    const input = elements.inputJson.value.trim();
    
    if (!input) {
        showStatus('Please enter some JSON to format', 'error');
        return;
    }
    
    try {
        // Parse JSON to validate
        const parsed = JSON.parse(input);
        
        // Get indent size
        const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;
        
        // Stringify with formatting
        const formatted = JSON.stringify(parsed, null, indent);
        
        // Display with syntax highlighting
        displayFormattedJSON(formatted);
        
        // Update UI
        showStatus('✓ Valid JSON formatted successfully', 'success');
        elements.validBadge.classList.remove('hidden');
        
        // Save to history
        saveToHistory(input, formatted);
        
        // Show success toast
        showToast('JSON formatted and validated ✓');
        
    } catch (error) {
        showStatus(`✗ Invalid JSON: ${error.message}`, 'error');
        elements.validBadge.classList.add('hidden');
        elements.outputJson.innerHTML = `<span style="color: var(--color-error);">Error: ${error.message}</span>`;
    }
}

/**
 * Minify JSON
 */
function minifyJSON() {
    const input = elements.inputJson.value.trim();
    
    if (!input) {
        showStatus('Please enter some JSON to minify', 'error');
        return;
    }
    
    try {
        const parsed = JSON.parse(input);
        const minified = JSON.stringify(parsed);
        
        elements.outputJson.textContent = minified;
        
        showStatus('✓ JSON minified successfully', 'success');
        elements.validBadge.classList.remove('hidden');
        
        saveToHistory(input, minified);
        showToast('JSON minified ✓');
        
    } catch (error) {
        showStatus(`✗ Invalid JSON: ${error.message}`, 'error');
        elements.validBadge.classList.add('hidden');
    }
}

/**
 * Clear all inputs and outputs
 */
function clearAll() {
    elements.inputJson.value = '';
    elements.outputJson.innerHTML = '';
    elements.validBadge.classList.add('hidden');
    showStatus('Ready to format JSON', 'ready');
    updateCharCount();
    showToast('Cleared');
}

/**
 * Paste from clipboard to input
 */
async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            elements.inputJson.value = text;
            updateCharCount();
            showToast('Pasted from clipboard! 📋');
            // Auto-format after paste
            setTimeout(() => formatJSON(), 100);
        } else {
            showToast('Clipboard is empty');
        }
    } catch (error) {
        // Clipboard API not supported or permission denied
        showToast('Please use Ctrl+V to paste');
    }
}

/**
 * Copy output to clipboard
 */
async function copyOutput() {
    const output = elements.outputJson.textContent;

    if (!output) {
        showToast('Nothing to copy');
        return;
    }

    try {
        await navigator.clipboard.writeText(output);
        showToast('Copied to clipboard! ⎘');
    } catch (error) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = output;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard! ⎘');
    }
}

/**
 * Load sample JSON
 */
function loadSample() {
    const sample = {
        "name": "DevToolkit",
        "version": "1.0.0",
        "description": "Professional developer tools suite",
        "tools": [
            {
                "name": "JSON Formatter",
                "status": "live",
                "features": ["format", "validate", "minify", "syntax-highlight"]
            },
            {
                "name": "RegEx Tester",
                "status": "coming-soon"
            },
            {
                "name": "Cron Builder",
                "status": "coming-soon"
            }
        ],
        "pricing": {
            "free": {
                "tools": "all",
                "history": 10,
                "ads": true
            },
            "premium": {
                "price": "$5/month",
                "history": "unlimited",
                "ads": false,
                "sync": true
            }
        },
        "stats": {
            "users": 1337,
            "formatsToday": 42069,
            "isAwesome": true,
            "bugs": null
        }
    };
    
    elements.inputJson.value = JSON.stringify(sample);
    updateCharCount();
    formatJSON();
}

/**
 * Update indent size preference
 */
function updateIndentSize(e) {
    const value = e.target.value;
    state.currentIndent = value === 'tab' ? 'tab' : parseInt(value);
    
    // Re-format if there's output
    if (elements.outputJson.textContent) {
        formatJSON();
    }
}

/**
 * Update character count
 */
function updateCharCount() {
    const count = elements.inputJson.value.length;
    elements.charCount.textContent = `${count.toLocaleString()} characters`;
}

// ========================================
// SYNTAX HIGHLIGHTING
// ========================================

/**
 * Display JSON with syntax highlighting
 */
function displayFormattedJSON(json) {
    const highlighted = syntaxHighlight(json);
    elements.outputJson.innerHTML = highlighted;
}

/**
 * Add syntax highlighting to JSON string
 */
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        let cls = 'json-number';
        
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'json-key';
            } else {
                cls = 'json-string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'json-boolean';
        } else if (/null/.test(match)) {
            cls = 'json-null';
        }
        
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// ========================================
// HISTORY & LOCALSTORAGE
// ========================================

/**
 * Save formatted JSON to history
 */
function saveToHistory(input, output) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        input: input.substring(0, 100) + (input.length > 100 ? '...' : ''),
        output: output,
        preview: generatePreview(input)
    };
    
    // Add to beginning of array
    state.history.unshift(historyItem);
    
    // Limit to MAX_FREE_HISTORY items (for free tier)
    if (state.history.length > CONFIG.MAX_FREE_HISTORY) {
        state.history = state.history.slice(0, CONFIG.MAX_FREE_HISTORY);
    }
    
    // Save to localStorage
    saveHistoryToStorage();
    
    // Update UI (premium feature preview - disabled for free tier)
    // renderHistory();
}

/**
 * Generate preview text from JSON
 */
function generatePreview(json) {
    try {
        const parsed = JSON.parse(json);
        const keys = Object.keys(parsed);
        return `{ ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''} }`;
    } catch {
        return json.substring(0, 50) + '...';
    }
}

/**
 * Save history to localStorage
 */
function saveHistoryToStorage() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.history));
    } catch (error) {
        console.warn('Failed to save history to localStorage:', error);
    }
}

/**
 * Load history from localStorage
 */
function loadHistoryFromStorage() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            state.history = JSON.parse(stored);
        }
    } catch (error) {
        console.warn('Failed to load history from localStorage:', error);
        state.history = [];
    }
}

/**
 * Render history items (Premium feature - currently disabled)
 */
function renderHistory() {
    if (state.history.length === 0) {
        elements.historyList.innerHTML = `
            <div class="history-empty">
                <p>No format history yet</p>
                <p class="history-empty-sub">Your last 10 formats will appear here (Premium: unlimited)</p>
            </div>
        `;
        return;
    }
    
    const html = state.history.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong>${item.preview}</strong>
                <span style="color: var(--color-text-dim); font-size: 0.8rem;">
                    ${new Date(item.timestamp).toLocaleString()}
                </span>
            </div>
            <div style="color: var(--color-text-muted); font-size: 0.85rem;">
                ${item.input}
            </div>
        </div>
    `).join('');
    
    elements.historyList.innerHTML = html;
    
    // Add click handlers to load history items
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            loadHistoryItem(id);
        });
    });
}

/**
 * Load a history item into the editor
 */
function loadHistoryItem(id) {
    const item = state.history.find(h => h.id === id);
    if (item) {
        elements.outputJson.textContent = item.output;
        showToast('Loaded from history');
    }
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
    // Ctrl/Cmd + Enter = Format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formatJSON();
    }
    
    // Ctrl/Cmd + Shift + M = Minify
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        minifyJSON();
    }
    
    // Ctrl/Cmd + K = Clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearAll();
    }
});

// ========================================
// ANALYTICS PLACEHOLDER
// ========================================
// When you add Google AdSense, you can track events here
function trackEvent(category, action, label) {
    // Example: gtag('event', action, { event_category: category, event_label: label });
    console.log('📊 Event:', category, action, label);
}

// Track usage
elements.formatBtn.addEventListener('click', () => trackEvent('Tool', 'Format', 'JSON'));
elements.minifyBtn.addEventListener('click', () => trackEvent('Tool', 'Minify', 'JSON'));
elements.copyBtn.addEventListener('click', () => trackEvent('Tool', 'Copy', 'JSON'));

// ========================================
// START APP
// ========================================
init();
