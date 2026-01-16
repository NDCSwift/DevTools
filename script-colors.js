// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    STORAGE_KEY: 'colorPalettes',
    MAX_HISTORY: 50 // Maximum undo/redo history
};

let state = {
    currentColor: '#00ff9f',
    currentHarmony: 'complementary',
    workingPalette: [], // NEW: Array of colors in working palette (max 8)
    savedPalettes: [],
    history: [], // Undo/redo history for working palette
    historyIndex: -1, // Current position in history
    accessibilityMode: false, // High contrast mode
    draggedIndex: null // For drag & drop
};

// ========================================
// DOM ELEMENTS
// ========================================
const elements = {
    colorPicker: document.getElementById('colorPicker'),
    colorDisplay: document.getElementById('colorDisplay'),
    colorName: document.getElementById('colorName'),

    // Value inputs
    hexInput: document.getElementById('hexInput'),
    rgbInput: document.getElementById('rgbInput'),
    hslInput: document.getElementById('hslInput'),
    cmykInput: document.getElementById('cmykInput'),

    // Buttons
    randomColorBtn: document.getElementById('randomColorBtn'),
    savePaletteBtn: document.getElementById('savePaletteBtn'),
    copyGradientBtn: document.getElementById('copyGradientBtn'),

    // Harmony
    harmonyPalette: document.getElementById('harmonyPalette'),

    // Gradient
    gradientColor1: document.getElementById('gradientColor1'),
    gradientColor2: document.getElementById('gradientColor2'),
    gradientType: document.getElementById('gradientType'),
    gradientAngle: document.getElementById('gradientAngle'),
    angleValue: document.getElementById('angleValue'),
    gradientPreview: document.getElementById('gradientPreview'),
    gradientCSS: document.getElementById('gradientCSS'),

    // Shades
    tintsGrid: document.getElementById('tintsGrid'),
    shadesGrid: document.getElementById('shadesGrid'),
    tonesGrid: document.getElementById('tonesGrid'),

    // Saved
    savedPalettes: document.getElementById('savedPalettes'),

    // Toast
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),

    // Undo/Redo & Export buttons
    undoBtn: document.getElementById('undoBtn'),
    redoBtn: document.getElementById('redoBtn'),
    eyedropperBtn: document.getElementById('eyedropperBtn'),
    exportPngBtn: document.getElementById('exportPngBtn'),
    accessibilityToggle: document.getElementById('accessibilityToggle'),

    // NEW: Contrast Checker
    contrastForeground: document.getElementById('contrastForeground'),
    contrastBackground: document.getElementById('contrastBackground'),
    contrastForegroundHex: document.getElementById('contrastForegroundHex'),
    contrastBackgroundHex: document.getElementById('contrastBackgroundHex'),
    contrastPreview: document.getElementById('contrastPreview'),
    contrastRatioValue: document.getElementById('contrastRatioValue'),
    swapContrastColors: document.getElementById('swapContrastColors'),
    usePickerForContrast: document.getElementById('usePickerForContrast'),

    // NEW: Import
    importHexInput: document.getElementById('importHexInput'),
    importCssInput: document.getElementById('importCssInput'),
    importJsonInput: document.getElementById('importJsonInput'),
    importHexBtn: document.getElementById('importHexBtn'),
    importCssBtn: document.getElementById('importCssBtn'),
    importJsonBtn: document.getElementById('importJsonBtn'),

    // NEW: Color Blindness
    colorblindPreview: document.getElementById('colorblindPreview'),
    colorblindDescription: document.getElementById('colorblindDescription'),

    // NEW: Image Extraction
    imageUploadArea: document.getElementById('imageUploadArea'),
    imageUploadInput: document.getElementById('imageUploadInput'),
    uploadedImage: document.getElementById('uploadedImage'),
    extractionControls: document.getElementById('extractionControls'),
    colorCount: document.getElementById('colorCount'),
    colorCountValue: document.getElementById('colorCountValue'),
    extractColorsBtn: document.getElementById('extractColorsBtn'),
    clearImageBtn: document.getElementById('clearImageBtn'),
    extractedColors: document.getElementById('extractedColors')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadSavedPalettes();
    loadAccessibilityMode(); // NEW: Load accessibility preference
    checkEyeDropperSupport(); // Check if EyeDropper is supported
    attachEventListeners();
    initializeWorkingPalette(); // NEW
    renderWorkingPalette(); // NEW
    updateAllFromColor(state.currentColor);
    updateHistoryButtons(); // NEW: Initialize undo/redo buttons
    console.log('🚀 ToolBit Color Tool initialized');
}

/**
 * Check if EyeDropper API is supported and update button accordingly
 */
