// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    MAX_FILE_SIZE: 100 * 1024 * 1024 // 100MB
};

let state = {
    currentMode: 'text',
    textInput: '',
    selectedAlgorithms: ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'],
    currentFile: null,
    currentFiles: [], // For batch file hashing
    hmac: {
        message: '',
        key: '',
        algorithm: 'SHA-256',
        keyVisible: false
    },
    comparison: {
        hash1: '',
        hash2: ''
    },
    uppercaseHashes: false,
    checksumEntries: [] // For parsed checksum files
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    updateCharCount();
    console.log('🔐 ToolBit Hash Generator initialized');
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
    
    // Text mode
    document.getElementById('textInput').addEventListener('input', updateCharCount);
    document.getElementById('sampleBtn').addEventListener('click', loadSampleText);
    document.getElementById('clearTextBtn').addEventListener('click', clearTextInput);
    document.getElementById('generateBtn').addEventListener('click', generateTextHashes);
    
    // Algorithm checkboxes
    document.querySelectorAll('.algo-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedAlgorithms);
    });
    
    // File mode
    const fileInput = document.getElementById('fileInput');
    const dropZone = document.getElementById('fileDropZone');
    
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleFileDrop);
    fileInput.addEventListener('change', handleFileSelect);
    document.getElementById('removeFileBtn').addEventListener('click', removeFile);
    document.getElementById('generateFileHashBtn').addEventListener('click', generateFileHashes);
    
    // HMAC mode
    document.getElementById('toggleKeyBtn').addEventListener('click', toggleKeyVisibility);
    document.getElementById('generateHMACBtn').addEventListener('click', generateHMAC);
    
    // Compare mode
    document.getElementById('hash1').addEventListener('input', autoCompare);
    document.getElementById('hash2').addEventListener('input', autoCompare);
    document.getElementById('compareBtn').addEventListener('click', compareHashes);

    // Case toggle
    const caseToggle = document.getElementById('caseToggle');
    if (caseToggle) {
        caseToggle.addEventListener('click', toggleHashCase);
    }

    // Batch file mode
    const batchDropZone = document.getElementById('batchDropZone');
    const batchFileInput = document.getElementById('batchFileInput');
    if (batchDropZone && batchFileInput) {
        batchDropZone.addEventListener('click', () => batchFileInput.click());
        batchDropZone.addEventListener('dragover', handleDragOver);
        batchDropZone.addEventListener('dragleave', handleDragLeave);
        batchDropZone.addEventListener('drop', handleBatchFileDrop);
        batchFileInput.addEventListener('change', handleBatchFileSelect);
        document.getElementById('clearBatchBtn').addEventListener('click', clearBatchFiles);
        document.getElementById('generateBatchHashBtn').addEventListener('click', generateBatchHashes);
    }

    // Checksum verification
    const checksumInput = document.getElementById('checksumInput');
    if (checksumInput) {
        checksumInput.addEventListener('input', parseChecksumInput);
        document.getElementById('verifyChecksumBtn').addEventListener('click', verifyChecksums);
    }
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
        content.classList.toggle('active', content.id === `${mode}Mode`);
    });
}

// ========================================
// TEXT MODE
// ========================================
function updateCharCount() {
    const text = document.getElementById('textInput').value;
    state.textInput = text;
    document.getElementById('charCount').textContent = `${text.length} characters`;
}

function loadSampleText() {
    const sampleText = "The quick brown fox jumps over the lazy dog";
    document.getElementById('textInput').value = sampleText;
    updateCharCount();
}

function clearTextInput() {
    document.getElementById('textInput').value = '';
    updateCharCount();
    document.getElementById('hashOutput').innerHTML = '';
}

function updateSelectedAlgorithms() {
    state.selectedAlgorithms = Array.from(
        document.querySelectorAll('.algo-checkbox input:checked')
    ).map(checkbox => checkbox.value);
}

