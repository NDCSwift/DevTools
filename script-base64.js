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
    currentImage: null,
    multipleFiles: [], // For batch processing
    batchResults: [], // Store batch encode/decode results
    // Metadata for file reconstruction
    lastEncodedFileName: null,
    lastEncodedMimeType: null,
    lastEncodedFileType: null, // 'text', 'file', or 'image'
    // Decoded file data
    decodedFileBlob: null,
    decodedFileName: null
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
    pasteBtn: document.getElementById('pasteBtn'),
    loadFileBtn: document.getElementById('loadFileBtn'),
    textFileInput: document.getElementById('textFileInput'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    clearInputBtn: document.getElementById('clearInputBtn'),
    copyOutputBtn: document.getElementById('copyOutputBtn'),
    downloadBtn: document.getElementById('downloadBtn'),

    // Options
    urlSafeToggle: document.getElementById('urlSafeToggle'),
    chunkedOutputToggle: document.getElementById('chunkedOutputToggle'),

    // Copy format dropdown
    copyFormatBtn: document.getElementById('copyFormatBtn'),
    copyFormatMenu: document.getElementById('copyFormatMenu'),
    
    // Labels
    inputLabel: document.getElementById('inputLabel'),
    outputLabel: document.getElementById('outputLabel'),
    
    // Status
    statusBar: document.getElementById('statusBar'),
    statusText: document.getElementById('statusText'),
    sizeInfo: document.getElementById('sizeInfo'),
    
    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),

    // Data URI Preview
    dataURIPreview: document.getElementById('dataURIPreview'),
    dataURIImage: document.getElementById('dataURIImage'),
    copyHTMLBtn: document.getElementById('copyHTMLBtn'),
    copyCSSBtn: document.getElementById('copyCSSBtn'),
    copyDataURIBtn: document.getElementById('copyDataURIBtn'),
    dataURISizeWarning: document.getElementById('dataURISizeWarning'),

    // Size Comparison
    sizeComparison: document.getElementById('sizeComparison'),
    originalSize: document.getElementById('originalSize'),
    base64Size: document.getElementById('base64Size'),
    sizeIncrease: document.getElementById('sizeIncrease'),
    compressionSuggestion: document.getElementById('compressionSuggestion'),
    suggestionText: document.getElementById('suggestionText'),

    // Multi-file
    multiFileList: document.getElementById('multiFileList')
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
    elements.textInput.addEventListener('input', detectAndSuggestMode);
    
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
    elements.pasteBtn.addEventListener('click', pasteInput);
    elements.loadFileBtn.addEventListener('click', () => elements.textFileInput.click());
    elements.textFileInput.addEventListener('change', handleTextFileLoad);
    elements.loadSampleBtn.addEventListener('click', loadSample);
    elements.clearInputBtn.addEventListener('click', clearInput);
    elements.copyOutputBtn.addEventListener('click', copyOutput);
    elements.downloadBtn.addEventListener('click', downloadOutput);

    // Copy format dropdown
    if (elements.copyFormatBtn && elements.copyFormatMenu) {
        elements.copyFormatBtn.addEventListener('click', toggleCopyFormatMenu);
        document.querySelectorAll('.format-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const format = e.target.dataset.format;
                copyOutputAs(format);
                elements.copyFormatMenu.classList.add('hidden');
            });
        });
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.copy-dropdown')) {
                elements.copyFormatMenu.classList.add('hidden');
            }
        });
    }

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

    // Hide data URI preview when switching away from image output
    if (type !== 'image') {
        hideDataURIPreview();
    }

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
        // Hide load file button in encode mode
        if (elements.loadFileBtn) {
            elements.loadFileBtn.classList.add('hidden');
        }
    } else {
        elements.processIcon.textContent = '⬇';
        elements.processText.textContent = 'Decode';
        elements.inputLabel.textContent = 'Base64 to Decode';
        elements.outputLabel.textContent = 'Decoded Output';
        // Show load file button in decode mode for text input
        if (elements.loadFileBtn && state.inputType === 'text') {
            elements.loadFileBtn.classList.remove('hidden');
        }
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
        hideDataURIPreview();

        // Store metadata for decode
        state.lastEncodedFileName = 'text-output.txt';
        state.lastEncodedMimeType = 'text/plain';
        state.lastEncodedFileType = 'text';

    } else if (state.inputType === 'file') {
        // Check for batch processing
        if (state.multipleFiles.length > 1) {
            await encodeBatchFiles();
            return;
        }

        if (!state.currentFile) {
            showStatus('Please select a file to encode', 'error');
            return;
        }
        result = await fileToBase64(state.currentFile);
        hideDataURIPreview();

        // Store metadata for decode
        state.lastEncodedFileName = state.currentFile.name;
        state.lastEncodedMimeType = state.currentFile.type || 'application/octet-stream';
        state.lastEncodedFileType = 'file';

    } else if (state.inputType === 'image') {
        if (!state.currentImage) {
            showStatus('Please select an image to encode', 'error');
            return;
        }
        result = await imageToBase64(state.currentImage);
        showDataURIPreview(result, state.currentImage);

        // Store metadata for decode
        state.lastEncodedFileName = state.currentImage.name;
        state.lastEncodedMimeType = state.currentImage.type;
        state.lastEncodedFileType = 'image';
    }

    // Apply URL-safe conversion if enabled
    const isUrlSafe = elements.urlSafeToggle && elements.urlSafeToggle.checked;
    const isChunked = elements.chunkedOutputToggle && elements.chunkedOutputToggle.checked;

    if (isUrlSafe) {
        result = toUrlSafeBase64(result);
    }

    if (isChunked) {
        result = chunkBase64(result);
    }

    // Build status message
    const options = [];
    if (isUrlSafe) options.push('URL-safe');
    if (isChunked) options.push('chunked');
    const optionStr = options.length > 0 ? ` (${options.join(', ')})` : '';
    showStatus(`✓ Successfully encoded to Base64${optionStr}`, 'success');

    elements.outputText.value = result;
    updateSizeInfo();

    // Show size comparison
    showSizeComparison(result);
}

