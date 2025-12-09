// Dashboard System
class DashboardSystem {
    constructor() {
        this.initFirebase();
        this.initElements();
        this.setupEventListeners();
        this.checkLogin();
        this.showWelcomeAnimation();
        this.updateDashboardData();
        this.startLiveUpdates();
    }
    
    initFirebase() {
        try {
            this.db = firebase.firestore();
        } catch (error) {
            console.error("Firebase dashboard error:", error);
            this.useLocalStorage = true;
        }
    }
    
    initElements() {
        // User info
        this.userName = document.getElementById('userName');
        this.youtubeStatus = document.getElementById('youtubeStatus');
        this.telegramStatus = document.getElementById('telegramStatus');
        this.updateLink = document.getElementById('dashboardUpdateLink');
        this.logoutBtn = document.getElementById('dashboardLogout');
        
        // Animation elements
        this.welcomeAnim = document.getElementById('welcomeAnim');
        this.confettiContainer = document.getElementById('dashboardConfetti');
    }
    
    setupEventListeners() {
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Refresh button
        const refreshBtn = document.querySelector('.premium-action');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
        
        // Feature card animations
        const featureItems = document.querySelectorAll('.feature-item');
        featureItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'translateY(-10px) scale(1.05)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'translateY(0) scale(1)';
            });
        });
        
        // Stat card hover effects
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (card.classList.contains('premium')) {
                    card.style.background = 'rgba(255, 255, 255, 0.1)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (card.classList.contains('premium')) {
                    card.style.background = '';
                }
            });
        });
    }
    
    checkLogin() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const demoMode = sessionStorage.getItem('demoMode') === 'true';
        
        if (!isLoggedIn) {
            window.location.href = '/';
            return;
        }
        
        // Set user name
        if (this.userName) {
            if (demoMode) {
                this.userName.textContent = 'Demo User';
            } else {
                const youtubeCode = sessionStorage.getItem('youtubeCode');
                this.userName.textContent = `User ${youtubeCode?.substring(0, 4)}...`;
            }
        }
    }
    
    showWelcomeAnimation() {
        if (!this.welcomeAnim) return;
        
        // Show welcome animation
        this.welcomeAnim.classList.add('active');
        
        // Add confetti
        if (window.animationManager) {
            window.animationManager.createConfetti();
        }
        
        // Play welcome sound
        this.playWelcomeSound();
        
        // Hide after 3 seconds
        setTimeout(() => {
            this.welcomeAnim.classList.remove('active');
        }, 3000);
    }
    
    async updateDashboardData() {
        try {
            if (this.useLocalStorage) {
                // Demo data
                if (this.youtubeStatus) {
                    this.youtubeStatus.textContent = 'Premium Active';
                    this.youtubeStatus.style.color = '#00ff41';
                }
                
                if (this.telegramStatus) {
                    this.telegramStatus.textContent = 'Connected';
                    this.telegramStatus.style.color = '#00ff41';
                }
                
                if (this.updateLink) {
                    const updateUrl = localStorage.getItem('updateChannelUrl') || 'https://t.me/updates';
                    this.updateLink.href = updateUrl;
                    this.updateLink.innerHTML = `<i class="fab fa-telegram"></i> ${updateUrl}`;
                }
            } else {
                // Load from Firebase
                const doc = await this.db.collection('config').doc('accessCodes').get();
                if (doc.exists) {
                    const data = doc.data();
                    
                    if (this.updateLink && data.updateChannelUrl) {
                        this.updateLink.href = data.updateChannelUrl;
                        this.updateLink.innerHTML = `<i class="fab fa-telegram"></i> ${data.updateChannelUrl}`;
                    }
                    
                    // Update status based on codes
                    const userYoutube = sessionStorage.getItem('youtubeCode');
                    const userTelegram = sessionStorage.getItem('telegramCode');
                    
                    if (this.youtubeStatus) {
                        if (userYoutube === data.youtubeCode) {
                            this.youtubeStatus.textContent = 'Premium Active';
                            this.youtubeStatus.style.color = '#00ff41';
                        } else {
                            this.youtubeStatus.textContent = 'Access Expired';
                            this.youtubeStatus.style.color = '#ff0080';
                        }
                    }
                    
                    if (this.telegramStatus) {
                        if (userTelegram === data.telegramCode) {
                            this.telegramStatus.textContent = 'Connected';
                            this.telegramStatus.style.color = '#00ff41';
                        } else {
                            this.telegramStatus.textContent = 'Disconnected';
                            this.telegramStatus.style.color = '#ff0080';
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Dashboard update error:', error);
        }
    }
    
    startLiveUpdates() {
        // Simulate live updates
        setInterval(() => {
            this.updateLiveStats();
        }, 10000);
        
        // Real-time Firebase updates
        if (!this.useLocalStorage && this.db) {
            this.setupRealtimeUpdates();
        }
    }
    
    setupRealtimeUpdates() {
        // Listen for config changes
        this.db.collection('config').doc('accessCodes')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    this.handleConfigUpdate(data);
                }
            });
    }
    
    handleConfigUpdate(data) {
        // Update dashboard with new data
        if (this.updateLink && data.updateChannelUrl) {
            this.updateLink.href = data.updateChannelUrl;
            this.updateLink.innerHTML = `<i class="fab fa-telegram"></i> ${data.updateChannelUrl}`;
            
            // Show update notification
            this.showNotification('Update channel URL has been updated!');
        }
    }
    
    updateLiveStats() {
        // Update stat cards with random data for demo
        const statCards = document.querySelectorAll('.stat-card:not(.premium) .stat-value');
        statCards.forEach(card => {
            const current = card.textContent;
            if (current.includes('Level')) {
                const level = parseInt(current.replace('Level ', ''));
                const newLevel = Math.min(5, Math.max(1, level + (Math.random() > 0.5 ? 1 : -1)));
                card.textContent = `Level ${newLevel}`;
                
                // Animate change
                card.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 300);
            }
        });
    }
    
    refreshDashboard() {
        // Show loading animation
        const refreshBtn = document.querySelector('.premium-action');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> REFRESHING...';
            refreshBtn.disabled = true;
            
            // Simulate refresh
            setTimeout(() => {
                this.updateDashboardData();
                
                // Show success animation
                if (window.animationManager) {
                    window.animationManager.createSuccessAnimation();
                }
                
                // Restore button
                refreshBtn.innerHTML = originalText;
                refreshBtn.disabled = false;
            }, 1500);
        }
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'dashboard-notification';
        notification.innerHTML = `
            <i class="fas fa-bell"></i>
            <span>${message}</span>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .dashboard-notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid var(--secondary);
                border-radius: 10px;
                padding: 15px 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideInUp 0.3s, slideOutDown 0.3s 2.7s forwards;
            }
            
            .dashboard-notification i {
                color: var(--secondary);
            }
            
            @keyframes slideInUp {
                from { transform: translateY(100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideOutDown {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }
    
    playWelcomeSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Play chord
            for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    const frequency = [523.25, 659.25, 783.99][i]; // C5, E5, G5
                    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, i * 100);
            }
        } catch (e) {
            console.log('Audio context not supported');
        }
    }
    
    logout() {
        // Clear session
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('youtubeCode');
        sessionStorage.removeItem('telegramCode');
        sessionStorage.removeItem('demoMode');
        
        // Show logout animation
        if (window.animationManager) {
            window.animationManager.createCircleAnimation();
        }
        
        // Redirect to home
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new DashboardSystem();
    window.dashboard = dashboard;
});