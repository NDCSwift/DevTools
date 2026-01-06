// ========================================
// CONTENT SOURCES
// ========================================
const LOREM_SOURCES = {
    classic: {
        words: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum']
    },
    
    hipster: {
        words: ['artisan', 'organic', 'sustainable', 'craft', 'vinyl', 'meditation', 'sriracha', 'literally', 'whatever', 'flexitarian', 'vegan', 'kombucha', 'aesthetic', 'asymmetrical', 'brooklyn', 'chambray', 'fixie', 'gluten-free', 'helvetica', 'kickstarter', 'letterpress', 'locavore', 'mustache', 'normcore', 'pinterest', 'quinoa', 'retro', 'seitan', 'shoreditch', 'tattooed', 'typewriter', 'unicorn', 'waistcoat', 'yuccie', 'biodiesel', 'dreamcatcher', 'ethical', 'farm-to-table', 'godard', 'heirloom', 'iPhone', 'jean', 'shorts', 'kale', 'keffiyeh', 'lomo', 'messenger', 'bag', 'microdosing', 'next', 'level', 'organic']
    },
    
    corporate: {
        words: ['synergy', 'leverage', 'stakeholder', 'strategic', 'partnership', 'innovative', 'solution', 'maximize', 'shareholder', 'value', 'paradigm', 'shift', 'best', 'practices', 'core', 'competency', 'deliverables', 'ecosystem', 'bandwidth', 'circle', 'back', 'low-hanging', 'fruit', 'move', 'needle', 'actionable', 'insights', 'thought', 'leadership', 'holistic', 'approach', 'deep', 'dive', 'scalable', 'enterprise', 'optimize', 'streamline', 'proactive', 'verticals', 'end-to-end', 'seamless', 'integration', 'robust', 'framework', 'game-changer', 'disruptive', 'bleeding', 'edge', 'mission-critical', 'key', 'performance', 'indicator']
    },
    
    tech: {
        words: ['API', 'microservices', 'containerized', 'scalable', 'cloud-native', 'serverless', 'distributed', 'architecture', 'framework', 'deployment', 'continuous', 'integration', 'DevOps', 'agile', 'sprint', 'refactor', 'legacy', 'codebase', 'authentication', 'authorization', 'middleware', 'backend', 'frontend', 'full-stack', 'repository', 'version', 'control', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'pipeline', 'orchestration', 'automation', 'infrastructure', 'as', 'code', 'REST', 'GraphQL', 'database', 'cache', 'load', 'balancer', 'monitoring', 'logging', 'metrics', 'performance', 'optimization', 'latency', 'throughput']
    },
    
    bacon: {
        words: ['bacon', 'ribeye', 'brisket', 'jerky', 'short', 'loin', 'pork', 'belly', 'chuck', 't-bone', 'filet', 'mignon', 'shankle', 'sirloin', 'tri-tip', 'bresaola', 'capicola', 'corned', 'beef', 'drumstick', 'fatback', 'flank', 'ham', 'hock', 'jowl', 'kielbasa', 'landjaeger', 'meatball', 'meatloaf', 'pastrami', 'pancetta', 'picanha', 'porchetta', 'pork', 'chop', 'prosciutto', 'salami', 'sausage', 'spare', 'ribs', 'strip', 'steak', 'tail', 'tenderloin', 'tongue', 'turducken', 'venison']
    },
    
    cupcake: {
        words: ['cupcake', 'chocolate', 'brownie', 'candy', 'sweet', 'roll', 'tart', 'cookie', 'cake', 'jelly', 'beans', 'gummies', 'marshmallow', 'toffee', 'bear', 'claw', 'bonbon', 'caramels', 'cheesecake', 'croissant', 'danish', 'donut', 'dragée', 'fruitcake', 'gingerbread', 'halvah', 'ice', 'cream', 'jujubes', 'lemon', 'drops', 'liquorice', 'macaroon', 'marzipan', 'oat', 'pie', 'pastry', 'powder', 'pudding', 'sesame', 'snaps', 'soufflé', 'sugar', 'plum', 'tiramisu', 'topping', 'wafer']
    },
    
    pirate: {
        words: ['avast', 'ye', 'landlubber', 'booty', 'plunder', 'ahoy', 'matey', 'scurvy', 'scallywag', 'bilge', 'rat', 'dead', 'mans', 'chest', 'doubloon', 'grog', 'jolly', 'roger', 'keelhaul', 'mutiny', 'parley', 'pieces', 'of', 'eight', 'privateer', 'rum', 'shiver', 'me', 'timbers', 'swab', 'the', 'deck', 'walk', 'plank', 'yo-ho-ho', 'buccaneer', 'cannon', 'crow\'s', 'nest', 'cutlass', 'davy', 'jones', 'locker', 'first', 'mate', 'gangplank', 'hornswaggle', 'landlocked', 'marooned', 'poop', 'starboard', 'port']
    },
    
    zombie: {
        words: ['zombie', 'brains', 'undead', 'infected', 'viral', 'outbreak', 'apocalypse', 'horde', 'shambling', 'rotting', 'flesh', 'contagion', 'mutation', 'plague', 'survivor', 'lurching', 'groaning', 'bite', 'scratch', 'headshot', 'quarantine', 'barricade', 'safe', 'house', 'ammunition', 'scavenge', 'supplies', 'bunker', 'antidote', 'cure', 'laboratory', 'experiment', 'patient', 'zero', 'transmission', 'reanimation', 'corpse', 'decay', 'ravenous', 'hunger', 'walker', 'ghoul', 'creature', 'horror', 'nightmare', 'terror']
    }
};