/**
 * Decode from Base64
 */
async function decode() {
    let input = elements.textInput.value.trim();

    if (!input) {
        showStatus('Please enter Base64 data to decode', 'error');
        return;
    }

    // Check for batch decode (multiple lines)
    // But first, detect if it's chunked Base64 (all lines are valid Base64 that form one string)
    const lines = input.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 1 && !input.includes('data:')) {
        // Check if all lines look like chunks of same Base64 (consistent length ~76 chars except last)
        const isChunked = lines.slice(0, -1).every(line => {
            const trimmed = line.trim();
            return trimmed.length >= 64 && trimmed.length <= 80 && /^[A-Za-z0-9+/=\-_]+$/.test(trimmed);
        });

        if (isChunked) {
            // Treat as single chunked Base64 - unchunk it
            input = unchunkBase64(input);
        } else {
            // Multiple separate Base64 strings - batch decode
            decodeBatchText(lines);
            return;
        }
    }

    // Check if it's a data URI and extract Base64 part and mime type
    const dataURIRegex = /^data:([^;]+);base64,(.+)$/;
    const dataURIMatch = input.match(dataURIRegex);
    let mimeType = null;
    let base64Data = input;

    if (dataURIMatch) {
        mimeType = dataURIMatch[1];
        base64Data = dataURIMatch[2];
        showStatus('✓ Extracted Base64 from data URI', 'success');
    }

    // Convert URL-safe Base64 to standard Base64 if needed
    // Detect URL-safe Base64 by presence of - or _
    if (base64Data.includes('-') || base64Data.includes('_')) {
        base64Data = fromUrlSafeBase64(base64Data);
        showStatus('✓ Detected URL-safe Base64, converting...', 'ready');
    }

    // Check if this looks like image data (from data URI)
    let isImage = mimeType && mimeType.startsWith('image/');

    // If no data URI, try to detect image from Base64 signature
    if (!isImage && !mimeType) {
        const detectedType = detectImageFromBase64(base64Data);
        if (detectedType) {
            mimeType = detectedType;
            isImage = true;
            // Reconstruct data URI for preview
            input = `data:${detectedType};base64,${base64Data}`;
        }
    }

    if (isImage) {
        // Handle image decoding - show preview and download option
        handleImageDecode(input, mimeType);
        hideSizeComparison();
    } else {
        // Check if input looks like a JWT token (three parts separated by dots)
        const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
        const isJWT = jwtRegex.test(input);

        if (isJWT) {
            handleJWTDecode(input);
            return;
        }

        // Check if we have metadata from a previous encode (for file reconstruction)
        const hasFileMetadata = state.lastEncodedFileType === 'file' && state.lastEncodedFileName;

        // Try to decode as text first
        try {
            const decoded = decodeURIComponent(escape(atob(base64Data)));
            elements.outputText.value = decoded;

            // If we have file metadata, show option to download as original file
            if (hasFileMetadata) {
                showStatus(`✓ Decoded from Base64 (Original: ${state.lastEncodedFileName})`, 'success');
                // The download button will use the metadata automatically
            } else {
                showStatus('✓ Successfully decoded from Base64', 'success');
            }

            updateSizeInfo();
            hideDataURIPreview();
            hideSizeComparison();
        } catch (error) {
            // If text decode fails, try binary file decode
            if (hasFileMetadata) {
                handleFileDecode(base64Data, state.lastEncodedFileName, state.lastEncodedMimeType);
            } else {
                showStatus('Invalid Base64 data', 'error');
                hideDataURIPreview();
                hideSizeComparison();
            }
        }
    }
}

