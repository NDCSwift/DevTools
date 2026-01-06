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
    addStructure: true,
    addContext: true,
    requestExamples: false,
    stepByStep: false,
    professionalTone: true,
    
    inputText: '',
    outputText: '',
    improvements: []
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    console.log('✨ ToolBit AI Prompt Optimizer initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Settings
    document.getElementById('promptType').addEventListener('change', (e) => {
        state.promptType = e.target.value;
    });
    
    document.getElementById('addStructure').addEventListener('change', (e) => {
        state.addStructure = e.target.checked;
    });
    
    document.getElementById('addContext').addEventListener('change', (e) => {
        state.addContext = e.target.checked;
    });
    
    document.getElementById('requestExamples').addEventListener('change', (e) => {
        state.requestExamples = e.target.checked;
    });
    
    document.getElementById('stepByStep').addEventListener('change', (e) => {
        state.stepByStep = e.target.checked;
    });
    
    document.getElementById('professionalTone').addEventListener('change', (e) => {
        state.professionalTone = e.target.checked;
    });
    
    // Input actions
    document.getElementById('pasteBtn').addEventListener('click', pasteText);
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('inputPrompt').addEventListener('input', updateInputWordCount);
    
    // Optimize button
    document.getElementById('optimizeBtn').addEventListener('click', optimizePrompt);
    
    // Output actions
    document.getElementById('copyBtn').addEventListener('click', copyOutput);
    document.getElementById('downloadBtn').addEventListener('click', downloadOutput);
    
    // Quick examples
    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const example = e.currentTarget.dataset.example;
            loadExample(example);
        });
    });
}

// ========================================
// INPUT FUNCTIONS
// ========================================
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('inputPrompt').value = text;
        updateInputWordCount();
        showToast('Text pasted from clipboard! 📋');
    } catch (error) {
        showToast('Failed to paste from clipboard');
    }
}

function clearInput() {
    document.getElementById('inputPrompt').value = '';
    updateInputWordCount();
}

function updateInputWordCount() {
    const text = document.getElementById('inputPrompt').value;
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('inputWordCount').textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
}

function loadExample(exampleKey) {
    const text = EXAMPLES[exampleKey];
    document.getElementById('inputPrompt').value = text;
    updateInputWordCount();
    showToast('Example loaded! ✨');
}

// ========================================
// OPTIMIZATION LOGIC
// ========================================
function optimizePrompt() {
    state.inputText = document.getElementById('inputPrompt').value.trim();
    
    if (!state.inputText) {
        showToast('Please enter a prompt to optimize');
        return;
    }
    
    state.improvements = [];
    let optimized = state.inputText;
    
    // Apply optimizations based on settings
    if (state.professionalTone) {
        optimized = makeProfessional(optimized);
    }
    
    if (state.addStructure) {
        optimized = addStructure(optimized, state.promptType);
    }
    
    if (state.addContext) {
        optimized = addContext(optimized, state.promptType);
    }
    
    if (state.requestExamples) {
        optimized = addExampleRequest(optimized);
    }
    
    if (state.stepByStep) {
        optimized = addStepByStep(optimized);
    }
    
    state.outputText = optimized;
    
    // Render output
    renderOutput();
    renderImprovements();
    
    // Show improvements panel
    document.getElementById('improvementsPanel').classList.remove('hidden');
    
    showToast('Prompt optimized! ✨');
}

function makeProfessional(text) {
    let result = text;
    
    // Capitalize first letter
    result = result.charAt(0).toUpperCase() + result.slice(1);
    
    // Add period if missing
    if (!result.endsWith('.') && !result.endsWith('?') && !result.endsWith('!')) {
        result += '.';
    }
    
    // Replace casual words
    const replacements = {
        "make me": "Create",
        "write me": "Write",
        "give me": "Provide",
        "do": "Create",
        "gonna": "going to",
        "wanna": "want to",
        "kinda": "kind of"
    };
    
    Object.keys(replacements).forEach(casual => {
        const regex = new RegExp('\\b' + casual + '\\b', 'gi');
        result = result.replace(regex, replacements[casual]);
    });
    
    if (result !== text) {
        state.improvements.push('Professional tone and grammar');
    }
    
    return result;
}

