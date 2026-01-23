// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    DEBOUNCE_DELAY: 300,
    // Common URI schemes for validation
    KNOWN_SCHEMES: [
        'http', 'https', 'ftp', 'ftps', 'mailto', 'tel', 'sms',
        'file', 'data', 'javascript', 'about', 'blob',
        // Mobile deep links
        'fb', 'twitter', 'instagram', 'whatsapp', 'tg', 'slack',
        'discord', 'spotify', 'youtube', 'snapchat', 'linkedin',
        // Development
        'vscode', 'vscode-insiders', 'jetbrains', 'sublime',
        // Other common
        'magnet', 'ssh', 'git', 'svn', 'ldap', 'news', 'nntp',
        'irc', 'ircs', 'xmpp', 'sip', 'sips', 'geo', 'maps'
    ]
};

let state = {
    currentMode: 'encode-decode',
    encodeMode: 'auto', // 'encode' | 'decode' | 'auto' - DEFAULT TO AUTO
    input: '',
    output: '',
    queryParams: [],
    urlComponents: null,
    batchMode: 'encode'
};

let debounceTimer = null;

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    updateCharCounts();
    console.log('🔗 ToolBit URL Encoder initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchMode(mode);
        });
    });
    
    // Encode/Decode mode
    document.getElementById('input').addEventListener('input', handleInputChange);
    document.getElementById('modeSelector').addEventListener('change', handleModeChange);
    document.getElementById('pasteBtn').addEventListener('click', pasteFromClipboard);
    document.getElementById('sampleBtn').addEventListener('click', loadSample);
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('swapBtn').addEventListener('click', swapInputOutput);
    document.getElementById('copyOutputBtn').addEventListener('click', () => {
        copyToClipboard(state.output);
        showToast('Output copied! ⎘');
    });
    
    // Query Parser mode
    document.getElementById('parseBtn').addEventListener('click', parseQueryString);
    document.getElementById('queryInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') parseQueryString();
    });
    document.getElementById('addParamBtn').addEventListener('click', addParameter);
    document.getElementById('copyRebuiltBtn').addEventListener('click', () => {
        const url = document.getElementById('rebuiltURL').value;
        copyToClipboard(url);
        showToast('URL copied! ⎘');
    });
    
    // URL Breakdown mode
    document.getElementById('analyzeBtn').addEventListener('click', analyzeURL);
    document.getElementById('urlInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') analyzeURL();
    });
    document.getElementById('urlInput').addEventListener('input', (e) => {
        updateValidationIndicator('urlInput', 'urlValidation');
    });

    // Query Parser validation
    document.getElementById('queryInput').addEventListener('input', (e) => {
        updateValidationIndicator('queryInput', 'queryValidation');
    });
    
    // Batch mode
    document.getElementById('processBatchBtn').addEventListener('click', processBatch);
    document.getElementById('copyBatchBtn').addEventListener('click', () => {
        const output = document.getElementById('batchOutput').value;
        copyToClipboard(output);
        showToast('Batch output copied! ⎘');
    });
    document.getElementById('downloadBatchBtn').addEventListener('click', downloadBatchCSV);
}

// ========================================
// MODE SWITCHING
// ========================================
function switchMode(mode) {
    state.currentMode = mode;
    
    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Update content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const modeMap = {
        'encode-decode': 'encodeDecodeMode',
        'query-parser': 'queryParserMode',
        'url-breakdown': 'urlBreakdownMode',
        'batch': 'batchMode'
    };
    
    document.getElementById(modeMap[mode]).classList.add('active');
}

// ========================================
// ENCODE/DECODE MODE
// ========================================
function handleInputChange(e) {
    state.input = e.target.value;
    updateCharCounts();
    
    // Debounced conversion
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        convertText();
    }, CONFIG.DEBOUNCE_DELAY);
}

function handleModeChange(e) {
    state.encodeMode = e.target.value;
    convertText();
}

