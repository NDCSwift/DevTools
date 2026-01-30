// ========================================
// CONFIGURATION & EXAMPLES
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000
};

const EXAMPLES = {
    // General
    login: "make me a login page",
    blog: "write a blog post about AI",
    email: "write an email about our new product",
    analyze: "analyze this data",
    logo: "design a logo for my coffee shop",

    // Developer - Build
    feature: "Add user authentication with JWT tokens to my Express app",
    api: "Design a REST API for a todo list application with CRUD operations",
    component: "Create a React component for a searchable dropdown",

    // Developer - Debug
    debug: "I'm getting 'Cannot read property of undefined' when calling my API endpoint",
    error: "Fix this TypeScript error: Type 'string' is not assignable to type 'number'",

    // Developer - Test
    test: "Write unit tests for this React component that fetches user data",
    e2e: "Write Cypress e2e tests for the login flow",

    // Developer - Quality
    review: "Review this function for security and performance issues",
    refactor: "Refactor this 200-line function into smaller, testable pieces"
};

// Dynamic field configurations for Advanced Builder
const WIZARD_CONFIGS = {
    general: {
        name: "General Prompt",
        fields: [
            { id: 'wizRole', label: 'Role / Persona', placeholder: 'e.g. Helpful Assistant, Expert Consultant' },
            { id: 'wizTask', label: 'Task / Objective', placeholder: 'e.g. Help me understand, Create a summary' },
            { id: 'wizContext', label: 'Context / Constraints', placeholder: 'e.g. For a beginner audience, Keep it brief' },
            { id: 'wizFormat', label: 'Desired Format', placeholder: 'e.g. Bullet points, Markdown, JSON' }
        ]
    },
    debug: {
        name: "🐛 Debug / Fix Bug",
        fields: [
            { id: 'wizError', label: 'Error Message / Issue', placeholder: 'e.g. TypeError: Cannot read property of undefined' },
            { id: 'wizLanguage', label: 'Language / Framework', placeholder: 'e.g. React, Node.js, Python, TypeScript' },
            { id: 'wizCode', label: 'Relevant Code Snippet', placeholder: 'Paste the code causing the issue', multiline: true },
            { id: 'wizTried', label: 'What You\'ve Tried', placeholder: 'e.g. Checked for null, added console.log' }
        ]
    },
    feature: {
        name: "🔧 New Feature",
        fields: [
            { id: 'wizFeature', label: 'Feature Description', placeholder: 'e.g. Add user authentication with JWT' },
            { id: 'wizStack', label: 'Tech Stack', placeholder: 'e.g. React + Node.js + PostgreSQL' },
            { id: 'wizExisting', label: 'Existing Codebase Context', placeholder: 'e.g. Already have a User model, using Express' },
            { id: 'wizRequirements', label: 'Requirements / Constraints', placeholder: 'e.g. Must support OAuth, needs rate limiting' }
        ]
    },
    testing: {
        name: "🧪 Write Tests",
        fields: [
            { id: 'wizTestCode', label: 'Code to Test', placeholder: 'Paste the function/component to test', multiline: true },
            { id: 'wizFramework', label: 'Testing Framework', placeholder: 'e.g. Jest, Vitest, Pytest, Mocha' },
            { id: 'wizTestType', label: 'Test Type', placeholder: 'e.g. Unit tests, Integration tests, E2E' },
            { id: 'wizCoverage', label: 'Focus Areas', placeholder: 'e.g. Edge cases, error handling, async behavior' }
        ]
    },
    review: {
        name: "👀 Code Review",
        fields: [
            { id: 'wizReviewCode', label: 'Code to Review', placeholder: 'Paste the code for review', multiline: true },
            { id: 'wizReviewLang', label: 'Language / Framework', placeholder: 'e.g. TypeScript, React, Python' },
            { id: 'wizFocus', label: 'Focus Areas', placeholder: 'e.g. Security, performance, readability, best practices' },
            { id: 'wizSeverity', label: 'Review Depth', placeholder: 'e.g. Quick scan, Thorough review, Security audit' }
        ]
    },
    refactor: {
        name: "✨ Refactor Code",
        fields: [
            { id: 'wizRefactorCode', label: 'Code to Refactor', placeholder: 'Paste the code to improve', multiline: true },
            { id: 'wizRefactorLang', label: 'Language', placeholder: 'e.g. JavaScript, Python, Go' },
            { id: 'wizGoals', label: 'Refactoring Goals', placeholder: 'e.g. Improve readability, reduce complexity, add types' },
            { id: 'wizConstraints', label: 'Constraints', placeholder: 'e.g. Keep same API, maintain backwards compatibility' }
        ]
    },
    api: {
        name: "🔌 API Design",
        fields: [
            { id: 'wizApiDesc', label: 'API Requirements', placeholder: 'e.g. User management API with CRUD operations' },
            { id: 'wizApiStyle', label: 'API Style', placeholder: 'e.g. REST, GraphQL, gRPC' },
            { id: 'wizAuth', label: 'Authentication', placeholder: 'e.g. JWT Bearer tokens, API keys, OAuth2' },
            { id: 'wizEndpoints', label: 'Key Endpoints Needed', placeholder: 'e.g. GET /users, POST /auth/login, DELETE /users/:id' }
        ]
    },
    code: {
        name: "💻 Write Code",
        fields: [
            { id: 'wizCodeTask', label: 'What to Build', placeholder: 'e.g. A function that validates email addresses' },
            { id: 'wizCodeLang', label: 'Language / Framework', placeholder: 'e.g. TypeScript, Python, React' },
            { id: 'wizCodeReqs', label: 'Requirements', placeholder: 'e.g. Handle edge cases, return boolean, be performant' },
            { id: 'wizCodeFormat', label: 'Output Format', placeholder: 'e.g. Code only, Code with explanation, With tests' }
        ]
    },
    writing: {
        name: "✍️ Content Writing",
        fields: [
            { id: 'wizWriteTopic', label: 'Topic / Subject', placeholder: 'e.g. Benefits of remote work, AI in healthcare' },
            { id: 'wizWriteType', label: 'Content Type', placeholder: 'e.g. Blog post, Article, Newsletter, Social media' },
            { id: 'wizWriteAudience', label: 'Target Audience', placeholder: 'e.g. Developers, Business executives, General public' },
            { id: 'wizWriteTone', label: 'Tone & Style', placeholder: 'e.g. Professional, Casual, Persuasive, Educational' }
        ]
    },
    analysis: {
        name: "📊 Data Analysis",
        fields: [
            { id: 'wizAnalyzeData', label: 'Data Description', placeholder: 'e.g. Sales data from Q4, User engagement metrics', multiline: true },
            { id: 'wizAnalyzeGoal', label: 'Analysis Goal', placeholder: 'e.g. Find trends, Identify outliers, Compare periods' },
            { id: 'wizAnalyzeFormat', label: 'Output Format', placeholder: 'e.g. Summary with charts, Detailed report, Key insights only' },
            { id: 'wizAnalyzeContext', label: 'Business Context', placeholder: 'e.g. Preparing for board meeting, Quarterly review' }
        ]
    },
    image: {
        name: "🎨 Image Generation",
        fields: [
            { id: 'wizImageSubject', label: 'Subject / Scene', placeholder: 'e.g. A futuristic city, A cozy coffee shop' },
            { id: 'wizImageStyle', label: 'Art Style', placeholder: 'e.g. Photorealistic, Watercolor, Digital art, Minimalist' },
            { id: 'wizImageMood', label: 'Mood / Lighting', placeholder: 'e.g. Warm sunset, Dramatic shadows, Soft and dreamy' },
            { id: 'wizImageDetails', label: 'Additional Details', placeholder: 'e.g. Include a cat, Cinematic composition, 4K quality' }
        ]
    }
};

