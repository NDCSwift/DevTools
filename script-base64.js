// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    MAX_FILE_SIZE_FREE: 10 * 1024 * 1024, // 10MB
    MAX_FILE_SIZE_PREMIUM: Infinity
};

let state = {
    mode: 'encode', // 'encode' or 'decode'
    inputType: 'text', // 'text', 'file', or 'image'
    currentFile: null,
    currentImage: null
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    // Mode toggle
    encodeMode: document.getElementById('encodeMode'),
    decodeMode: document.getElementById('decodeMode'),
    
    // Input type buttons
    textInputBtn: document.getElementById('textInputBtn'),
    fileInputBtn: document.getElementById('fileInputBtn'),
    imageInputBtn: document.getElementById('imageInputBtn'),
    
    // Input sections
    textInputSection: document.getElementById('textInputSection'),
    fileInputSection: document.getElementById('fileInputSection'),
    imageInputSection: document.getElementById('imageInputSection'),
    
    // Text input/output
    textInput: document.getElementById('textInput'),
    outputText: document.getElementById('outputText'),
    
    // File input
    fileInput: document.getElementById('fileInput'),
    fileDropZone: document.getElementById('fileDropZone'),
    fileInfo: document.getElementById('fileInfo'),
    fileName: document.getElementById('fileName'),
    fileSize: document.getElementById('fileSize'),
    removeFileBtn: document.getElementById('removeFileBtn'),
    
    // Image input
    imageInput: document.getElementById('imageInput'),
    imageDropZone: document.getElementById('imageDropZone'),
    imagePreview: document.getElementById('imagePreview'),
    previewImg: document.getElementById('previewImg'),
    removeImageBtn: document.getElementById('removeImageBtn'),
    
    // Action buttons
    processBtn: document.getElementById('processBtn'),
    processIcon: document.getElementById('processIcon'),
    processText: document.getElementById('processText'),
    swapBtn: document.getElementById('swapBtn'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    
    // Other buttons
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    copyOutputBtn: document.getElementById('copyOutputBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    
    // Labels
    inputLabel: document.getElementById('inputLabel'),
    outputLabel: document.getElementById('outputLabel'),
    
    // Status
    statusBar: document.getElementById('statusBar'),
    statusText: document.getElementById('statusText'),
    sizeInfo: document.getElementById('sizeInfo'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    updateUI();
    console.log('🚀 DevToolkit Base64 Tool initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Mode toggle
    elements.encodeMode.addEventListener('click', () => setMode('encode'));
    elements.decodeMode.addEventListener('click', () => setMode('decode'));
    
    // Input type
    elements.textInputBtn.addEventListener('click', () => setInputType('text'));
    elements.fileInputBtn.addEventListener('click', () => setInputType('file'));
    elements.imageInputBtn.addEventListener('click', () => setInputType('image'));
    
    // Text input
    elements.textInput.addEventListener('input', updateSizeInfo);
    
    // File upload
    elements.fileDropZone.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', handleFileSelect);
    elements.removeFileBtn.addEventListener('click', removeFile);
    setupDragDrop(elements.fileDropZone, handleFileSelect);
    
    // Image upload
    elements.imageDropZone.addEventListener('click', () => elements.imageInput.click());
    elements.imageInput.addEventListener('change', handleImageSelect);
    elements.removeImageBtn.addEventListener('click', removeImage);
    setupDragDrop(elements.imageDropZone, handleImageSelect);
    
    // Action buttons
    elements.processBtn.addEventListener('click', process);
    elements.swapBtn.addEventListener('click', swap);
    elements.clearAllBtn.addEventListener('click', clearAll);
    
    // Other buttons
    elements.loadSampleBtn.addEventListener('click', loadSample);
    elements.clearInputBtn.addEventListener('click', clearInput);
    elements.copyOutputBtn.addEventListener('click', copyOutput);
    elements.downloadBtn.addEventListener('click', downloadOutput);
    
    // Quick actions
    document.querySelectorAll('.quick-action-card').forEach(card => {
        card.addEventListener('click', handleQuickAction);
    });
}

// ========================================
// MODE & TYPE SWITCHING
// ========================================

/**
 * Set encode or decode mode
 */
function setMode(mode) {
    state.mode = mode;
    
    // Update button states
    elements.encodeMode.classList.toggle('active', mode === 'encode');
    elements.decodeMode.classList.toggle('active', mode === 'decode');
    
    updateUI();
}

/**
 * Set input type (text, file, image)
 */
function setInputType(type) {
    state.inputType = type;
    
    // Update button states
    elements.textInputBtn.classList.toggle('active', type === 'text');
    elements.fileInputBtn.classList.toggle('active', type === 'file');
    elements.imageInputBtn.classList.toggle('active', type === 'image');
    
    // Show/hide sections
    elements.textInputSection.classList.toggle('hidden', type !== 'text');
    elements.fileInputSection.classList.toggle('hidden', type !== 'file');
    elements.imageInputSection.classList.toggle('hidden', type !== 'image');
    
    updateUI();
}

/**
 * Update UI labels and button text
 */
function updateUI() {
    if (state.mode === 'encode') {
        elements.processIcon.textContent = '⬆';
        elements.processText.textContent = 'Encode';
        elements.inputLabel.textContent = state.inputType === 'text' ? 'Text to Encode' : 'Input';
        elements.outputLabel.textContent = 'Base64 Output';
    } else {
        elements.processIcon.textContent = '⬇';
        elements.processText.textContent = 'Decode';
        elements.inputLabel.textContent = 'Base64 to Decode';
        elements.outputLabel.textContent = 'Decoded Output';
    }
    
    updateSizeInfo();
}

// ========================================
// CORE PROCESSING
// ========================================

/**
 * Main process function - encode or decode based on mode
 */
async function process() {
    try {
        if (state.mode === 'encode') {
            await encode();
        } else {
            await decode();
        }
    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        console.error('Processing error:', error);
    }
}

/**
 * Encode to Base64
 */
async function encode() {
    let result = '';
    
    if (state.inputType === 'text') {
        const input = elements.textInput.value;
        if (!input) {
            showStatus('Please enter text to encode', 'error');
            return;
        }
        result = btoa(unescape(encodeURIComponent(input)));
        
    } else if (state.inputType === 'file') {
        if (!state.currentFile) {
            showStatus('Please select a file to encode', 'error');
            return;
        }
        result = await fileToBase64(state.currentFile);
        
    } else if (state.inputType === 'image') {
        if (!state.currentImage) {
            showStatus('Please select an image to encode', 'error');
            return;
        }
        result = await imageToBase64(state.currentImage);
    }
    
    elements.outputText.value = result;
    showStatus('✓ Successfully encoded to Base64', 'success');
    updateSizeInfo();
}

/**
 * Decode from Base64
 */
async function decode() {
    const input = elements.textInput.value.trim();
    
    if (!input) {
        showStatus('Please enter Base64 data to decode', 'error');
        return;
    }
    
    try {
        // Try to decode as text
        const decoded = decodeURIComponent(escape(atob(input)));
        elements.outputText.value = decoded;
        showStatus('✓ Successfully decoded from Base64', 'success');
        updateSizeInfo();
    } catch (error) {
        showStatus('Invalid Base64 data', 'error');
    }
}

/**
 * Convert file to Base64
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Convert image to Base64 data URL
 */
function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Swap input and output
 */
function swap() {
    const temp = elements.textInput.value;
    elements.textInput.value = elements.outputText.value;
    elements.outputText.value = temp;
    
    // Swap mode
    setMode(state.mode === 'encode' ? 'decode' : 'encode');
    
    showToast('Swapped input and output');
}

// ========================================
// FILE HANDLING
// ========================================

/**
 * Handle file selection
 */
function handleFileSelect(e) {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    
    if (!file) return;
    
    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE_FREE) {
        showStatus(`File too large. Free tier max: 10MB. Upgrade to Premium for unlimited.`, 'error');
        return;
    }
    
    state.currentFile = file;
    
    // Update UI
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.classList.remove('hidden');
    elements.fileDropZone.style.display = 'none';
    
    updateSizeInfo();
    showStatus(`File loaded: ${file.name}`, 'success');
}

/**
 * Remove selected file
 */
function removeFile() {
    state.currentFile = null;
    elements.fileInput.value = '';
    elements.fileInfo.classList.add('hidden');
    elements.fileDropZone.style.display = 'block';
    updateSizeInfo();
}

/**
 * Handle image selection
 */
function handleImageSelect(e) {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showStatus('Please select a valid image file', 'error');
        return;
    }
    
    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE_FREE) {
        showStatus(`Image too large. Free tier max: 10MB.`, 'error');
        return;
    }
    
    state.currentImage = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        elements.previewImg.src = e.target.result;
        elements.imagePreview.classList.remove('hidden');
        elements.imageDropZone.style.display = 'none';
    };
    reader.readAsDataURL(file);
    
    updateSizeInfo();
    showStatus(`Image loaded: ${file.name}`, 'success');
}