/**
 * Detect image type from Base64 data by checking magic bytes
 */
function detectImageFromBase64(base64Data) {
    // Common image file signatures (magic bytes) as Base64 prefixes
    const signatures = {
        // PNG: 89 50 4E 47 0D 0A 1A 0A -> iVBORw0KGgo
        'iVBORw0KGgo': 'image/png',
        'iVBORw0K': 'image/png',

        // JPEG: FF D8 FF -> /9j/
        '/9j/': 'image/jpeg',

        // GIF87a: 47 49 46 38 37 61 -> R0lGODdh
        // GIF89a: 47 49 46 38 39 61 -> R0lGODlh
        'R0lGODdh': 'image/gif',
        'R0lGODlh': 'image/gif',

        // WebP: 52 49 46 46 ... 57 45 42 50 -> UklGR...WEBP
        'UklGR': 'image/webp',

        // BMP: 42 4D -> Qk
        'Qk': 'image/bmp',

        // ICO: 00 00 01 00 -> AAAB
        'AAAB': 'image/x-icon',

        // SVG (text-based, check for common starting patterns)
        'PHN2Zw': 'image/svg+xml', // <svg
        'PD94bWw': 'image/svg+xml' // <?xml (often used with SVG)
    };

    for (const [prefix, mimeType] of Object.entries(signatures)) {
        if (base64Data.startsWith(prefix)) {
            return mimeType;
        }
    }

    return null;
}

/**
 * Decode multiple Base64 strings (one per line)
 */
function decodeBatchText(lines) {
    const results = [];

    showStatus(`Decoding ${lines.length} items...`, 'ready');

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        // Handle URL-safe Base64
        if (line.includes('-') || line.includes('_')) {
            line = fromUrlSafeBase64(line);
        }

        try {
            const decoded = decodeURIComponent(escape(atob(line)));
            results.push({
                index: i + 1,
                input: line.substring(0, 30) + (line.length > 30 ? '...' : ''),
                output: decoded,
                success: true
            });
        } catch (error) {
            results.push({
                index: i + 1,
                input: line.substring(0, 30) + (line.length > 30 ? '...' : ''),
                error: 'Invalid Base64',
                success: false
            });
        }
    }

    // Format output
    const successCount = results.filter(r => r.success).length;
    let output = `=== BATCH DECODE RESULTS ===\n`;
    output += `Total: ${lines.length} | Success: ${successCount} | Failed: ${lines.length - successCount}\n`;
    output += `${'='.repeat(40)}\n\n`;

    results.forEach(r => {
        if (r.success) {
            output += `[${r.index}] ✓ ${r.output}\n`;
        } else {
            output += `[${r.index}] ✗ ${r.error} (input: ${r.input})\n`;
        }
    });

    elements.outputText.value = output;
    hideDataURIPreview();
    hideSizeComparison();

    if (successCount === lines.length) {
        showStatus(`✓ Successfully decoded ${lines.length} items`, 'success');
    } else {
        showStatus(`Decoded ${successCount}/${lines.length} items`, 'error');
    }
}

