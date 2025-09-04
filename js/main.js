// Main JavaScript for Game-themed Portfolio

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const startButton = document.getElementById('start-button');
const loadingScreen = document.getElementById('loading-screen');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const mainNavigation = document.getElementById('main-navigation');
const toggleThemeButton = document.getElementById('toggle-theme');
const toggleSoundButton = document.getElementById('toggle-sound');
const backgroundMusic = document.getElementById('background-music');
const contactForm = document.getElementById('contact-form');
const sections = document.querySelectorAll('.game-section');

// State
let soundEnabled = true;
let currentTheme = localStorage.getItem('theme') || 'light';
let loadingProgress = 0;
let assets = [];
let currentSection = null;
let musicStarted = false;

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    // Initialize sound preference
    const savedSoundPreference = localStorage.getItem('soundEnabled');
    if (savedSoundPreference !== null) {
        soundEnabled = savedSoundPreference === 'true';
        updateSoundIcon();
    }
    
    // Start background music automatically if sound is enabled
    if (soundEnabled && backgroundMusic) {
        // Add a small delay to ensure the audio element is ready
        setTimeout(() => {
            backgroundMusic.play().then(() => {
                musicStarted = true;
                console.log('Background music started automatically');
            }).catch(e => {
                console.log('Auto-play prevented by browser, will start on first user interaction:', e);
                // Add event listener for first user interaction
                document.addEventListener('click', startMusicOnFirstInteraction, { once: true });
                document.addEventListener('keydown', startMusicOnFirstInteraction, { once: true });
            });
        }, 500);
    }
    
    // Preload assets
    preloadAssets();
    
    // Create anchored decorations after page loads
    setTimeout(createAnchoredDecorations, 1000);
    
    // Start button event listener (guard if not present)
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
    
    // Enter key to start (PC users)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent any default behavior
            startGame();
        }
    });
    
    // Navigation functionality
    setupNavigation();
    
    // Theme toggle
    if (toggleThemeButton) {
        toggleThemeButton.addEventListener('click', toggleTheme);
    }
    
    // Sound toggle
    if (toggleSoundButton) {
        toggleSoundButton.addEventListener('click', toggleSound);
    }
    
    // Navigation scroll effect
    setupNavigationScrollEffect();
    
    // Contact form submission
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
    
    // Add hover sound to buttons
    addHoverSoundToButtons();
    
    // Initialize custom cursor if not on mobile
    if (window.innerWidth > 768) {
        initCustomCursor();
    }
    
    // Set up intersection observers for scroll animations
    setupScrollAnimations();
});

// Preload assets
function preloadAssets() {
    // Gather all assets to preload
    const images = [
        'assets/images/avatar.jpg',
        'assets/images/avatar-small.jpg',
        'assets/images/pixel-character.png',
        'assets/images/project1.jpg',
        'assets/images/project2.jpg',
        'assets/images/project3.jpg',
        'assets/images/loading-icon.png',
        'assets/images/grid-pattern.png'
    ];
    
    const sounds = [
        'assets/sounds/button-click.mp3',
        'assets/sounds/hover.mp3',
        'assets/sounds/start.mp3'
    ];
    
    assets = [...images, ...sounds];
    const totalAssets = assets.length;
    let loadedAssets = 0;
    
    // Update loading bar as assets load
    assets.forEach(asset => {
        const element = asset.endsWith('.mp3') ? new Audio() : new Image();
        
        element.onload = element.oncanplaythrough = () => {
            loadedAssets++;
            loadingProgress = (loadedAssets / totalAssets) * 100;
            updateLoadingBar();
            
            if (loadedAssets === totalAssets) {
                setTimeout(completeLoading, 500);
            }
        };
        
        element.onerror = () => {
            loadedAssets++;
            console.warn(`Failed to load asset: ${asset}`);
            
            if (loadedAssets === totalAssets) {
                setTimeout(completeLoading, 500);
            }
        };
        
        if (asset.endsWith('.mp3')) {
            element.src = asset;
        } else {
            element.src = asset;
        }
    });
    
    // Fallback in case some assets don't load
    setTimeout(completeLoading, 5000);
}

