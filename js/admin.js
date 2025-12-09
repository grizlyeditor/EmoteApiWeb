// Admin Panel System
class AdminSystem {
    constructor() {
        this.initFirebase();
        this.initElements();
        this.setupEventListeners();
        this.loadCurrentConfig();
        this.setupTabNavigation();
        this.setupChart();
    }
    
    initFirebase() {
        try {
            // Firebase should already be initialized from login.js
            this.db = firebase.firestore();
            this.auth = firebase.auth();
        } catch (error) {
            console.error("Firebase admin error:", error);
            this.useLocalStorage = true;
        }
    }
    
    initElements() {
        // Inputs
        this.youtubeInput = document.getElementById('adminYoutubeCode');
        this.telegramInput = document.getElementById('adminTelegramCode');
        this.updateUrlInput = document.getElementById('updateChannelUrl');
        
        // Current values
        this.currentYoutube = document.getElementById('currentYoutubeCode');
        this.currentTelegram = document.getElementById('currentTelegramCode');
        
        // Buttons
        this.generateYoutubeBtn = document.getElementById('generateYoutube');
        this.generateTelegramBtn = document.getElementById('generateTelegram');
        this.saveBtn = document.getElementById('saveCredentials');
        this.logoutBtn = document.getElementById('adminLogout');
        
        // Status
        this.usersOnline = document.getElementById('usersOnline');
    }
    