// ========================================
// STATE & CONFIGURATION
// ========================================
const CONFIG = {
    TOAST_DURATION: 3000
};

let state = {
    contentType: 'classic',
    amountType: 'paragraphs',
    amount: 3,
    format: 'plain',
    startWithLorem: true,
    sentenceVariety: false,
    generatedText: '',
    previewMode: 'styled'
};

// ========================================
// INITIALIZATION
// ========================================
function init() {
    attachEventListeners();
    console.log('📝 ToolBit Lorem Ipsum Generator initialized');
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Content type selector
    document.querySelectorAll('.type-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            selectContentType(type);
        });
    });
    
    // Amount type radios
    document.querySelectorAll('input[name="amountType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.amountType = e.target.value;
            updateAmountValue();
        });
    });
    
    // Amount inputs
    document.getElementById('paragraphCount').addEventListener('input', updateAmountValue);
    document.getElementById('sentenceCount').addEventListener('input', updateAmountValue);
    document.getElementById('wordCount').addEventListener('input', updateAmountValue);
    
    // Format radios
    document.querySelectorAll('input[name="format"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.format = e.target.value;
            updatePreview();
        });
    });
    
    // Options checkboxes
    document.getElementById('startWithLorem').addEventListener('change', (e) => {
        state.startWithLorem = e.target.checked;
    });
    
    document.getElementById('sentenceVariety').addEventListener('change', (e) => {
        state.sentenceVariety = e.target.checked;
    });
    
    // Generate button
    document.getElementById('generateBtn').addEventListener('click', generateText);
    
    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.currentTarget.dataset.template;
            generateTemplate(template);
        });
    });
    
    // Preview mode buttons
    document.querySelectorAll('.preview-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.currentTarget.dataset.mode;
            switchPreviewMode(mode);
        });
    });
    
    // Action buttons
    document.getElementById('copyTextBtn').addEventListener('click', () => copyText('plain'));
    document.getElementById('copyHTMLBtn').addEventListener('click', () => copyText('html'));
    document.getElementById('downloadBtn').addEventListener('click', downloadText);
}

// ========================================
// CONTENT TYPE SELECTION
// ========================================
function selectContentType(type) {
    state.contentType = type;
    
    // Update active button
    document.querySelectorAll('.type-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
    });
    
    // Disable "Start with Lorem" for non-classic types
    const startWithLoremCheckbox = document.getElementById('startWithLorem');
    if (type !== 'classic') {
        startWithLoremCheckbox.checked = false;
        startWithLoremCheckbox.disabled = true;
        state.startWithLorem = false;
    } else {
        startWithLoremCheckbox.disabled = false;
    }
}

