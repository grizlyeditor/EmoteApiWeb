// Firebase Configuration
// Replace with your Firebase project configuration

const firebaseConfig = {
    apiKey: "AIzaSyAsxyAe9jssuyBZeu100uT1ok7olO7PBDg",
    authDomain: "ejene-d8ff7.firebaseapp.com",
    projectId: "ejene-d8ff7",
    storageBucket: "ejene-d8ff7.firebasestorage.app",
    messagingSenderId: "612166184659",
    appId: "1:612166184659:android:1d117840c0a65bd19b6e26"
};

// Initialize Firebase (will be initialized in login.js)
// This file just exports the configuration

// For demo/testing purposes
window.firebaseConfig = firebaseConfig;

// Demo mode helper
window.isDemoMode = true; // Set to false when using real Firebase

// Firestore setup for demo
if (window.isDemoMode) {
    console.log('Running in demo mode');
    
    // Mock Firebase functions for demo
    window.firebase = window.firebase || {
        initializeApp: function(config) {
            console.log('Firebase initialized (demo mode)');
            return {
                firestore: function() {
                    return {
                        collection: function(name) {
                            return {
                                doc: function(id) {
                                    return {
                                        get: function() {
                                            return Promise.resolve({
                                                exists: true,
                                                data: function() {
                                                    return {
                                                        youtubeCode: localStorage.getItem('youtubeCode') || 'DEMO123',
                                                        telegramCode: localStorage.getItem('telegramCode') || 'DEMO456',
                                                        updateChannelUrl: localStorage.getItem('updateChannelUrl') || 'https://t.me/updates',
                                                        lastUpdated: new Date().toISOString()
                                                    };
                                                }
                                            });
                                        },
                                        set: function(data, options) {
                                            localStorage.setItem('youtubeCode', data.youtubeCode || 'DEMO123');
                                            localStorage.setItem('telegramCode', data.telegramCode || 'DEMO456');
                                            if (data.updateChannelUrl) {
                                                localStorage.setItem('updateChannelUrl', data.updateChannelUrl);
                                            }
                                            console.log('Config saved to localStorage:', data);
                                            return Promise.resolve();
                                        },
                                        onSnapshot: function(callback) {
                                            // Simulate real-time updates
                                            setInterval(() => {
                                                callback({
                                                    exists: true,
                                                    data: function() {
                                                        return {
                                                            youtubeCode: localStorage.getItem('youtubeCode') || 'DEMO123',
                                                            telegramCode: localStorage.getItem('telegramCode') || 'DEMO456',
                                                            updateChannelUrl: localStorage.getItem('updateChannelUrl') || 'https://t.me/updates'
                                                        };
                                                    }
                                                });
                                            }, 30000);
                                            return () => {}; // Unsubscribe function
                                        }
                                    };
                                }
                            };
                        }
                    };
                },
                auth: function() {
                    return {
                        currentUser: null,
                        onAuthStateChanged: function(callback) {
                            callback(null);
                            return () => {};
                        }
                    };
                }
            };
        }
    };
}