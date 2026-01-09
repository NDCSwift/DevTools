// ========================================
// HOMEPAGE SCRIPT
// ========================================

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scroll to tools section
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            const toolsSection = document.querySelector('#tools');
            if (toolsSection) {
                toolsSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // Add scroll reveal animation for tool cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all tool cards
    const toolCards = document.querySelectorAll('.tool-card');
    toolCards.forEach((card, index) => {
        // Initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        // Observe
        observer.observe(card);
    });

    // Observe feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        // Initial state
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        // Observe
        observer.observe(card);
    });

    // Track tool clicks for analytics (if GA is present)
    if (typeof gtag !== 'undefined') {
        toolCards.forEach(card => {
            card.addEventListener('click', function() {
                const toolName = this.querySelector('.tool-name').textContent;
                gtag('event', 'tool_click', {
                    'event_category': 'navigation',
                    'event_label': toolName,
                    'value': 1
                });
            });
        });
    }

    console.log('🎉 ToolBit Homepage loaded - 10 tools ready!');
});
