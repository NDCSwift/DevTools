// ========================================
// CONFIGURATION & STATE
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000,
    SAMPLE_ORIGINAL: `function calculateTotal(items) {
  var total = 0;
  for (i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`,
    SAMPLE_MODIFIED: `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  console.log("Total:", total);
  return total;
}`
};

let state = {
    viewMode: 'side-by-side',
    language: 'javascript',
    ignoreWhitespace: true,
    ignoreCase: false,
    showLineNumbers: true,
    
    originalText: '',
    modifiedText: '',
    
    diff: null,
    diffLines: null,
    stats: null,
    
    currentChange: -1,
    changePositions: []
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    console.log('📝 ToolBit Diff Checker initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Input actions
    document.getElementById('pasteLeft').addEventListener('click', () => pasteText('left'));
    document.getElementById('pasteRight').addEventListener('click', () => pasteText('right'));
    document.getElementById('clearLeft').addEventListener('click', () => clearText('left'));
    document.getElementById('clearRight').addEventListener('click', () => clearText('right'));
    document.getElementById('sampleLeft').addEventListener('click', () => loadSample('left'));
    document.getElementById('sampleRight').addEventListener('click', () => loadSample('right'));
    
    // Settings
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        state.language = e.target.value;
    });
    
    document.getElementById('ignoreWhitespace').addEventListener('change', (e) => {
        state.ignoreWhitespace = e.target.checked;
    });
    
    document.getElementById('ignoreCase').addEventListener('change', (e) => {
        state.ignoreCase = e.target.checked;
    });
    
    document.getElementById('showLineNumbers').addEventListener('change', (e) => {
        state.showLineNumbers = e.target.checked;
        if (state.diff) renderDiff();
    });
    
    // View mode
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchViewMode(mode);
        });
    });
    
    // Compare button
    document.getElementById('compareBtn').addEventListener('click', compareDiff);
    
    // Copy buttons
    document.getElementById('copyOriginal').addEventListener('click', () => {
        copyToClipboard(state.originalText);
        showToast('Original text copied! ⎘');
    });
    
    document.getElementById('copyModified').addEventListener('click', () => {
        copyToClipboard(state.modifiedText);
        showToast('Modified text copied! ⎘');
    });
    
    document.getElementById('copyInline').addEventListener('click', () => {
        const inlineDiff = generateInlineText();
        copyToClipboard(inlineDiff);
        showToast('Inline diff copied! ⎘');
    });
    
    // Navigation
    document.getElementById('prevChange').addEventListener('click', () => navigateChange(-1));
    document.getElementById('nextChange').addEventListener('click', () => navigateChange(1));
    
    // Export
    document.getElementById('exportUnified').addEventListener('click', exportUnifiedDiff);
    document.getElementById('exportHTML').addEventListener('click', exportHTML);
}

// ========================================
// TEXT INPUT FUNCTIONS
// ========================================
async function pasteText(side) {
    try {
        const text = await navigator.clipboard.readText();
        const textarea = side === 'left' ? 
            document.getElementById('originalText') : 
            document.getElementById('modifiedText');
        textarea.value = text;
        showToast('Text pasted from clipboard! 📋');
    } catch (error) {
        showToast('Failed to paste from clipboard');
    }
}

function clearText(side) {
    const textarea = side === 'left' ? 
        document.getElementById('originalText') : 
        document.getElementById('modifiedText');
    textarea.value = '';
}

function loadSample(side) {
    const textarea = side === 'left' ? 
        document.getElementById('originalText') : 
        document.getElementById('modifiedText');
    const sample = side === 'left' ? CONFIG.SAMPLE_ORIGINAL : CONFIG.SAMPLE_MODIFIED;
    textarea.value = sample;
    showToast('Sample code loaded! 📝');
}

// ========================================
// VIEW MODE
// ========================================
function switchViewMode(mode) {
    state.viewMode = mode;
    
    // Update buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    // Update views
    document.querySelectorAll('.diff-view').forEach(view => {
        view.classList.remove('active');
    });
    
    const viewMap = {
        'side-by-side': 'sideBySideView',
        'inline': 'inlineView'
    };
    
    document.getElementById(viewMap[mode]).classList.add('active');
}

// ========================================
// DIFF COMPARISON
// ========================================
function compareDiff() {
    state.originalText = document.getElementById('originalText').value;
    state.modifiedText = document.getElementById('modifiedText').value;
    
    if (!state.originalText && !state.modifiedText) {
        showToast('Please enter some text to compare');
        return;
    }
    
    // Preprocess text
    let text1 = state.originalText;
    let text2 = state.modifiedText;
    
    if (state.ignoreWhitespace) {
        text1 = text1.replace(/\s+/g, ' ').trim();
        text2 = text2.replace(/\s+/g, ' ').trim();
    }
    
    if (state.ignoreCase) {
        text1 = text1.toLowerCase();
        text2 = text2.toLowerCase();
    }
    
    // Compute diff
    const dmp = new diff_match_patch();
    const diff = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(diff);
    
    state.diff = diff;
    state.diffLines = computeLineDiff(state.originalText, state.modifiedText);
    state.stats = calculateStats(state.diffLines);
    
    // Render results
    renderStats();
    renderDiff();
    
    // Show output
    document.getElementById('statsPanel').classList.remove('hidden');
    document.getElementById('diffOutput').classList.remove('hidden');
    
    // Find change positions
    findChangePositions();
    
    showToast('Comparison complete! 🔍');
}