async function generateTextHashes() {
    const text = state.textInput;
    
    if (!text) {
        showToast('Please enter some text to hash');
        return;
    }
    
    if (state.selectedAlgorithms.length === 0) {
        showToast('Please select at least one algorithm');
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    btn.classList.add('generating');
    btn.disabled = true;
    
    const hashes = {};
    
    for (const algo of state.selectedAlgorithms) {
        try {
            hashes[algo] = await generateHash(text, algo);
        } catch (error) {
            console.error(`Error generating ${algo}:`, error);
            hashes[algo] = 'Error generating hash';
        }
    }
    
    displayHashes(hashes);
    
    btn.classList.remove('generating');
    btn.disabled = false;
    
    showToast('Hashes generated! 🔐');
}

// ========================================
// HASH GENERATION
// ========================================
async function generateHash(text, algorithm) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    
    switch (algorithm) {
        case 'MD5':
            return CryptoJS.MD5(text).toString();
            
        case 'SHA-1':
            return await subtleDigest('SHA-1', data);
            
        case 'SHA-256':
            return await subtleDigest('SHA-256', data);
            
        case 'SHA-512':
            return await subtleDigest('SHA-512', data);
            
        case 'SHA3-256':
            return CryptoJS.SHA3(text, { outputLength: 256 }).toString();
            
        case 'SHA3-512':
            return CryptoJS.SHA3(text, { outputLength: 512 }).toString();
            
        default:
            throw new Error(`Unknown algorithm: ${algorithm}`);
    }
}