// Update the loading progress bar
function updateLoadingBar() {
    const progressBar = document.querySelector('.loading-progress');
    progressBar.style.width = `${loadingProgress}%`;
}

// Complete the loading process
function completeLoading() {
    const progressBar = document.querySelector('.loading-progress');
    progressBar.style.width = '100%';
    
    setTimeout(() => {
        if (loadingScreen) loadingScreen.style.opacity = '0';
        setTimeout(() => {
            if (loadingScreen) loadingScreen.style.display = 'none';
            if (titleScreen) {
                titleScreen.classList.add('active');
            }
            // Add animations to title screen elements (guarded if elements exist)
            const gameTitle = document.querySelector('.game-title');
            if (gameTitle) gameTitle.classList.add('fade-in');
            const gameSubtitle = document.querySelector('.game-subtitle');
            if (gameSubtitle) gameSubtitle.classList.add('fade-in', 'delay-300');
            const pixelChar = document.querySelector('.pixel-character');
            if (pixelChar) pixelChar.classList.add('fade-in', 'delay-500');
            const startBtnEl = document.querySelector('#start-button');
            if (startBtnEl) startBtnEl.classList.add('fade-in', 'delay-700');
            const blinkText = document.querySelector('.blink-text');
            if (blinkText) blinkText.classList.add('fade-in', 'delay-900');
        }, 500);
    }, 500);
}

// Start the game (scroll to about section)
function startGame() {
    playSound('start-sound');
    // Smooth scroll to first content section; fallback to #skills if #about doesn't exist
    const target = document.getElementById('about') || document.getElementById('skills');
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add specific animations for each section
function animateSectionEntrance(sectionId) {
    switch (sectionId) {
        case 'about':
            animateElement('.character-avatar', 'slide-in-left');
            animateElement('.character-info h3', 'slide-in-right', 200);
            animateElement('.character-class', 'slide-in-right', 300);
            animateElement('.character-stats', 'fade-in', 400);
            animateElement('.character-bio', 'fade-in', 600);
            break;
            
        case 'skills':
            const categories = document.querySelectorAll('.skill-category');
            categories.forEach((category, index) => {
                category.classList.add('slide-in-bottom', `delay-${index * 200}`);
            });
            break;
            
        case 'projects':
            const projects = document.querySelectorAll('.project-card');
            projects.forEach((project, index) => {
                project.classList.add('fade-in', `delay-${index * 200}`);
            });
            break;
            
        case 'achievements':
            const achievements = document.querySelectorAll('.achievement-card');
            achievements.forEach((achievement, index) => {
                achievement.classList.add('slide-in-right', `delay-${index * 150}`);
            });
            break;
            
        case 'experience':
            const timelineItems = document.querySelectorAll('.timeline-item');
            timelineItems.forEach((item, index) => {
                item.classList.add('slide-in-left', `delay-${index * 200}`);
            });
            break;
            
        case 'contact':
            animateElement('.dialogue-box', 'slide-in-left');
            animateElement('.contact-form', 'slide-in-right', 300);
            break;
    }
}

// Helper to animate an element
function animateElement(selector, animationClass, delay = 0) {
    const element = document.querySelector(selector);
    if (element) {
        setTimeout(() => {
            element.classList.add(animationClass);
        }, delay);
    }
}

// Toggle theme between light and dark
function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    playSound('click-sound');
}

// Update the theme toggle icon
function updateThemeIcon() {
    if (!toggleThemeButton) return;
    const icon = toggleThemeButton.querySelector('i');
    if (!icon) return;
    if (currentTheme === 'light') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundIcon();
    
    if (soundEnabled) {
        playSound('click-sound');
        // Start background music if not already started
        if (!musicStarted && backgroundMusic) {
            backgroundMusic.play().then(() => {
                musicStarted = true;
                console.log('BGM started via sound toggle');
            }).catch(e => console.log('BGM play failed:', e));
        } else if (backgroundMusic) {
            backgroundMusic.play().catch(e => console.log('BGM resume failed:', e));
        }
    } else {
        // Pause background music
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
    }
    
    // Store preference
    localStorage.setItem('soundEnabled', soundEnabled);
}

