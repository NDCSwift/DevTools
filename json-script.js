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
    currentIndent: 2,
    currentJson: null,
    treeViewEnabled: false,
    searchQuery: '',
    currentPath: '',
    lineNumbersEnabled: false
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
    downloadBtn: document.getElementById('downloadBtn'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileInput: document.getElementById('fileInput'),
    pasteBtn: document.getElementById('pasteBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    indentSize: document.getElementById('indentSize'),
    statusBar: document.getElementById('statusBar'),
    statusText: document.getElementById('statusText'),
    charCount: document.getElementById('charCount'),
    validBadge: document.getElementById('validBadge'),
    historyList: document.getElementById('historyList'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    treeViewBtn: document.getElementById('treeViewBtn'),
    searchInput: document.getElementById('searchInput'),
    jsonPath: document.getElementById('jsonPath'),
    escapeBtn: document.getElementById('escapeBtn'),
    unescapeBtn: document.getElementById('unescapeBtn'),
    collapseAllBtn: document.getElementById('collapseAllBtn'),
    expandAllBtn: document.getElementById('expandAllBtn'),
    lineNumbersToggle: document.getElementById('lineNumbersToggle')
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
    elements.downloadBtn.addEventListener('click', downloadOutput);
    elements.uploadBtn.addEventListener('click', triggerFileUpload);
    elements.fileInput.addEventListener('change', handleFileUpload);
    elements.pasteBtn.addEventListener('click', pasteInput);
    elements.loadSampleBtn.addEventListener('click', loadSample);
    elements.indentSize.addEventListener('change', updateIndentSize);
    elements.inputJson.addEventListener('input', () => {
        updateCharCount();
        if (state.lineNumbersEnabled) {
            updateInputLineNumbers();
        }
    });
    elements.inputJson.addEventListener('scroll', syncInputLineNumbersScroll);

    // New feature listeners
    elements.treeViewBtn.addEventListener('click', toggleTreeView);
    elements.searchInput.addEventListener('input', handleSearch);
    elements.escapeBtn.addEventListener('click', escapeJSON);
    elements.unescapeBtn.addEventListener('click', unescapeJSON);
    elements.collapseAllBtn.addEventListener('click', collapseAll);
    elements.expandAllBtn.addEventListener('click', expandAll);
    elements.lineNumbersToggle.addEventListener('change', toggleLineNumbers);

    // Drag and drop listeners
    elements.inputJson.addEventListener('dragover', handleDragOver);
    elements.inputJson.addEventListener('dragleave', handleDragLeave);
    elements.inputJson.addEventListener('drop', handleDrop);

    // Auto-format on paste (optional UX enhancement)
    elements.inputJson.addEventListener('paste', () => {
        setTimeout(() => {
            formatJSON();
            if (state.lineNumbersEnabled) {
                updateInputLineNumbers();
            }
        }, 100);
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
        state.currentJson = parsed;

        // Get indent size
        const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;

        // Stringify with formatting
        const formatted = JSON.stringify(parsed, null, indent);

        // Display with syntax highlighting or tree view
        if (state.treeViewEnabled) {
            displayTreeView(parsed);
        } else {
            displayFormattedJSON(formatted);
        }

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
        displayJSONError(input, error);
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
 * Trigger file upload dialog
 */
function triggerFileUpload() {
    elements.fileInput.click();
}

/**
 * Handle file upload
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        readFile(file);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.inputJson.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.inputJson.classList.remove('drag-over');
}

/**
 * Handle drop event
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    elements.inputJson.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file) {
        // Check if it's a JSON file
        if (file.type === 'application/json' || file.name.endsWith('.json')) {
            readFile(file);
        } else {
            showToast('Please upload a JSON file');
        }
    }
}

/**
 * Read file content
 */
function readFile(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
        const content = e.target.result;
        elements.inputJson.value = content;
        updateCharCount();
        showToast(`Loaded ${file.name} 📁`);
        // Auto-format after load
        setTimeout(() => formatJSON(), 100);
    };

    reader.onerror = () => {
        showToast('Failed to read file');
    };

    reader.readAsText(file);
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
 * Download output as JSON file
 */
function downloadOutput() {
    const output = elements.outputJson.textContent;

    if (!output) {
        showToast('Nothing to download');
        return;
    }

    try {
        // Validate that it's proper JSON
        JSON.parse(output);

        // Create blob with JSON content
        const blob = new Blob([output], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Create temporary download link
        const link = document.createElement('a');
        link.href = url;

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `formatted-json-${timestamp}.json`;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);

        showToast('JSON downloaded! ⬇');
        trackEvent('Tool', 'Download', 'JSON');
    } catch (error) {
        showToast('Invalid JSON - cannot download');
    }
}

/**
 * Load sample JSON
 */
function loadSample() {
    const sample = {
        "project": {
            "name": "ToolBit",
            "tagline": "Professional developer tools, zero bloat",
            "version": "2.0.0",
            "repository": "https://github.com/toolbit/toolbit",
            "license": "MIT"
        },

        "features": {
            "json": {
                "name": "JSON Formatter & Validator",
                "capabilities": [
                    "Format & beautify",
                    "Minify",
                    "Tree view with collapse/expand",
                    "Search keys and values",
                    "Escape/unescape strings",
                    "Download formatted JSON",
                    "Syntax highlighting"
                ],
                "status": "live",
                "users": 15420
            },

            "colors": {
                "name": "Color Palette Generator",
                "capabilities": [
                    "Generate palettes",
                    "Extract from images",
                    "Export formats"
                ],
                "status": "live",
                "users": 8930
            },

            "diff": {
                "name": "Text Diff Checker",
                "capabilities": [
                    "Side-by-side comparison",
                    "Inline diff",
                    "Word-level highlighting"
                ],
                "status": "live",
                "users": 6780
            }
        },

        "tech_stack": {
            "frontend": [
                "HTML5",
                "CSS3",
                "Vanilla JavaScript"
            ],
            "fonts": [
                "JetBrains Mono",
                "Unbounded"
            ],
            "deployment": "Static hosting",
            "analytics": "Google Analytics"
        },

        "stats": {
            "totalUsers": 31130,
            "dailyActive": 2847,
            "avgSessionTime": "4m 32s",
            "satisfaction": 4.8,
            "openSource": true,
            "mobileReady": true,
            "lastUpdated": "2026-01-13T12:00:00Z",
            "nextFeature": "API Endpoint Tester"
        },

        "community": {
            "discord": "https://discord.gg/toolbit",
            "github": "https://github.com/toolbit",
            "twitter": "@toolbit_dev",
            "contributors": 47,
            "stars": 1337
        },

        "metadata": {
            "createdBy": "Noah",
            "purpose": "Making developer tools accessible and fast",
            "philosophy": "Client-side processing, privacy-first, zero tracking of user data",
            "sponsorship": null
        }
    };

    elements.inputJson.value = JSON.stringify(sample, null, 2);
    updateCharCount();
    updateInputLineNumbers();
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

/**
 * Toggle line numbers in input and output
 */
function toggleLineNumbers() {
    state.lineNumbersEnabled = elements.lineNumbersToggle.checked;

    // Update input line numbers visibility
    const inputWrapper = elements.inputJson.parentElement;
    const lineNumbersGutter = document.getElementById('inputLineNumbers');

    if (state.lineNumbersEnabled) {
        inputWrapper.classList.add('with-line-numbers');
        elements.inputJson.classList.add('with-line-numbers');
        updateInputLineNumbers();
    } else {
        inputWrapper.classList.remove('with-line-numbers');
        elements.inputJson.classList.remove('with-line-numbers');
        lineNumbersGutter.innerHTML = '';
    }

    // Re-render the output if we have JSON
    if (state.currentJson) {
        if (state.treeViewEnabled) {
            // Tree view doesn't support line numbers, show message
            showToast('Line numbers not available in tree view');
            elements.lineNumbersToggle.checked = false;
            state.lineNumbersEnabled = false;
            inputWrapper.classList.remove('with-line-numbers');
            elements.inputJson.classList.remove('with-line-numbers');
            lineNumbersGutter.innerHTML = '';
        } else {
            const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;
            const formatted = JSON.stringify(state.currentJson, null, indent);
            displayFormattedJSON(formatted);
            showToast(state.lineNumbersEnabled ? 'Line numbers enabled' : 'Line numbers disabled');
        }
    } else {
        showToast(state.lineNumbersEnabled ? 'Line numbers enabled' : 'Line numbers disabled');
    }
}

/**
 * Update input line numbers based on content
 */
function updateInputLineNumbers() {
    const lineNumbersGutter = document.getElementById('inputLineNumbers');

    if (!state.lineNumbersEnabled) {
        return;
    }

    const lines = elements.inputJson.value.split('\n').length;
    const lineNumbersHTML = Array.from({ length: lines }, (_, i) =>
        `<div class="line-number">${i + 1}</div>`
    ).join('');

    lineNumbersGutter.innerHTML = lineNumbersHTML;
}

/**
 * Sync input line numbers scroll with textarea
 */
function syncInputLineNumbersScroll() {
    const lineNumbersGutter = document.getElementById('inputLineNumbers');
    lineNumbersGutter.scrollTop = elements.inputJson.scrollTop;
}

// ========================================
// TREE VIEW FUNCTIONALITY
// ========================================

/**
 * Toggle between tree view and regular view
 */
function toggleTreeView() {
    state.treeViewEnabled = !state.treeViewEnabled;
    elements.treeViewBtn.textContent = state.treeViewEnabled ? '📄 Plain View' : '🌲 Tree View';

    if (state.currentJson) {
        if (state.treeViewEnabled) {
            displayTreeView(state.currentJson);
        } else {
            const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;
            const formatted = JSON.stringify(state.currentJson, null, indent);
            displayFormattedJSON(formatted);
        }
    }
}

/**
 * Display JSON as interactive tree
 */
function displayTreeView(data, path = '') {
    elements.outputJson.innerHTML = '';
    elements.outputJson.className = 'json-output tree-view';
    const tree = createTreeNode(data, path, 'root');
    elements.outputJson.appendChild(tree);
}

/**
 * Create a tree node element
 */
function createTreeNode(data, path, key, isExpanded = true) {
    const container = document.createElement('div');
    container.className = 'tree-node';

    const type = Array.isArray(data) ? 'array' : typeof data === 'object' && data !== null ? 'object' : 'value';

    if (type === 'object' || type === 'array') {
        const header = document.createElement('div');
        header.className = 'tree-node-header';

        const toggle = document.createElement('span');
        toggle.className = `tree-toggle ${isExpanded ? 'expanded' : 'collapsed'}`;
        toggle.textContent = isExpanded ? '▼' : '▶';

        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key json-key';
        keySpan.textContent = key !== 'root' ? `"${key}"` : '';
        keySpan.dataset.path = path || key;

        const colon = document.createElement('span');
        colon.textContent = key !== 'root' ? ': ' : '';

        const bracket = document.createElement('span');
        bracket.className = 'tree-bracket';
        const isArray = Array.isArray(data);
        const openBracket = isArray ? '[' : '{';
        const closeBracket = isArray ? ']' : '}';
        const length = isArray ? data.length : Object.keys(data).length;
        bracket.textContent = `${openBracket} ${length} items ${closeBracket}`;

        header.appendChild(toggle);
        if (key !== 'root') {
            header.appendChild(keySpan);
            header.appendChild(colon);
        }
        header.appendChild(bracket);

        // Add click to show path
        keySpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showJsonPath(keySpan.dataset.path);
            highlightNode(keySpan);
        });

        const content = document.createElement('div');
        content.className = 'tree-node-content';
        content.style.display = isExpanded ? 'block' : 'none';

        const entries = isArray ? data.map((v, i) => [i, v]) : Object.entries(data);
        entries.forEach(([k, v]) => {
            const childPath = path ? `${path}.${k}` : String(k);
            const childNode = createTreeNode(v, childPath, k, false);
            content.appendChild(childNode);
        });

        // Toggle expand/collapse functionality
        const toggleExpansion = (e) => {
            // Don't toggle if clicking on the key to show path
            if (e.target.classList.contains('tree-key')) {
                return;
            }

            const isCurrentlyExpanded = content.style.display === 'block';
            content.style.display = isCurrentlyExpanded ? 'none' : 'block';
            toggle.className = `tree-toggle ${isCurrentlyExpanded ? 'collapsed' : 'expanded'}`;
            toggle.textContent = isCurrentlyExpanded ? '▶' : '▼';
        };

        // Make entire header clickable
        header.addEventListener('click', toggleExpansion);
        header.style.cursor = 'pointer';

        container.appendChild(header);
        container.appendChild(content);
    } else {
        // Leaf node
        const leaf = document.createElement('div');
        leaf.className = 'tree-leaf';

        const keySpan = document.createElement('span');
        keySpan.className = 'tree-key json-key';
        keySpan.textContent = `"${key}"`;
        keySpan.dataset.path = path || key;

        const colon = document.createElement('span');
        colon.textContent = ': ';

        const valueSpan = document.createElement('span');
        const valueType = typeof data;
        let valueClass = 'json-value';

        if (data === null) {
            valueClass = 'json-null';
            valueSpan.textContent = 'null';
        } else if (valueType === 'boolean') {
            valueClass = 'json-boolean';
            valueSpan.textContent = String(data);
        } else if (valueType === 'number') {
            valueClass = 'json-number';
            valueSpan.textContent = String(data);
        } else if (valueType === 'string') {
            valueClass = 'json-string';
            valueSpan.textContent = `"${data}"`;
        }

        valueSpan.className = valueClass;

        // Add click to show path
        keySpan.addEventListener('click', (e) => {
            e.stopPropagation();
            showJsonPath(keySpan.dataset.path);
            highlightNode(keySpan);
        });

        leaf.appendChild(keySpan);
        leaf.appendChild(colon);
        leaf.appendChild(valueSpan);

        container.appendChild(leaf);
    }

    return container;
}

/**
 * Collapse all tree nodes
 */
function collapseAll() {
    if (!state.treeViewEnabled || !state.currentJson) {
        showToast('Enable tree view first');
        return;
    }

    const contents = elements.outputJson.querySelectorAll('.tree-node-content');
    const toggles = elements.outputJson.querySelectorAll('.tree-toggle');

    contents.forEach(content => content.style.display = 'none');
    toggles.forEach(toggle => {
        toggle.className = 'tree-toggle collapsed';
        toggle.textContent = '▶';
    });

    showToast('All nodes collapsed');
}

/**
 * Expand all tree nodes
 */
function expandAll() {
    if (!state.treeViewEnabled || !state.currentJson) {
        showToast('Enable tree view first');
        return;
    }

    const contents = elements.outputJson.querySelectorAll('.tree-node-content');
    const toggles = elements.outputJson.querySelectorAll('.tree-toggle');

    contents.forEach(content => content.style.display = 'block');
    toggles.forEach(toggle => {
        toggle.className = 'tree-toggle expanded';
        toggle.textContent = '▼';
    });

    showToast('All nodes expanded');
}

// ========================================
// JSON PATH DISPLAY
// ========================================

/**
 * Show the JSON path of selected element
 */
function showJsonPath(path) {
    state.currentPath = path;
    elements.jsonPath.innerHTML = `Path: <span class="path-value">${path || 'root'}</span>`;
    elements.jsonPath.classList.remove('hidden');

    // Copy path on click
    elements.jsonPath.onclick = async () => {
        try {
            await navigator.clipboard.writeText(path);
            showToast('Path copied! 📋');
        } catch (err) {
            showToast('Failed to copy path');
        }
    };
}

/**
 * Highlight selected node
 */
function highlightNode(element) {
    // Remove previous highlights
    document.querySelectorAll('.tree-key.highlighted').forEach(el => {
        el.classList.remove('highlighted');
    });

    // Add highlight to current
    element.classList.add('highlighted');
}

// ========================================
// SEARCH/FILTER FUNCTIONALITY
// ========================================

/**
 * Handle search input
 */
function handleSearch() {
    const query = elements.searchInput.value.toLowerCase().trim();
    state.searchQuery = query;

    if (!state.currentJson) {
        return;
    }

    if (!query) {
        // Clear search highlights and restore original view
        if (state.treeViewEnabled) {
            clearSearchHighlights();
        } else {
            // Re-render the plain view without highlights
            const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;
            const formatted = JSON.stringify(state.currentJson, null, indent);
            displayFormattedJSON(formatted);
        }
        showStatus('Ready to format JSON', 'ready');
        return;
    }

    if (state.treeViewEnabled) {
        searchInTreeView(query);
    } else {
        // Re-render first to clear any previous highlights
        const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;
        const formatted = JSON.stringify(state.currentJson, null, indent);
        displayFormattedJSON(formatted);
        // Then apply new search
        searchInPlainView(query);
    }
}

/**
 * Search in tree view
 */
function searchInTreeView(query) {
    const allKeys = elements.outputJson.querySelectorAll('.tree-key');
    const allValues = elements.outputJson.querySelectorAll('.json-string, .json-number, .json-boolean, .json-null');

    let matchCount = 0;

    // Clear previous highlights
    clearSearchHighlights();

    // Helper function to highlight matching text within an element
    const highlightMatches = (element) => {
        const text = element.textContent;
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();

        if (lowerText.includes(lowerQuery)) {
            const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
            const highlighted = text.replace(regex, '<mark class="search-match">$1</mark>');
            element.innerHTML = highlighted;
            return true;
        }
        return false;
    };

    // Search keys
    allKeys.forEach(key => {
        if (highlightMatches(key)) {
            matchCount++;

            // Expand parent nodes to show match
            let parent = key.closest('.tree-node-content');
            while (parent) {
                parent.style.display = 'block';
                const toggle = parent.previousElementSibling?.querySelector('.tree-toggle');
                if (toggle) {
                    toggle.className = 'tree-toggle expanded';
                    toggle.textContent = '▼';
                }
                parent = parent.parentElement?.closest('.tree-node-content');
            }
        }
    });

    // Search values
    allValues.forEach(value => {
        if (highlightMatches(value)) {
            matchCount++;

            // Expand parent nodes to show match
            let parent = value.closest('.tree-node-content');
            while (parent) {
                parent.style.display = 'block';
                const toggle = parent.previousElementSibling?.querySelector('.tree-toggle');
                if (toggle) {
                    toggle.className = 'tree-toggle expanded';
                    toggle.textContent = '▼';
                }
                parent = parent.parentElement?.closest('.tree-node-content');
            }
        }
    });

    showStatus(`Found ${matchCount} matches for "${query}"`, matchCount > 0 ? 'success' : 'error');
}

/**
 * Search in plain view
 */
function searchInPlainView(query) {
    // Clear previous highlights first
    clearSearchHighlights();

    let matchCount = 0;
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');

    // Helper function to highlight text in text nodes only
    const highlightTextNodes = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const lowerText = text.toLowerCase();
            const lowerQuery = query.toLowerCase();

            if (lowerText.includes(lowerQuery)) {
                // Count matches
                const matches = text.match(regex);
                if (matches) {
                    matchCount += matches.length;
                }

                // Create a temporary container
                const span = document.createElement('span');
                span.innerHTML = text.replace(regex, '<mark class="search-match">$1</mark>');

                // Replace the text node with the highlighted content
                const fragment = document.createDocumentFragment();
                while (span.firstChild) {
                    fragment.appendChild(span.firstChild);
                }
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Recursively process child nodes
            // Create a copy of childNodes array since we'll be modifying the DOM
            const children = Array.from(node.childNodes);
            children.forEach(child => highlightTextNodes(child));
        }
    };

    highlightTextNodes(elements.outputJson);
    showStatus(`Found ${matchCount} matches for "${query}"`, matchCount > 0 ? 'success' : 'error');
}

/**
 * Clear search highlights
 */
function clearSearchHighlights() {
    document.querySelectorAll('.search-match').forEach(el => {
        if (el.tagName === 'MARK') {
            el.outerHTML = el.innerHTML;
        } else {
            el.classList.remove('search-match');
        }
    });
}

/**
 * Escape regex special characters
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ========================================
// ESCAPE/UNESCAPE FUNCTIONALITY
// ========================================

/**
 * Escape JSON string
 */
function escapeJSON() {
    const input = elements.inputJson.value.trim();

    if (!input) {
        showStatus('Please enter some JSON to escape', 'error');
        return;
    }

    try {
        // Parse to validate
        const parsed = JSON.parse(input);
        // Convert to escaped string
        const escaped = JSON.stringify(JSON.stringify(parsed));

        // Remove outer quotes
        const result = escaped.slice(1, -1);

        elements.outputJson.textContent = result;
        showStatus('✓ JSON escaped successfully', 'success');
        showToast('JSON escaped ✓');

    } catch (error) {
        showStatus(`✗ Invalid JSON: ${error.message}`, 'error');
    }
}

/**
 * Unescape JSON string
 */
function unescapeJSON() {
    const input = elements.inputJson.value.trim();

    if (!input) {
        showStatus('Please enter an escaped JSON string', 'error');
        return;
    }

    try {
        // Try to parse as escaped JSON
        let unescaped;

        // Try parsing with quotes
        try {
            unescaped = JSON.parse(`"${input}"`);
        } catch {
            // If that fails, try parsing directly
            unescaped = JSON.parse(input);
        }

        // Parse the unescaped string as JSON to validate
        const parsed = JSON.parse(unescaped);
        state.currentJson = parsed;

        // Format the result
        const indent = state.currentIndent === 'tab' ? '\t' : state.currentIndent;
        const formatted = JSON.stringify(parsed, null, indent);

        displayFormattedJSON(formatted);
        showStatus('✓ JSON unescaped successfully', 'success');
        elements.validBadge.classList.remove('hidden');
        showToast('JSON unescaped ✓');

    } catch (error) {
        showStatus(`✗ Invalid escaped JSON: ${error.message}`, 'error');
    }
}

// ========================================
// SYNTAX HIGHLIGHTING
// ========================================

/**
 * Display JSON with syntax highlighting
 */
function displayFormattedJSON(json) {
    elements.outputJson.className = 'json-output';

    if (state.lineNumbersEnabled) {
        elements.outputJson.classList.add('with-line-numbers');
    }

    const highlighted = syntaxHighlight(json);

    if (state.lineNumbersEnabled) {
        // Wrap each line in a span for line number display
        const lines = highlighted.split('\n');
        const wrappedLines = lines.map(line => `<span class="line">${line || ' '}</span>`).join('\n');
        elements.outputJson.innerHTML = wrappedLines;
    } else {
        elements.outputJson.innerHTML = highlighted;
    }
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

/**
 * Display JSON error with line highlighting
 */
function displayJSONError(input, error) {
    elements.outputJson.className = 'json-output';

    // Try to extract line and column from error message
    const positionMatch = error.message.match(/position (\d+)/i);
    const lineMatch = error.message.match(/line (\d+)/i);
    const columnMatch = error.message.match(/column (\d+)/i);

    let errorHTML = '<div class="json-error">';
    errorHTML += '<div class="error-title">⚠ JSON Syntax Error</div>';
    errorHTML += `<div class="error-message">${escapeHtml(error.message)}</div>`;

    if (positionMatch || lineMatch) {
        const lines = input.split('\n');
        let errorLine = 0;
        let errorColumn = 0;

        if (positionMatch) {
            // Calculate line and column from position
            const position = parseInt(positionMatch[1]);
            let charCount = 0;

            for (let i = 0; i < lines.length; i++) {
                const lineLength = lines[i].length + 1; // +1 for newline
                if (charCount + lineLength > position) {
                    errorLine = i;
                    errorColumn = position - charCount;
                    break;
                }
                charCount += lineLength;
            }
        } else if (lineMatch) {
            errorLine = parseInt(lineMatch[1]) - 1; // Convert to 0-based
            if (columnMatch) {
                errorColumn = parseInt(columnMatch[1]) - 1;
            }
        }

        // Show context: 2 lines before, error line, 2 lines after
        const contextStart = Math.max(0, errorLine - 2);
        const contextEnd = Math.min(lines.length, errorLine + 3);

        errorHTML += '<div class="error-preview">';

        for (let i = contextStart; i < contextEnd; i++) {
            const lineNum = i + 1;
            const line = lines[i];
            const isErrorLine = i === errorLine;

            errorHTML += `<div style="margin-bottom: ${isErrorLine ? '0.5rem' : '0.25rem'};">`;
            errorHTML += `<span class="error-line-number${isErrorLine ? '" style="color: var(--color-error); font-weight: 900;' : ''}">${lineNum}:</span>`;
            errorHTML += `<span class="error-line"${isErrorLine ? ' style="background: rgba(255, 0, 110, 0.1); font-weight: 600;"' : ''}>${escapeHtml(line)}</span>`;

            if (isErrorLine && errorColumn > 0) {
                errorHTML += '<div>';
                errorHTML += `<span class="error-line-number"></span>`;
                errorHTML += `<span class="error-pointer">${' '.repeat(errorColumn)}^--- Error here</span>`;
                errorHTML += '</div>';
            }

            errorHTML += '</div>';
        }

        errorHTML += '</div>';
    }

    errorHTML += '</div>';
    elements.outputJson.innerHTML = errorHTML;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
