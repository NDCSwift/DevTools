// ========================================
// CONFIGURATION & EXAMPLES
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000
};

const EXAMPLES = {
    login: "make me a login page",
    blog: "write a blog post about AI",
    api: "create a REST API",
    email: "write an email about our new product",
    analyze: "analyze this data",
    logo: "design a logo for my coffee shop"
};

// ========================================
// STATE
// ========================================
let state = {
    promptType: 'general',
    isAdvanced: false, // Tracks "Wizard Mode" status

    // UI Options
    addStructure: true,
    addContext: true,
    requestExamples: false,
    stepByStep: false,
    professionalTone: true,

    inputText: '',
    outputText: '',
    improvements: [],
    history: JSON.parse(localStorage.getItem('promptHistory') || '[]')
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    attachLogicListeners(); // New listener group for Logic Engine
    setupEducationalToggle(); // Standard educational content toggle
    renderHistoryDropdown(); // Initialize history UI
    console.log('✨ ToolBit Prompt Optimizer (Beast Mode) initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Mode Toggle (Quick vs Advanced)
    document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchMode(mode);
        });
    });

    // Settings Inputs
    document.getElementById('promptType').addEventListener('change', (e) => state.promptType = e.target.value);
    document.getElementById('addStructure').addEventListener('change', (e) => state.addStructure = e.target.checked);
    document.getElementById('addContext').addEventListener('change', (e) => state.addContext = e.target.checked);
    document.getElementById('requestExamples').addEventListener('change', (e) => state.requestExamples = e.target.checked);
    document.getElementById('stepByStep').addEventListener('change', (e) => state.stepByStep = e.target.checked);
    document.getElementById('professionalTone').addEventListener('change', (e) => state.professionalTone = e.target.checked);

    // Main Actions
    document.getElementById('pasteBtn').addEventListener('click', pasteText);
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('optimizeBtn').addEventListener('click', optimizePrompt);
    document.getElementById('copyBtn').addEventListener('click', copyOutput);
    document.getElementById('downloadBtn').addEventListener('click', downloadOutput);

    // Quick Examples
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            loadExample(e.currentTarget.dataset.example);
        });
    });
}

function attachLogicListeners() {
    // Real-time Analysis on Input
    const inputArea = document.getElementById('inputPrompt');
    if (inputArea) {
        inputArea.addEventListener('input', () => {
            updateInputWordCount();
            analyzeRealTime();
        });
    }

    // Wizard Fields Analysis (optional, updates score based on combined length)
    ['wizRole', 'wizTask', 'wizContext'].forEach(id => {
        document.getElementById(id).addEventListener('input', analyzeRealTime);
    });
}

function setupEducationalToggle() {
    const toggleBtn = document.getElementById('toggleEducation');
    const content = document.getElementById('educationalContent');

    if (toggleBtn && content) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = content.classList.contains('hidden');
            if (isHidden) {
                content.classList.remove('hidden');
                toggleBtn.classList.add('active');
                toggleBtn.querySelector('.toggle-text').textContent = 'Hide Learning Content';
                setTimeout(() => {
                    document.getElementById('educationalSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            } else {
                content.classList.add('hidden');
                toggleBtn.classList.remove('active');
                toggleBtn.querySelector('.toggle-text').textContent = 'Learn More About Prompt Engineering';
            }
        });
    }
}

// ========================================
// CORE LOGIC (INTEGRATION WITH ENGINE)
// ========================================

function analyzeRealTime() {
    // Gather text from either main input or wizard fields
    let textToAnalyze = "";
    if (state.isAdvanced) {
        textToAnalyze += document.getElementById('wizRole').value + " ";
        textToAnalyze += document.getElementById('wizTask').value + " ";
        textToAnalyze += document.getElementById('wizContext').value;
    } else {
        textToAnalyze = document.getElementById('inputPrompt').value;
    }

    // Call the Logic Engine
    if (typeof PROMPT_LOGIC !== 'undefined') {
        const result = PROMPT_LOGIC.analyze(textToAnalyze);
        updateScoreBar(result);
    }
}