/**
 * Encode multiple files in batch
 */
async function encodeBatchFiles() {
    const files = state.multipleFiles;
    const results = [];
    const urlSafe = elements.urlSafeToggle && elements.urlSafeToggle.checked;

    showStatus(`Encoding ${files.length} files...`, 'ready');

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            let base64 = await fileToBase64(file);
            if (urlSafe) {
                base64 = toUrlSafeBase64(base64);
            }
            results.push({
                name: file.name,
                type: file.type || 'application/octet-stream',
                size: file.size,
                base64: base64,
                success: true
            });
        } catch (error) {
            results.push({
                name: file.name,
                success: false,
                error: error.message
            });
        }
    }

    // Store batch results
    state.batchResults = results;

    // Format output as JSON
    const successCount = results.filter(r => r.success).length;
    const output = {
        batchInfo: {
            totalFiles: files.length,
            successful: successCount,
            failed: files.length - successCount,
            encodedAt: new Date().toISOString(),
            urlSafe: urlSafe
        },
        files: results.map(r => ({
            name: r.name,
            type: r.type,
            originalSize: r.size,
            base64Size: r.base64 ? r.base64.length : 0,
            success: r.success,
            error: r.error || null,
            base64: r.base64 || null
        }))
    };

    elements.outputText.value = JSON.stringify(output, null, 2);
    hideDataURIPreview();
    hideSizeComparison();

    if (successCount === files.length) {
        showStatus(`✓ Successfully encoded ${files.length} files`, 'success');
    } else {
        showStatus(`Encoded ${successCount}/${files.length} files (${files.length - successCount} failed)`, 'error');
    }

    showToast(`Batch complete! Download as JSON 📦`);
}

/**
 * Handle JWT token decode
 */
function handleJWTDecode(jwt) {
    try {
        const parts = jwt.split('.');
        if (parts.length < 2) {
            showStatus('Invalid JWT format', 'error');
            return;
        }

        // Decode header and payload
        const header = JSON.parse(decodeURIComponent(escape(atob(fromUrlSafeBase64(parts[0])))));
        const payload = JSON.parse(decodeURIComponent(escape(atob(fromUrlSafeBase64(parts[1])))));

        // Format output with clear sections
        let output = '=== JWT DECODED ===\n\n';

        output += '📋 HEADER:\n';
        output += JSON.stringify(header, null, 2);
        output += '\n\n';

        output += '📦 PAYLOAD:\n';
        output += JSON.stringify(payload, null, 2);
        output += '\n\n';

        // Show expiry information if present
        if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            const isExpired = expDate < now;
            output += `⏰ EXPIRY:\n`;
            output += `   Expires: ${expDate.toLocaleString()}\n`;
            output += `   Status: ${isExpired ? '❌ EXPIRED' : '✅ Valid'}\n`;
            if (!isExpired) {
                const timeLeft = expDate - now;
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                output += `   Time left: ${days}d ${hours}h\n`;
            }
            output += '\n';
        }

        if (payload.iat) {
            const iatDate = new Date(payload.iat * 1000);
            output += `📅 ISSUED AT: ${iatDate.toLocaleString()}\n\n`;
        }

        output += '🔐 SIGNATURE:\n';
        output += parts[2] || '(no signature)';

        elements.outputText.value = output;
        showStatus('✓ JWT token decoded successfully', 'success');
        hideDataURIPreview();
        hideSizeComparison();
    } catch (error) {
        showStatus('Failed to decode JWT token', 'error');
        console.error('JWT decode error:', error);
    }
}

/**
 * Handle decoding of binary files
 */
function handleFileDecode(base64Data, fileName, mimeType) {
    try {
        // Convert Base64 to binary
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create a blob and data URL
        const blob = new Blob([bytes], { type: mimeType });
        const dataURL = URL.createObjectURL(blob);

        elements.outputText.value = `[Binary File: ${fileName}]\n\nType: ${mimeType}\nSize: ${formatFileSize(blob.size)}\n\nUse "Download" button to save the file.`;

        // Store blob URL for download
        state.decodedFileBlob = dataURL;
        state.decodedFileName = fileName;

        showStatus(`✓ Decoded file: ${fileName}`, 'success');
        hideDataURIPreview();
        hideSizeComparison();
    } catch (error) {
        showStatus('Failed to decode binary file', 'error');
        console.error('Binary decode error:', error);
    }
}