function computeLineDiff(text1, text2) {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    const dmp = new diff_match_patch();
    const diff = dmp.diff_main(lines1.join('\n'), lines2.join('\n'));
    dmp.diff_cleanupSemantic(diff);
    
    const result = {
        left: [],
        right: []
    };
    
    let leftLine = 1;
    let rightLine = 1;
    
    diff.forEach(([operation, text]) => {
        const lines = text.split('\n');
        
        // Remove last empty line if exists
        if (lines[lines.length - 1] === '') {
            lines.pop();
        }
        
        lines.forEach(line => {
            if (operation === 0) { // Unchanged
                result.left.push({ line: leftLine++, text: line, type: 'unchanged' });
                result.right.push({ line: rightLine++, text: line, type: 'unchanged' });
            } else if (operation === -1) { // Deleted
                result.left.push({ line: leftLine++, text: line, type: 'deleted' });
                result.right.push({ line: null, text: '', type: 'empty' });
            } else { // Added
                result.left.push({ line: null, text: '', type: 'empty' });
                result.right.push({ line: rightLine++, text: line, type: 'added' });
            }
        });
    });
    
    return result;
}

function calculateStats(diffLines) {
    let total = 0;
    let unchanged = 0;
    let added = 0;
    let deleted = 0;
    
    diffLines.left.forEach(line => {
        if (line.type === 'unchanged') unchanged++;
        if (line.type === 'deleted') deleted++;
        total++;
    });
    
    diffLines.right.forEach(line => {
        if (line.type === 'added') added++;
    });
    
    // Adjust total (don't double-count)
    total = Math.max(diffLines.left.length, diffLines.right.length);
    
    return { total, unchanged, added, deleted };
}

// ========================================
// RENDERING
// ========================================
function renderStats() {
    const { total, unchanged, added, deleted } = state.stats;
    
    document.getElementById('totalLines').textContent = total;
    document.getElementById('unchangedLines').textContent = unchanged;
    document.getElementById('addedLines').textContent = added;
    document.getElementById('deletedLines').textContent = deleted;
    
    const unchangedPct = ((unchanged / total) * 100).toFixed(1);
    const addedPct = ((added / total) * 100).toFixed(1);
    const deletedPct = ((deleted / total) * 100).toFixed(1);
    
    const summary = `${unchangedPct}% unchanged, ${addedPct}% added, ${deletedPct}% deleted`;
    document.getElementById('statsSummary').textContent = summary;
}

function renderDiff() {
    if (state.viewMode === 'side-by-side') {
        renderSideBySide();
    } else {
        renderInline();
    }
}

function renderSideBySide() {
    const leftPanel = document.getElementById('leftDiff');
    const rightPanel = document.getElementById('rightDiff');
    
    leftPanel.innerHTML = '';
    rightPanel.innerHTML = '';
    
    state.diffLines.left.forEach((leftLine, index) => {
        const rightLine = state.diffLines.right[index];
        
        leftPanel.appendChild(createDiffLine(leftLine));
        rightPanel.appendChild(createDiffLine(rightLine));
    });
}

function createDiffLine(lineData) {
    const div = document.createElement('div');
    div.className = `diff-line line-${lineData.type}`;
    
    if (state.showLineNumbers) {
        const lineNum = document.createElement('span');
        lineNum.className = 'line-number';
        lineNum.textContent = lineData.line || '';
        div.appendChild(lineNum);
    }
    
    const content = document.createElement('span');
    content.className = 'line-content';
    content.textContent = lineData.text;
    div.appendChild(content);
    
    return div;
}

function renderInline() {
    const inlinePanel = document.getElementById('inlineDiff');
    inlinePanel.innerHTML = '';
    
    let lineNum = 1;
    
    state.diffLines.left.forEach((leftLine, index) => {
        const rightLine = state.diffLines.right[index];
        
        if (leftLine.type === 'unchanged') {
            const div = createInlineLine(lineNum++, ' ', leftLine.text, 'unchanged');
            inlinePanel.appendChild(div);
        } else if (leftLine.type === 'deleted') {
            const div = createInlineLine(lineNum, '-', leftLine.text, 'deleted');
            inlinePanel.appendChild(div);
            if (rightLine.type !== 'empty') lineNum++;
        }
        
        if (rightLine.type === 'added') {
            const div = createInlineLine(lineNum++, '+', rightLine.text, 'added');
            inlinePanel.appendChild(div);
        }
    });
}