// ========================================
// AMOUNT MANAGEMENT
// ========================================
function updateAmountValue() {
    const amountType = state.amountType;
    
    if (amountType === 'paragraphs') {
        state.amount = parseInt(document.getElementById('paragraphCount').value) || 3;
    } else if (amountType === 'sentences') {
        state.amount = parseInt(document.getElementById('sentenceCount').value) || 5;
    } else if (amountType === 'words') {
        state.amount = parseInt(document.getElementById('wordCount').value) || 50;
    }
}

// ========================================
// TEXT GENERATION
// ========================================
function generateText() {
    updateAmountValue();
    
    let paragraphs = [];
    
    if (state.amountType === 'paragraphs') {
        paragraphs = generateParagraphs(state.amount);
    } else if (state.amountType === 'sentences') {
        const sentences = generateSentences(state.amount);
        paragraphs = [sentences.join(' ')];
    } else if (state.amountType === 'words') {
        const words = generateWords(state.amount);
        paragraphs = [capitalize(words.join(' ')) + '.'];
    }
    
    state.generatedText = formatOutput(paragraphs);
    updatePreview();
    showToast('Text generated! ✨');
}

function generateParagraphs(count) {
    const paragraphs = [];
    
    for (let i = 0; i < count; i++) {
        const sentenceCount = state.sentenceVariety ? random(3, 8) : random(4, 6);
        const sentences = generateSentences(sentenceCount, i === 0);
        paragraphs.push(sentences.join(' '));
    }
    
    return paragraphs;
}