/**
 * Handle decoding of image data URIs
 */
function handleImageDecode(dataURI, mimeType) {
    // Show the image preview
    elements.dataURIImage.src = dataURI;
    elements.dataURIPreview.classList.remove('hidden');
    elements.dataURISizeWarning.classList.add('hidden');

    // Update output to show it's an image
    const extension = mimeType.split('/')[1] || 'png';
    elements.outputText.value = `[Image Data: ${mimeType}]\n\nPreview shown below.\nUse "Download as Image" button to save the file.`;

    // Setup buttons for image download
    if (elements.copyHTMLBtn) {
        elements.copyHTMLBtn.onclick = () => copyAsHTML(dataURI, `decoded-image.${extension}`);
    }
    if (elements.copyCSSBtn) {
        elements.copyCSSBtn.onclick = () => copyAsCSS(dataURI);
    }
    if (elements.copyDataURIBtn) {
        // Change this button to "Download as Image" for decode mode
        elements.copyDataURIBtn.innerHTML = `
            <span class="format-icon">💾</span>
            <div class="format-text">
                <strong>Download as Image</strong>
                <span class="format-hint">Save as .${extension} file</span>
            </div>
        `;
        elements.copyDataURIBtn.onclick = () => downloadDecodedImage(dataURI, mimeType);
    }

    showStatus(`✓ Decoded image data (${mimeType})`, 'success');
}

/**
 * Download decoded image as file
 */
function downloadDecodedImage(dataURI, mimeType) {
    const extension = mimeType.split('/')[1] || 'png';
    const link = document.createElement('a');
    link.href = dataURI;
    link.download = `decoded-image.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded as ${extension.toUpperCase()}! 💾`);
}

/**
 * Convert standard Base64 to URL-safe Base64
 */
function toUrlSafeBase64(base64) {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Convert URL-safe Base64 to standard Base64
 */
function fromUrlSafeBase64(urlSafeBase64) {
    let base64 = urlSafeBase64.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    while (base64.length % 4) {
        base64 += '=';
    }
    return base64;
}

/**
 * Chunk Base64 string into lines (MIME standard: 76 chars per line)
 */
function chunkBase64(base64, chunkSize = 76) {
    const chunks = [];
    for (let i = 0; i < base64.length; i += chunkSize) {
        chunks.push(base64.substring(i, i + chunkSize));
    }
    return chunks.join('\n');
}

/**
 * Remove line breaks from chunked Base64
 */
function unchunkBase64(chunkedBase64) {
    return chunkedBase64.replace(/\s+/g, '');
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
    // For text mode - swap the text areas
    if (state.inputType === 'text') {
        const temp = elements.textInput.value;
        elements.textInput.value = elements.outputText.value;
        elements.outputText.value = temp;
    } else {
        // For file/image mode - move output to input textarea
        const output = elements.outputText.value;

        // Switch to text mode for decode
        setInputType('text');
        elements.textInput.value = output;
        elements.outputText.value = '';
    }

    // Swap mode
    setMode(state.mode === 'encode' ? 'decode' : 'encode');

    showToast('Swapped! Mode and content switched');
}

// ========================================
// FILE HANDLING
// ========================================

/**
 * Handle file selection (supports single and multiple files)
 */
function handleFileSelect(e) {
    const files = e.target.files || e.dataTransfer?.files;

    if (!files || files.length === 0) return;

    // Handle multiple files
    if (files.length > 1) {
        handleMultipleFiles(Array.from(files));
        return;
    }

    // Single file handling
    const file = files[0];

    // Check file size
    if (file.size > CONFIG.MAX_FILE_SIZE_FREE) {
        showStatus(`File too large. Free tier max: 10MB. Upgrade to Premium for unlimited.`, 'error');
        return;
    }

    state.currentFile = file;
    state.multipleFiles = []; // Clear any previous batch

    // Update UI
    elements.fileName.textContent = file.name;
    elements.fileSize.textContent = formatFileSize(file.size);
    elements.fileInfo.classList.remove('hidden');
    elements.fileDropZone.style.display = 'none';
    if (elements.multiFileList) {
        elements.multiFileList.classList.add('hidden');
        elements.multiFileList.innerHTML = '';
    }

    updateSizeInfo();
    showStatus(`File loaded: ${file.name}`, 'success');
}

/**
 * Handle multiple file selection for batch processing
 */
function handleMultipleFiles(files) {
    // Filter out files that are too large
    const validFiles = files.filter(file => {
        if (file.size > CONFIG.MAX_FILE_SIZE_FREE) {
            showToast(`Skipped ${file.name} (too large)`);
            return false;
        }
        return true;
    });

    if (validFiles.length === 0) {
        showStatus('No valid files selected', 'error');
        return;
    }

    state.multipleFiles = validFiles;
    state.currentFile = validFiles[0]; // First file for single processing fallback

    // Hide single file info, show multi-file list
    elements.fileInfo.classList.add('hidden');
    elements.fileDropZone.style.display = 'none';

    // Build multi-file list UI
    if (elements.multiFileList) {
        elements.multiFileList.innerHTML = '';
        elements.multiFileList.classList.remove('hidden');

        validFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'multi-file-item';
            item.innerHTML = `
                <div class="file-item-info">
                    <span class="file-item-icon">📄</span>
                    <span class="file-item-name">${file.name}</span>
                    <span class="file-item-size">${formatFileSize(file.size)}</span>
                </div>
                <button class="btn-link remove-file-btn" data-index="${index}">Remove</button>
            `;
            elements.multiFileList.appendChild(item);
        });

        // Add remove handlers
        elements.multiFileList.querySelectorAll('.remove-file-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                removeFileFromBatch(index);
            });
        });
    }

    updateSizeInfo();
    showStatus(`${validFiles.length} files loaded for batch processing`, 'success');
}