function createInlineLine(lineNum, prefix, text, type) {
    const div = document.createElement('div');
    div.className = `diff-line line-${type}`;
    
    if (state.showLineNumbers) {
        const lineNumSpan = document.createElement('span');
        lineNumSpan.className = 'line-number';
        lineNumSpan.textContent = lineNum;
        div.appendChild(lineNumSpan);
    }
    
    const content = document.createElement('span');
    content.className = 'line-content';
    
    const prefixSpan = document.createElement('span');
    prefixSpan.className = `inline-prefix prefix-${type}`;
    prefixSpan.textContent = prefix;
    content.appendChild(prefixSpan);
    
    const textNode = document.createTextNode(text);
    content.appendChild(textNode);
    
    div.appendChild(content);
    
    return div;
}

// ========================================
// NAVIGATION
// ========================================
function findChangePositions() {
    state.changePositions = [];
    
    state.diffLines.left.forEach((line, index) => {
        if (line.type !== 'unchanged') {
            state.changePositions.push(index);
        }
    });
    
    state.currentChange = -1;
    updateNavigationUI();
}

function navigateChange(direction) {
    if (state.changePositions.length === 0) return;
    
    state.currentChange += direction;
    
    if (state.currentChange < 0) {
        state.currentChange = 0;
    } else if (state.currentChange >= state.changePositions.length) {
        state.currentChange = state.changePositions.length - 1;
    }
    
    // Scroll to change
    const position = state.changePositions[state.currentChange];
    const lines = document.querySelectorAll('.diff-line');
    if (lines[position]) {
        lines[position].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    updateNavigationUI();
}

function updateNavigationUI() {
    const total = state.changePositions.length;
    const current = state.currentChange + 1;
    
    document.getElementById('changeCounter').textContent = 
        total > 0 ? `Change ${current} of ${total}` : 'No changes';
    
    document.getElementById('prevChange').disabled = state.currentChange <= 0;
    document.getElementById('nextChange').disabled = state.currentChange >= total - 1;
}

// ========================================
// EXPORT
// ========================================
function generateInlineText() {
    let output = '';
    let lineNum = 1;
    
    state.diffLines.left.forEach((leftLine, index) => {
        const rightLine = state.diffLines.right[index];
        
        if (leftLine.type === 'unchanged') {
            output += `  ${leftLine.text}\n`;
        } else if (leftLine.type === 'deleted') {
            output += `- ${leftLine.text}\n`;
        }
        
        if (rightLine.type === 'added') {
            output += `+ ${rightLine.text}\n`;
        }
    });
    
    return output;
}

function exportUnifiedDiff() {
    const unified = generateUnifiedDiff();
    
    const blob = new Blob([unified], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff.patch';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Unified diff downloaded! 📄');
}

function generateUnifiedDiff() {
    let output = '--- original\n';
    output += '+++ modified\n';
    output += '@@ -1,' + state.diffLines.left.length + ' +1,' + state.diffLines.right.length + ' @@\n';
    
    output += generateInlineText();
    
    return output;
}

function exportHTML() {
    const html = generateHTMLReport();
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diff-report.html';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('HTML report downloaded! 🌐');
}

function generateHTMLReport() {
    const { total, unchanged, added, deleted } = state.stats;
    
    let html = `<!DOCTYPE html>
<html>
<head>
    <title>Diff Report</title>
    <style>
        body { font-family: 'Courier New', monospace; background: #0a0e1a; color: #e0e0e0; padding: 20px; }
        h1 { color: #00ff9f; }
        .stats { background: #151b2d; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .diff-container { display: flex; gap: 20px; }
        .diff-panel { flex: 1; background: #151b2d; border-radius: 8px; overflow: hidden; }
        .panel-header { background: #0a0e1a; padding: 10px; font-weight: bold; border-bottom: 2px solid #2d3748; }
        .diff-line { display: flex; min-height: 1.6em; }
        .line-number { min-width: 50px; padding: 0 10px; text-align: right; color: #6c757d; background: #0a0e1a; border-right: 1px solid #2d3748; }
        .line-content { flex: 1; padding: 0 10px; white-space: pre-wrap; }
        .line-added { background: rgba(40, 167, 69, 0.15); }
        .line-added .line-number { color: #28a745; font-weight: bold; }
        .line-deleted { background: rgba(220, 53, 69, 0.15); }
        .line-deleted .line-number { color: #dc3545; font-weight: bold; }
        .line-empty .line-content { background: repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px); }
    </style>
</head>
<body>
    <h1>Diff Report</h1>
    <div class="stats">
        <p><strong>Statistics:</strong></p>
        <p>Total Lines: ${total} | Unchanged: ${unchanged} | Added: ${added} | Deleted: ${deleted}</p>
    </div>
    <div class="diff-container">
        <div class="diff-panel">
            <div class="panel-header">Original</div>
            ${generateHTMLDiffPanel(state.diffLines.left)}
        </div>
        <div class="diff-panel">
            <div class="panel-header">Modified</div>
            ${generateHTMLDiffPanel(state.diffLines.right)}
        </div>
    </div>
</body>
</html>`;
    
    return html;
}

function generateHTMLDiffPanel(lines) {
    return lines.map(line => {
        const lineNum = line.line || '';
        const text = escapeHtml(line.text);
        return `<div class="diff-line line-${line.type}">
            <span class="line-number">${lineNum}</span>
            <span class="line-content">${text}</span>
        </div>`;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