function convertText() {
    const input = state.input;
    
    if (!input) {
        state.output = '';
        document.getElementById('output').value = '';
        updateCharCounts();
        return;
    }
    
    let output = '';
    let mode = state.encodeMode;
    
    // Auto-detect mode
    if (mode === 'auto') {
        mode = detectMode(input);
    }
    
    try {
        if (mode === 'encode') {
            output = encodeURL(input);
        } else {
            output = decodeURL(input);
        }
    } catch (error) {
        output = 'Error: ' + error.message;
    }
    
    state.output = output;
    document.getElementById('output').value = output;
    updateCharCounts();
    
    // Update info text
    const infoText = mode === 'encode' ? 'Encoded' : 'Decoded';
    document.getElementById('outputInfo').textContent = infoText;
}

function encodeURL(str) {
    return encodeURIComponent(str);
}

function decodeURL(str) {
    try {
        return decodeURIComponent(str);
    } catch (e) {
        throw new Error('Invalid URL encoding');
    }
}

function detectMode(str) {
    // Check if string contains percent-encoded characters
    if (/%[0-9A-Fa-f]{2}/.test(str)) {
        return 'decode';
    }
    return 'encode';
}

function updateCharCounts() {
    const input = state.input;
    const output = state.output;
    
    document.getElementById('inputCharCount').textContent = `${input.length} characters`;
    document.getElementById('outputCharCount').textContent = `${output.length} characters`;
}

function loadSample() {
    const mode = state.encodeMode;
    const samples = {
        encode: [
            'hello world',
            'user@example.com',
            'https://example.com/path with spaces',
            'key=value&foo=bar baz'
        ],
        decode: [
            'hello%20world',
            'user%40example.com',
            'https%3A%2F%2Fexample.com%2Fpath',
            'key%3Dvalue%26foo%3Dbar'
        ]
    };
    
    const sampleList = mode === 'decode' ? samples.decode : samples.encode;
    const sample = sampleList[Math.floor(Math.random() * sampleList.length)];
    
    document.getElementById('input').value = sample;
    state.input = sample;
    convertText();
    updateCharCounts();
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('input').value = text;
        state.input = text;
        convertText();
        updateCharCounts();
        showToast('Pasted from clipboard! 📋');
    } catch (error) {
        showToast('Paste permission denied. Please paste manually (Ctrl+V)');
    }
}

function clearInput() {
    document.getElementById('input').value = '';
    document.getElementById('output').value = '';
    state.input = '';
    state.output = '';
    updateCharCounts();
}

function swapInputOutput() {
    const input = state.input;
    const output = state.output;
    
    document.getElementById('input').value = output;
    document.getElementById('output').value = input;
    
    state.input = output;
    state.output = input;
    
    updateCharCounts();
    
    showToast('Swapped! ⇄');
}

// ========================================
// QUERY PARSER MODE
// ========================================
function parseQueryString() {
    const input = document.getElementById('queryInput').value.trim();
    
    if (!input) {
        showToast('Please enter a URL or query string');
        return;
    }
    
    try {
        const params = extractQueryParams(input);
        state.queryParams = params;
        renderParams();
        document.getElementById('paramsSection').classList.remove('hidden');
        showToast('Parsed successfully! ✓');
    } catch (error) {
        showToast('Error parsing URL: ' + error.message);
    }
}

function extractQueryParams(input) {
    let searchParams;
    
    try {
        // Try parsing as full URL
        const url = new URL(input);
        searchParams = url.searchParams;
    } catch (e) {
        // Try parsing as query string
        const queryString = input.startsWith('?') ? input.slice(1) : input;
        searchParams = new URLSearchParams(queryString);
    }
    
    const params = [];
    for (const [key, value] of searchParams.entries()) {
        params.push({ key, value });
    }
    
    return params;
}

function renderParams() {
    const tbody = document.getElementById('paramsBody');
    tbody.innerHTML = '';
    
    state.queryParams.forEach((param, index) => {
        const row = createParamRow(param, index);
        tbody.appendChild(row);
    });
    
    rebuildURL();
}

function createParamRow(param, index) {
    const row = document.createElement('tr');
    row.className = 'param-row';
    
    row.innerHTML = `
        <td>
            <input 
                type="text" 
                class="param-key-input" 
                value="${escapeHtml(param.key)}" 
                data-index="${index}"
            >
        </td>
        <td>
            <input 
                type="text" 
                class="param-value-input" 
                value="${escapeHtml(param.value)}" 
                data-index="${index}"
            >
        </td>
        <td class="param-actions">
            <button class="delete-param-btn" data-index="${index}">×</button>
        </td>
    `;
    
    // Event listeners
    row.querySelector('.param-key-input').addEventListener('input', (e) => {
        state.queryParams[index].key = e.target.value;
        rebuildURL();
    });
    
    row.querySelector('.param-value-input').addEventListener('input', (e) => {
        state.queryParams[index].value = e.target.value;
        rebuildURL();
    });
    
    row.querySelector('.delete-param-btn').addEventListener('click', () => {
        deleteParameter(index);
    });
    
    return row;
}

