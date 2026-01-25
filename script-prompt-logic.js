/**
 * ToolBit Prompt Logic Engine
 * Handles intent detection, heuristic scoring, and template management.
 * Runs 100% client-side.
 */

const PROMPT_LOGIC = {
    // ==========================================
    // 1. PATTERN LIBRARY
    // ==========================================
    PATTERNS: {
        code: {
            regex: /\b(function|class|def|var|const|let|=>|api|endpoint|database|react|css|html|python|javascript|java|sql|query|json|xml|debug|fix|repo)\b/i,
            weight: 2
        },
        image: {
            regex: /\b(image|photo|picture|draw|generate|style|ratio|aspect|4k|hd|render|art|illustration|logo|icon)\b/i,
            weight: 2
        },
        writing: {
            regex: /\b(essay|blog|post|article|email|letter|text|story|chapter|plot|character|narrative|tone|voice|introduction|conclusion)\b/i,
            weight: 1.5
        },
        analysis: {
            regex: /\b(analyze|summarize|extract|data|trend|pattern|insight|report|chart|table|excel|csv|metrics)\b/i,
            weight: 1.5
        },
        weakWords: {
            regex: /\b(stuff|things|good|make|do|give|something|kinda|sorta|whatever)\b/gi,
            weight: -1
        }
    },

    // ==========================================
    // 2. TEMPLATE LIBRARY
    // ==========================================
    TEMPLATES: {
        general: {
            name: "Standard Structured",
            structure: `
**Role:** {{ROLE}}
**Task:** {{TASK}}
**Context:** {{CONTEXT}}
**Format:** {{FORMAT}}
`
        },
        code: {
            name: "Senior Developer (Expert)",
            structure: `
Act as a Senior {{LANGUAGE}} Developer.
Task: {{TASK}}

Requirements:
- Use modern syntax and best practices.
- Include robust error handling.
- Add comments explaining complex logic.
- Optimize for performance and scalability.

Output format: {{FORMAT}} (e.g., Code block only, or Code + Explanation)
`
        },
        writing: {
            name: "Professional Writer",
            structure: `
Act as a professional {{TYPE}} writer.
Topic: {{TOPIC}}
Audience: {{AUDIENCE}}
Tone: {{TONE}}

Structure:
1. Engaging Hook
2. Key Points / Arguments
3. Clear Conclusion with Call to Action

Constraints:
- Use active voice.
- Avoid jargon unless necessary.
- Target word count: {{LENGTH}}.
`
        },
        analysis: {
            name: "Data Analyst",
            structure: `
Act as a Data Analyst.
Task: Analyze the provided {{DATA_TYPE}}.
Goal: Identify key trends, anomalies, and actionable insights.

Output format:
- Executive Summary
- Key Findings (Bullet points)
- Recommendations
- Format: {{FORMAT}} (Table/Text)
`
        },
        image: {
            name: "Midjourney/DALL-E Expert",
            structure: `
/imagine prompt: {{SUBJECT}}, {{STYLE}}, {{LIGHTING}}, {{COLOR_PALETTE}}, {{COMPOSITION}} --ar {{ASPECT_RATIO}} --v {{VERSION}}
`
        },
        cot: { // Chain of Thought
            name: "Chain of Thought (Reasoning)",
            structure: `
Role: {{ROLE}}
Task: {{TASK}}

Instructions:
Let's think step by step.
1. Break down the problem into smaller components.
2. Analyze each component.
3. Synthesize the findings into a final answer.

Constraints:
- Show your reasoning clearly.
- Verify assumptions.
`
        }
    },

    // ==========================================
    // 3. ANALYSIS ENGINE
    // ==========================================
    analyze: function (text) {
        if (!text) return null;

        const scores = {
            code: 0,
            image: 0,
            writing: 0,
            analysis: 0
        };

        // Detect Intent
        Object.keys(scores).forEach(category => {
            const match = text.match(new RegExp(this.PATTERNS[category].regex, 'gi'));
            if (match) {
                scores[category] = match.length * this.PATTERNS[category].weight;
            }
        });

        // Determine primary intent
        let maxScore = 0;
        let primaryIntent = 'general';
        Object.entries(scores).forEach(([intent, score]) => {
            if (score > maxScore) {
                maxScore = score;
                primaryIntent = intent;
            }
        });

        // Calculate Quality Score (0-100)
        let qualityScore = 50; // Base score
        const wordCount = text.split(/\s+/).length;

        // Length bonus
        if (wordCount > 5) qualityScore += 10;
        if (wordCount > 15) qualityScore += 10;

        // Specificity bonus (looking for quoted text, numbers, formatting)
        if (/"[^"]+"/.test(text)) qualityScore += 5;
        if (/\d+/.test(text)) qualityScore += 5;

        // Weak word penalty
        const weakMatches = text.match(this.PATTERNS.weakWords.regex);
        if (weakMatches) {
            qualityScore -= (weakMatches.length * 5);
        }

        return {
            intent: primaryIntent,
            scores: scores,
            quality: Math.max(0, Math.min(100, qualityScore)),
            suggestions: this.getSuggestions(primaryIntent, text)
        };
    },

    // ==========================================
    // 4. SUGGESTION ENGINE
    // ==========================================
    getSuggestions: function (intent, text) {
        const suggestions = [];

        if (text.length < 10) suggestions.push("Add more detail to your request.");

        if (intent === 'code') {
            if (!/\b(python|js|javascript|html|css|sql|react|node)\b/i.test(text)) {
                suggestions.push("Specify the programming language/framework.");
            }
            if (!/\b(error|bug|fix)\b/i.test(text) && !/\b(create|build)\b/i.test(text)) {
                suggestions.push("Clarify if you want to create new code or fix existing code.");
            }
        }

        if (intent === 'image') {
            if (!/\b(style|realistic|cartoon|oil|sketch)\b/i.test(text)) {
                suggestions.push("Mention a specific art style.");
            }
            if (!/\b(ratio|ar|16:9|square)\b/i.test(text)) {
                suggestions.push("Define the aspect ratio.");
            }
        }

        if (intent === 'writing') {
            if (!/\b(audience|reader|for)\b/i.test(text)) {
                suggestions.push("Specify your target audience.");
            }
            if (!/\b(length|words|short|long|paragraphs)\b/i.test(text)) {
                suggestions.push("Define the desired length.");
            }
            if (!/\b(tone|formal|casual|friendly)\b/i.test(text)) {
                suggestions.push("Mention the tone you want.");
            }
        }

        if (intent === 'analysis') {
            if (!/\b(data|csv|table|numbers|dataset)\b/i.test(text)) {
                suggestions.push("Describe the data format you're analyzing.");
            }
            if (!/\b(trend|pattern|insight|compare|find)\b/i.test(text)) {
                suggestions.push("Specify what insights you're looking for.");
            }
        }

        if (intent === 'general') {
            if (suggestions.length === 0) {
                suggestions.push("Try adding specific details about the format you want.");
            }
            if (!/\b(please|help|need|want)\b/i.test(text)) {
                suggestions.push("Consider adding constraints or requirements.");
            }
        }

        return suggestions;
    },

    // ==========================================
    // 5. COMPILER (TEMPLATE INJECTION)
    // ==========================================
    compile: function (data) {
        // data expects: { intent, fields: { role, task, context, ... } }
        const template = this.TEMPLATES[data.intent] || this.TEMPLATES.general;
        let compiled = template.structure;

        // Replace placeholders
        Object.entries(data.fields).forEach(([key, value]) => {
            const placeholder = `{{${key.toUpperCase()}}}`;
            compiled = compiled.replace(placeholder, value || `[${key}]`); // Leave placeholder if empty
        });

        // Clean up empty lines
        return compiled.replace(/^\s*[\r\n]/gm, '').trim();
    }
};

// Export for module usage (if needed) or global attachment
if (typeof window !== 'undefined') {
    window.PROMPT_LOGIC = PROMPT_LOGIC;
}