/**
 * Remove selected image
 */
function removeImage() {
    state.currentImage = null;
    elements.imageInput.value = '';
    elements.previewImg.src = '';
    elements.imagePreview.classList.add('hidden');
    elements.imageDropZone.style.display = 'block';
    updateSizeInfo();
}

/**
 * Setup drag and drop for a zone
 */
function setupDragDrop(zone, handler) {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        handler(e);
    });
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Load sample data
 */
function loadSample() {
    if (state.mode === 'encode') {
        const samples = [
            'Hello, World! This is a Base64 encoding example.',
            '{"name":"DevToolkit","version":"1.0.0","tools":["JSON","RegEx","Base64"]}',
            'The quick brown fox jumps over the lazy dog. 🦊',
            'https://devtoolkit.io/api/v1/encode?data=example'
        ];
        elements.textInput.value = samples[Math.floor(Math.random() * samples.length)];
    } else {
        const samples = [
            'SGVsbG8sIFdvcmxkIQ==',
            'VGhlIHF1aWNrIGJyb3duIGZveCBqdW1wcyBvdmVyIHRoZSBsYXp5IGRvZy4g8J+mig==',
            'eyJuYW1lIjoiRGV2VG9vbGtpdCIsInZlcnNpb24iOiIxLjAuMCJ9'
        ];
        elements.textInput.value = samples[Math.floor(Math.random() * samples.length)];
    }
    updateSizeInfo();
    showToast('Sample loaded');
}

