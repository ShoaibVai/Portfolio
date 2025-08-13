// Main JavaScript for Game-themed Portfolio

// DOM Elements
const titleScreen = document.getElementById('title-screen');
const mainMenu = document.getElementById('main-menu');
const startButton = document.getElementById('start-button');
const loadingScreen = document.getElementById('loading-screen');
const menuButtons = document.querySelectorAll('.menu-button');
const backButtons = document.querySelectorAll('.back-button');
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
    
    // Start button event listener
    startButton.addEventListener('click', startGame);
    
    // Enter key to start (PC users)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent any default behavior
            startGame();
        }
    });
    
    // Menu navigation
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            playSound('click-sound');
            
            // Smooth scroll to the target section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Back buttons
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            playSound('click-sound');
            
            // Smooth scroll back to main menu
            document.getElementById('main-menu').scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Theme toggle
    toggleThemeButton.addEventListener('click', toggleTheme);
    
    // Sound toggle
    toggleSoundButton.addEventListener('click', toggleSound);
    
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
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            titleScreen.classList.add('active');
            
            // Add animations to title screen elements
            document.querySelector('.game-title').classList.add('fade-in');
            document.querySelector('.game-subtitle').classList.add('fade-in', 'delay-300');
            document.querySelector('.pixel-character').classList.add('fade-in', 'delay-500');
            document.querySelector('#start-button').classList.add('fade-in', 'delay-700');
            document.querySelector('.blink-text').classList.add('fade-in', 'delay-900');
        }, 500);
    }, 500);
}

// Start the game (scroll to main menu)
function startGame() {
    playSound('start-sound');
    
    // Smooth scroll to main menu section
    document.getElementById('main-menu').scrollIntoView({
        behavior: 'smooth'
    });
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
    const icon = toggleThemeButton.querySelector('i');
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
    const icon = toggleSoundButton.querySelector('i');
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
    const interactiveElements = document.querySelectorAll('.game-button, .menu-button, .back-button, .dialogue-option');
    
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
    
    // Simple validation
    if (!nameInput.value || !emailInput.value || !messageInput.value) {
        alert('Please fill in all fields');
        return;
    }
    
    // Here you would normally send the form data to a server
    // For this example, we'll just show a success message
    playSound('click-sound');
    
    const formData = {
        name: nameInput.value,
        email: emailInput.value,
        message: messageInput.value
    };
    
    console.log('Form submitted:', formData);
    
    // Show success message
    contactForm.innerHTML = `
        <div class="success-message">
            <h3>Message Sent!</h3>
            <p>Thank you for your message, ${formData.name}. I'll get back to you soon!</p>
            <button type="button" class="game-button" onclick="showSection('main-menu')">Return to Menu</button>
        </div>
    `;
    
    // Add animation to success message
    const successMessage = document.querySelector('.success-message');
    successMessage.classList.add('fade-in');
}

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

// Export functions for other scripts
window.GameUI = {
    playSound,
    showSection,
    toggleTheme,
    toggleSound
};
