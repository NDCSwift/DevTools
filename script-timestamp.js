// ========================================
// CONFIGURATION & STATE
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    UPDATE_INTERVAL: 1000
};

const POPULAR_TIMEZONES = [
    { name: 'UTC', zone: 'UTC' },
    { name: 'New York', zone: 'America/New_York' },
    { name: 'Los Angeles', zone: 'America/Los_Angeles' },
    { name: 'London', zone: 'Europe/London' },
    { name: 'Paris', zone: 'Europe/Paris' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Shanghai', zone: 'Asia/Shanghai' },
    { name: 'Sydney', zone: 'Australia/Sydney' }
];

let state = {
    mode: 'unix-to-human',
    currentTimestamp: Date.now(),
    updateInterval: null
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    startLiveUpdate();
    initializeDefaultValues();
    initializeTimezoneList();
    console.log('⏰ ToolBit Timestamp Converter initialized');
}

function initializeDefaultValues() {
    // Set current date/time for Human to Unix
    const now = new Date();
    document.getElementById('dateInput').valueAsDate = now;
    document.getElementById('timeInput').value = now.toTimeString().split(' ')[0];
}

function initializeTimezoneList() {
    const list = document.getElementById('timezoneList');
    list.innerHTML = '';
    
    POPULAR_TIMEZONES.forEach(tz => {
        const item = document.createElement('div');
        item.className = 'timezone-item';
        item.innerHTML = `
            <span class="timezone-name">${tz.name}</span>
            <span class="timezone-time" data-timezone="${tz.zone}">-</span>
            <button class="copy-btn-small" onclick="copyTimezoneValue('${tz.zone}')">⎘</button>
        `;
        list.appendChild(item);
    });
}

// ========================================
// LIVE UPDATE
// ========================================
function startLiveUpdate() {
    updateCurrentTimestamp();
    state.updateInterval = setInterval(updateCurrentTimestamp, CONFIG.UPDATE_INTERVAL);
}

function updateCurrentTimestamp() {
    const now = Date.now();
    const seconds = Math.floor(now / 1000);
    
    document.getElementById('currentUnix').textContent = seconds;
    document.getElementById('currentUnixMs').textContent = now;
    document.getElementById('currentISO').textContent = new Date(now).toISOString();
    document.getElementById('currentLocal').textContent = new Date(now).toString();
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Mode tabs
    document.querySelectorAll('.mode-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchMode(mode);
        });
    });
    
    // Unix to Human
    document.getElementById('unixInput').addEventListener('input', convertUnixToHuman);
    document.querySelectorAll('#unixToHumanMode .preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.currentTarget.dataset.preset;
            applyPreset(preset, 'unix');
        });
    });
    
    // Human to Unix
    document.getElementById('convertToUnixBtn').addEventListener('click', convertHumanToUnix);
    document.querySelectorAll('#humanToUnixMode .preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const preset = e.currentTarget.dataset.preset;
            applyPreset(preset, 'human');
        });
    });
    
    // Timezone
    document.getElementById('timezoneInput').addEventListener('input', updateTimezones);
    
    // Relative Time
    document.getElementById('calculateBtn').addEventListener('click', calculateRelativeTime);
    
    // Batch
    document.getElementById('convertBatchBtn').addEventListener('click', convertBatch);
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
    state.mode = mode;
    
    // Update tabs
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });
    
    // Update content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const modeMap = {
        'unix-to-human': 'unixToHumanMode',
        'human-to-unix': 'humanToUnixMode',
        'timezone': 'timezoneMode',
        'relative': 'relativeMode',
        'batch': 'batchMode'
    };
    
    document.getElementById(modeMap[mode]).classList.add('active');
}

// ========================================
// UNIX TO HUMAN CONVERSION
// ========================================
function convertUnixToHuman() {
    const input = document.getElementById('unixInput').value.trim();
    
    if (!input) {
        clearUnixToHumanOutputs();
        return;
    }
    
    const timestamp = parseInt(input);
    
    if (isNaN(timestamp)) {
        clearUnixToHumanOutputs();
        return;
    }
    
    // Detect if milliseconds or seconds
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    
    if (isNaN(date.getTime())) {
        clearUnixToHumanOutputs();
        return;
    }
    
    document.getElementById('outputUTC').textContent = date.toUTCString();
    document.getElementById('outputISO').textContent = date.toISOString();
    document.getElementById('outputLocal').textContent = date.toString();
    document.getElementById('outputLocaleString').textContent = date.toLocaleString();
    document.getElementById('outputRelative').textContent = getRelativeTime(date);
}