function addParameter() {
    state.queryParams.push({ key: 'key', value: 'value' });
    renderParams();
    showToast('Parameter added');
}

function deleteParameter(index) {
    state.queryParams.splice(index, 1);
    renderParams();
    showToast('Parameter deleted');
}

function rebuildURL() {
    const baseURL = document.getElementById('queryInput').value.split('?')[0];
    const queryString = state.queryParams
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
    
    const rebuiltURL = queryString ? `${baseURL}?${queryString}` : baseURL;
    document.getElementById('rebuiltURL').value = rebuiltURL;
}

// ========================================
// URL VALIDATION
// ========================================
function validateURL(urlString) {
    if (!urlString || !urlString.trim()) {
        return { valid: false, type: 'empty', message: '' };
    }

    urlString = urlString.trim();

    // Check for URI scheme pattern
    const schemeMatch = urlString.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):(.+)$/);

    if (schemeMatch) {
        const scheme = schemeMatch[1].toLowerCase();
        const rest = schemeMatch[2];

        // Check if it's a known scheme
        const isKnownScheme = CONFIG.KNOWN_SCHEMES.includes(scheme);

        // Special validation for different scheme types
        if (scheme === 'mailto') {
            const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+/.test(rest);
            return {
                valid: emailValid,
                type: 'mailto',
                scheme: scheme,
                message: emailValid ? 'Valid mailto link' : 'Invalid email format'
            };
        }

        if (scheme === 'tel' || scheme === 'sms') {
            const phoneValid = /^[+\d\s\-()]+/.test(rest);
            return {
                valid: phoneValid,
                type: scheme,
                scheme: scheme,
                message: phoneValid ? `Valid ${scheme} link` : 'Invalid phone format'
            };
        }

        if (scheme === 'data') {
            return {
                valid: rest.includes(','),
                type: 'data',
                scheme: scheme,
                message: 'Data URI'
            };
        }

        // For http/https and other URL-like schemes
        try {
            new URL(urlString);
            return {
                valid: true,
                type: isKnownScheme ? 'known' : 'custom',
                scheme: scheme,
                message: isKnownScheme ? `Valid ${scheme.toUpperCase()} URL` : `Custom scheme: ${scheme}://`
            };
        } catch (e) {
            // URL parsing failed but has valid scheme structure
            return {
                valid: true,
                type: 'custom',
                scheme: scheme,
                message: `${isKnownScheme ? 'Known' : 'Custom'} URI: ${scheme}://`
            };
        }
    }

    // No scheme - check if it looks like a URL
    if (/^[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z]{2,})+/.test(urlString)) {
        return {
            valid: true,
            type: 'incomplete',
            scheme: null,
            message: 'Missing protocol (add https://)'
        };
    }

    // Might be a query string or partial URL
    if (urlString.startsWith('?') || urlString.includes('=')) {
        return {
            valid: true,
            type: 'query',
            scheme: null,
            message: 'Query string'
        };
    }

    return { valid: false, type: 'invalid', message: 'Not a valid URL' };
}

function updateValidationIndicator(inputId, indicatorId) {
    const input = document.getElementById(inputId);
    const indicator = document.getElementById(indicatorId);

    if (!indicator) return;

    const result = validateURL(input.value);

    if (!input.value.trim()) {
        indicator.className = 'validation-indicator';
        indicator.innerHTML = '';
        return;
    }

    if (result.valid) {
        indicator.className = 'validation-indicator valid';
        indicator.innerHTML = `<span class="validation-icon">✓</span><span class="validation-text">${result.message}</span>`;
    } else if (result.type === 'incomplete') {
        indicator.className = 'validation-indicator warning';
        indicator.innerHTML = `<span class="validation-icon">⚠</span><span class="validation-text">${result.message}</span>`;
    } else {
        indicator.className = 'validation-indicator invalid';
        indicator.innerHTML = `<span class="validation-icon">✗</span><span class="validation-text">${result.message}</span>`;
    }
}