function checkEyeDropperSupport() {
    if (elements.eyedropperBtn && !window.EyeDropper) {
        elements.eyedropperBtn.disabled = true;
        elements.eyedropperBtn.title = 'EyeDropper is only supported in Chrome, Edge, and Opera';
        elements.eyedropperBtn.style.opacity = '0.5';
        elements.eyedropperBtn.style.cursor = 'not-allowed';

        // Update button text to indicate not available
        const btnText = elements.eyedropperBtn.querySelector('.btn-icon');
        if (btnText) {
            btnText.textContent = '🚫';
        }
    }
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Color picker
    elements.colorPicker.addEventListener('input', (e) => {
        updateAllFromColor(e.target.value);
    });
    
    // Value inputs
    elements.hexInput.addEventListener('change', (e) => {
        if (isValidHex(e.target.value)) {
            updateAllFromColor(e.target.value);
        }
    });
    
    elements.rgbInput.addEventListener('change', (e) => {
        const hex = rgbToHex(e.target.value);
        if (hex) updateAllFromColor(hex);
    });
    
    elements.hslInput.addEventListener('change', (e) => {
        const hex = hslToHex(e.target.value);
        if (hex) updateAllFromColor(hex);
    });
    
    // Random color
    elements.randomColorBtn.addEventListener('click', generateRandomColor);
    
    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target;
            const input = document.getElementById(targetId);
            copyToClipboard(input.value);
        });
    });
    
    // Harmony tabs
    document.querySelectorAll('.harmony-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.harmony-tab').forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.currentHarmony = e.currentTarget.dataset.harmony;
            generateHarmony(state.currentColor, state.currentHarmony);
        });
    });
    
    // Gradient
    elements.gradientColor1.addEventListener('input', updateGradient);
    elements.gradientColor2.addEventListener('input', updateGradient);
    elements.gradientType.addEventListener('change', updateGradient);
    elements.gradientAngle.addEventListener('input', (e) => {
        elements.angleValue.textContent = e.target.value + '°';
        updateGradient();
    });
    elements.copyGradientBtn.addEventListener('click', () => {
        copyToClipboard(elements.gradientCSS.value);
    });
    
    // Save palette (OLD - now saves harmony)
    elements.savePaletteBtn.addEventListener('click', saveCurrentPalette);
    
    // NEW: Working Palette event listeners
    document.getElementById('addToPaletteBtn').addEventListener('click', () => {
        addToWorkingPalette(state.currentColor);
    });
    
    document.getElementById('clearPaletteBtn').addEventListener('click', clearWorkingPalette);
    
    document.getElementById('saveWorkingPaletteBtn').addEventListener('click', saveWorkingPalette);
    
    document.getElementById('loadHarmonyBtn').addEventListener('click', loadHarmonyToWorking);

    // NEW: Undo/Redo buttons
    if (elements.undoBtn) {
        elements.undoBtn.addEventListener('click', undo);
    }
    if (elements.redoBtn) {
        elements.redoBtn.addEventListener('click', redo);
    }

    // NEW: Eyedropper button
    if (elements.eyedropperBtn) {
        elements.eyedropperBtn.addEventListener('click', openEyeDropper);
    }

    // NEW: Export PNG button
    if (elements.exportPngBtn) {
        elements.exportPngBtn.addEventListener('click', exportPaletteAsPng);
    }

    // NEW: Accessibility toggle
    if (elements.accessibilityToggle) {
        elements.accessibilityToggle.addEventListener('change', toggleAccessibilityMode);
    }

    // NEW: Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            redo();
        }
    });

    // Popular palettes - UPDATED to load full palette
    document.querySelectorAll('.palette-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const palette = JSON.parse(e.currentTarget.dataset.palette);
            if (palette && palette.length > 0) {
                loadPopularPalette(palette); // NEW: Load all colors to working palette
            }
        });
    });

    // NEW: Contrast Checker event listeners
    if (elements.contrastForeground) {
        elements.contrastForeground.addEventListener('input', updateContrastChecker);
        elements.contrastBackground.addEventListener('input', updateContrastChecker);
        elements.contrastForegroundHex.addEventListener('change', (e) => {
            if (isValidHex(e.target.value)) {
                elements.contrastForeground.value = e.target.value;
                updateContrastChecker();
            }
        });
        elements.contrastBackgroundHex.addEventListener('change', (e) => {
            if (isValidHex(e.target.value)) {
                elements.contrastBackground.value = e.target.value;
                updateContrastChecker();
            }
        });
        elements.swapContrastColors.addEventListener('click', swapContrastColors);
        elements.usePickerForContrast.addEventListener('click', () => {
            elements.contrastForeground.value = state.currentColor;
            elements.contrastForegroundHex.value = state.currentColor;
            updateContrastChecker();
        });
    }

    // NEW: Import event listeners
    document.querySelectorAll('.import-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.import-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.import-panel').forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const type = e.currentTarget.dataset.import;
            document.getElementById(`import${type.charAt(0).toUpperCase() + type.slice(1)}Panel`).classList.add('active');
        });
    });

    if (elements.importHexBtn) {
        elements.importHexBtn.addEventListener('click', importHexColors);
        elements.importCssBtn.addEventListener('click', importCssColors);
        elements.importJsonBtn.addEventListener('click', importJsonColors);
    }

    // NEW: Color Blindness event listeners
    document.querySelectorAll('.colorblind-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.colorblind-tab').forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const type = e.currentTarget.dataset.type;
            renderColorBlindPreview(type);
        });
    });

    // NEW: Image extraction event listeners
    if (elements.imageUploadArea) {
        elements.imageUploadArea.addEventListener('click', () => {
            elements.imageUploadInput.click();
        });

        elements.imageUploadInput.addEventListener('change', handleImageUpload);

        // Drag and drop
        elements.imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.imageUploadArea.classList.add('drag-over');
        });

        elements.imageUploadArea.addEventListener('dragleave', () => {
            elements.imageUploadArea.classList.remove('drag-over');
        });

        elements.imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.imageUploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleImageFile(file);
            }
        });

        elements.colorCount.addEventListener('input', (e) => {
            elements.colorCountValue.textContent = e.target.value;
        });

        elements.extractColorsBtn.addEventListener('click', extractColorsFromImage);
        elements.clearImageBtn.addEventListener('click', clearUploadedImage);
    }
}

// ========================================
// WORKING PALETTE FUNCTIONS
// ========================================

/**
 * Save current palette state to history
 */
function saveToHistory() {
    // Remove any future history if we're not at the end
    if (state.historyIndex < state.history.length - 1) {
        state.history = state.history.slice(0, state.historyIndex + 1);
    }

    // Add current state
    state.history.push([...state.workingPalette]);

    // Limit history size
    if (state.history.length > CONFIG.MAX_HISTORY) {
        state.history.shift();
    } else {
        state.historyIndex++;
    }

    updateHistoryButtons();
}