function clearUnixToHumanOutputs() {
    document.getElementById('outputUTC').textContent = '-';
    document.getElementById('outputISO').textContent = '-';
    document.getElementById('outputLocal').textContent = '-';
    document.getElementById('outputLocaleString').textContent = '-';
    document.getElementById('outputRelative').textContent = '-';
}

// ========================================
// HUMAN TO UNIX CONVERSION
// ========================================
function convertHumanToUnix() {
    const dateValue = document.getElementById('dateInput').value;
    const timeValue = document.getElementById('timeInput').value;
    const timezone = document.getElementById('timezoneSelect').value;
    
    if (!dateValue || !timeValue) {
        showToast('Please select both date and time');
        return;
    }
    
    // Construct ISO string
    const isoString = `${dateValue}T${timeValue}`;
    const date = new Date(isoString);
    
    // Adjust for timezone (this is simplified - in production use a library like moment-timezone)
    const seconds = Math.floor(date.getTime() / 1000);
    const milliseconds = date.getTime();
    
    document.getElementById('unixSeconds').textContent = seconds;
    document.getElementById('unixMilliseconds').textContent = milliseconds;
    
    showToast('Converted to Unix timestamp! ⏰');
}

// ========================================
// TIMEZONE CONVERSION
// ========================================
function updateTimezones() {
    const input = document.getElementById('timezoneInput').value.trim();
    
    if (!input) {
        clearTimezones();
        return;
    }
    
    const timestamp = parseInt(input);
    
    if (isNaN(timestamp)) {
        clearTimezones();
        return;
    }
    
    const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
    const date = new Date(ms);
    
    if (isNaN(date.getTime())) {
        clearTimezones();
        return;
    }
    
    document.querySelectorAll('.timezone-time').forEach(el => {
        const timezone = el.dataset.timezone;
        try {
            const formatted = date.toLocaleString('en-US', {
                timeZone: timezone,
                dateStyle: 'full',
                timeStyle: 'long'
            });
            el.textContent = formatted;
        } catch (error) {
            el.textContent = 'Invalid timezone';
        }
    });
}

function clearTimezones() {
    document.querySelectorAll('.timezone-time').forEach(el => {
        el.textContent = '-';
    });
}

// ========================================
// RELATIVE TIME CALCULATION
// ========================================
function calculateRelativeTime() {
    const fromInput = document.getElementById('relativeFrom').value.trim();
    const toInput = document.getElementById('relativeTo').value.trim();
    
    if (!fromInput || !toInput) {
        showToast('Please enter both timestamps');
        return;
    }
    
    const fromTimestamp = parseInt(fromInput);
    const toTimestamp = parseInt(toInput);
    
    if (isNaN(fromTimestamp) || isNaN(toTimestamp)) {
        showToast('Invalid timestamps');
        return;
    }
    
    const fromMs = fromTimestamp.toString().length === 10 ? fromTimestamp * 1000 : fromTimestamp;
    const toMs = toTimestamp.toString().length === 10 ? toTimestamp * 1000 : toTimestamp;
    
    const diffMs = Math.abs(toMs - fromMs);
    
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    document.getElementById('diffDays').textContent = days;
    document.getElementById('diffHours').textContent = hours;
    document.getElementById('diffMinutes').textContent = minutes;
    document.getElementById('diffSeconds').textContent = seconds;
    
    const direction = toMs > fromMs ? 'later' : 'earlier';
    const summary = `${days} days, ${hours % 24} hours, ${minutes % 60} minutes, ${seconds % 60} seconds ${direction}`;
    document.getElementById('diffSummary').textContent = summary;
    
    document.getElementById('relativeDifference').classList.remove('hidden');
}