// Start music on first user interaction (fallback for autoplay restrictions)
function startMusicOnFirstInteraction() {
    if (soundEnabled && backgroundMusic && !musicStarted) {
        backgroundMusic.play().then(() => {
            musicStarted = true;
            console.log('Background music started on first user interaction');
        }).catch(e => {
            console.log('Failed to start background music:', e);
        });
    }
}

// Update the sound toggle icon
function updateSoundIcon() {
    if (!toggleSoundButton) return;
    const icon = toggleSoundButton.querySelector('i');
    if (!icon) return;
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
    } else {
        icon.className = 'fas fa-volume-mute';
    }
}

// Play a sound if sound is enabled
function playSound(soundId) {
    if (soundEnabled) {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn('Audio playback was prevented:', error);
            });
        }
    }
}

// Add hover sound effect to interactive elements
function addHoverSoundToButtons() {
    const interactiveElements = document.querySelectorAll('.game-button, .menu-button, .back-button, .dialogue-option, .nav-link, .nav-toggle');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            playSound('hover-sound');
        });
    });
}

// Handle contact form submission
function handleContactFormSubmit(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    
    if (!nameInput.value || !emailInput.value || !messageInput.value) {
        alert('Please fill in all fields');
        return;
    }
    
    playSound('click-sound');
    
    emailjs.send('service_uqc89hm', 'template_e73u9a5', {
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value
    })
    .then(function(response) {
        console.log('EmailJS SUCCESS!', response.status, response.text);
        contactForm.innerHTML = `
            <div class="success-message">
                <h3>Message Sent!</h3>
                <p>Thank you for your message, ${nameInput.value}. I'll get back to you soon!</p>
                <button type="button" class="game-button" onclick="showSection('main-menu')">Return to Menu</button>
            </div>
        `;
        const successMessage = document.querySelector('.success-message');
        if (successMessage) {
            successMessage.classList.add('fade-in');
        }
    }, function(error) {
        console.error('EmailJS FAILED...', error);
        alert('Failed to send message. Error: ' + JSON.stringify(error));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize EmailJS
    emailjs.init('nju6MOa-L6VA2UZ7Y');
    
    // Other initializations...
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }
});

// Initialize custom cursor
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });
    
    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.display = 'none';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.display = 'block';
    });
    
    // Interactive elements should change cursor state
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .project-card, .dialogue-option');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('active');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('active');
        });
    });
}

// Set up intersection observers for scroll animations
function setupScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('[data-animation="hidden"]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.setAttribute('data-animation', 'visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Handle keyboard navigation
document.addEventListener('keydown', (event) => {
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
        return;
    }

    // Only handle keyboard navigation in the main menu
    if (currentSection === 'main-menu') {
        const menuItems = document.querySelectorAll('.menu-button');
        let currentFocus = -1;
        
        // Find currently focused item
        menuItems.forEach((item, index) => {
            if (document.activeElement === item) {
                currentFocus = index;
            }
        });
        
        // Up arrow
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentFocus > 0) {
                menuItems[currentFocus - 1].focus();
                playSound('hover-sound');
            } else {
                menuItems[menuItems.length - 1].focus();
                playSound('hover-sound');
            }
        }
        
        // Down arrow
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentFocus < menuItems.length - 1) {
                menuItems[currentFocus + 1].focus();
                playSound('hover-sound');
            } else {
                menuItems[0].focus();
                playSound('hover-sound');
            }
        }
        
        // Enter
        if (event.key === 'Enter' && currentFocus !== -1) {
            event.preventDefault();
            menuItems[currentFocus].click();
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Check if custom cursor should be enabled/disabled
    const cursor = document.querySelector('.custom-cursor');
    
    if (window.innerWidth <= 768 && cursor) {
        cursor.style.display = 'none';
    } else if (window.innerWidth > 768 && cursor) {
        cursor.style.display = 'block';
    }
});