// ========================================
// URL BREAKDOWN MODE
// ========================================
function analyzeURL() {
    const input = document.getElementById('urlInput').value.trim();

    if (!input) {
        showToast('Please enter a URL');
        return;
    }

    // Try to parse with validation
    const validation = validateURL(input);

    try {
        const components = parseURLComponents(input);
        state.urlComponents = components;
        renderComponents(components);
        document.getElementById('componentsSection').classList.remove('hidden');
        showToast('URL analyzed! ✓');
    } catch (error) {
        // For non-standard URIs, show what we can parse
        if (validation.valid && validation.scheme) {
            const components = parseCustomURI(input, validation.scheme);
            state.urlComponents = components;
            renderComponents(components);
            document.getElementById('componentsSection').classList.remove('hidden');
            showToast(`${validation.scheme.toUpperCase()} URI analyzed! ✓`);
        } else {
            showToast('Error: Invalid URL format');
        }
    }
}

function parseCustomURI(uriString, scheme) {
    // Parse non-standard URIs that URL() can't handle
    const withoutScheme = uriString.replace(/^[^:]+:\/?\/?/, '');

    const components = {
        protocol: {
            value: scheme + ':',
            description: getSchemeDescription(scheme)
        }
    };

    // Try to extract parts based on scheme type
    if (scheme === 'mailto') {
        const parts = withoutScheme.split('?');
        components.recipient = {
            value: parts[0],
            description: 'Email recipient address'
        };
        if (parts[1]) {
            components.search = {
                value: '?' + parts[1],
                description: 'Email parameters (subject, body, cc, bcc)'
            };
        }
    } else if (scheme === 'tel' || scheme === 'sms') {
        components.number = {
            value: withoutScheme.split('?')[0],
            description: 'Phone number'
        };
    } else {
        // Generic parsing for other schemes
        components.path = {
            value: withoutScheme,
            description: 'URI path/data'
        };
    }

    return components;
}

function getSchemeDescription(scheme) {
    const descriptions = {
        'http': 'Hypertext Transfer Protocol (unencrypted)',
        'https': 'Hypertext Transfer Protocol Secure (encrypted)',
        'ftp': 'File Transfer Protocol',
        'mailto': 'Email address link',
        'tel': 'Telephone number link',
        'sms': 'SMS message link',
        'file': 'Local file system path',
        'data': 'Inline data URI',
        'javascript': 'JavaScript code execution',
        'vscode': 'Visual Studio Code deep link',
        'spotify': 'Spotify app deep link',
        'slack': 'Slack app deep link',
        'discord': 'Discord app deep link',
        'fb': 'Facebook app deep link',
        'twitter': 'Twitter/X app deep link',
        'instagram': 'Instagram app deep link',
        'whatsapp': 'WhatsApp deep link',
        'tg': 'Telegram deep link',
        'youtube': 'YouTube app deep link',
        'magnet': 'Magnet link (P2P)',
        'ssh': 'Secure Shell connection',
        'git': 'Git repository URL'
    };
    return descriptions[scheme] || `Custom URI scheme: ${scheme}`;
}

function parseURLComponents(urlString) {
    const url = new URL(urlString);
    const scheme = url.protocol.replace(':', '');

    return {
        protocol: { value: url.protocol, description: getSchemeDescription(scheme) },
        username: { value: url.username, description: 'Username for authentication (if present)' },
        password: { value: url.password, description: 'Password for authentication (if present)' },
        hostname: { value: url.hostname, description: 'Domain name or IP address' },
        port: { value: url.port, description: 'Port number (default: 80 for HTTP, 443 for HTTPS)' },
        pathname: { value: url.pathname, description: 'Path to the resource on the server' },
        search: { value: url.search, description: 'Query string (parameters after ?)' },
        hash: { value: url.hash, description: 'Fragment identifier (anchor after #)' },
        origin: { value: url.origin, description: 'Protocol + hostname + port' }
    };
}

