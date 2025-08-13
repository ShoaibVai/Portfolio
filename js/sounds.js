// Sound Manager for Game-themed Portfolio

// Sound effects configuration
const SoundManager = {
    // Sound elements
    sounds: {
        click: null,
        hover: null,
        start: null,
        achievement: null,
        transition: null
    },
    
    // Sound settings
    settings: {
        enabled: true,
        volume: 0.5
    },
    
    // Initialize the sound manager
    init() {
        // Get sound elements
        this.sounds.click = document.getElementById('click-sound');
        this.sounds.hover = document.getElementById('hover-sound');
        this.sounds.start = document.getElementById('start-sound');
        
        // Load settings from local storage
        this.loadSettings();
        
        // Apply volume settings
        this.applyVolumeSettings();
        
        // Create additional sound effects dynamically
        this.createAdditionalSounds();
    },
    
    // Create additional sound effects that weren't in HTML
    createAdditionalSounds() {
        // Achievement sound
        this.sounds.achievement = new Audio();
        this.sounds.achievement.src = 'assets/sounds/achievement.mp3';
        this.sounds.achievement.preload = 'auto';
        
        // Transition sound
        this.sounds.transition = new Audio();
        this.sounds.transition.src = 'assets/sounds/transition.mp3';
        this.sounds.transition.preload = 'auto';
        
        // Apply volume to new sounds
        this.sounds.achievement.volume = this.settings.volume;
        this.sounds.transition.volume = this.settings.volume;
    },
    
    // Play a sound effect
    play(soundName) {
        if (!this.settings.enabled) return;
        
        const sound = this.sounds[soundName];
        if (sound) {
            // Reset and play
            sound.currentTime = 0;
            
            // Promise handling to catch any autoplay restrictions
            sound.play().catch(error => {
                console.warn(`Sound playback was prevented: ${error}`);
            });
        }
    },
    
    // Toggle sound on/off
    toggleSound() {
        this.settings.enabled = !this.settings.enabled;
        this.saveSettings();
        return this.settings.enabled;
    },
    
    // Set volume for all sounds
    setVolume(volume) {
        this.settings.volume = volume;
        this.applyVolumeSettings();
        this.saveSettings();
    },
    
    // Apply volume setting to all sound elements
    applyVolumeSettings() {
        for (const soundKey in this.sounds) {
            const sound = this.sounds[soundKey];
            if (sound) {
                sound.volume = this.settings.volume;
            }
        }
    },
    
    // Save settings to local storage
    saveSettings() {
        try {
            const settings = {
                enabled: this.settings.enabled,
                volume: this.settings.volume
            };
            localStorage.setItem('sound_settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Could not save sound settings:', error);
        }
    },
    
    // Load settings from local storage
    loadSettings() {
        try {
            const savedSettings = localStorage.getItem('sound_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                this.settings.enabled = settings.enabled;
                this.settings.volume = settings.volume;
            }
        } catch (error) {
            console.warn('Could not load sound settings:', error);
        }
    }
};

// Initialize sound manager when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    SoundManager.init();
    
    // Set up event listeners for interactive elements
    setupSoundEventListeners();
});

// Setup sound event listeners
function setupSoundEventListeners() {
    // Button click sounds
    document.addEventListener('click', (e) => {
        if (e.target.closest('.game-button') || 
            e.target.closest('.menu-button') || 
            e.target.closest('.back-button')) {
            SoundManager.play('click');
        }
        
        // Achievement sounds
        if (e.target.closest('.achievement-icon')) {
            SoundManager.play('achievement');
        }
    });
    
    // Hover sounds
    const interactiveElements = document.querySelectorAll('.game-button, .menu-button, .back-button, .dialogue-option');
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            SoundManager.play('hover');
        });
    });
    
    // Toggle sound button
    const toggleSoundButton = document.getElementById('toggle-sound');
    if (toggleSoundButton) {
        toggleSoundButton.addEventListener('click', () => {
            const soundEnabled = SoundManager.toggleSound();
            
            // Update icon
            const icon = toggleSoundButton.querySelector('i');
            if (icon) {
                icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            }
            
            // Play confirmation sound if enabled
            if (soundEnabled) {
                SoundManager.play('click');
            }
        });
    }
    
    // Add transition sounds when changing sections
    const menuButtons = document.querySelectorAll('.menu-button');
    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            SoundManager.play('transition');
        });
    });
    
    // Back buttons
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            SoundManager.play('transition');
        });
    });
    
    // Start button
    const startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', () => {
            SoundManager.play('start');
        });
    }
}

// Keyboard sound effects
document.addEventListener('keydown', (e) => {
    // Only handle some key events for sound
    if (e.key === 'Enter' || e.key === ' ' || 
        e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        
        // Play sound if the key is used for navigation
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'BUTTON' || 
            activeElement.tagName === 'A' || 
            activeElement.classList.contains('menu-button') ||
            activeElement.classList.contains('game-button')) {
            
            SoundManager.play('hover');
        }
    }
});

// Export the SoundManager for use in other scripts
window.SoundManager = SoundManager;