// Prompt cards for the tabbed library UI
const PROMPT_CARDS = [
    // Build category
    { id: 'feature', icon: '🔧', title: 'New Feature', desc: 'Implement new functionality', category: 'build', template: 'feature' },
    { id: 'api', icon: '🔌', title: 'API Design', desc: 'Design REST/GraphQL endpoints', category: 'build', template: 'api' },
    { id: 'component', icon: '🧩', title: 'Component', desc: 'Create UI components', category: 'build', template: 'code' },

    // Debug category
    { id: 'debug', icon: '🐛', title: 'Fix Bug', desc: 'Debug errors and exceptions', category: 'debug', template: 'debug' },
    { id: 'error', icon: '⚠️', title: 'Error Help', desc: 'Understand error messages', category: 'debug', template: 'debug' },

    // Test category
    { id: 'test', icon: '🧪', title: 'Unit Tests', desc: 'Write unit/integration tests', category: 'test', template: 'testing' },
    { id: 'e2e', icon: '🎭', title: 'E2E Tests', desc: 'End-to-end testing', category: 'test', template: 'testing' },

    // Quality category
    { id: 'review', icon: '👀', title: 'Code Review', desc: 'Review for issues', category: 'quality', template: 'review' },
    { id: 'refactor', icon: '✨', title: 'Refactor', desc: 'Clean up and improve code', category: 'quality', template: 'refactor' },

    // General (shown in All)
    { id: 'blog', icon: '✍️', title: 'Blog Post', desc: 'Write content', category: 'general', template: 'writing' },
    { id: 'analyze', icon: '📊', title: 'Analyze Data', desc: 'Data analysis prompts', category: 'general', template: 'analysis' },
    { id: 'logo', icon: '🎨', title: 'Image Gen', desc: 'AI image prompts', category: 'general', template: 'image' }
];

