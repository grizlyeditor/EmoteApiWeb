// Animation and Effects Manager
class AnimationManager {
    constructor() {
        this.confettiCount = 150;
        this.colors = ['#00ff41', '#0080ff', '#ff0080', '#ffd700', '#ff00ff'];
    }

    init() {
        this.createPixelStars();
        this.setupMoonAnimation();
        this.setupInputAnimations();
        this.setupButtonEffects();
        this.hideLoadingScreen();
    }

    createPixelStars() {
        const starsContainer = document.querySelector('.pixel-stars');
        if (!starsContainer) return;

        const starCount = 200;
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'pixel-star';
            star.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: ${this.colors[Math.floor(Math.random() * this.colors.length)]};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.5 + 0.1};
                animation: twinkle ${Math.random() * 3 + 2}s infinite alternate;
            `;
            starsContainer.appendChild(star);
        }
    }

    setupMoonAnimation() {
        const moon = document.getElementById('pixelMoon');
        if (!moon) return;

        let isAnimating = false;
        
        moon.addEventListener('click', () => {
            if (isAnimating) return;
            isAnimating = true;

            moon.style.animation = 'moonFall 2s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
            
            setTimeout(() => {
                moon.style.animation = '';
                isAnimating = false;
                this.createConfetti();
                this.playSuccessSound();
            }, 2000);
        });

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes moonFall {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(0, 50px) rotate(90deg); }
                50% { transform: translate(0, 200px) rotate(180deg); }
                75% { transform: translate(0, 400px) rotate(270deg); }
                100% { transform: translate(0, 800px) rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('.premium-input');
        inputs.forEach(input => {
            input.addEventListener('focus', (e) => {
                const parent = e.target.parentElement;
                const animation = parent.querySelector('.input-animation');
                if (animation) {
                    animation.style.opacity = '0.1';
                    animation.style.animation = 'inputGlow 2s infinite alternate';
                }
            });

            input.addEventListener('blur', (e) => {
                const parent = e.target.parentElement;
                const animation = parent.querySelector('.input-animation');
                if (animation) {
                    animation.style.opacity = '0';
                    animation.style.animation = '';
                }
            });

            // Add typing effect
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                input.style.transform = 'scale(1.02)';
                timeout = setTimeout(() => {
                    input.style.transform = 'scale(1)';
                }, 100);
            });
        });
    }

    setupButtonEffects() {
        const buttons = document.querySelectorAll('.premium-btn, .save-btn, .action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                const rect = e.target.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('div');
                ripple.className = 'button-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    width: 100px;
                    height: 100px;
                    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
                    border-radius: 50%;
                    top: ${y - 50}px;
                    left: ${x - 50}px;
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                e.target.style.position = 'relative';
                e.target.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });

            button.addEventListener('click', () => {
                this.playClickSound();
            });
        });
    }

    createConfetti() {
        const container = document.querySelector('.confetti-container');
        if (!container) return;

        container.innerHTML = '';
        
        for (let i = 0; i < this.confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            const color = this.colors[Math.floor(Math.random() * this.colors.length)];
            const size = Math.random() * 10 + 5;
            
            confetti.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                top: -20px;
                left: ${Math.random() * 100}%;
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall ${Math.random() * 3 + 2}s linear forwards;
                border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                opacity: ${Math.random() * 0.5 + 0.5};
            `;
            
            container.appendChild(confetti);
            
            // Remove confetti after animation
            setTimeout(() => confetti.remove(), 3000);
        }
    }

    createSuccessAnimation() {
        const container = document.getElementById('mainContainer') || document.body;
        const success = document.createElement('div');
        success.className = 'success-animation';
        
        success.innerHTML = `
            <div class="success-content">
                <svg class="checkmark" viewBox="0 0 52 52">
                    <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                <h3>Success!</h3>
            </div>
        `;
        
        container.appendChild(success);
        
        setTimeout(() => {
            success.style.animation = 'fadeOut 0.5s forwards';
            setTimeout(() => success.remove(), 500);
        }, 2000);
    }

    createCircleAnimation() {
        const container = document.getElementById('mainContainer');
        if (!container) return;

        const circle = document.createElement('div');
        circle.className = 'circle-animation';
        
        circle.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
            z-index: 1000;
            animation: circleExpand 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
        `;
        
        container.appendChild(circle);
        
        setTimeout(() => {
            circle.style.animation = 'circleImplode 0.5s forwards';
            setTimeout(() => circle.remove(), 500);
        }, 1000);
    }

    playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    playClickSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio context not supported');
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Animate title characters
                const titleChars = document.querySelectorAll('.title-char');
                titleChars.forEach((char, index) => {
                    setTimeout(() => {
                        char.style.animation = 'titleAppear 0.5s ease-out forwards';
                    }, index * 100);
                });
            }, 2000);
        }
    }

    addStyleAnimations() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes titleAppear {
                0% { opacity: 0; transform: translateY(-20px) rotate(-10deg); }
                100% { opacity: 1; transform: translateY(0) rotate(0); }
            }
            
            @keyframes ripple {
                0% { transform: scale(0); opacity: 1; }
                100% { transform: scale(4); opacity: 0; }
            }
            
            @keyframes confettiFall {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            
            @keyframes circleExpand {
                0% { width: 0; height: 0; opacity: 1; }
                100% { width: 200vh; height: 200vh; opacity: 0; }
            }
            
            @keyframes circleImplode {
                0% { width: 200vh; height: 200vh; opacity: 0; }
                100% { width: 0; height: 0; opacity: 1; }
            }
            
            @keyframes fadeOut {
                0% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-20px); }
            }
            
            @keyframes inputGlow {
                0% { box-shadow: 0 0 10px rgba(0, 255, 65, 0.3); }
                100% { box-shadow: 0 0 20px rgba(0, 128, 255, 0.5); }
            }
            
            .success-animation {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                padding: 40px;
                border-radius: 20px;
                z-index: 2000;
                animation: fadeIn 0.5s;
            }
            
            .checkmark__circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 2;
                stroke-miterlimit: 10;
                stroke: var(--secondary);
                fill: none;
                animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            
            .checkmark__check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            
            @keyframes stroke {
                100% { stroke-dashoffset: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize animation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animationManager = new AnimationManager();
    animationManager.addStyleAnimations();
    animationManager.init();
    
    // Export for other scripts
    window.animationManager = animationManager;
});