    setupEventListeners() {
        if (this.generateYoutubeBtn) {
            this.generateYoutubeBtn.addEventListener('click', () => this.generateCode('youtube'));
        }
        
        if (this.generateTelegramBtn) {
            this.generateTelegramBtn.addEventListener('click', () => this.generateCode('telegram'));
        }
        
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.saveConfig());
        }
        
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Real-time updates for inputs
        [this.youtubeInput, this.telegramInput, this.updateUrlInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.saveBtn.disabled = false;
                    this.saveBtn.style.opacity = '1';
                });
            }
        });
        
        // Check admin auth
        this.checkAdminAuth();
    }
    
    setupTabNavigation() {
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        const tabContents = document.querySelectorAll('.tab-content');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                const tabId = item.getAttribute('data-tab');
                
                // Update active nav item
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                
                // Show active tab
                tabContents.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.id === `${tabId}Tab`) {
                        tab.classList.add('active');
                    }
                });
            });
        });
    }
    
    setupChart() {
        const ctx = document.getElementById('analyticsChart');
        if (!ctx) return;
        
        new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Users',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#00ff41',
                    backgroundColor: 'rgba(0, 255, 65, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Logins',
                    data: [7, 11, 5, 8, 3, 7],
                    borderColor: '#0080ff',
                    backgroundColor: 'rgba(0, 128, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff'
                        }
                    }
                }
            }
        });
    }
    
    generateCode(type) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        if (type === 'youtube' && this.youtubeInput) {
            this.youtubeInput.value = code;
            this.animateInput(this.youtubeInput);
        } else if (type === 'telegram' && this.telegramInput) {
            this.telegramInput.value = code;
            this.animateInput(this.telegramInput);
        }
        
        // Play generation sound
        this.playGenerateSound();
    }
    
    animateInput(input) {
        input.style.transform = 'scale(1.1)';
        input.style.boxShadow = '0 0 20px rgba(0, 255, 65, 0.5)';
        
        setTimeout(() => {
            input.style.transform = 'scale(1)';
            input.style.boxShadow = '';
        }, 300);
    }
    
    async loadCurrentConfig() {
        try {
            if (this.useLocalStorage) {
                // Load from localStorage for demo
                const youtubeCode = localStorage.getItem('youtubeCode') || 'DEMO123';
                const telegramCode = localStorage.getItem('telegramCode') || 'DEMO456';
                const updateUrl = localStorage.getItem('updateChannelUrl') || 'https://t.me/updates';
                
                if (this.currentYoutube) this.currentYoutube.textContent = youtubeCode;
                if (this.currentTelegram) this.currentTelegram.textContent = telegramCode;
                if (this.updateUrlInput) this.updateUrlInput.value = updateUrl;
                
                // Update user count (demo)
                if (this.usersOnline) {
                    this.usersOnline.textContent = Math.floor(Math.random() * 50) + 10;
                }
            } else {
                // Load from Firebase
                const doc = await this.db.collection('config').doc('accessCodes').get();
                if (doc.exists) {
                    const data = doc.data();
                    
                    if (this.currentYoutube) this.currentYoutube.textContent = data.youtubeCode || 'Not set';
                    if (this.currentTelegram) this.currentTelegram.textContent = data.telegramCode || 'Not set';
                    if (this.updateUrlInput && data.updateChannelUrl) {
                        this.updateUrlInput.value = data.updateChannelUrl;
                    }
                }
                
                // Load online users (simulated)
                if (this.usersOnline) {
                    this.startUserCounter();
                }
            }
        } catch (error) {
            console.error('Load config error:', error);
        }
    }
    
    startUserCounter() {
        // Simulate live user count updates
        setInterval(() => {
            if (this.usersOnline) {
                const current = parseInt(this.usersOnline.textContent) || 0;
                const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                const newCount = Math.max(0, current + change);
                this.usersOnline.textContent = newCount;
                
                // Animate change
                if (change > 0) {
                    this.usersOnline.style.color = '#00ff41';
                } else if (change < 0) {
                    this.usersOnline.style.color = '#ff0080';
                }
                
                setTimeout(() => {
                    this.usersOnline.style.color = '#00ff41';
                }, 500);
            }
        }, 5000);
    }
    
    async saveConfig() {
        const youtubeCode = this.youtubeInput?.value.trim();
        const telegramCode = this.telegramInput?.value.trim();
        const updateUrl = this.updateUrlInput?.value.trim();
        
        if (!youtubeCode || !telegramCode) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        // Disable save button
        if (this.saveBtn) {
            this.saveBtn.disabled = true;
            this.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SAVING...';
        }
        
        try {
            if (this.useLocalStorage) {
                // Save to localStorage for demo
                localStorage.setItem('youtubeCode', youtubeCode);
                localStorage.setItem('telegramCode', telegramCode);
                if (updateUrl) {
                    localStorage.setItem('updateChannelUrl', updateUrl);
                }
                
                // Update current values display
                if (this.currentYoutube) this.currentYoutube.textContent = youtubeCode;
                if (this.currentTelegram) this.currentTelegram.textContent = telegramCode;
            } else {
                // Save to Firebase
                await this.db.collection('config').doc('accessCodes').set({
                    youtubeCode,
                    telegramCode,
                    updateChannelUrl: updateUrl || '',
                    lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                
                // Update current values
                if (this.currentYoutube) this.currentYoutube.textContent = youtubeCode;
                if (this.currentTelegram) this.currentTelegram.textContent = telegramCode;
            }
            
            this.showMessage('Configuration saved successfully!', 'success');
            
            // Update main page if open
            this.updateMainPage(updateUrl);
            
        } catch (error) {
            console.error('Save error:', error);
            this.showMessage('Error saving configuration', 'error');
        } finally {
            // Re-enable save button
            if (this.saveBtn) {
                setTimeout(() => {
                    this.saveBtn.disabled = false;
                    this.saveBtn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
                }, 2000);
            }
        }
    }
    
    updateMainPage(updateUrl) {
        // This would typically be done through Firebase real-time updates
        // For demo, we'll just log it
        console.log('Main page should be updated with new URL:', updateUrl);
        
        // Trigger confetti animation
        if (window.animationManager) {
            window.animationManager.createConfetti();
        }
    }
    
    showMessage(message, type) {
        // Remove existing message
        const existingMsg = document.querySelector('.admin-message');
        if (existingMsg) existingMsg.remove();
        
        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.className = `admin-message ${type}`;
        msgDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .admin-message {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideInRight 0.3s, slideOutRight 0.3s 2.7s forwards;
            }
            
            .admin-message.success {
                background: rgba(0, 255, 65, 0.2);
                border: 1px solid rgba(0, 255, 65, 0.3);
                color: #00ff41;
            }
            
            .admin-message.error {
                background: rgba(255, 0, 128, 0.2);
                border: 1px solid rgba(255, 0, 128, 0.3);
                color: #ff0080;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(msgDiv);
        
        // Auto remove
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.remove();
            }
        }, 3000);
    }
    
    playGenerateSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio context not supported');
        }
    }
    
    checkAdminAuth() {
        // Simple admin check - in production, use proper authentication
        const isAdmin = sessionStorage.getItem('isAdmin') === 'true' || 
                       window.location.hash === '#admin';
        
        if (!isAdmin && !window.location.pathname.includes('admin.html')) {
            // Redirect to home if not admin
            window.location.href = '/';
        } else {
            sessionStorage.setItem('isAdmin', 'true');
        }
    }
    
    logout() {
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('isLoggedIn');
        
        // Show logout animation
        if (window.animationManager) {
            window.animationManager.createCircleAnimation();
        }
        
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
}

// Initialize admin system
document.addEventListener('DOMContentLoaded', () => {
    const adminSystem = new AdminSystem();
    window.adminSystem = adminSystem;
});