// Initialize side note toggle and persistence
function initSideNoteToggle() {
    const sideNote = document.querySelector('.side-note');
    const toggleBtn = document.querySelector('.side-note-toggle');
    if (!sideNote || !toggleBtn) return;

    // Restore state
    const saved = localStorage.getItem('sideNoteMinimized');
    const isMinimized = saved === 'true';
    if (isMinimized) {
        sideNote.classList.add('minimized');
        toggleBtn.setAttribute('aria-expanded', 'false');
        const icon = toggleBtn.querySelector('i');
    if (icon) icon.className = 'fas fa-plus';
    toggleBtn.title = 'Expand';
    toggleBtn.setAttribute('aria-label', 'Expand note');
    }

    toggleBtn.addEventListener('click', () => {
        const nowMin = !sideNote.classList.contains('minimized');
        sideNote.classList.toggle('minimized');
        localStorage.setItem('sideNoteMinimized', String(nowMin));
        toggleBtn.setAttribute('aria-expanded', String(!nowMin));
        const icon = toggleBtn.querySelector('i');
    if (icon) icon.className = nowMin ? 'fas fa-plus' : 'fas fa-minus';
    toggleBtn.title = nowMin ? 'Expand' : 'Minimize';
    toggleBtn.setAttribute('aria-label', nowMin ? 'Expand note' : 'Minimize note');
        playSound('click-sound');
    });
}

// Countdown and auto-hide for side note
(function setupSideNoteTimer(){
    const sideNote = document.querySelector('.side-note');
    const timerBar = document.getElementById('side-note-timer-bar');
    if (!sideNote || !timerBar) return;

    const DURATION_MS = 20000; // 20 seconds
    let timeoutId = null;
    let startTime = null;

    function startTimer() {
        // Reset classes
        sideNote.classList.remove('hidden');
        timerBar.style.width = '100%';
        startTime = performance.now();

        // Animate via requestAnimationFrame for smoothness
        function tick(now) {
            const elapsed = now - startTime;
            const ratio = Math.min(1, elapsed / DURATION_MS);
            timerBar.style.width = `${(1 - ratio) * 100}%`;

            if (ratio < 1) {
                requestAnimationFrame(tick);
            } else {
                // hide bubble
                sideNote.classList.add('hidden');
                // clear minimized state so toggle reflects collapsed
                sideNote.classList.add('minimized');
                const toggleBtn = sideNote.querySelector('.side-note-toggle');
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    const icon = toggleBtn.querySelector('i');
                    if (icon) icon.className = 'fas fa-plus';
                }
            }
        }

        requestAnimationFrame(tick);

        // Also ensure a hard timeout in case rAF stalls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            sideNote.classList.add('hidden');
        }, DURATION_MS + 500);
    }

    // Start only if not minimized at load
    const persisted = localStorage.getItem('sideNoteMinimized');
    if (persisted !== 'true') {
        // small delay so user sees it after page animations
        setTimeout(startTimer, 700);
    }

    // If user toggles open, restart the timer
    const toggleBtn = sideNote.querySelector('.side-note-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isNowMin = sideNote.classList.contains('minimized');
            if (!isNowMin) {
                // opened, restart timer
                startTimer();
                sideNote.classList.remove('hidden');
                // also remove minimized flag in storage
                localStorage.setItem('sideNoteMinimized', 'false');
            } else {
                // user minimized, stop timers
                clearTimeout(timeoutId);
                timerBar.style.width = '100%';
            }
        });
    }
})();