/**
 * Undo last palette change
 */
function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        state.workingPalette = [...state.history[state.historyIndex]];
        renderWorkingPalette();
        updateHistoryButtons();
        showToast('Undo ↶');
    }
}

/**
 * Redo last undone change
 */
function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.workingPalette = [...state.history[state.historyIndex]];
        renderWorkingPalette();
        updateHistoryButtons();
        showToast('Redo ↷');
    }
}

/**
 * Update undo/redo button states
 */
function updateHistoryButtons() {
    if (elements.undoBtn) {
        elements.undoBtn.disabled = state.historyIndex <= 0;
        elements.undoBtn.style.opacity = state.historyIndex <= 0 ? '0.5' : '1';
    }
    if (elements.redoBtn) {
        elements.redoBtn.disabled = state.historyIndex >= state.history.length - 1;
        elements.redoBtn.style.opacity = state.historyIndex >= state.history.length - 1 ? '0.5' : '1';
    }
}

/**
 * Initialize working palette slots in HTML
 */
function initializeWorkingPalette() {
    const slotsContainer = document.getElementById('paletteSlots');
    slotsContainer.innerHTML = '';
    
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'palette-slot empty';
        slot.dataset.index = i;
        slot.innerHTML = `
            <div class="slot-color"></div>
            <div class="slot-hex">Empty</div>
            <button class="remove-color" title="Remove color">×</button>
        `;
        slotsContainer.appendChild(slot);
    }
}

/**
 * Add current color to working palette
 */
function addToWorkingPalette(color) {
    if (state.workingPalette.length >= 8) {
        showToast('Palette is full (max 8 colors)');
        return;
    }

    if (state.workingPalette.includes(color.toUpperCase())) {
        showToast('Color already in palette');
        return;
    }

    saveToHistory(); // Save before modifying
    state.workingPalette.push(color.toUpperCase());
    renderWorkingPalette();
    showToast('Added to palette! 🎨');
}

/**
 * Remove color from working palette
 */
function removeFromWorkingPalette(index) {
    saveToHistory(); // Save before modifying
    state.workingPalette.splice(index, 1);
    renderWorkingPalette();
    showToast('Color removed');
}

/**
 * Clear working palette
 */
function clearWorkingPalette() {
    if (state.workingPalette.length === 0) {
        showToast('Palette is already empty');
        return;
    }

    if (confirm('Clear all colors from working palette?')) {
        saveToHistory(); // Save before modifying
        state.workingPalette = [];
        renderWorkingPalette();
        showToast('Palette cleared');
    }
}

/**
 * Load current harmony colors to working palette
 */
function loadHarmonyToWorking() {
    const harmonyColors = getCurrentHarmonyColors();
    if (harmonyColors.length === 0) {
        showToast('No harmony colors to load');
        return;
    }

    saveToHistory(); // Save before modifying
    state.workingPalette = harmonyColors.map(c => c.toUpperCase());
    renderWorkingPalette();
    showToast(`Loaded ${harmonyColors.length} harmony colors! 🎨`);
}

/**
 * Get current harmony colors from display
 */
function getCurrentHarmonyColors() {
    const swatches = elements.harmonyPalette.querySelectorAll('.color-swatch');
    return Array.from(swatches).map(swatch => swatch.dataset.hex);
}

/**
 * Load popular palette to working palette
 */
function loadPopularPalette(colors) {
    saveToHistory(); // Save before modifying
    state.workingPalette = colors.map(c => c.toUpperCase());
    renderWorkingPalette();
    showToast(`Loaded ${colors.length} colors to palette! 🎨`);
}

/**
 * Save working palette
 */
function saveWorkingPalette() {
    if (state.workingPalette.length === 0) {
        showToast('Add some colors first!');
        return;
    }
    
    const name = prompt('Name this palette:', 'My Palette');
    if (!name) return;
    
    const palette = {
        id: Date.now(),
        name: name.trim(),
        colors: [...state.workingPalette],
        date: Date.now()
    };
    
    state.savedPalettes.push(palette);
    savePalettesToStorage();
    renderSavedPalettes();
    showToast('Palette saved! 💾');
}

/**
 * Render working palette slots
 */
function renderWorkingPalette() {
    const slots = document.querySelectorAll('.palette-slot');

    // Update color blindness preview if active
    const activeColorBlindTab = document.querySelector('.colorblind-tab.active');
    if (activeColorBlindTab) {
        const type = activeColorBlindTab.dataset.type;
        renderColorBlindPreview(type);
    }

    slots.forEach((slot, index) => {
        const colorDiv = slot.querySelector('.slot-color');
        const hexDiv = slot.querySelector('.slot-hex');
        const removeBtn = slot.querySelector('.remove-color');

        if (index < state.workingPalette.length) {
            const color = state.workingPalette[index];

            slot.classList.remove('empty');
            slot.setAttribute('draggable', 'true');
            colorDiv.style.background = color;
            hexDiv.textContent = color;
            removeBtn.style.display = 'flex';

            // Click to view/edit this color
            slot.onclick = () => updateAllFromColor(color);

            // Remove button
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                removeFromWorkingPalette(index);
            };

            // Add copy on hover tooltip
            slot.title = `Click to edit ${color}\nRight-click to copy\nDrag to reorder`;

            // Right-click to copy
            slot.oncontextmenu = (e) => {
                e.preventDefault();
                copyToClipboard(color);
            };

            // NEW: Drag & drop functionality
            slot.ondragstart = (e) => {
                state.draggedIndex = index;
                slot.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            };

            slot.ondragend = (e) => {
                slot.classList.remove('dragging');
                slots.forEach(s => s.classList.remove('drag-over'));
            };

            slot.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                slot.classList.add('drag-over');
            };

            slot.ondragleave = (e) => {
                slot.classList.remove('drag-over');
            };

            slot.ondrop = (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');

                if (state.draggedIndex !== null && state.draggedIndex !== index) {
                    saveToHistory(); // Save before reordering
                    const draggedColor = state.workingPalette[state.draggedIndex];
                    state.workingPalette.splice(state.draggedIndex, 1);
                    state.workingPalette.splice(index, 0, draggedColor);
                    renderWorkingPalette();
                    showToast('Colors reordered');
                }
                state.draggedIndex = null;
            };

        } else {
            slot.classList.add('empty');
            slot.removeAttribute('draggable');
            colorDiv.style.background = 'transparent';
            hexDiv.textContent = 'Empty';
            removeBtn.style.display = 'none';
            slot.onclick = null;
            slot.oncontextmenu = null;
            slot.ondragstart = null;
            slot.ondragend = null;
            slot.ondragover = null;
            slot.ondragleave = null;
            slot.ondrop = null;
            slot.title = 'Add a color to fill this slot';
        }
    });
}