function getRelativeTime(date) {
    const now = Date.now();
    const diff = date.getTime() - now;
    const absDiff = Math.abs(diff);
    
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return diff > 0 ? 'in a few seconds' : 'a few seconds ago';
    if (minutes < 60) {
        const text = `${minutes} minute${minutes > 1 ? 's' : ''}`;
        return diff > 0 ? `in ${text}` : `${text} ago`;
    }
    if (hours < 24) {
        const text = `${hours} hour${hours > 1 ? 's' : ''}`;
        return diff > 0 ? `in ${text}` : `${text} ago`;
    }
    if (days < 30) {
        const text = `${days} day${days > 1 ? 's' : ''}`;
        return diff > 0 ? `in ${text}` : `${text} ago`;
    }
    if (months < 12) {
        const text = `${months} month${months > 1 ? 's' : ''}`;
        return diff > 0 ? `in ${text}` : `${text} ago`;
    }
    const text = `${years} year${years > 1 ? 's' : ''}`;
    return diff > 0 ? `in ${text}` : `${text} ago`;
}

// ========================================
// BATCH CONVERSION
// ========================================
function convertBatch() {
    const input = document.getElementById('batchInput').value;
    const format = document.getElementById('batchFormat').value;
    
    if (!input.trim()) {
        showToast('Please enter some timestamps');
        return;
    }
    
    const lines = input.split('\n').filter(line => line.trim());
    const results = [];
    
    lines.forEach(line => {
        const timestamp = parseInt(line.trim());
        
        if (isNaN(timestamp)) {
            results.push('ERROR: Invalid timestamp');
            return;
        }
        
        const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
        const date = new Date(ms);
        
        if (isNaN(date.getTime())) {
            results.push('ERROR: Invalid date');
            return;
        }
        
        switch (format) {
            case 'utc':
                results.push(date.toUTCString());
                break;
            case 'iso':
                results.push(date.toISOString());
                break;
            case 'local':
                results.push(date.toString());
                break;
            case 'relative':
                results.push(getRelativeTime(date));
                break;
            default:
                results.push(date.toUTCString());
        }
    });
    
    document.getElementById('batchOutput').value = results.join('\n');
    showToast('Batch conversion complete! ✓');
}

function downloadBatchCSV() {
    const input = document.getElementById('batchInput').value;
    const output = document.getElementById('batchOutput').value;
    
    if (!input.trim() || !output.trim()) {
        showToast('Convert batch first');
        return;
    }
    
    const inputLines = input.split('\n').filter(line => line.trim());
    const outputLines = output.split('\n');
    
    let csv = 'Input,Output\n';
    inputLines.forEach((line, i) => {
        csv += `"${line.replace(/"/g, '""')}","${outputLines[i].replace(/"/g, '""')}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timestamp-batch.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('CSV downloaded! 📥');
}

// ========================================
// PRESETS
// ========================================
function applyPreset(preset, mode) {
    const now = Date.now();
    let timestamp;
    
    switch (preset) {
        case 'now':
            timestamp = now;
            break;
        case '1h_ago':
            timestamp = now - (60 * 60 * 1000);
            break;
        case '1h_from_now':
            timestamp = now + (60 * 60 * 1000);
            break;
        case 'yesterday':
            timestamp = now - (24 * 60 * 60 * 1000);
            break;
        case 'tomorrow':
            timestamp = now + (24 * 60 * 60 * 1000);
            break;
        case 'today_start':
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            timestamp = startOfDay.getTime();
            break;
        case 'today_end':
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            timestamp = endOfDay.getTime();
            break;
        default:
            timestamp = now;
    }
    
    if (mode === 'unix') {
        document.getElementById('unixInput').value = Math.floor(timestamp / 1000);
        convertUnixToHuman();
    } else if (mode === 'human') {
        const date = new Date(timestamp);
        document.getElementById('dateInput').valueAsDate = date;
        document.getElementById('timeInput').value = date.toTimeString().split(' ')[0];
    }
}

function setRelativeNow(field) {
    const seconds = Math.floor(Date.now() / 1000);
    document.getElementById(`relative${field.charAt(0).toUpperCase() + field.slice(1)}`).value = seconds;
}

// ========================================
// COPY FUNCTIONS
// ========================================
window.copyValue = function(elementId) {
    const element = document.getElementById(elementId);
    const value = element.textContent;
    
    if (value && value !== '-') {
        copyToClipboard(value);
        showToast('Copied to clipboard! ⎘');
    }
};

window.copyTimezoneValue = function(timezone) {
    const element = document.querySelector(`[data-timezone="${timezone}"]`);
    const value = element.textContent;
    
    if (value && value !== '-') {
        copyToClipboard(value);
        showToast(`${timezone} time copied! ⎘`);
    }
};

// ========================================
// UTILITY FUNCTIONS
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
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