function updateScoreBar(result) {
    if (!result) {
        // Reset if empty
        document.getElementById('scoreBarContainer').classList.add('hidden');
        return;
    }

    const container = document.getElementById('scoreBarContainer');
    const fill = document.getElementById('scoreFill');
    const val = document.getElementById('scoreValue');
    const feedback = document.getElementById('scoreFeedback');

    container.classList.remove('hidden');
    fill.style.width = `${result.quality}%`;
    val.textContent = `${result.quality}%`;

    // Color coding
    if (result.quality < 40) fill.style.backgroundColor = '#ff4757'; // Red
    else if (result.quality < 70) fill.style.backgroundColor = '#ffa502'; // Orange
    else fill.style.backgroundColor = '#2ed573'; // Green

    // Feedback text
    if (result.suggestions && result.suggestions.length > 0) {
        feedback.textContent = "💡 Tip: " + result.suggestions[0];
    } else {
        feedback.textContent = `Detected Intent: ${result.intent.toUpperCase()}`;
    }
}

function optimizePrompt() {
    let finalPrompt = "";
    state.improvements = [];

    if (typeof PROMPT_LOGIC === 'undefined') {
        showToast("Error: Logic Engine not loaded.");
        return;
    }

    if (state.isAdvanced) {
        // WIZARD COMPILATION
        const role = document.getElementById('wizRole').value.trim();
        const task = document.getElementById('wizTask').value.trim();
        const context = document.getElementById('wizContext').value.trim();
        const format = document.getElementById('wizFormat').value.trim();

        if (!task) {
            showToast("Please enter at least a Task.");
            return;
        }

        // Detect intent from the task to choose template
        const analysis = PROMPT_LOGIC.analyze(task);

        const data = {
            intent: analysis.intent,
            fields: {
                role: role || "Helpful Assistant",
                task: task,
                context: context,
                format: format || "Clear and concise text",
                // Specifics for certain templates
                language: "programming language",
                topic: task,
                audience: "general audience",
                tone: "professional",
                length: "appropriate length"
            }
        };

        finalPrompt = PROMPT_LOGIC.compile(data);
        state.improvements.push("Constructed via Advanced Builder");

    } else {
        // QUICK COMPILATION (Legacy + Logic)
        const input = document.getElementById('inputPrompt').value.trim();
        if (!input) {
            showToast("Please enter a prompt first.");
            return;
        }

        // Analyze to find best template
        const analysis = PROMPT_LOGIC.analyze(input);

        // Map raw input to fields based on intent
        let fields = {
            task: input,
            role: "AI Assistant",
            context: "Standard context",
            format: "Markdown",
            // defaults
            language: "Code",
            topic: input,
            audience: "Reader",
            tone: "Professional",
            length: "Short"
        };

        const data = {
            intent: analysis.intent,
            fields: fields
        };

        finalPrompt = PROMPT_LOGIC.compile(data);

        // Apply legacy checkboxes if needed (post-processing)
        if (state.addStructure) finalPrompt += "\n\nOrganize the response with clear headings and sections.";
        if (state.addContext) finalPrompt += "\nEnsure the output is accurate and relevant.";
        if (state.requestExamples) finalPrompt += "\nInclude 2-3 concrete examples to illustrate.";
        if (state.stepByStep) finalPrompt += "\nPlease think step-by-step.";
        if (state.professionalTone) finalPrompt += "\nUse formal, professional language.";

        state.improvements.push(`Optimized for detected intent: ${analysis.intent.toUpperCase()}`);
    }

    state.outputText = finalPrompt;
    renderOutput();
    showToast("Prompt Optimized! 🚀");
}

// ========================================
// UI HELPERS
// ========================================

