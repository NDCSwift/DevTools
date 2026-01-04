// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    STORAGE_KEY: 'colorPalettes'
};

let state = {
    currentColor: '#00ff9f',
    currentHarmony: 'complementary',
    savedPalettes: []
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
    toastMessage: document.getElementById('toastMessage')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    loadSavedPalettes();
    attachEventListeners();
    updateAllFromColor(state.currentColor);
    console.log('🚀 DevToolkit Color Tool initialized');
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
    
    // Save palette
    elements.savePaletteBtn.addEventListener('click', saveCurrentPalette);
    
    // Popular palettes
    document.querySelectorAll('.palette-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const palette = JSON.parse(e.currentTarget.dataset.palette);
            if (palette && palette.length > 0) {
                updateAllFromColor(palette[0]);
            }
        });
    });
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
        <div class="color-swatch" style="background: ${color}" data-hex="${color}" onclick="updateAllFromColor('${color}')"></div>
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
                <p class="saved-hint">Click "Save Current" to save the active harmony palette</p>
            </div>
        `;
        return;
    }
    
    elements.savedPalettes.innerHTML = state.savedPalettes.map(palette => `
        <div class="saved-palette-card" onclick="loadPalette(${palette.id})">
            <div class="saved-palette-preview">
                ${palette.colors.map(c => `<div style="background: ${c}"></div>`).join('')}
            </div>
            <div class="saved-palette-name">${palette.name}</div>
            <div class="saved-palette-date">${new Date(palette.date).toLocaleDateString()}</div>
            <button class="delete-palette" onclick="event.stopPropagation(); deletePalette(${palette.id})">🗑️</button>
        </div>
    `).join('');
}

/**
 * Load palette
 */
window.loadPalette = function(id) {
    const palette = state.savedPalettes.find(p => p.id === id);
    if (palette && palette.colors.length > 0) {
        updateAllFromColor(palette.colors[0]);
        showToast('Palette loaded');
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
// START APP
// ========================================
init();
updateGradient();