// ========================================
// STATE
// ========================================
let state = {
    promptType: 'general',
    isAdvanced: false, // Tracks "Wizard Mode" status
    wizardTemplate: 'general', // Currently selected wizard template

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
    initPromptLibrary(); // Initialize the tabbed prompt library
    initWizardTemplates(); // Initialize dynamic wizard fields
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

    // History Dropdown
    const historyDropdown = document.getElementById('historyDropdown');
    if (historyDropdown) {
        historyDropdown.addEventListener('change', (e) => {
            const index = parseInt(e.target.value, 10);
            if (!isNaN(index)) {
                loadFromHistory(index);
                e.target.value = ''; // Reset dropdown
            }
        });
    }

    // Clear History Button
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', clearHistory);
    }
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
    // Note: Wizard field listeners are attached dynamically in renderWizardFields()
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
        // Collect all dynamic wizard field values
        const values = getWizardFieldValues();
        textToAnalyze = Object.values(values).join(' ');
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
        // WIZARD COMPILATION - Dynamic fields based on template
        const wizardValues = getWizardFieldValues();
        const template = state.wizardTemplate;

        // Check for required input (first non-empty field)
        const hasInput = Object.values(wizardValues).some(v => v.length > 0);
        if (!hasInput) {
            showToast("Please fill in at least one field.");
            return;
        }

        // Build fields object based on template type
        const fields = buildFieldsForTemplate(template, wizardValues);

        const data = {
            intent: template,
            fields: fields
        };

        finalPrompt = PROMPT_LOGIC.compile(data);
        state.improvements.push(`Built with ${WIZARD_CONFIGS[template]?.name || 'Advanced Builder'}`);

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

    // Save to history - get first field value for advanced mode
    let inputForHistory = '';
    if (state.isAdvanced) {
        const config = WIZARD_CONFIGS[state.wizardTemplate] || WIZARD_CONFIGS.general;
        const firstField = document.getElementById(config.fields[0]?.id);
        inputForHistory = firstField ? firstField.value.trim() : 'Advanced prompt';
    } else {
        inputForHistory = document.getElementById('inputPrompt').value.trim();
    }
    saveToHistory(inputForHistory, finalPrompt);

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
    // Clear dynamic wizard inputs based on current template
    const config = WIZARD_CONFIGS[state.wizardTemplate] || WIZARD_CONFIGS.general;
    config.fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) el.value = '';
    });
    updateInputWordCount();
    analyzeRealTime();
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

    // Calculate real stats - get first field value for advanced mode
    let inputText = '';
    if (state.isAdvanced) {
        const config = WIZARD_CONFIGS[state.wizardTemplate] || WIZARD_CONFIGS.general;
        const firstField = document.getElementById(config.fields[0]?.id);
        inputText = firstField ? firstField.value : '';
    } else {
        inputText = document.getElementById('inputPrompt').value;
    }
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