function switchMode(mode) {
    // Toggle Buttons
    document.querySelectorAll('.mode-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    state.isAdvanced = (mode === 'advanced');

    const basicInput = document.getElementById('inputPrompt');
    const wizardFields = document.getElementById('wizardFields');
    const pasteBtn = document.getElementById('pasteBtn');

    if (state.isAdvanced) {
        basicInput.classList.add('hidden');
        pasteBtn.classList.add('hidden'); // Hide paste in wizard mode for simplicity
        wizardFields.classList.remove('hidden');
        showToast("Switched to Advanced Builder");
    } else {
        basicInput.classList.remove('hidden');
        pasteBtn.classList.remove('hidden');
        wizardFields.classList.add('hidden');
        showToast("Switched to Quick Optimize");
    }
}

function pasteText() {
    navigator.clipboard.readText().then(text => {
        document.getElementById('inputPrompt').value = text;
        updateInputWordCount();
        analyzeRealTime();
        showToast("Pasted! 📋");
    }).catch(err => {
        showToast("Failed to paste");
    });
}

function clearInput() {
    document.getElementById('inputPrompt').value = '';
    // Clear wizard inputs too
    ['wizRole', 'wizTask', 'wizContext', 'wizFormat'].forEach(id => {
        document.getElementById(id).value = '';
    });
    updateInputWordCount();
    document.getElementById('scoreBarContainer').classList.add('hidden');
}

function updateInputWordCount() {
    const text = document.getElementById('inputPrompt').value;
    const count = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('inputWordCount').textContent = `${count} words`;
}

function calculateRealStats(inputText, outputText) {
    const inputWords = inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const outputWords = outputText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordDiff = outputWords - inputWords;

    // Clarity: Based on sentence structure and formatting
    const sentences = outputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = outputWords / Math.max(sentences.length, 1);
    const hasStructure = /\*\*|##|[-*]\s|:/.test(outputText);
    let clarity = 70;
    if (avgSentenceLength < 25) clarity += 15;
    if (hasStructure) clarity += 15;
    clarity = Math.min(100, clarity);

    // Specificity: Concrete nouns, numbers, quoted strings
    const hasNumbers = /\d+/.test(outputText);
    const hasQuotes = /"[^"]+"/.test(outputText);
    const hasRoleTask = /role|task|context|format/i.test(outputText);
    let specificity = "Medium";
    const specificityScore = (hasNumbers ? 1 : 0) + (hasQuotes ? 1 : 0) + (hasRoleTask ? 1 : 0);
    if (specificityScore >= 2) specificity = "High";
    else if (specificityScore === 0) specificity = "Low";

    return { wordDiff, clarity, specificity };
}

function renderOutput() {
    const outputDiv = document.getElementById('outputPrompt');
    // Simple rendering for now, preserving whitespace
    outputDiv.textContent = state.outputText;

    const count = state.outputText.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('outputWordCount').textContent = `${count} words`;

    // Show Improvements Panel
    const panel = document.getElementById('improvementsPanel');
    const list = document.getElementById('improvementsList');
    panel.classList.remove('hidden');

    list.innerHTML = state.improvements.map(imp => `
        <div class="improvement-item">
            <span class="improvement-check">✓</span> ${imp}
        </div>
    `).join('');

    // Calculate real stats
    const inputText = state.isAdvanced
        ? document.getElementById('wizTask').value
        : document.getElementById('inputPrompt').value;
    const stats = calculateRealStats(inputText, state.outputText);

    document.getElementById('wordDiff').textContent = `${stats.wordDiff >= 0 ? '+' : ''}${stats.wordDiff} words`;
    document.getElementById('clarityScore').textContent = `${stats.clarity}%`;
    document.getElementById('specificityScore').textContent = stats.specificity;
}

function copyOutput() {
    if (!state.outputText) return;
    navigator.clipboard.writeText(state.outputText);
    showToast("Copied to clipboard! ⎘");
}

function downloadOutput() {
    if (!state.outputText) return;
    const blob = new Blob([state.outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-prompt.txt';
    a.click();
    showToast("Downloaded! 📥");
}

function loadExample(key) {
    if (state.isAdvanced) return; // Only works in quick mode
    document.getElementById('inputPrompt').value = EXAMPLES[key];
    updateInputWordCount();
    analyzeRealTime();
    showToast("Example loaded");
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastMessage');
    text.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Start
document.addEventListener('DOMContentLoaded', init);