function addStructure(text, type) {
    let structured = '';
    
    // Extract key elements from the prompt
    const topic = extractTopic(text);
    
    switch (type) {
        case 'code':
            structured = `${text}\n\n**Requirements:**\n`;
            structured += `- Implement ${topic}\n`;
            structured += `- Include proper error handling\n`;
            structured += `- Add inline comments explaining the code\n`;
            structured += `- Follow best practices and conventions\n\n`;
            structured += `**Technical Details:**\n`;
            structured += `- Write clean, readable code\n`;
            structured += `- Consider edge cases\n`;
            structured += `- Optimize for performance where applicable`;
            state.improvements.push('Added code structure with requirements');
            break;
            
        case 'writing':
            structured = `${text}\n\n**Content Requirements:**\n`;
            structured += `- Topic: ${topic}\n`;
            structured += `- Tone: [Specify: Professional/Casual/Technical]\n`;
            structured += `- Length: [Specify word count]\n`;
            structured += `- Target Audience: [Specify audience]\n\n`;
            structured += `**Structure:**\n`;
            structured += `- Engaging introduction with hook\n`;
            structured += `- Well-organized body with clear sections\n`;
            structured += `- Strong conclusion with takeaways`;
            state.improvements.push('Added writing structure with content requirements');
            break;
            
        case 'analysis':
            structured = `${text}\n\n**Analysis Requirements:**\n`;
            structured += `- Objective: Analyze ${topic}\n`;
            structured += `- Methodology: [Specify analytical approach]\n`;
            structured += `- Key metrics to examine\n`;
            structured += `- Identify patterns and trends\n\n`;
            structured += `**Deliverables:**\n`;
            structured += `- Summary of findings\n`;
            structured += `- Data-driven insights\n`;
            structured += `- Actionable recommendations`;
            state.improvements.push('Added analysis structure with methodology');
            break;
            
        case 'creative':
            structured = `${text}\n\n**Creative Brief:**\n`;
            structured += `- Project: ${topic}\n`;
            structured += `- Style: [Specify aesthetic preferences]\n`;
            structured += `- Target Audience: [Specify demographics]\n`;
            structured += `- Constraints: [Specify any limitations]\n\n`;
            structured += `**Design Elements:**\n`;
            structured += `- Color palette considerations\n`;
            structured += `- Typography preferences\n`;
            structured += `- Overall mood and feel`;
            state.improvements.push('Added creative brief structure');
            break;
            
        case 'business':
            structured = `${text}\n\n**Business Context:**\n`;
            structured += `- Objective: ${topic}\n`;
            structured += `- Target Audience: [Specify stakeholders]\n`;
            structured += `- Key Messages: [Main points to convey]\n\n`;
            structured += `**Requirements:**\n`;
            structured += `- Professional tone and formatting\n`;
            structured += `- Clear call-to-action\n`;
            structured += `- Appropriate length and structure`;
            state.improvements.push('Added business context and requirements');
            break;
            
        default:
            structured = `${text}\n\n**Details:**\n`;
            structured += `- Please provide ${topic}\n`;
            structured += `- Be specific and comprehensive\n`;
            structured += `- Include relevant context`;
            state.improvements.push('Added basic structure');
    }
    
    return structured;
}

function addContext(text, type) {
    let contextual = text;
    
    // Add context section if not already very detailed
    if (text.length < 100) {
        contextual += `\n\n**Additional Context:**\n`;
        contextual += `- Specify any constraints or requirements\n`;
        contextual += `- Mention relevant background information\n`;
        contextual += `- Define success criteria`;
        
        state.improvements.push('Added context and constraints section');
    }
    
    return contextual;
}

function addExampleRequest(text) {
    let withExamples = text;
    
    withExamples += `\n\n**Please include:**\n`;
    withExamples += `- Concrete examples to illustrate key points\n`;
    withExamples += `- Sample output or demonstration`;
    
    state.improvements.push('Requested examples and demonstrations');
    
    return withExamples;
}

function addStepByStep(text) {
    let withSteps = text;
    
    withSteps += `\n\n**Process:**\n`;
    withSteps += `Please explain step-by-step, breaking down the process into clear, sequential stages.`;
    
    state.improvements.push('Requested step-by-step explanation');
    
    return withSteps;
}

function extractTopic(text) {
    // Simple topic extraction - get the main subject
    const words = text.toLowerCase().split(/\s+/);
    
    // Remove common starting words
    const filtered = words.filter(w => 
        !['make', 'create', 'write', 'build', 'design', 'develop', 'give', 'me', 'a', 'an', 'the'].includes(w)
    );
    
    // Return first few meaningful words
    return filtered.slice(0, 5).join(' ') || 'the requested item';
}

// ========================================
// OUTPUT FUNCTIONS
// ========================================
function renderOutput() {
    const outputDiv = document.getElementById('outputPrompt');
    
    // Format the output with proper HTML
    let formatted = state.outputText;
    
    // Convert **text** to <strong>text</strong>
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Convert bullet points to list items
    formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in <ul>
    formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    
    // Convert section headings (text ending with :)
    formatted = formatted.replace(/^([A-Z][^:\n]+):$/gm, '<h4>$1:</h4>');
    
    // Convert line breaks to paragraphs
    const paragraphs = formatted.split('\n\n');
    formatted = paragraphs.map(p => {
        if (p.startsWith('<h4>') || p.startsWith('<ul>')) {
            return p;
        }
        return `<p>${p}</p>`;
    }).join('');
    
    outputDiv.innerHTML = formatted;
    
    // Update word count
    const wordCount = state.outputText.split(/\s+/).filter(w => w.length > 0).length;
    document.getElementById('outputWordCount').textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
}

function renderImprovements() {
    const list = document.getElementById('improvementsList');
    list.innerHTML = '';
    
    state.improvements.forEach(improvement => {
        const item = document.createElement('div');
        item.className = 'improvement-item';
        item.innerHTML = `
            <span class="improvement-check">✓</span>
            <span>${improvement}</span>
        `;
        list.appendChild(item);
    });
    
    // Calculate stats
    const inputWords = state.inputText.split(/\s+/).filter(w => w.length > 0).length;
    const outputWords = state.outputText.split(/\s+/).filter(w => w.length > 0).length;
    const wordDiff = outputWords - inputWords;
    
    document.getElementById('wordDiff').textContent = `+${wordDiff} words`;
    
    // Simple clarity score (based on improvements)
    const clarityScore = Math.min(100, 60 + (state.improvements.length * 8));
    document.getElementById('clarityScore').textContent = `${clarityScore}%`;
    
    // Specificity score (based on length and structure)
    const specificityScore = Math.min(100, 50 + Math.floor(outputWords / 10));
    document.getElementById('specificityScore').textContent = `${specificityScore}%`;
}

async function copyOutput() {
    if (!state.outputText) {
        showToast('Nothing to copy yet');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(state.outputText);
        showToast('Optimized prompt copied! ⎘');
    } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = state.outputText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Optimized prompt copied! ⎘');
    }
}

function downloadOutput() {
    if (!state.outputText) {
        showToast('Nothing to download yet');
        return;
    }
    
    const blob = new Blob([state.outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-prompt.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Prompt downloaded! 📥');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
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