/**
 * Export working palette in different formats
 */
window.exportPaletteAs = function(format) {
    if (state.workingPalette.length === 0) {
        showToast('Palette is empty!');
        return;
    }

    let output;

    switch(format) {
        case 'css':
            output = ':root {\n' + state.workingPalette.map((c, i) =>
                `  --color-${i + 1}: ${c};`
            ).join('\n') + '\n}';
            break;

        case 'array':
            output = JSON.stringify(state.workingPalette);
            break;

        case 'json':
            output = JSON.stringify({
                name: 'My Palette',
                colors: state.workingPalette,
                count: state.workingPalette.length
            }, null, 2);
            break;
    }

    copyToClipboard(output);
};

/**
 * Open EyeDropper API to pick color from screen
 */
async function openEyeDropper() {
    if (!window.EyeDropper) {
        showToast('⚠️ EyeDropper is only supported in Chrome, Edge, and Opera. Safari support coming soon!');

        // Optionally offer alternative instructions
        setTimeout(() => {
            showToast('💡 Tip: Use a browser extension or screenshot tool instead');
        }, 3500);
        return;
    }

    try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        updateAllFromColor(result.sRGBHex);
        showToast('Color picked! 🎨');
    } catch (error) {
        if (error.name === 'AbortError') {
            // User cancelled, don't show error
            return;
        }
        showToast('Failed to pick color');
        console.error('EyeDropper error:', error);
    }
}

/**
 * Export palette as PNG image
 */
function exportPaletteAsPng() {
    if (state.workingPalette.length === 0) {
        showToast('Palette is empty!');
        return;
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const swatchWidth = 200;
    const swatchHeight = 200;
    const cols = Math.min(4, state.workingPalette.length);
    const rows = Math.ceil(state.workingPalette.length / cols);

    canvas.width = cols * swatchWidth;
    canvas.height = rows * swatchHeight;

    // Draw background
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw color swatches
    state.workingPalette.forEach((color, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * swatchWidth;
        const y = row * swatchHeight;

        // Draw color
        ctx.fillStyle = color;
        ctx.fillRect(x + 10, y + 10, swatchWidth - 20, swatchHeight - 60);

        // Draw text
        ctx.fillStyle = '#e6edf3';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(color, x + swatchWidth / 2, y + swatchHeight - 20);
    });

    // Download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `palette-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Palette exported as PNG! 📸');
    });
}

/**
 * Toggle accessibility mode
 */
function toggleAccessibilityMode() {
    state.accessibilityMode = !state.accessibilityMode;
    document.body.classList.toggle('accessibility-mode', state.accessibilityMode);
    localStorage.setItem('accessibilityMode', state.accessibilityMode);
    showToast(state.accessibilityMode ? 'Accessibility mode ON' : 'Accessibility mode OFF');
}

/**
 * Load accessibility mode from localStorage
 */
function loadAccessibilityMode() {
    const saved = localStorage.getItem('accessibilityMode');
    if (saved === 'true') {
        state.accessibilityMode = true;
        document.body.classList.add('accessibility-mode');
        if (elements.accessibilityToggle) {
            elements.accessibilityToggle.checked = true;
        }
    }
}

// ========================================
// COLOR CONVERSION FUNCTIONS
// ========================================

/**
 * Convert HEX to RGB
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to HEX
 */
function rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);
    if (!match || match.length < 3) return null;
    
    const r = parseInt(match[0]);
    const g = parseInt(match[1]);
    const b = parseInt(match[2]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Convert HEX to HSL
 */
function hexToHsl(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

/**
 * Convert HSL to HEX
 */
function hslToHex(hsl) {
    const match = hsl.match(/\d+/g);
    if (!match || match.length < 3) return null;
    
    let h = parseInt(match[0]) / 360;
    let s = parseInt(match[1]) / 100;
    let l = parseInt(match[2]) / 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert HEX to CMYK
 */
function hexToCmyk(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    const k = 1 - Math.max(r, g, b);
    const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b - k) / (1 - k);
    
    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

/**
 * Validate HEX color
 */
function isValidHex(hex) {
    return /^#[0-9A-F]{6}$/i.test(hex);
}

// ========================================
// COLOR MANIPULATION
// ========================================

/**
 * Update all displays from a color
 */
function updateAllFromColor(hex) {
    if (!isValidHex(hex)) return;
    
    state.currentColor = hex.toUpperCase();
    
    // Update picker
    elements.colorPicker.value = hex;
    elements.colorDisplay.style.background = hex;
    
    // Update value inputs
    const rgb = hexToRgb(hex);
    const hsl = hexToHsl(hex);
    const cmyk = hexToCmyk(hex);
    
    elements.hexInput.value = hex.toUpperCase();
    elements.rgbInput.value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    elements.hslInput.value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    elements.cmykInput.value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    
    // Update color name (simplified)
    elements.colorName.textContent = getColorName(hex);
    
    // Update harmony
    generateHarmony(hex, state.currentHarmony);
    
    // Update shades/tints
    generateShades(hex);
}

/**
 * Get approximate color name
 */
function getColorName(hex) {
    const hsl = hexToHsl(hex);
    const { h, s, l } = hsl;
    
    // Grayscale
    if (s < 10) {
        if (l < 20) return 'Black';
        if (l < 40) return 'Dark Gray';
        if (l < 60) return 'Gray';
        if (l < 80) return 'Light Gray';
        return 'White';
    }
    
    // Colors
    const hueNames = [
        'Red', 'Orange', 'Yellow', 'Lime', 'Green', 'Teal',
        'Cyan', 'Sky', 'Blue', 'Purple', 'Magenta', 'Pink'
    ];
    
    const hueIndex = Math.round(h / 30) % 12;
    let name = hueNames[hueIndex];
    
    // Add modifiers
    if (l < 30) name = 'Dark ' + name;
    else if (l > 70) name = 'Light ' + name;
    
    if (s > 80 && l > 40 && l < 60) name = 'Neon ' + name;
    
    return name;
}

/**
 * Generate random color
 */
function generateRandomColor() {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    updateAllFromColor(randomHex);
    showToast('Random color generated 🎲');
}

// ========================================
// COLOR HARMONIES
// ========================================

/**
 * Generate color harmony
 */
function generateHarmony(hex, type) {
    const hsl = hexToHsl(hex);
    let colors = [];
    
    switch (type) {
        case 'complementary':
            colors = [
                hex,
                rotateHue(hex, 180)
            ];
            break;
            
        case 'analogous':
            colors = [
                rotateHue(hex, -30),
                hex,
                rotateHue(hex, 30)
            ];
            break;
            
        case 'triadic':
            colors = [
                hex,
                rotateHue(hex, 120),
                rotateHue(hex, 240)
            ];
            break;
            
        case 'tetradic':
            colors = [
                hex,
                rotateHue(hex, 90),
                rotateHue(hex, 180),
                rotateHue(hex, 270)
            ];
            break;
            
        case 'monochromatic':
            colors = [
                adjustLightness(hex, -30),
                adjustLightness(hex, -15),
                hex,
                adjustLightness(hex, 15),
                adjustLightness(hex, 30)
            ];
            break;
    }
    
    displayPalette(colors);
}

/**
 * Rotate hue
 */
function rotateHue(hex, degrees) {
    const hsl = hexToHsl(hex);
    hsl.h = (hsl.h + degrees + 360) % 360;
    return hslToHex(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
}

/**
 * Adjust lightness
 */
function adjustLightness(hex, amount) {
    const hsl = hexToHsl(hex);
    hsl.l = Math.max(0, Math.min(100, hsl.l + amount));
    return hslToHex(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`);
}

/**
 * Display palette
 */
function displayPalette(colors) {
    elements.harmonyPalette.innerHTML = colors.map(color => `
        <div class="color-swatch"
             style="background: ${color}"
             data-hex="${color}"
             title="${color}&#10;Left-click: View color&#10;Right-click: Add to palette"
             onclick="updateAllFromColor('${color}')"
             oncontextmenu="event.preventDefault(); addToWorkingPalette('${color}')">
        </div>
    `).join('');
}

// ========================================
// GRADIENT
// ========================================

/**
 * Update gradient preview
 */
function updateGradient() {
    const color1 = elements.gradientColor1.value;
    const color2 = elements.gradientColor2.value;
    const type = elements.gradientType.value;
    const angle = elements.gradientAngle.value;

    // Show/hide angle control based on gradient type
    const angleContainer = elements.gradientAngle.parentElement;
    if (type === 'radial') {
        angleContainer.style.opacity = '0.5';
        angleContainer.style.pointerEvents = 'none';
        elements.gradientAngle.disabled = true;
    } else {
        angleContainer.style.opacity = '1';
        angleContainer.style.pointerEvents = 'auto';
        elements.gradientAngle.disabled = false;
    }

    let css;
    if (type === 'linear') {
        css = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
    } else {
        css = `radial-gradient(circle, ${color1}, ${color2})`;
    }

    elements.gradientPreview.style.background = css;
    elements.gradientCSS.value = `background: ${css};`;
}

// ========================================
// SHADES & TINTS
// ========================================

/**
 * Generate shades, tints, and tones
 */
function generateShades(hex) {
    // Tints (add white)
    const tints = [];
    for (let i = 10; i <= 90; i += 20) {
        tints.push(mixColors(hex, '#FFFFFF', i / 100));
    }
    
    // Shades (add black)
    const shades = [];
    for (let i = 10; i <= 90; i += 20) {
        shades.push(mixColors(hex, '#000000', i / 100));
    }
    
    // Tones (add gray)
    const tones = [];
    for (let i = 10; i <= 90; i += 20) {
        tones.push(mixColors(hex, '#808080', i / 100));
    }
    
    displayShades(elements.tintsGrid, tints);
    displayShades(elements.shadesGrid, shades);
    displayShades(elements.tonesGrid, tones);
}

/**
 * Mix two colors
 */
function mixColors(color1, color2, ratio) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const r = Math.round(rgb1.r * (1 - ratio) + rgb2.r * ratio);
    const g = Math.round(rgb1.g * (1 - ratio) + rgb2.g * ratio);
    const b = Math.round(rgb1.b * (1 - ratio) + rgb2.b * ratio);
    
    return rgbToHex(`rgb(${r}, ${g}, ${b})`);
}

/**
 * Display shades
 */
function displayShades(container, colors) {
    container.innerHTML = colors.map(color => `
        <div class="shade-color" style="background: ${color}" title="${color}" onclick="updateAllFromColor('${color}')"></div>
    `).join('');
}

// ========================================
// PALETTE MANAGEMENT
// ========================================

/**
 * Save current palette
 */
function saveCurrentPalette() {
    const colors = Array.from(document.querySelectorAll('#harmonyPalette .color-swatch')).map(el => el.dataset.hex);
    
    if (colors.length === 0) {
        showToast('No palette to save');
        return;
    }
    
    const palette = {
        id: Date.now(),
        name: `${state.currentHarmony} - ${new Date().toLocaleDateString()}`,
        colors: colors,
        date: new Date().toISOString()
    };
    
    state.savedPalettes.unshift(palette);
    savePalettesToStorage();
    renderSavedPalettes();
    
    showToast('Palette saved! 💾');
}

/**
 * Load saved palettes from localStorage
 */
function loadSavedPalettes() {
    try {
        const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (stored) {
            state.savedPalettes = JSON.parse(stored);
            renderSavedPalettes();
        }
    } catch (error) {
        console.warn('Failed to load saved palettes:', error);
        state.savedPalettes = [];
    }
}

/**
 * Save palettes to localStorage
 */
function savePalettesToStorage() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(state.savedPalettes));
    } catch (error) {
        console.warn('Failed to save palettes:', error);
    }
}

/**
 * Render saved palettes
 */
function renderSavedPalettes() {
    if (state.savedPalettes.length === 0) {
        elements.savedPalettes.innerHTML = `
            <div class="saved-empty">
                <p>No saved palettes yet</p>
                <p class="saved-hint">Click "💾 Save Palette" to save your working palette</p>
            </div>
        `;
        return;
    }
    
    elements.savedPalettes.innerHTML = state.savedPalettes.map(palette => `
        <div class="saved-palette-card" onclick="loadPalette(${palette.id})">
            <div class="saved-palette-preview">
                ${palette.colors.map(c => `<div style="background: ${c}" title="${c}"></div>`).join('')}
            </div>
            <div class="saved-palette-info">
                <div class="saved-palette-name">${palette.name}</div>
                <div class="saved-palette-meta">
                    <span>${palette.colors.length} colors</span>
                    <span>•</span>
                    <span>${new Date(palette.date).toLocaleDateString()}</span>
                </div>
            </div>
            <button class="delete-palette" onclick="event.stopPropagation(); deletePalette(${palette.id})" title="Delete palette">🗑️</button>
        </div>
    `).join('');
}

/**
 * Load palette
 */
window.loadPalette = function(id) {
    const palette = state.savedPalettes.find(p => p.id === id);
    if (palette && palette.colors.length > 0) {
        state.workingPalette = [...palette.colors];
        renderWorkingPalette();
        updateAllFromColor(palette.colors[0]); // Also show first color in picker
        showToast(`Loaded "${palette.name}" to working palette! 🎨`);
    }
};

/**
 * Delete palette
 */
window.deletePalette = function(id) {
    state.savedPalettes = state.savedPalettes.filter(p => p.id !== id);
    savePalettesToStorage();
    renderSavedPalettes();
    showToast('Palette deleted');
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Copy to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard! ⎘');
    } catch (error) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard! ⎘');
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
// ANALYTICS PLACEHOLDER
// ========================================
function trackEvent(category, action, label) {
    console.log('📊 Event:', category, action, label);
}

// Track usage
elements.randomColorBtn.addEventListener('click', () => trackEvent('Tool', 'Random', 'Color'));
elements.savePaletteBtn.addEventListener('click', () => trackEvent('Tool', 'Save', 'Palette'));

// ========================================
// CONTRAST CHECKER FUNCTIONS
// ========================================

/**
 * Calculate relative luminance (WCAG formula)
 */
function getLuminance(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1, color2) {
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Update contrast checker display
 */
function updateContrastChecker() {
    const fg = elements.contrastForeground.value;
    const bg = elements.contrastBackground.value;

    // Update hex inputs
    elements.contrastForegroundHex.value = fg.toUpperCase();
    elements.contrastBackgroundHex.value = bg.toUpperCase();

    // Update preview
    elements.contrastPreview.style.backgroundColor = bg;
    elements.contrastPreview.style.color = fg;

    // Calculate contrast ratio
    const ratio = getContrastRatio(fg, bg);
    elements.contrastRatioValue.textContent = ratio.toFixed(2) + ':1';

    // Update overall status
    updateContrastStatus(ratio);

    // Update WCAG compliance badges
    updateComplianceBadge('normalAA', ratio, 4.5);
    updateComplianceBadge('normalAAA', ratio, 7);
    updateComplianceBadge('largeAA', ratio, 3);
    updateComplianceBadge('largeAAA', ratio, 4.5);
    updateComplianceBadge('uiAA', ratio, 3);
}

/**
 * Update overall contrast status message
 */
function updateContrastStatus(ratio) {
    const statusEl = document.getElementById('contrastRatioStatus');
    if (!statusEl) return;

    // Clear existing classes
    statusEl.className = 'contrast-ratio-status';

    if (ratio >= 7) {
        statusEl.classList.add('excellent');
        statusEl.textContent = '✓ Excellent - Passes AAA for all text';
    } else if (ratio >= 4.5) {
        statusEl.classList.add('good');
        statusEl.textContent = '✓ Good - Passes AA for all text';
    } else if (ratio >= 3) {
        statusEl.classList.add('close');
        statusEl.textContent = '⚠ Fair - Only large text & UI pass AA';
    } else if (ratio >= 2.5) {
        statusEl.classList.add('close');
        statusEl.textContent = `⚠ Close - Need ${(3 - ratio).toFixed(2)} more for AA Large`;
    } else {
        statusEl.classList.add('poor');
        statusEl.textContent = '✗ Poor - Does not meet WCAG standards';
    }
}

/**
 * Update compliance badge status
 */
function updateComplianceBadge(id, ratio, threshold) {
    const badge = document.getElementById(id);
    if (!badge) return;

    const statusEl = badge.querySelector('.badge-status');
    const passes = ratio >= threshold;
    const isClose = !passes && ratio >= threshold - 0.5; // Within 0.5 of passing

    // Clear existing classes
    badge.classList.remove('pass', 'fail', 'close');

    if (passes) {
        badge.classList.add('pass');
        if (statusEl) statusEl.textContent = 'Pass';
    } else if (isClose) {
        badge.classList.add('close');
        if (statusEl) statusEl.textContent = `Need ${(threshold - ratio).toFixed(1)}`;
    } else {
        badge.classList.add('fail');
        if (statusEl) statusEl.textContent = 'Fail';
    }
}

/**
 * Swap foreground and background colors
 */
function swapContrastColors() {
    const fg = elements.contrastForeground.value;
    const bg = elements.contrastBackground.value;
    elements.contrastForeground.value = bg;
    elements.contrastBackground.value = fg;
    updateContrastChecker();
    showToast('Colors swapped! ⇄');
}

// ========================================
// IMPORT PALETTE FUNCTIONS
// ========================================

/**
 * Import HEX colors from text
 */
function importHexColors() {
    const input = elements.importHexInput.value.trim();
    if (!input) {
        showToast('Please paste some HEX codes');
        return;
    }

    // Extract all valid hex codes
    const hexPattern = /#[0-9A-Fa-f]{6}\b/g;
    const matches = input.match(hexPattern);

    if (!matches || matches.length === 0) {
        showToast('No valid HEX codes found');
        return;
    }

    const colors = matches.slice(0, 8).map(c => c.toUpperCase());
    saveToHistory();
    state.workingPalette = colors;
    renderWorkingPalette();
    showToast(`Imported ${colors.length} colors! 🎨`);
    elements.importHexInput.value = '';
}

/**
 * Import colors from CSS variables
 */
function importCssColors() {
    const input = elements.importCssInput.value.trim();
    if (!input) {
        showToast('Please paste some CSS');
        return;
    }

    // Extract hex codes from CSS
    const hexPattern = /#[0-9A-Fa-f]{6}\b/g;
    const matches = input.match(hexPattern);

    if (!matches || matches.length === 0) {
        showToast('No valid color values found in CSS');
        return;
    }

    const colors = matches.slice(0, 8).map(c => c.toUpperCase());
    saveToHistory();
    state.workingPalette = colors;
    renderWorkingPalette();
    showToast(`Imported ${colors.length} colors from CSS! 🎨`);
    elements.importCssInput.value = '';
}

/**
 * Import colors from JSON
 */
function importJsonColors() {
    const input = elements.importJsonInput.value.trim();
    if (!input) {
        showToast('Please paste some JSON');
        return;
    }

    try {
        const data = JSON.parse(input);
        let colors = [];

        // Handle different JSON formats
        if (Array.isArray(data)) {
            colors = data;
        } else if (data.colors && Array.isArray(data.colors)) {
            colors = data.colors;
        } else if (data.palette && Array.isArray(data.palette)) {
            colors = data.palette;
        } else {
            showToast('Invalid JSON format. Expected array or object with "colors" property');
            return;
        }

        // Validate hex codes
        const validColors = colors
            .filter(c => typeof c === 'string' && isValidHex(c))
            .slice(0, 8)
            .map(c => c.toUpperCase());

        if (validColors.length === 0) {
            showToast('No valid HEX codes found in JSON');
            return;
        }

        saveToHistory();
        state.workingPalette = validColors;
        renderWorkingPalette();
        showToast(`Imported ${validColors.length} colors from JSON! 🎨`);
        elements.importJsonInput.value = '';

    } catch (error) {
        showToast('Invalid JSON format');
        console.error('JSON parse error:', error);
    }
}

// ========================================
// COLOR BLINDNESS SIMULATION FUNCTIONS
// ========================================

/**
 * Simulate color blindness for a given color
 */
function simulateColorBlindness(hex, type) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;

    // Transformation matrices for different types of color blindness
    const matrices = {
        normal: [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ],
        protanopia: [ // Red-blind
            [0.567, 0.433, 0],
            [0.558, 0.442, 0],
            [0, 0.242, 0.758]
        ],
        deuteranopia: [ // Green-blind
            [0.625, 0.375, 0],
            [0.7, 0.3, 0],
            [0, 0.3, 0.7]
        ],
        tritanopia: [ // Blue-blind
            [0.95, 0.05, 0],
            [0, 0.433, 0.567],
            [0, 0.475, 0.525]
        ],
        achromatopsia: [ // Monochrome
            [0.299, 0.587, 0.114],
            [0.299, 0.587, 0.114],
            [0.299, 0.587, 0.114]
        ]
    };

    const matrix = matrices[type] || matrices.normal;

    const newR = Math.min(255, Math.max(0, Math.round((matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b) * 255)));
    const newG = Math.min(255, Math.max(0, Math.round((matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b) * 255)));
    const newB = Math.min(255, Math.max(0, Math.round((matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b) * 255)));

    return rgbToHex(`rgb(${newR}, ${newG}, ${newB})`);
}

/**
 * Render color blind preview
 */
function renderColorBlindPreview(type) {
    if (state.workingPalette.length === 0) {
        elements.colorblindPreview.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--color-text-dim);">Add colors to your working palette to preview</div>';
        updateColorBlindDescription(type);
        return;
    }

    elements.colorblindPreview.innerHTML = state.workingPalette.map(color => {
        const simulated = simulateColorBlindness(color, type);
        return `
            <div class="colorblind-swatch" style="background: ${simulated}" title="Original: ${color}&#10;Simulated: ${simulated}">
                <div class="colorblind-swatch-label">${simulated}</div>
            </div>
        `;
    }).join('');

    updateColorBlindDescription(type);
}

/**
 * Update color blindness description
 */
function updateColorBlindDescription(type) {
    const descriptions = {
        normal: 'Your palette as seen by people with normal color vision.',
        protanopia: 'Protanopia (Red-Blind): Affects ~1% of males. Red appears darker and more muted. Red and green may be confused.',
        deuteranopia: 'Deuteranopia (Green-Blind): Most common, affects ~1% of males. Green appears more red. Red and green may be confused.',
        tritanopia: 'Tritanopia (Blue-Blind): Rare, affects ~0.001%. Blue appears greener, yellow appears more pink or violet.',
        achromatopsia: 'Achromatopsia (Total Color Blindness): Very rare. Only brightness differences are visible, no color.'
    };

    elements.colorblindDescription.textContent = descriptions[type] || descriptions.normal;
}

// ========================================
// IMAGE COLOR EXTRACTION FUNCTIONS
// ========================================

/**
 * Handle image upload from file input
 */
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

/**
 * Handle image file
 */
function handleImageFile(file) {
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showToast('Image too large (max 10MB)');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        elements.uploadedImage.src = e.target.result;
        elements.uploadedImage.style.display = 'block';
        elements.uploadedImage.parentElement.querySelector('.upload-prompt').style.display = 'none';
        elements.extractionControls.style.display = 'flex';
        showToast('Image loaded! Click "Extract Colors" to analyze 📸');
    };
    reader.readAsDataURL(file);
}

/**
 * Clear uploaded image
 */
function clearUploadedImage() {
    elements.uploadedImage.src = '';
    elements.uploadedImage.style.display = 'none';
    elements.uploadedImage.parentElement.querySelector('.upload-prompt').style.display = 'flex';
    elements.extractionControls.style.display = 'none';
    elements.extractedColors.innerHTML = '';
    elements.imageUploadInput.value = '';
    showToast('Image cleared');
}

/**
 * Extract dominant colors from image using k-means clustering
 */
function extractColorsFromImage() {
    if (!elements.uploadedImage.src) {
        showToast('Please upload an image first');
        return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = elements.uploadedImage;

    // Resize image for faster processing
    const maxSize = 200;
    const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight);
    canvas.width = img.naturalWidth * scale;
    canvas.height = img.naturalHeight * scale;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Sample pixels (every 10th pixel for performance)
    const samples = [];
    for (let i = 0; i < pixels.length; i += 40) { // 40 = 10 pixels * 4 (RGBA)
        samples.push([pixels[i], pixels[i + 1], pixels[i + 2]]);
    }

    // Simple k-means clustering
    const k = parseInt(elements.colorCount.value);
    const colors = kMeansClustering(samples, k);

    // Display extracted colors
    displayExtractedColors(colors);
}

/**
 * K-means clustering for color extraction
 */
function kMeansClustering(pixels, k, maxIterations = 10) {
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
        const randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        centroids.push([...randomPixel]);
    }

    for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Assign pixels to nearest centroid
        const clusters = Array.from({ length: k }, () => []);

        pixels.forEach(pixel => {
            let minDist = Infinity;
            let closestCentroid = 0;

            centroids.forEach((centroid, i) => {
                const dist = Math.sqrt(
                    Math.pow(pixel[0] - centroid[0], 2) +
                    Math.pow(pixel[1] - centroid[1], 2) +
                    Math.pow(pixel[2] - centroid[2], 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    closestCentroid = i;
                }
            });

            clusters[closestCentroid].push(pixel);
        });

        // Recalculate centroids
        const newCentroids = clusters.map(cluster => {
            if (cluster.length === 0) return centroids[0]; // Fallback

            const sum = cluster.reduce((acc, pixel) => [
                acc[0] + pixel[0],
                acc[1] + pixel[1],
                acc[2] + pixel[2]
            ], [0, 0, 0]);

            return [
                Math.round(sum[0] / cluster.length),
                Math.round(sum[1] / cluster.length),
                Math.round(sum[2] / cluster.length)
            ];
        });

        // Check for convergence
        const converged = centroids.every((c, i) =>
            c[0] === newCentroids[i][0] &&
            c[1] === newCentroids[i][1] &&
            c[2] === newCentroids[i][2]
        );

        centroids = newCentroids;
        if (converged) break;
    }

    // Convert RGB to HEX
    return centroids.map(rgb => rgbToHex(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`));
}

/**
 * Display extracted colors
 */
function displayExtractedColors(colors) {
    elements.extractedColors.innerHTML = colors.map(color => `
        <div class="extracted-color-item" onclick="addToWorkingPalette('${color}')" title="Click to add to palette">
            <div class="extracted-color-swatch" style="background: ${color}"></div>
            <div class="extracted-color-hex">${color}</div>
        </div>
    `).join('');

    showToast(`Extracted ${colors.length} dominant colors! 🎨`);
}

// ========================================
// APPLY PALETTE PREVIEW COLORS
// ========================================
function applyPalettePreviewColors() {
    // Apply colors to all palette preview divs from data-color attributes
    document.querySelectorAll('.palette-preview div[data-color]').forEach(div => {
        const color = div.getAttribute('data-color');
        if (color) {
            div.style.background = color;
        }
    });
}

// ========================================
// START APP
// ========================================
init();
updateGradient();
applyPalettePreviewColors();

// Initialize new features
if (elements.contrastForeground) {
    updateContrastChecker();
}
if (elements.colorblindPreview) {
    renderColorBlindPreview('normal');
}