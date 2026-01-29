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
        // General code (lower weight so specific patterns take priority)
        code: {
            regex: /\b(function|class|def|var|const|let|=>|database|react|css|html|python|javascript|java|sql|query|json|xml|repo|component|module)\b/i,
            weight: 1.5
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
        reasoning: {
            regex: /\b(step by step|explain why|how does|reason|think through|logic|prove|derive|calculate|solve|work out|breakdown|break down)\b/i,
            weight: 2
        },

        // Developer-specific patterns (higher weight for specificity)
        debug: {
            regex: /\b(debug|bug|error|fix|issue|crash|fail|broken|not working|exception|stack trace|undefined is not|null|TypeError|ReferenceError)\b/i,
            weight: 2.5
        },
        feature: {
            regex: /\b(add feature|implement|new feature|functionality|develop|integrate|build a|create a)\b/i,
            weight: 2
        },
        testing: {
            regex: /\b(test|spec|unit test|integration test|e2e|mock|stub|assert|coverage|jest|mocha|pytest|vitest|testing)\b/i,
            weight: 2.5
        },
        review: {
            regex: /\b(review|code review|check this|audit|inspect|evaluate|feedback|critique|look at this code)\b/i,
            weight: 2
        },
        refactor: {
            regex: /\b(refactor|clean up|simplify|optimize|restructure|improve code|technical debt|code smell|rewrite)\b/i,
            weight: 2
        },
        api: {
            regex: /\b(api design|endpoint|route|rest api|graphql|request|response|http|fetch|axios|crud)\b/i,
            weight: 2
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
        },

        // ==========================================
        // DEVELOPER TEMPLATES
        // ==========================================
        debug: {
            name: "Bug Detective",
            structure: `
Act as a Senior Debugging Specialist.

**Error/Issue:** {{TASK}}
**Language/Framework:** {{LANGUAGE}}
**Context:** {{CONTEXT}}

Debugging Approach:
1. Analyze the error message and stack trace
2. Identify potential root causes
3. Suggest diagnostic steps (console.log, breakpoints, etc.)
4. Provide the fix with detailed explanation
5. Recommend prevention strategies

Output format: {{FORMAT}}

Constraints:
- Explain *why* the bug occurs, not just how to fix it
- Include before/after code snippets
- Mention edge cases that could cause similar issues
`
        },
        feature: {
            name: "Feature Architect",
            structure: `
Act as a Senior Software Architect.

**Feature Request:** {{TASK}}
**Tech Stack:** {{LANGUAGE}}
**Existing Context:** {{CONTEXT}}

Implementation Plan:
1. Requirements breakdown
2. Architecture/design decisions
3. Step-by-step implementation guide
4. Integration points with existing code
5. Error handling considerations
6. Testing strategy

Output format: {{FORMAT}}

Constraints:
- Follow existing code patterns and conventions
- Consider scalability and maintainability
- Include TypeScript types if applicable
- Add JSDoc/docstring comments
`
        },
        testing: {
            name: "Test Engineer",
            structure: `
Act as a Senior Test Engineer.

**Code/Function to Test:** {{TASK}}
**Testing Framework:** {{LANGUAGE}}
**Test Type:** {{CONTEXT}}

Generate comprehensive tests including:
1. Happy path / expected behavior
2. Edge cases and boundary conditions
3. Error handling scenarios
4. Mock/stub setup if needed
5. Assertions with clear descriptions

Output format: {{FORMAT}}

Constraints:
- Use AAA pattern (Arrange, Act, Assert)
- Each test should test ONE behavior
- Include descriptive test names (should_X_when_Y)
- Add setup/teardown if needed
`
        },
        review: {
            name: "Code Reviewer",
            structure: `
Act as a Senior Code Reviewer performing a thorough review.

**Code to Review:**
{{TASK}}

**Language/Framework:** {{LANGUAGE}}
**Focus Areas:** {{CONTEXT}}

Review for:
1. **Correctness**: Logic errors, off-by-one, null checks
2. **Security**: Injection, XSS, authentication issues
3. **Performance**: N+1 queries, memory leaks, inefficient loops
4. **Readability**: Naming, complexity, documentation
5. **Best Practices**: SOLID principles, DRY, design patterns

Output format: {{FORMAT}}

For each issue found: [Severity: Critical/Major/Minor] + Location + Suggestion
`
        },
        refactor: {
            name: "Refactoring Expert",
            structure: `
Act as a Senior Developer specializing in code refactoring.

**Code to Refactor:**
{{TASK}}

**Language:** {{LANGUAGE}}
**Goals:** {{CONTEXT}}

Refactoring Approach:
1. Identify code smells (duplication, long methods, etc.)
2. Propose refactoring techniques to apply
3. Show step-by-step transformation
4. Ensure behavior is preserved
5. Suggest test coverage improvements

Output format: {{FORMAT}}

Constraints:
- Make incremental, safe changes
- Preserve existing functionality (no regressions)
- Explain the "why" behind each change
- Follow language idioms and conventions
`
        },
        api: {
            name: "API Designer",
            structure: `
Act as a Senior API Architect.

**API Requirement:** {{TASK}}
**Framework/Style:** {{LANGUAGE}}
**Context:** {{CONTEXT}}

Design deliverables:
1. Endpoint structure (routes, HTTP methods)
2. Request/response schemas (with examples)
3. Authentication/authorization approach
4. Error response format
5. Pagination/filtering strategy
6. Example requests with curl/fetch

Output format: {{FORMAT}}

Constraints:
- Follow RESTful conventions (or GraphQL best practices)
- Include proper HTTP status codes
- Document edge cases and error scenarios
- Consider rate limiting and versioning
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
            analysis: 0,
            reasoning: 0,
            // Developer intents
            debug: 0,
            feature: 0,
            testing: 0,
            review: 0,
            refactor: 0,
            api: 0
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

        // Map reasoning intent to Chain-of-Thought template
        if (primaryIntent === 'reasoning') {
            primaryIntent = 'cot';
        }

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

        if (intent === 'cot' || intent === 'reasoning') {
            if (!/\b(problem|question|solve|calculate)\b/i.test(text)) {
                suggestions.push("Clearly state the problem to be solved.");
            }
            if (!/\b(show|explain|verify)\b/i.test(text)) {
                suggestions.push("Ask the AI to show its work or verify assumptions.");
            }
        }

        // Developer intent suggestions
        if (intent === 'debug') {
            if (!/\b(error|message|stack|trace|log)\b/i.test(text)) {
                suggestions.push("Include the error message or stack trace.");
            }
            if (!/\b(python|js|javascript|react|node|java|typescript)\b/i.test(text)) {
                suggestions.push("Mention the programming language or framework.");
            }
        }

        if (intent === 'feature') {
            if (!/\b(existing|current|codebase|project)\b/i.test(text)) {
                suggestions.push("Describe the existing codebase context.");
            }
            if (!/\b(requirement|should|must|need)\b/i.test(text)) {
                suggestions.push("List specific requirements for the feature.");
            }
        }

        if (intent === 'testing') {
            if (!/\b(jest|mocha|pytest|vitest|cypress)\b/i.test(text)) {
                suggestions.push("Specify the testing framework to use.");
            }
            if (!/\b(unit|integration|e2e|end-to-end)\b/i.test(text)) {
                suggestions.push("Clarify the type of tests needed.");
            }
        }

        if (intent === 'review') {
            if (!/\b(security|performance|readability)\b/i.test(text)) {
                suggestions.push("Specify focus areas (security, performance, readability).");
            }
        }

        if (intent === 'refactor') {
            if (!/\b(goal|improve|simplify|readable)\b/i.test(text)) {
                suggestions.push("Describe the refactoring goals.");
            }
        }

        if (intent === 'api') {
            if (!/\b(rest|graphql|grpc)\b/i.test(text)) {
                suggestions.push("Specify the API style (REST, GraphQL, etc.).");
            }
            if (!/\b(auth|authentication|authorization)\b/i.test(text)) {
                suggestions.push("Mention authentication requirements.");
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