function loadExample(key, template) {
    const exampleText = EXAMPLES[key] || '';

    if (state.isAdvanced) {
        // Advanced mode: switch template and pre-fill first field
        const targetTemplate = template || 'general';
        const selector = document.getElementById('wizardTemplateSelect');

        if (selector && WIZARD_CONFIGS[targetTemplate]) {
            // Update selector and state
            selector.value = targetTemplate;
            state.wizardTemplate = targetTemplate;

            // Render new fields
            renderWizardFields(targetTemplate);

            // Pre-fill the first field with example text
            const config = WIZARD_CONFIGS[targetTemplate];
            if (config.fields.length > 0) {
                const firstField = document.getElementById(config.fields[0].id);
                if (firstField) {
                    firstField.value = exampleText;
                }
            }

            analyzeRealTime();
            showToast(`Switched to ${config.name} template`);
        }
    } else {
        // Quick mode: fill textarea
        document.getElementById('inputPrompt').value = exampleText;
        updateInputWordCount();
        analyzeRealTime();
        showToast("Example loaded");
    }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastMessage');
    text.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ========================================
// HISTORY FUNCTIONS
// ========================================
function saveToHistory(input, output) {
    const entry = {
        input: input,
        output: output,
        timestamp: Date.now()
    };
    state.history.unshift(entry);
    state.history = state.history.slice(0, 10); // Keep last 10
    localStorage.setItem('promptHistory', JSON.stringify(state.history));
    renderHistoryDropdown();
}

function loadFromHistory(index) {
    if (index < 0 || index >= state.history.length) return;
    const entry = state.history[index];

    if (!state.isAdvanced) {
        document.getElementById('inputPrompt').value = entry.input;
        updateInputWordCount();
        analyzeRealTime();
    }

    state.outputText = entry.output;
    renderOutput();
    showToast("Loaded from history");
}

function renderHistoryDropdown() {
    const dropdown = document.getElementById('historyDropdown');
    if (!dropdown) return;

    if (state.history.length === 0) {
        dropdown.innerHTML = '<option value="">No history yet</option>';
        dropdown.disabled = true;
        return;
    }

    dropdown.disabled = false;
    dropdown.innerHTML = '<option value="">Load from history...</option>' +
        state.history.map((h, i) => {
            const preview = h.input.substring(0, 35) + (h.input.length > 35 ? '...' : '');
            const date = new Date(h.timestamp).toLocaleTimeString();
            return `<option value="${i}">${preview} (${date})</option>`;
        }).join('');
}

function clearHistory() {
    state.history = [];
    localStorage.removeItem('promptHistory');
    renderHistoryDropdown();
    showToast("History cleared");
}

// ========================================
// WIZARD TEMPLATE FUNCTIONS
// ========================================
function initWizardTemplates() {
    const selector = document.getElementById('wizardTemplateSelect');
    if (!selector) return;

    // Render initial fields
    renderWizardFields('general');

    // Listen for template changes
    selector.addEventListener('change', (e) => {
        const template = e.target.value;
        state.wizardTemplate = template;
        renderWizardFields(template);
        analyzeRealTime();
    });
}

function renderWizardFields(templateKey) {
    const container = document.getElementById('dynamicWizardFields');
    if (!container) return;

    const config = WIZARD_CONFIGS[templateKey] || WIZARD_CONFIGS.general;

    container.innerHTML = config.fields.map(field => {
        if (field.multiline) {
            return `
                <div class="input-group">
                    <label>${field.label}</label>
                    <textarea id="${field.id}" class="text-input wizard-textarea"
                        placeholder="${field.placeholder}" rows="4"></textarea>
                </div>
            `;
        }
        return `
            <div class="input-group">
                <label>${field.label}</label>
                <input type="text" id="${field.id}" class="text-input"
                    placeholder="${field.placeholder}">
            </div>
        `;
    }).join('');

    // Re-attach input listeners for real-time analysis
    container.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', analyzeRealTime);
    });
}

function getWizardFieldValues() {
    const config = WIZARD_CONFIGS[state.wizardTemplate] || WIZARD_CONFIGS.general;
    const values = {};

    config.fields.forEach(field => {
        const el = document.getElementById(field.id);
        values[field.id] = el ? el.value.trim() : '';
    });

    return values;
}