/**
 * Clear input
 */
function clearInput() {
    elements.textInput.value = '';
    removeFile();
    removeImage();
    updateSizeInfo();
}

/**
 * Clear all
 */
function clearAll() {
    clearInput();
    elements.outputText.value = '';
    updateSizeInfo();
    showToast('Cleared');
}

/**
 * Copy output to clipboard
 */
async function copyOutput() {
    const output = elements.outputText.value;
    
    if (!output) {
        showToast('Nothing to copy');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(output);
        showToast('Copied to clipboard! ⎘');
    } catch (error) {
        // Fallback
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
 * Download output as file
 */
function downloadOutput() {
    const output = elements.outputText.value;
    
    if (!output) {
        showToast('Nothing to download');
        return;
    }
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.mode === 'encode' ? 'encoded.txt' : 'decoded.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Downloaded! 📥');
}

/**
 * Update size information
 */
function updateSizeInfo() {
    let size = 0;
    
    if (state.inputType === 'text') {
        size = new Blob([elements.textInput.value]).size;
    } else if (state.inputType === 'file' && state.currentFile) {
        size = state.currentFile.size;
    } else if (state.inputType === 'image' && state.currentImage) {
        size = state.currentImage.size;
    }
    
    elements.sizeInfo.textContent = formatFileSize(size);
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 bytes';
    
    const k = 1024;
    const sizes = ['bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// QUICK ACTIONS
// ========================================

/**
 * Handle quick action clicks
 */
function handleQuickAction(e) {
    const action = e.currentTarget.dataset.action;
    
    switch (action) {
        case 'encode-url':
            elements.textInput.value = 'https://devtoolkit.io/api/encode?param=example';
            setMode('encode');
            setInputType('text');
            process();
            break;
            
        case 'encode-email':
            elements.textInput.value = 'contact@devtoolkit.io';
            setMode('encode');
            setInputType('text');
            process();
            break;
            
        case 'decode-jwt':
            // Sample JWT token (header.payload.signature)
            const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';
            const parts = sampleJWT.split('.');
            if (parts.length >= 2) {
                elements.textInput.value = parts[1]; // Decode payload
                setMode('decode');
                setInputType('text');
                process();
            }
            break;
            
        case 'data-uri':
            showToast('Upload an image to create a data URI');
            setMode('encode');
            setInputType('image');
            break;
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
    // Ctrl/Cmd + Enter = Process
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        process();
    }
    
    // Ctrl/Cmd + K = Clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearAll();
    }
    
    // Ctrl/Cmd + Shift + S = Swap
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        swap();
    }
});

// ========================================
// ANALYTICS PLACEHOLDER
// ========================================
function trackEvent(category, action, label) {
    console.log('📊 Event:', category, action, label);
}

// Track usage
elements.processBtn.addEventListener('click', () => trackEvent('Tool', state.mode, 'Base64'));
elements.copyOutputBtn.addEventListener('click', () => trackEvent('Tool', 'Copy', 'Base64'));
elements.downloadBtn.addEventListener('click', () => trackEvent('Tool', 'Download', 'Base64'));

// ========================================
// START APP
// ========================================
init();
