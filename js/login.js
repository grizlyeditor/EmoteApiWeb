// Login System with Firebase Integration
class LoginSystem {
    constructor() {
        this.firebaseConfig = window.firebaseConfig || {
            apiKey: "AIzaSyAsxyAe9jssuyBZeu100uT1ok7olO7PBDg",
            authDomain: "ejene-d8ff7.firebaseapp.com",
            projectId: "ejene-d8ff7",
            storageBucket: "ejene-d8ff7.firebasestorage.app",
            messagingSenderId: "612166184659",
            appId: "1:612166184659:android:1d117840c0a65bd19b6e26"
        };
        
        this.initFirebase();
        this.initElements();
        this.setupEventListeners();
    }
    
    initFirebase() {
        try {
            firebase.initializeApp(this.firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            console.log("Firebase initialized successfully");
        } catch (error) {
            console.error("Firebase initialization error:", error);
            // Fallback to localStorage for demo
            this.useLocalStorage = true;
        }
    }
    
    initElements() {
        this.youtubeCodeInput = document.getElementById('youtubeCode');
        this.telegramCodeInput = document.getElementById('telegramCode');
        this.loginBtn = document.getElementById('loginBtn');
        this.updateLink = document.getElementById('updateLink');
        
        // Load saved codes
        this.loadSavedCodes();
    }
    
    setupEventListeners() {
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        // Enter key support
        const inputs = [this.youtubeCodeInput, this.telegramCodeInput];
        inputs.forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.handleLogin();
                });
            }
        });
    }
    
    async handleLogin() {
        const youtubeCode = this.youtubeCodeInput?.value.trim();
        const telegramCode = this.telegramCodeInput?.value.trim();
        
        if (!youtubeCode || !telegramCode) {
            this.showError('Please enter both codes');
            return;
        }
        
        // Disable button and show loading
        if (this.loginBtn) {
            this.loginBtn.disabled = true;
            this.loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> VERIFYING...';
        }
        
        // Create circle animation
        if (window.animationManager) {
            window.animationManager.createCircleAnimation();
        }
        
        try {
            const isValid = await this.validateCodes(youtubeCode, telegramCode);
            
            if (isValid) {
                await this.successfulLogin(youtubeCode, telegramCode);
            } else {
                this.failedLogin();
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Connection error. Using demo mode.');
            // Demo mode fallback
            setTimeout(() => this.demoSuccessfulLogin(), 1500);
        } finally {
            // Re-enable button
            if (this.loginBtn) {
                setTimeout(() => {
                    this.loginBtn.disabled = false;
                    this.loginBtn.innerHTML = '<i class="fas fa-rocket"></i> ACCESS PORTAL';
                }, 2000);
            }
        }
    }
    
    async validateCodes(youtubeCode, telegramCode) {
        if (this.useLocalStorage) {
            // Demo validation
            const savedYoutube = localStorage.getItem('youtubeCode') || 'DEMO123';
            const savedTelegram = localStorage.getItem('telegramCode') || 'DEMO456';
            
            return youtubeCode === savedYoutube && telegramCode === savedTelegram;
        }
        
        try {
            const doc = await this.db.collection('config').doc('accessCodes').get();
            if (doc.exists) {
                const data = doc.data();
                return youtubeCode === data.youtubeCode && telegramCode === data.telegramCode;
            }
            return false;
        } catch (error) {
            console.error('Validation error:', error);
            return false;
        }
    }
    
    async successfulLogin(youtubeCode, telegramCode) {
        // Play success animation
        if (window.animationManager) {
            window.animationManager.createConfetti();
            window.animationManager.playSuccessSound();
        }
        
        // Store login session
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('youtubeCode', youtubeCode);
        sessionStorage.setItem('telegramCode', telegramCode);
        
        // Animate success
        this.animateSuccess();
        
        // Redirect to dashboard after animation
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    }
    
    async demoSuccessfulLogin() {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('demoMode', 'true');
        
        if (window.animationManager) {
            window.animationManager.createConfetti();
        }
        
        this.animateSuccess();
        
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    }
    
    animateSuccess() {
        const loginPanel = document.getElementById('loginPanel');
        if (!loginPanel) return;
        
        // Create success animation
        const successDiv = document.createElement('div');
        successDiv.className = 'login-success';
        successDiv.innerHTML = `
            <div class="success-spinner">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Access Granted!</h3>
            <p>Redirecting to dashboard...</p>
        `;
        
        loginPanel.style.opacity = '0.5';
        loginPanel.appendChild(successDiv);
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .login-success {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                text-align: center;
                z-index: 100;
                animation: successAppear 0.5s;
            }
            
            .success-spinner {
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #00ff41, #0080ff);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
                animation: spinSuccess 1s ease-out;
            }
            
            .success-spinner i {
                font-size: 2.5rem;
                color: white;
            }
            
            @keyframes successAppear {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            
            @keyframes spinSuccess {
                0% { transform: rotate(0deg) scale(0); }
                70% { transform: rotate(180deg) scale(1.2); }
                100% { transform: rotate(360deg) scale(1); }
            }
        `;
        document.head.appendChild(style);
    }
    
    failedLogin() {
        // Shake animation
        const inputs = [this.youtubeCodeInput, this.telegramCodeInput];
        inputs.forEach(input => {
            if (input) {
                input.style.animation = 'shake 0.5s';
                input.style.borderColor = '#ff0080';
                
                setTimeout(() => {
                    input.style.animation = '';
                    input.style.borderColor = '';
                }, 500);
            }
        });
        
        // Error message
        this.showError('Invalid codes. Please try again.');
        
        // Add shake animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-10px); }
                75% { transform: translateX(10px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    showError(message) {
        // Remove existing error
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        // Create error element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .error-message {
                background: rgba(255, 0, 128, 0.2);
                border: 1px solid rgba(255, 0, 128, 0.3);
                color: #ff0080;
                padding: 15px;
                border-radius: 10px;
                margin: 20px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideDown 0.3s;
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
        
        // Insert after login panel or button
        const loginPanel = document.getElementById('loginPanel');
        if (loginPanel) {
            loginPanel.appendChild(errorDiv);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.style.animation = 'slideUp 0.3s forwards';
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 5000);
    }
    
    loadSavedCodes() {
        if (this.useLocalStorage) {
            const youtubeCode = localStorage.getItem('youtubeCode');
            const telegramCode = localStorage.getItem('telegramCode');
            const updateUrl = localStorage.getItem('updateChannelUrl');
            
            if (this.updateLink && updateUrl) {
                this.updateLink.href = updateUrl;
                this.updateLink.textContent = updateUrl;
            }
        } else {
            // Load from Firebase
            this.loadFromFirebase();
        }
    }
    
    async loadFromFirebase() {
        try {
            const doc = await this.db.collection('config').doc('accessCodes').get();
            if (doc.exists) {
                const data = doc.data();
                
                if (this.updateLink && data.updateChannelUrl) {
                    this.updateLink.href = data.updateChannelUrl;
                    this.updateLink.textContent = data.updateChannelUrl;
                }
            }
        } catch (error) {
            console.error('Load config error:', error);
        }
    }
    
    static checkAuth() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const currentPage = window.location.pathname;
        
        // If not logged in and trying to access dashboard, redirect to home
        if (!isLoggedIn && currentPage.includes('dashboard')) {
            window.location.href = '/';
        }
        
        // If logged in and on home page, show logged in state
        if (isLoggedIn && currentPage === '/') {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.innerHTML = '<i class="fas fa-check-circle"></i> ALREADY LOGGED IN';
                loginBtn.disabled = true;
            }
        }
    }
}

// Initialize login system
document.addEventListener('DOMContentLoaded', () => {
    const loginSystem = new LoginSystem();
    LoginSystem.checkAuth();
    
    // Export for other scripts
    window.loginSystem = loginSystem;
});
