// Animations JavaScript for Game-themed Portfolio

// Animation Controller
const AnimationController = {
    // Initialize animations
    init() {
        this.setupParallaxEffect();
        this.setupPixelateEffect();
        this.setupGlitchEffect();
        this.setupTypingEffect();
        this.setupRainEffect();
    },
    
    // Parallax effect for background elements
    setupParallaxEffect() {
        if (window.innerWidth <= 768) return; // Skip on mobile
        
        const parallaxElements = document.querySelectorAll('.parallax');
        
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 5;
                const xOffset = (0.5 - x) * speed;
                const yOffset = (0.5 - y) * speed;
                
                element.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });
    },
    
    // Pixelate effect for pixel art elements
    setupPixelateEffect() {
        const pixelElements = document.querySelectorAll('.pixel-effect');
        
        pixelElements.forEach(element => {
            // Random pixelation amount
            const pixelAmount = Math.floor(Math.random() * 3) + 1;
            element.style.filter = `blur(${pixelAmount}px)`;
            
            // Random animation delay
            const delay = Math.random() * 2;
            element.style.animationDelay = `${delay}s`;
        });
    },
    
    // Glitch effect for text elements
    setupGlitchEffect() {
        const glitchElements = document.querySelectorAll('.glitch-effect');
        
        glitchElements.forEach(element => {
            const originalText = element.textContent;
            
            // Periodically apply glitch effect
            setInterval(() => {
                // Skip if user prefers reduced motion
                if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
                
                this.applyGlitchEffect(element, originalText);
            }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds
        });
    },
    
    // Apply glitch effect to an element
    applyGlitchEffect(element, originalText) {
        const glitchChars = '!@#$%^&*()_+{}:"<>?|~`1234567890';
        const steps = 3; // Number of glitch steps
        
        let counter = 0;
        const glitchInterval = setInterval(() => {
            // Create glitched text
            let glitchedText = '';
            
            for (let i = 0; i < originalText.length; i++) {
                // 20% chance to replace with glitch character
                if (Math.random() < 0.2) {
                    const randomChar = glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
                    glitchedText += randomChar;
                } else {
                    glitchedText += originalText[i];
                }
            }
            
            element.textContent = glitchedText;
            
            counter++;
            if (counter >= steps) {
                clearInterval(glitchInterval);
                element.textContent = originalText; // Restore original text
            }
        }, 100);
    },
    
    // Typing effect for dialogue text
    setupTypingEffect() {
        const typingElements = document.querySelectorAll('[data-typing]');
        
        typingElements.forEach(element => {
            const text = element.textContent;
            element.textContent = ''; // Clear text
            
            // Store original text
            element.setAttribute('data-original-text', text);
            
            // Add cursor element
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '|';
            element.appendChild(cursor);
            
            // Setup typing animation when element becomes visible
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.typeText(element, text, 0);
                        observer.unobserve(element);
                    }
                });
            });
            
            observer.observe(element);
        });
    },
    
    // Type text character by character
    typeText(element, text, index) {
        if (index < text.length) {
            // Add next character
            element.textContent = text.substring(0, index + 1);
            
            // Add cursor
            const cursor = document.createElement('span');
            cursor.className = 'typing-cursor';
            cursor.textContent = '|';
            element.appendChild(cursor);
            
            // Random typing speed for natural effect
            const speed = Math.floor(Math.random() * 50) + 30;
            
            setTimeout(() => {
                this.typeText(element, text, index + 1);
            }, speed);
        } else {
            // Typing complete, blink cursor
            const cursor = element.querySelector('.typing-cursor');
            if (cursor) {
                cursor.classList.add('blink');
            }
        }
    },
    
    // Particle rain effect for backgrounds
    setupRainEffect() {
        const rainContainers = document.querySelectorAll('.rain-effect');
        
        rainContainers.forEach(container => {
            // Skip if user prefers reduced motion
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            
            // Create particles
            const particleCount = 50;
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'rain-particle';
                
                // Random position and animation
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.animationDuration = `${Math.random() * 3 + 2}s`;
                particle.style.animationDelay = `${Math.random() * 5}s`;
                particle.style.width = `${Math.random() * 3 + 1}px`;
                particle.style.height = `${Math.random() * 10 + 5}px`;
                
                container.appendChild(particle);
            }
        });
    }
};