/**
 * Remove a file from the batch
 */
function removeFileFromBatch(index) {
    state.multipleFiles.splice(index, 1);

    if (state.multipleFiles.length === 0) {
        // No files left, reset to drop zone
        removeFile();
    } else if (state.multipleFiles.length === 1) {
        // Only one file left, switch to single file mode
        state.currentFile = state.multipleFiles[0];
        state.multipleFiles = [];
        elements.fileName.textContent = state.currentFile.name;
        elements.fileSize.textContent = formatFileSize(state.currentFile.size);
        elements.fileInfo.classList.remove('hidden');
        if (elements.multiFileList) {
            elements.multiFileList.classList.add('hidden');
            elements.multiFileList.innerHTML = '';
        }
        showStatus(`File loaded: ${state.currentFile.name}`, 'success');
    } else {
        // Rebuild multi-file list
        handleMultipleFiles(state.multipleFiles);
    }
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
// DATA URI PREVIEW
// ========================================

/**
 * Show data URI preview for images
 */
function showDataURIPreview(dataURI, file) {
    if (!elements.dataURIPreview) return;

    // Show preview image
    elements.dataURIImage.src = dataURI;
    elements.dataURIPreview.classList.remove('hidden');

    // Check size and show warning if too large
    const sizeKB = Math.round(dataURI.length / 1024);
    if (sizeKB > 100) {
        elements.dataURISizeWarning.classList.remove('hidden');
        elements.dataURISizeWarning.textContent = `⚠️ ${sizeKB}KB - Large data URIs may impact page performance`;
    } else {
        elements.dataURISizeWarning.classList.add('hidden');
    }

    // Setup copy buttons
    if (elements.copyHTMLBtn) {
        elements.copyHTMLBtn.onclick = () => copyAsHTML(dataURI, file.name);
    }
    if (elements.copyCSSBtn) {
        elements.copyCSSBtn.onclick = () => copyAsCSS(dataURI);
    }
    if (elements.copyDataURIBtn) {
        elements.copyDataURIBtn.onclick = () => copyAsDataURI(dataURI);
    }
}

/**
 * Hide data URI preview
 */
function hideDataURIPreview() {
    if (elements.dataURIPreview) {
        elements.dataURIPreview.classList.add('hidden');
    }
}

/**
 * Copy as HTML img tag
 */
async function copyAsHTML(dataURI, fileName) {
    const html = `<img src="${dataURI}" alt="${fileName || 'Image'}" />`;
    await copyToClipboard(html);
    showToast('Copied as HTML! 🏷️');
}

/**
 * Copy as CSS background-image
 */
async function copyAsCSS(dataURI) {
    const css = `background-image: url('${dataURI}');`;
    await copyToClipboard(css);
    showToast('Copied as CSS! 🎨');
}

/**
 * Copy just the data URI
 */
async function copyAsDataURI(dataURI) {
    await copyToClipboard(dataURI);
    showToast('Copied data URI! 📋');
}

/**
 * Toggle copy format dropdown menu
 */
function toggleCopyFormatMenu(e) {
    e.stopPropagation();
    elements.copyFormatMenu.classList.toggle('hidden');
}

/**
 * Copy output in specified format
 */
async function copyOutputAs(format) {
    const output = elements.outputText.value;

    if (!output) {
        showToast('Nothing to copy');
        return;
    }

    // Remove line breaks if output is chunked
    const base64 = output.includes('\n') ? unchunkBase64(output) : output;

    let formatted = '';
    let formatName = '';

    switch (format) {
        case 'raw':
            formatted = output;
            formatName = 'Raw';
            break;

        case 'json':
            formatted = `"data": "${base64}"`;
            formatName = 'JSON';
            break;

        case 'xml':
            formatted = `<data encoding="base64">${base64}</data>`;
            formatName = 'XML';
            break;

        case 'js':
            // Escape for JavaScript string
            formatted = `const base64Data = "${base64}";`;
            formatName = 'JavaScript';
            break;

        case 'python':
            formatted = `import base64\ndata = base64.b64decode("${base64}")`;
            formatName = 'Python';
            break;

        default:
            formatted = output;
            formatName = 'Raw';
    }

    await copyToClipboard(formatted);
    showToast(`Copied as ${formatName}! 📋`);
}

/**
 * Helper to copy to clipboard
 */
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

// ========================================
// SIZE COMPARISON
// ========================================

/**
 * Show size comparison widget
 */
function showSizeComparison(base64Result) {
    if (!elements.sizeComparison) return;

    let originalBytes = 0;

    // Calculate original size based on input type
    if (state.inputType === 'text') {
        originalBytes = new Blob([elements.textInput.value]).size;
    } else if (state.inputType === 'file' && state.currentFile) {
        originalBytes = state.currentFile.size;
    } else if (state.inputType === 'image' && state.currentImage) {
        originalBytes = state.currentImage.size;
    }

    // Calculate Base64 size
    const base64Bytes = new Blob([base64Result]).size;

    // Calculate percentage increase
    const increase = originalBytes > 0
        ? ((base64Bytes - originalBytes) / originalBytes * 100).toFixed(1)
        : 0;

    // Update UI
    elements.originalSize.textContent = formatFileSize(originalBytes);
    elements.base64Size.textContent = formatFileSize(base64Bytes);
    elements.sizeIncrease.textContent = `+${increase}%`;

    // Show suggestions based on size and type
    showOptimizationSuggestions(originalBytes, base64Bytes, state.inputType);

    // Show the widget
    elements.sizeComparison.classList.remove('hidden');
}

/**
 * Hide size comparison widget
 */
function hideSizeComparison() {
    if (elements.sizeComparison) {
        elements.sizeComparison.classList.add('hidden');
    }
}

/**
 * Show optimization suggestions
 */
function showOptimizationSuggestions(originalBytes, base64Bytes, inputType) {
    if (!elements.compressionSuggestion || !elements.suggestionText) return;

    const sizeKB = base64Bytes / 1024;
    const sizeMB = sizeKB / 1024;

    let suggestion = '';

    if (inputType === 'image') {
        if (sizeKB > 100) {
            suggestion = `Large image (${sizeMB.toFixed(1)}MB as Base64). Consider:
                • Compressing the image before encoding
                • Using external hosting (CDN, cloud storage)
                • Using &lt;img src="url"&gt; instead of data URIs`;
        } else if (sizeKB > 50) {
            suggestion = `Moderate size. Data URIs work but consider compression for better performance.`;
        } else {
            suggestion = `Great size for data URIs! Perfect for inline embedding.`;
        }
    } else if (inputType === 'file') {
        if (sizeMB > 1) {
            suggestion = `Large file (${sizeMB.toFixed(1)}MB). Base64 adds ~33% overhead.
                Consider direct file transfer or compression.`;
        } else if (sizeKB > 500) {
            suggestion = `Moderate size. Consider if Base64 encoding is necessary for your use case.`;
        }
    }

    if (suggestion) {
        elements.suggestionText.innerHTML = suggestion;
        elements.compressionSuggestion.classList.remove('hidden');
    } else {
        elements.compressionSuggestion.classList.add('hidden');
    }
}

// ========================================
// SMART DETECTION
// ========================================

/**
 * Detect input format and suggest appropriate mode
 */
function detectAndSuggestMode() {
    const input = elements.textInput.value.trim();

    if (!input || input.length < 10) return;

    // Detect Base64 string
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    const isBase64 = base64Regex.test(input) && input.length % 4 === 0;

    // Detect data URI
    const dataURIRegex = /^data:([^;]+);base64,(.+)$/;
    const dataURIMatch = input.match(dataURIRegex);

    // Detect JWT token
    const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
    const isJWT = jwtRegex.test(input);

    if (dataURIMatch && state.mode !== 'decode') {
        // Data URI detected - extract Base64 and suggest decode
        showStatus('💡 Data URI detected. Switch to decode mode to extract?', 'ready');
    } else if (isJWT && state.mode !== 'decode') {
        // JWT detected
        showStatus('💡 JWT token detected. Switch to decode mode to view payload?', 'ready');
    } else if (isBase64 && state.mode !== 'decode') {
        // Base64 string detected
        showStatus('💡 Base64 string detected. Switch to decode mode?', 'ready');
    } else if (state.mode === 'decode' && !isBase64 && !dataURIMatch) {
        // In decode mode but input doesn't look like Base64
        showStatus('⚠️ Input doesn\'t appear to be valid Base64', 'ready');
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Load Base64 text from file
 */
async function handleTextFileLoad(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
        const text = await file.text();
        elements.textInput.value = text.trim();
        updateSizeInfo();
        showToast(`Loaded ${file.name}! 📄`);

        // Clear the file input so the same file can be selected again
        elements.textFileInput.value = '';
    } catch (error) {
        showStatus('Failed to load file', 'error');
        console.error('File load error:', error);
    }
}

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
    hideDataURIPreview();
    hideSizeComparison();
    showToast('Cleared');
}

/**
 * Paste from clipboard to input
 */
async function pasteInput() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            elements.textInput.value = text;
            updateSizeInfo();
            showToast('Pasted from clipboard! 📋');
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

    // Check if we have a decoded binary file with blob URL
    if (state.mode === 'decode' && state.decodedFileBlob && state.decodedFileName) {
        const a = document.createElement('a');
        a.href = state.decodedFileBlob;
        a.download = state.decodedFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast(`Downloaded ${state.decodedFileName}! 📥`);
        return;
    }

    // Determine filename based on context
    let filename = '';
    let mimeType = 'text/plain';

    if (state.mode === 'encode') {
        // Encoding - create .b64 or .txt file
        if (state.inputType === 'file' && state.currentFile) {
            filename = `${state.currentFile.name}.b64`;
        } else if (state.inputType === 'image' && state.currentImage) {
            filename = `${state.currentImage.name}.b64`;
        } else {
            filename = 'encoded.txt';
        }
    } else {
        // Decoding - use original filename if available
        if (state.lastEncodedFileName) {
            filename = state.lastEncodedFileName;
            mimeType = state.lastEncodedMimeType || 'text/plain';
        } else {
            filename = 'decoded.txt';
        }
    }

    const blob = new Blob([output], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`Downloaded ${filename}! 📥`);
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
            toggleEducationBtn.querySelector('.toggle-text').textContent = 'Learn More About Base64 Encoding';
        }

        trackEvent('Educational', isHidden ? 'Expand' : 'Collapse', 'Base64');
    });
}

// ========================================
// START APP
// ========================================
init();