function renderComponents(components) {
    const grid = document.getElementById('componentsGrid');
    grid.innerHTML = '';

    const componentConfig = {
        protocol: { icon: '🔒', name: 'Protocol', class: 'protocol' },
        username: { icon: '👤', name: 'Username', class: 'username' },
        password: { icon: '🔑', name: 'Password', class: 'password' },
        hostname: { icon: '🌐', name: 'Hostname', class: 'hostname' },
        port: { icon: '🔌', name: 'Port', class: 'port' },
        pathname: { icon: '📂', name: 'Path', class: 'pathname' },
        search: { icon: '❓', name: 'Query String', class: 'search' },
        hash: { icon: '#️⃣', name: 'Hash/Fragment', class: 'hash' },
        origin: { icon: '🏠', name: 'Origin', class: 'origin' },
        // Custom URI components
        recipient: { icon: '📧', name: 'Recipient', class: 'hostname' },
        number: { icon: '📞', name: 'Number', class: 'hostname' },
        path: { icon: '📂', name: 'Path/Data', class: 'pathname' }
    };

    for (const [key, data] of Object.entries(components)) {
        if (!data.value) continue;

        const config = componentConfig[key] || { icon: '📋', name: key, class: 'pathname' };
        const card = createComponentCard(key, data, config);
        grid.appendChild(card);
    }
}

function createComponentCard(key, data, config) {
    const card = document.createElement('div');
    card.className = `component-card ${config.class}`;
    
    const displayValue = key === 'password' ? '•••••••' : data.value;
    
    card.innerHTML = `
        <div class="component-header">
            <span class="component-name">
                <span class="component-icon">${config.icon}</span>
                ${config.name}
            </span>
            <button class="copy-component-btn" data-value="${escapeHtml(data.value)}">
                Copy
            </button>
        </div>
        <div class="component-value">${escapeHtml(displayValue)}</div>
        <div class="component-description">${data.description}</div>
    `;
    
    card.querySelector('.copy-component-btn').addEventListener('click', (e) => {
        const value = e.currentTarget.dataset.value;
        copyToClipboard(value);
        showToast(`${config.name} copied! ⎘`);
    });
    
    return card;
}

// ========================================
// BATCH MODE
// ========================================
function processBatch() {
    const input = document.getElementById('batchInput').value;
    const mode = document.getElementById('batchModeSelector').value;
    
    if (!input.trim()) {
        showToast('Please enter some URLs');
        return;
    }
    
    const lines = input.split('\n').filter(line => line.trim());
    const results = [];
    let successCount = 0;
    let errorCount = 0;
    
    lines.forEach(line => {
        try {
            const result = mode === 'encode' ? encodeURL(line) : decodeURL(line);
            results.push(result);
            successCount++;
        } catch (error) {
            results.push('ERROR: ' + error.message);
            errorCount++;
        }
    });
    
    const output = results.join('\n');
    document.getElementById('batchOutput').value = output;
    
    // Show stats
    const statsEl = document.getElementById('batchStats');
    const statsText = document.getElementById('batchStatsText');
    statsText.textContent = `Processed ${lines.length} URLs | ✓ ${successCount} successful | ✗ ${errorCount} errors`;
    statsEl.classList.remove('hidden');
    
    showToast('Batch processing complete! ✓');
}

function downloadBatchCSV() {
    const input = document.getElementById('batchInput').value;
    const output = document.getElementById('batchOutput').value;
    
    if (!input.trim() || !output.trim()) {
        showToast('Process batch first');
        return;
    }
    
    const inputLines = input.split('\n').filter(line => line.trim());
    const outputLines = output.split('\n');
    
    let csv = 'Input,Output\n';
    inputLines.forEach((line, i) => {
        csv += `"${line.replace(/"/g, '""')}","${outputLines[i].replace(/"/g, '""')}"\n`;
    });
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-batch-results.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('CSV downloaded! 📥');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, CONFIG.TOAST_DURATION);
}

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
            toggleEducationBtn.querySelector('.toggle-text').textContent = 'Learn More About URL Encoding';
        }

        // Optional: Track if you have analytics
        if (typeof trackEvent === 'function') {
            trackEvent('Educational', isHidden ? 'Expand' : 'Collapse', 'URL');
        }
    });
}

// ========================================
// START
// ========================================
document.addEventListener('DOMContentLoaded', init);