function buildFieldsForTemplate(template, values) {
    // Map wizard field values to template placeholders
    switch (template) {
        case 'debug':
            return {
                task: values.wizError || 'Debug this issue',
                language: values.wizLanguage || 'JavaScript',
                context: values.wizCode ? `Code:\n${values.wizCode}\n\nAlready tried: ${values.wizTried || 'Nothing yet'}` : values.wizTried || '',
                format: 'Code fix with explanation'
            };

        case 'feature':
            return {
                task: values.wizFeature || 'Implement feature',
                language: values.wizStack || 'JavaScript',
                context: `${values.wizExisting || ''}\n\nRequirements: ${values.wizRequirements || 'Standard requirements'}`,
                format: 'Implementation plan with code'
            };

        case 'testing':
            return {
                task: values.wizTestCode || 'Write tests',
                language: values.wizFramework || 'Jest',
                context: `Test type: ${values.wizTestType || 'Unit tests'}\nFocus: ${values.wizCoverage || 'Full coverage'}`,
                format: 'Test file with all test cases'
            };

        case 'review':
            return {
                task: values.wizReviewCode || 'Review this code',
                language: values.wizReviewLang || 'JavaScript',
                context: `Focus areas: ${values.wizFocus || 'All'}\nDepth: ${values.wizSeverity || 'Thorough'}`,
                format: 'Review comments with severity levels'
            };

        case 'refactor':
            return {
                task: values.wizRefactorCode || 'Refactor this code',
                language: values.wizRefactorLang || 'JavaScript',
                context: `Goals: ${values.wizGoals || 'Improve readability'}\nConstraints: ${values.wizConstraints || 'Maintain API'}`,
                format: 'Refactored code with explanation'
            };

        case 'api':
            return {
                task: values.wizApiDesc || 'Design API',
                language: values.wizApiStyle || 'REST',
                context: `Auth: ${values.wizAuth || 'JWT'}\nEndpoints: ${values.wizEndpoints || 'CRUD operations'}`,
                format: 'API specification with examples'
            };

        case 'code':
            return {
                task: values.wizCodeTask || 'Write code',
                language: values.wizCodeLang || 'JavaScript',
                context: values.wizCodeReqs || 'Standard requirements',
                format: values.wizCodeFormat || 'Code with explanation'
            };

        case 'writing':
            return {
                task: `Write a ${values.wizWriteType || 'blog post'} about: ${values.wizWriteTopic || 'the topic'}`,
                topic: values.wizWriteTopic || 'General topic',
                audience: values.wizWriteAudience || 'General audience',
                tone: values.wizWriteTone || 'Professional',
                format: `${values.wizWriteType || 'Article'} with engaging structure`
            };

        case 'analysis':
            return {
                task: `Analyze the following data: ${values.wizAnalyzeData || 'Provided data'}`,
                context: `Goal: ${values.wizAnalyzeGoal || 'Find insights'}\nBusiness context: ${values.wizAnalyzeContext || 'General analysis'}`,
                format: values.wizAnalyzeFormat || 'Summary with key insights'
            };

        case 'image':
            return {
                task: `Generate an image of: ${values.wizImageSubject || 'A scene'}`,
                context: `Style: ${values.wizImageStyle || 'Digital art'}\nMood: ${values.wizImageMood || 'Balanced lighting'}`,
                format: `Image prompt with details: ${values.wizImageDetails || 'High quality'}`
            };

        case 'general':
        default:
            return {
                role: values.wizRole || 'Helpful Assistant',
                task: values.wizTask || 'Help with this request',
                context: values.wizContext || '',
                format: values.wizFormat || 'Clear and concise text'
            };
    }
}

// ========================================
// PROMPT LIBRARY FUNCTIONS
// ========================================
function initPromptLibrary() {
    renderPromptCards('all');
    attachLibraryListeners();
}

function attachLibraryListeners() {
    // Tab switching
    document.querySelectorAll('.library-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const category = e.currentTarget.dataset.category;
            // Update active tab
            document.querySelectorAll('.library-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            // Render cards for this category
            renderPromptCards(category);
        });
    });
}

function renderPromptCards(category) {
    const grid = document.getElementById('libraryGrid');
    if (!grid) return;

    const filteredCards = category === 'all'
        ? PROMPT_CARDS
        : PROMPT_CARDS.filter(card => card.category === category);

    grid.innerHTML = filteredCards.map(card => `
        <button class="prompt-card" data-example="${card.id}" data-template="${card.template}">
            <span class="card-icon">${card.icon}</span>
            <span class="card-title">${card.title}</span>
            <span class="card-desc">${card.desc}</span>
        </button>
    `).join('');

    // Attach click handlers to new cards
    grid.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const exampleKey = e.currentTarget.dataset.example;
            const template = e.currentTarget.dataset.template;
            loadExample(exampleKey, template);
        });
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