function generateSentences(count, isFirst = false) {
    const sentences = [];
    
    for (let i = 0; i < count; i++) {
        if (i === 0 && isFirst && state.startWithLorem && state.contentType === 'classic') {
            sentences.push('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
        } else {
            const wordCount = state.sentenceVariety ? random(5, 20) : random(8, 15);
            const words = generateWords(wordCount);
            const sentence = capitalize(words.join(' ')) + '.';
            sentences.push(sentence);
        }
    }
    
    return sentences;
}

function generateWords(count) {
    const words = [];
    const source = LOREM_SOURCES[state.contentType].words;
    
    for (let i = 0; i < count; i++) {
        const word = source[random(0, source.length - 1)];
        words.push(word);
    }
    
    return words;
}

function formatOutput(paragraphs) {
    switch (state.format) {
        case 'html':
            return paragraphs.map(p => `<p>${p}</p>`).join('\n');
        case 'markdown':
            return paragraphs.join('\n\n');
        case 'json':
            return JSON.stringify(paragraphs, null, 2);
        default:
            return paragraphs.join('\n\n');
    }
}

// ========================================
// TEMPLATE GENERATION
// ========================================
function generateTemplate(templateType) {
    let output = '';
    
    switch (templateType) {
        case 'email':
            output = generateEmailTemplate();
            break;
        case 'blog':
            output = generateBlogTemplate();
            break;
        case 'profile':
            output = generateProfileTemplate();
            break;
        case 'product':
            output = generateProductTemplate();
            break;
        case 'testimonial':
            output = generateTestimonialTemplate();
            break;
    }
    
    state.generatedText = output;
    state.format = 'plain';
    document.querySelector('input[name="format"][value="plain"]').checked = true;
    updatePreview();
    showToast(`${capitalize(templateType)} template generated! ✨`);
}

function generateEmailTemplate() {
    const subject = generateSentences(1)[0].replace('.', '');
    const greeting = 'Hi [Name],';
    const body = generateParagraphs(2);
    const closing = 'Best regards,\n[Your Name]';
    
    return `Subject: ${subject}\n\n${greeting}\n\n${body.join('\n\n')}\n\n${closing}`;
}

function generateBlogTemplate() {
    const title = '# ' + generateSentences(1)[0].replace('.', '');
    const intro = generateParagraphs(1)[0];
    const section1Heading = '## ' + capitalize(generateWords(3).join(' '));
    const section1Body = generateParagraphs(2).join('\n\n');
    const section2Heading = '## ' + capitalize(generateWords(3).join(' '));
    const section2Body = generateParagraphs(2).join('\n\n');
    const conclusion = generateParagraphs(1)[0];
    
    return `${title}\n\n${intro}\n\n${section1Heading}\n\n${section1Body}\n\n${section2Heading}\n\n${section2Body}\n\n${conclusion}`;
}

function generateProfileTemplate() {
    const name = capitalize(generateWords(2).join(' '));
    const bio = generateSentences(2).join(' ');
    const interests = generateWords(6).join(', ');
    
    return `Name: ${name}\n\nBio: ${bio}\n\nInterests: ${interests}`;
}

function generateProductTemplate() {
    const productName = capitalize(generateWords(3).join(' '));
    const tagline = generateSentences(1)[0];
    const features = [
        '- ' + capitalize(generateWords(4).join(' ')),
        '- ' + capitalize(generateWords(4).join(' ')),
        '- ' + capitalize(generateWords(4).join(' '))
    ].join('\n');
    const description = generateParagraphs(2).join('\n\n');
    const price = '$' + random(10, 999);
    
    return `${productName}\n${tagline}\n\nFeatures:\n${features}\n\n${description}\n\nPrice: ${price}`;
}

function generateTestimonialTemplate() {
    const quote = generateSentences(3).join(' ');
    const name = capitalize(generateWords(2).join(' '));
    const title = capitalize(generateWords(2).join(' ')) + ', ' + capitalize(generateWords(2).join(' '));
    
    return `"${quote}"\n\n— ${name}, ${title}`;
}

// ========================================
// PREVIEW MANAGEMENT
// ========================================
function updatePreview() {
    const content = document.getElementById('previewContent');
    
    if (!state.generatedText) {
        content.innerHTML = '<p class="preview-placeholder">Click "Generate Text" or choose a template to get started!</p>';
        content.className = 'preview-content';
        updateStats('', 0, 0, 0);
        return;
    }
    
    if (state.previewMode === 'raw') {
        content.textContent = state.generatedText;
        content.className = 'preview-content raw';
    } else {
        // Styled preview
        let html = state.generatedText;
        
        // Convert markdown headings to HTML
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        
        // Convert paragraphs
        if (!html.includes('<p>') && !html.includes('<h')) {
            const paragraphs = html.split('\n\n');
            html = paragraphs.map(p => p.trim() ? `<p>${p}</p>` : '').join('');
        }
        
        content.innerHTML = html;
        content.className = 'preview-content styled';
    }
    
    // Update stats
    const plainText = state.generatedText.replace(/<[^>]*>/g, '').replace(/[#*-]/g, '');
    const words = plainText.split(/\s+/).filter(w => w.length > 0).length;
    const chars = plainText.length;
    const paragraphs = (state.generatedText.match(/<p>/g) || state.generatedText.split('\n\n').filter(p => p.trim())).length;
    
    updateStats(state.generatedText, words, chars, paragraphs);
}

function switchPreviewMode(mode) {
    state.previewMode = mode;
    
    // Update active button
    document.querySelectorAll('.preview-mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    updatePreview();
}

function updateStats(text, words, chars, paragraphs) {
    document.getElementById('wordCount').textContent = `${words} word${words !== 1 ? 's' : ''}`;
    document.getElementById('charCount').textContent = `${chars} character${chars !== 1 ? 's' : ''}`;
    document.getElementById('paraCount').textContent = `${paragraphs} paragraph${paragraphs !== 1 ? 's' : ''}`;
}

// ========================================
// COPY & DOWNLOAD
// ========================================
function copyText(format) {
    if (!state.generatedText) {
        showToast('Generate some text first!');
        return;
    }
    
    let textToCopy = state.generatedText;
    
    if (format === 'plain' && state.format === 'html') {
        // Strip HTML tags
        textToCopy = textToCopy.replace(/<[^>]*>/g, '').replace(/\n\n+/g, '\n\n');
    }
    
    copyToClipboard(textToCopy);
    showToast(`${format === 'html' ? 'HTML' : 'Text'} copied to clipboard! ⎘`);
}

function downloadText() {
    if (!state.generatedText) {
        showToast('Generate some text first!');
        return;
    }
    
    const extension = state.format === 'html' ? 'html' : 'txt';
    const blob = new Blob([state.generatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lorem-ipsum.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('File downloaded! 📥');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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
