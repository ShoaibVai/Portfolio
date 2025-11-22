// Enhancements for UI/UX: AOS, Typed.js, VanillaTilt

document.addEventListener('DOMContentLoaded', () => {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out-cubic',
            once: true,
            offset: 50,
            delay: 100,
            disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        });
    }

    // Initialize Typed.js
    if (typeof Typed !== 'undefined' && document.getElementById('typed-roles')) {
        new Typed('#typed-roles', {
            strings: [
                'Project Manager',
                'Game Designer',
                'Game Developer',
                'QA Test',
                'Business Analyst'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            cursorChar: '_',
            smartBackspace: true
        });
    }

    // Initialize Vanilla Tilt for cards (only on non-touch / large screens)
    if (typeof VanillaTilt !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches && window.innerWidth > 768) {
        const cards = document.querySelectorAll('.experience-card, .project-card, .achievement-card, .blog-card');
        VanillaTilt.init(cards, {
            max: 5,
            speed: 400,
            glare: true,
            "max-glare": 0.2,
            scale: 1.02
        });
    }

    // Particles.js removed to simplify visuals / improve performance
});