async function subtleDigest(algorithm, data) {
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function displayHashes(hashes, outputId = 'hashOutput') {
    const output = document.getElementById(outputId);
    output.innerHTML = '';

    for (const [algo, hash] of Object.entries(hashes)) {
        const hashBox = createHashBox(algo, hash);
        output.appendChild(hashBox);
    }
}

function formatHash(hash) {
    return state.uppercaseHashes ? hash.toUpperCase() : hash.toLowerCase();
}

function toggleHashCase() {
    state.uppercaseHashes = !state.uppercaseHashes;

    // Update toggle button text
    const toggle = document.getElementById('caseToggle');
    if (toggle) {
        toggle.textContent = state.uppercaseHashes ? 'Aa' : 'AA';
        toggle.title = state.uppercaseHashes ? 'Switch to lowercase' : 'Switch to uppercase';
    }

    // Re-render all visible hash values
    document.querySelectorAll('.hash-value').forEach(el => {
        const hash = el.dataset.hash;
        if (hash) {
            el.textContent = formatHash(hash);
        }
    });

    showToast(state.uppercaseHashes ? 'Uppercase hashes' : 'Lowercase hashes');
}

function createHashBox(algorithm, hash) {
    const box = document.createElement('div');
    box.className = `hash-box ${algorithm.toLowerCase().replace(/[-_]/g, '')}`;
    const displayHash = formatHash(hash);

    box.innerHTML = `
        <div class="hash-header">
            <span class="hash-algorithm">${algorithm}</span>
            <button class="hash-copy-btn" onclick="copyHash('${hash}', '${algorithm}')">
                ⎘ Copy
            </button>
        </div>
        <div class="hash-value" data-hash="${hash}" onclick="copyHash('${hash}', '${algorithm}')" title="Click to copy">
            ${displayHash}
        </div>
    `;

    return box;
}

window.copyHash = function(hash, algorithm) {
    copyToClipboard(formatHash(hash));
    showToast(`${algorithm} copied! ⎘`);
};

// ========================================
// FILE MODE
// ========================================
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        showToast(`File too large! Max ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
        return;
    }
    
    state.currentFile = file;
    
    // Update UI
    document.getElementById('fileDropZone').classList.add('hidden');
    document.getElementById('fileInfo').classList.remove('hidden');
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
}

function removeFile() {
    state.currentFile = null;
    document.getElementById('fileDropZone').classList.remove('hidden');
    document.getElementById('fileInfo').classList.add('hidden');
    document.getElementById('fileInput').value = '';
    document.getElementById('fileHashOutput').innerHTML = '';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function generateFileHashes() {
    if (!state.currentFile) {
        showToast('Please select a file first');
        return;
    }
    
    const btn = document.getElementById('generateFileHashBtn');
    btn.classList.add('generating');
    btn.disabled = true;
    
    const progressBar = document.getElementById('fileProgress');
    progressBar.classList.remove('hidden');
    
    try {
        const arrayBuffer = await readFileAsArrayBuffer(state.currentFile);
        const hashes = await generateAllFileHashes(arrayBuffer);
        
        displayFileHashes(hashes);
        showToast('File hashes generated! 🔐');
    } catch (error) {
        console.error('Error generating file hashes:', error);
        showToast('Error generating hashes');
    } finally {
        btn.classList.remove('generating');
        btn.disabled = false;
        progressBar.classList.add('hidden');
    }
}

function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

async function generateAllFileHashes(arrayBuffer) {
    const hashes = {};
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Web Crypto API hashes
    hashes['SHA-1'] = await subtleDigest('SHA-1', uint8Array);
    hashes['SHA-256'] = await subtleDigest('SHA-256', uint8Array);
    hashes['SHA-512'] = await subtleDigest('SHA-512', uint8Array);
    
    // CryptoJS hashes
    const wordArray = CryptoJS.lib.WordArray.create(uint8Array);
    hashes['MD5'] = CryptoJS.MD5(wordArray).toString();
    
    return hashes;
}

function displayFileHashes(hashes) {
    const output = document.getElementById('fileHashOutput');
    output.innerHTML = '';

    for (const [algo, hash] of Object.entries(hashes)) {
        const hashBox = createHashBox(algo, hash);
        output.appendChild(hashBox);
    }
}

// ========================================
// BATCH FILE MODE
// ========================================
function handleBatchFileDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = Array.from(e.dataTransfer.files);
    addBatchFiles(files);
}

function handleBatchFileSelect(e) {
    const files = Array.from(e.target.files);
    addBatchFiles(files);
}

function addBatchFiles(files) {
    for (const file of files) {
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showToast(`${file.name} too large (max ${CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB)`);
            continue;
        }
        // Avoid duplicates
        if (!state.currentFiles.find(f => f.name === file.name && f.size === file.size)) {
            state.currentFiles.push(file);
        }
    }
    renderBatchFileList();
}

function renderBatchFileList() {
    const list = document.getElementById('batchFileList');
    const countEl = document.getElementById('batchFileCount');

    if (state.currentFiles.length === 0) {
        list.innerHTML = '<p class="empty-list">No files selected</p>';
        countEl.textContent = '0 files';
        return;
    }

    countEl.textContent = `${state.currentFiles.length} file${state.currentFiles.length > 1 ? 's' : ''}`;

    list.innerHTML = state.currentFiles.map((file, index) => `
        <div class="batch-file-item">
            <span class="batch-file-icon">📄</span>
            <span class="batch-file-name">${file.name}</span>
            <span class="batch-file-size">${formatFileSize(file.size)}</span>
            <button class="btn-link batch-remove-btn" onclick="removeBatchFile(${index})">✕</button>
        </div>
    `).join('');
}

window.removeBatchFile = function(index) {
    state.currentFiles.splice(index, 1);
    renderBatchFileList();
};

function clearBatchFiles() {
    state.currentFiles = [];
    document.getElementById('batchFileInput').value = '';
    document.getElementById('batchHashOutput').innerHTML = '';
    renderBatchFileList();
}

async function generateBatchHashes() {
    if (state.currentFiles.length === 0) {
        showToast('Please select files first');
        return;
    }

    const btn = document.getElementById('generateBatchHashBtn');
    btn.classList.add('generating');
    btn.disabled = true;

    const output = document.getElementById('batchHashOutput');
    output.innerHTML = '';

    for (const file of state.currentFiles) {
        const fileSection = document.createElement('div');
        fileSection.className = 'batch-file-result';
        fileSection.innerHTML = `
            <div class="batch-file-header">
                <span class="batch-file-icon">📄</span>
                <strong>${file.name}</strong>
                <span class="batch-file-size">${formatFileSize(file.size)}</span>
            </div>
            <div class="batch-file-hashes"></div>
        `;
        output.appendChild(fileSection);

        try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const hashes = await generateAllFileHashes(arrayBuffer);

            const hashesContainer = fileSection.querySelector('.batch-file-hashes');
            for (const [algo, hash] of Object.entries(hashes)) {
                const hashBox = createHashBox(algo, hash);
                hashesContainer.appendChild(hashBox);
            }
        } catch (error) {
            console.error(`Error hashing ${file.name}:`, error);
            fileSection.querySelector('.batch-file-hashes').innerHTML =
                '<p class="error-text">Error generating hashes</p>';
        }
    }

    btn.classList.remove('generating');
    btn.disabled = false;
    showToast(`Hashed ${state.currentFiles.length} file(s)! 🔐`);
}

// ========================================
// CHECKSUM VERIFICATION
// ========================================
function parseChecksumInput() {
    const input = document.getElementById('checksumInput').value.trim();
    state.checksumEntries = [];

    if (!input) {
        updateChecksumPreview();
        return;
    }

    const lines = input.split('\n').filter(line => line.trim());

    for (const line of lines) {
        const entry = parseChecksumLine(line);
        if (entry) {
            state.checksumEntries.push(entry);
        }
    }

    updateChecksumPreview();
}

function parseChecksumLine(line) {
    // Format 1: hash  filename (GNU coreutils style, two spaces)
    // Format 2: hash *filename (binary mode)
    // Format 3: hash filename (single space)
    // Format 4: ALGO (filename) = hash (BSD style)

    line = line.trim();

    // BSD style: SHA256 (filename) = hash
    const bsdMatch = line.match(/^(MD5|SHA-?1|SHA-?256|SHA-?512|SHA3-?256|SHA3-?512)\s*\((.+)\)\s*=\s*([a-fA-F0-9]+)$/i);
    if (bsdMatch) {
        return {
            algorithm: normalizeAlgorithm(bsdMatch[1]),
            filename: bsdMatch[2],
            hash: bsdMatch[3].toLowerCase()
        };
    }

    // GNU style: hash  filename or hash *filename
    const gnuMatch = line.match(/^([a-fA-F0-9]+)\s+[\*]?(.+)$/);
    if (gnuMatch) {
        const hash = gnuMatch[1].toLowerCase();
        return {
            algorithm: detectAlgorithmFromLength(hash.length),
            filename: gnuMatch[2].trim(),
            hash: hash
        };
    }

    return null;
}

function normalizeAlgorithm(algo) {
    algo = algo.toUpperCase().replace(/-/g, '');
    const map = {
        'MD5': 'MD5',
        'SHA1': 'SHA-1',
        'SHA256': 'SHA-256',
        'SHA512': 'SHA-512',
        'SHA3256': 'SHA3-256',
        'SHA3512': 'SHA3-512'
    };
    return map[algo] || algo;
}

function detectAlgorithmFromLength(length) {
    const lengthMap = {
        32: 'MD5',
        40: 'SHA-1',
        64: 'SHA-256',
        128: 'SHA-512'
    };
    return lengthMap[length] || 'Unknown';
}

function updateChecksumPreview() {
    const preview = document.getElementById('checksumPreview');

    if (state.checksumEntries.length === 0) {
        preview.innerHTML = '<p class="empty-list">Paste checksum file contents above</p>';
        return;
    }

    preview.innerHTML = state.checksumEntries.map((entry, i) => `
        <div class="checksum-entry" data-index="${i}">
            <span class="checksum-algo">${entry.algorithm}</span>
            <span class="checksum-filename">${entry.filename}</span>
            <span class="checksum-status" id="checksumStatus${i}">⏳</span>
        </div>
    `).join('');
}

async function verifyChecksums() {
    if (state.checksumEntries.length === 0) {
        showToast('No checksums to verify');
        return;
    }

    const fileInput = document.getElementById('checksumFileInput');
    const files = Array.from(fileInput.files);

    if (files.length === 0) {
        showToast('Please select files to verify');
        return;
    }

    const btn = document.getElementById('verifyChecksumBtn');
    btn.classList.add('generating');
    btn.disabled = true;

    // Create a map of filename -> file
    const fileMap = new Map();
    for (const file of files) {
        fileMap.set(file.name, file);
    }

    let matched = 0, failed = 0, notFound = 0;

    for (let i = 0; i < state.checksumEntries.length; i++) {
        const entry = state.checksumEntries[i];
        const statusEl = document.getElementById(`checksumStatus${i}`);
        const entryEl = statusEl.closest('.checksum-entry');

        const file = fileMap.get(entry.filename);

        if (!file) {
            statusEl.textContent = '❓';
            statusEl.title = 'File not found';
            entryEl.classList.add('not-found');
            notFound++;
            continue;
        }

        try {
            const arrayBuffer = await readFileAsArrayBuffer(file);
            const hashes = await generateAllFileHashes(arrayBuffer);
            const generatedHash = hashes[entry.algorithm]?.toLowerCase();

            if (generatedHash === entry.hash) {
                statusEl.textContent = '✅';
                statusEl.title = 'Match!';
                entryEl.classList.add('match');
                matched++;
            } else {
                statusEl.textContent = '❌';
                statusEl.title = `Expected: ${entry.hash}\nGot: ${generatedHash}`;
                entryEl.classList.add('no-match');
                failed++;
            }
        } catch (error) {
            statusEl.textContent = '⚠️';
            statusEl.title = 'Error reading file';
            entryEl.classList.add('error');
            failed++;
        }
    }

    btn.classList.remove('generating');
    btn.disabled = false;

    const total = state.checksumEntries.length;
    showToast(`Verified: ${matched}/${total} matched, ${failed} failed, ${notFound} not found`);
}

// ========================================
// HMAC MODE
// ========================================
function toggleKeyVisibility() {
    state.hmac.keyVisible = !state.hmac.keyVisible;
    const input = document.getElementById('hmacKey');
    input.type = state.hmac.keyVisible ? 'text' : 'password';
    
    const icon = document.querySelector('.eye-icon');
    icon.textContent = state.hmac.keyVisible ? '👁️' : '👁️';
}

async function generateHMAC() {
    const message = document.getElementById('hmacMessage').value;
    const key = document.getElementById('hmacKey').value;
    const algorithm = document.getElementById('hmacAlgorithm').value;
    
    if (!message || !key) {
        showToast('Please enter both message and key');
        return;
    }
    
    const btn = document.getElementById('generateHMACBtn');
    btn.classList.add('generating');
    btn.disabled = true;
    
    try {
        const hmac = await generateHMACHash(message, key, algorithm);
        displayHMAC(algorithm, hmac);
        showToast('HMAC generated! 🔐');
    } catch (error) {
        console.error('Error generating HMAC:', error);
        showToast('Error generating HMAC');
    } finally {
        btn.classList.remove('generating');
        btn.disabled = false;
    }
}

async function generateHMACHash(message, key, algorithm) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: algorithm },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        messageData
    );
    
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function displayHMAC(algorithm, hmac) {
    const output = document.getElementById('hmacOutput');
    output.innerHTML = '';
    
    const hashBox = createHashBox(`HMAC-${algorithm}`, hmac);
    hashBox.classList.add('hmac');
    output.appendChild(hashBox);
}

// ========================================
// COMPARE MODE
// ========================================
let compareDebounceTimer;

function autoCompare() {
    clearTimeout(compareDebounceTimer);
    compareDebounceTimer = setTimeout(compareHashes, 500);
}

function compareHashes() {
    const hash1 = document.getElementById('hash1').value.trim().toLowerCase();
    const hash2 = document.getElementById('hash2').value.trim().toLowerCase();
    
    const indicator = document.getElementById('comparisonResult');
    
    if (!hash1 || !hash2) {
        indicator.className = 'comparison-indicator';
        indicator.innerHTML = `
            <span class="status-icon">⏳</span>
            <span class="status-text">Enter hashes to compare</span>
        `;
        return;
    }
    
    if (hash1.length !== hash2.length) {
        indicator.className = 'comparison-indicator different-length';
        indicator.innerHTML = `
            <span class="status-icon">⚠️</span>
            <span class="status-text">Different lengths - Different algorithms?</span>
        `;
        return;
    }
    
    if (hash1 === hash2) {
        indicator.className = 'comparison-indicator match';
        indicator.innerHTML = `
            <span class="status-icon">✅</span>
            <span class="status-text">Hashes Match! File integrity verified.</span>
        `;
    } else {
        indicator.className = 'comparison-indicator no-match';
        indicator.innerHTML = `
            <span class="status-icon">❌</span>
            <span class="status-text">Hashes Don't Match! Files may be corrupted or different.</span>
        `;
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
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
// START
// ========================================
document.addEventListener('DOMContentLoaded', init);