// Create anchored decorative elements
function createAnchoredDecorations() {
    // PNG images for floating decorations
    const pngImages = [
        'assets/images/confetti-images/1.png',
        'assets/images/confetti-images/2.png',
        'assets/images/confetti-images/3.png',
        'assets/images/confetti-images/4.png',
        'assets/images/confetti-images/5.png',
        'assets/images/confetti-images/6.png',
        'assets/images/confetti-images/7.png',
        'assets/images/confetti-images/8.png',
        'assets/images/confetti-images/9.png',
        'assets/images/confetti-images/10.png',
        'assets/images/confetti-images/11.png',
        'assets/images/confetti-images/12.png'
    ];
    
    // GIF images for static decorations
    const gifImages = [
        'assets/images/confetti-images/1.gif',
        'assets/images/confetti-images/2.gif',
        'assets/images/confetti-images/3.gif',
        'assets/images/confetti-images/4.gif',
        'assets/images/confetti-images/5.gif',
        'assets/images/confetti-images/6.gif',
        'assets/images/confetti-images/7.gif',
        'assets/images/confetti-images/8.gif',
        'assets/images/confetti-images/9.gif',
        'assets/images/confetti-images/10.gif'
    ];
    
    // Get all sections to anchor decorations to
    const sections = document.querySelectorAll('.game-section');
    const variants = ['variant-1', 'variant-2', 'variant-3', 'variant-4'];
    const sizes = ['size-small', 'size-medium', 'size-large'];
    
    sections.forEach((section, sectionIndex) => {
        // Make section position relative for absolute positioning of decorations
        if (getComputedStyle(section).position === 'static') {
            section.style.position = 'relative';
        }
        
        // Add 2-3 PNG decorations per section (animated)
        const pngCount = Math.floor(Math.random() * 2) + 2; // 2-3 decorations
        for (let i = 0; i < pngCount; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'anchored-decoration animated';
            
            // Random PNG image
            const randomPng = pngImages[Math.floor(Math.random() * pngImages.length)];
            decoration.style.backgroundImage = `url('${randomPng}')`;
            
            // Random variant and size
            const randomVariant = variants[Math.floor(Math.random() * variants.length)];
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            decoration.classList.add(randomVariant, randomSize);
            
            // Random position within the section
            decoration.style.left = Math.random() * 80 + 10 + '%'; // 10-90%
            decoration.style.top = Math.random() * 70 + 15 + '%';  // 15-85%
            
            section.appendChild(decoration);
        }
        
        // Add 1-2 GIF decorations per section (static)
        const gifCount = Math.floor(Math.random() * 2) + 1; // 1-2 decorations
        for (let i = 0; i < gifCount; i++) {
            const decoration = document.createElement('div');
            decoration.className = 'anchored-decoration static';
            
            // Random GIF image
            const randomGif = gifImages[Math.floor(Math.random() * gifImages.length)];
            decoration.style.backgroundImage = `url('${randomGif}')`;
            
            // Random size (no animation variant needed for static)
            const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
            decoration.classList.add(randomSize);
            
            // Random position within the section (different from PNGs)
            decoration.style.right = Math.random() * 80 + 10 + '%'; // Position from right
            decoration.style.bottom = Math.random() * 70 + 15 + '%'; // Position from bottom
            
            section.appendChild(decoration);
        }
    });
}

// Function to navigate to sections
function showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Setup navigation functionality
function setupNavigation() {
    // Mobile navigation toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            playSound('click-sound');
        });
    }

    // Navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            playSound('click-sound');
            
            // Close mobile menu if open
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
            }
            
            // Smooth scroll to section
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu && navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Handle escape key for mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Setup navigation scroll effects
function setupNavigationScrollEffect() {
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Add shadow when scrolled
        if (currentScrollY > 50) {
            mainNavigation.classList.add('scrolled');
        } else {
            mainNavigation.classList.remove('scrolled');
        }
        
        // Update active navigation link based on scroll position
        updateActiveNavLink();
        
        lastScrollY = currentScrollY;
    });
}

// Update active navigation link based on current section
function updateActiveNavLink() {
    const scrollPosition = window.scrollY + 100; // Offset for fixed nav
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            // Remove active class from all nav links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current section's nav link
            const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}

// Export functions for other scripts
window.GameUI = {
    playSound,
    showSection,
    toggleTheme,
    toggleSound
};