// Special Effects Controller
const EffectsController = {
    // Initialize effects
    init() {
        this.setupSkillBarAnimation();
        this.setupProjectCardEffects();
        this.setupAchievementEffects();
        this.setupLoadingBarAnimation();
    },
    
    // Animate skill bars when visible
    setupSkillBarAnimation() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const targetWidth = entry.target.style.width;
                    entry.target.style.width = '0';
                    
                    setTimeout(() => {
                        entry.target.style.width = targetWidth;
                    }, 100);
                    
                    observer.unobserve(entry.target);
                }
            });
        });
        
        skillBars.forEach(bar => {
            observer.observe(bar);
        });
    },
    
    // Add effects to project cards
    setupProjectCardEffects() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            // Tilt effect on hover (if not mobile)
            if (window.innerWidth > 768) {
                card.addEventListener('mousemove', (e) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardCenterX = cardRect.left + cardRect.width / 2;
                    const cardCenterY = cardRect.top + cardRect.height / 2;
                    
                    const x = e.clientX - cardCenterX;
                    const y = e.clientY - cardCenterY;
                    
                    // Limit tilt to small amount
                    const tiltX = y / (cardRect.height / 2) * 5;
                    const tiltY = -x / (cardRect.width / 2) * 5;
                    
                    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-10px)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(-10px)';
                    
                    // Reset after transition
                    setTimeout(() => {
                        card.style.transform = '';
                    }, 300);
                });
            }
        });
    },
    
    // Add effects to achievement icons
    setupAchievementEffects() {
        const achievementIcons = document.querySelectorAll('.achievement-icon');
        
        achievementIcons.forEach(icon => {
            icon.addEventListener('click', () => {
                // Play shine animation
                icon.classList.add('shine-effect');
                
                // Play sound if available
                if (window.GameUI && window.GameUI.playSound) {
                    window.GameUI.playSound('click-sound');
                }
                
                // Remove effect after animation completes
                setTimeout(() => {
                    icon.classList.remove('shine-effect');
                }, 800);
            });
        });
    },
    
    // Animate loading bar
    setupLoadingBarAnimation() {
        const loadingBar = document.querySelector('.loading-progress');
        if (!loadingBar) return;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            loadingBar.style.width = `${progress}%`;
        }, 200);
    }
};

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    AnimationController.init();
    EffectsController.init();
    
    // Add CSS custom properties for RGB values (for animations)
    const root = document.documentElement;
    
    // Helper to convert hex to RGB
    const hexToRgb = (hex) => {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
    };
    
    // Get computed styles
    const computedStyle = getComputedStyle(document.body);
    
    // Set RGB values for colors
    const primaryColor = computedStyle.getPropertyValue('--primary-color').trim();
    const secondaryColor = computedStyle.getPropertyValue('--secondary-color').trim();
    const accentColor = computedStyle.getPropertyValue('--accent-color').trim();
    const cardBackground = computedStyle.getPropertyValue('--card-background').trim();
    
    if (primaryColor.startsWith('#')) {
        root.style.setProperty('--primary-color-rgb', hexToRgb(primaryColor));
    }
    
    if (secondaryColor.startsWith('#')) {
        root.style.setProperty('--secondary-color-rgb', hexToRgb(secondaryColor));
    }
    
    if (accentColor.startsWith('#')) {
        root.style.setProperty('--accent-color-rgb', hexToRgb(accentColor));
    }
    
    if (cardBackground.startsWith('#')) {
        root.style.setProperty('--card-background-rgb', hexToRgb(cardBackground));
    }
});

// Add button animation on click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('game-button') || 
        e.target.classList.contains('menu-button') ||
        e.target.classList.contains('back-button')) {
        
        // Add ripple effect
        const button = e.target;
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});
