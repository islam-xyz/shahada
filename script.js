/**
 * Shahada Page — Interactive Features
 * 
 * Features:
 * 1. Word-by-word audio playback using timestamps
 * 2. Full Shahada audio playback
 * 3. Global anonymous counter (API-based)
 * 4. Personal Shahada date (localStorage)
 * 
 * Privacy: The counter is completely anonymous — only increments a number.
 * Google Analytics is used for basic traffic and conversion insights.
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    const CONFIG = {
        // Counter API endpoint (CountAPI.xyz — free, anonymous)
        counterAPI: 'https://api.countapi.xyz',
        counterNamespace: 'shahada-org',
        counterKey: 'declarations',
        
        // localStorage keys
        storageKeys: {
            shahadaDate: 'shahada_date',
            hasCompleted: 'shahada_completed',
            tooltipSeen: 'word_tooltip_seen'
        },
        
        // Audio configuration
        audio: {
            src: 'audio/shahada.mp3',
            fallbackSrc: 'audio/shahada.ogg'
        }
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    
    const elements = {
        playFullBtn: document.getElementById('play-full'),
        shahadaBtn: document.getElementById('shahada-btn'),
        audio: document.getElementById('shahada-audio'),
        globalCount: document.getElementById('global-count'),
        personalDate: document.getElementById('personal-date'),
        userDate: document.getElementById('user-date'),
        congratsMessage: document.getElementById('congrats-message'),
        wordButtons: document.querySelectorAll('.word-btn'),
        wordTooltip: document.getElementById('word-tooltip')
    };

    // ============================================
    // AUDIO PLAYER
    // ============================================
    
    const AudioPlayer = {
        audio: elements.audio,
        isPlaying: false,
        currentWord: null,
        endTime: null,
        checkInterval: null,

        /**
         * Initialize audio player
         */
        init() {
            if (!this.audio) {
                console.warn('Audio element not found. Audio features disabled.');
                return false;
            }

            // Handle audio events
            this.audio.addEventListener('ended', () => this.onEnded());
            this.audio.addEventListener('pause', () => this.onPause());
            this.audio.addEventListener('error', (e) => this.onError(e));
            
            // Preload audio
            this.audio.load();
            
            return true;
        },

        /**
         * Play full Shahada
         */
        playFull() {
            if (!this.audio) return;
            
            this.stopWordPlayback();
            this.audio.currentTime = 0;
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    this.updatePlayButton(true);
                })
                .catch(err => {
                    console.error('Audio playback failed:', err);
                    this.showAudioError();
                });
        },

        /**
         * Play a specific word segment
         * @param {number} start - Start time in seconds
         * @param {number} end - End time in seconds
         * @param {HTMLElement} wordBtn - The word button element
         */
        playWord(start, end, wordBtn) {
            if (!this.audio) return;
            
            // Stop any current playback
            this.stopWordPlayback();
            
            // Set up word playback
            this.audio.currentTime = start;
            this.endTime = end;
            this.currentWord = wordBtn;
            
            // Highlight the word
            this.highlightWord(wordBtn, true);
            
            // Play
            this.audio.play()
                .then(() => {
                    this.isPlaying = true;
                    
                    // Check for end time
                    this.checkInterval = setInterval(() => {
                        if (this.audio.currentTime >= this.endTime) {
                            this.stopWordPlayback();
                        }
                    }, 50);
                })
                .catch(err => {
                    console.error('Word playback failed:', err);
                    this.highlightWord(wordBtn, false);
                });
        },

        /**
         * Stop word playback
         */
        stopWordPlayback() {
            if (this.checkInterval) {
                clearInterval(this.checkInterval);
                this.checkInterval = null;
            }
            
            if (this.currentWord) {
                this.highlightWord(this.currentWord, false);
                this.currentWord = null;
            }
            
            if (this.isPlaying && this.endTime !== null) {
                this.audio.pause();
            }
            
            this.endTime = null;
        },

        /**
         * Stop all playback
         */
        stop() {
            this.stopWordPlayback();
            if (this.audio) {
                this.audio.pause();
                this.audio.currentTime = 0;
            }
            this.isPlaying = false;
            this.updatePlayButton(false);
        },

        /**
         * Highlight a word button
         */
        highlightWord(btn, highlight) {
            if (highlight) {
                btn.classList.add('playing');
            } else {
                btn.classList.remove('playing');
            }
        },

        /**
         * Update play button state
         */
        updatePlayButton(playing) {
            if (!elements.playFullBtn) return;
            
            const icon = elements.playFullBtn.querySelector('.btn-icon');
            if (icon) {
                icon.textContent = playing ? '⏸' : '▶';
            }
            elements.playFullBtn.setAttribute('aria-label', 
                playing ? 'Pause Shahada audio' : 'Play full Shahada audio');
        },

        /**
         * Handle audio ended
         */
        onEnded() {
            this.isPlaying = false;
            this.updatePlayButton(false);
            if (this.currentWord) {
                this.highlightWord(this.currentWord, false);
                this.currentWord = null;
            }
        },

        /**
         * Handle audio paused
         */
        onPause() {
            if (!this.endTime) {
                // Full playback was paused
                this.isPlaying = false;
                this.updatePlayButton(false);
            }
        },

        /**
         * Handle audio error
         */
        onError(e) {
            console.error('Audio error:', e);
            this.isPlaying = false;
            this.updatePlayButton(false);
        },

        /**
         * Show audio error message
         */
        showAudioError() {
            // Could show a user-friendly message here
            console.warn('Audio playback is not available. Please try again or use a different browser.');
        }
    };

    // ============================================
    // COUNTER (Global + Personal)
    // ============================================
    
    const Counter = {
        /**
         * Initialize counter — fetch current count and check personal status
         */
        async init() {
            // Load current global count
            await this.loadGlobalCount();
            
            // Check if user has already completed
            this.checkPersonalStatus();
        },

        /**
         * Fetch global count from API
         */
        async loadGlobalCount() {
            try {
                const response = await fetch(
                    `${CONFIG.counterAPI}/get/${CONFIG.counterNamespace}/${CONFIG.counterKey}`
                );
                
                if (!response.ok) {
                    throw new Error('Counter API error');
                }
                
                const data = await response.json();
                this.displayCount(data.value || 0);
            } catch (error) {
                console.warn('Could not load counter:', error);
                // Show a fallback or hide counter
                this.displayCount(null);
            }
        },

        /**
         * Increment global count
         */
        async incrementCount() {
            try {
                const response = await fetch(
                    `${CONFIG.counterAPI}/hit/${CONFIG.counterNamespace}/${CONFIG.counterKey}`
                );
                
                if (!response.ok) {
                    throw new Error('Counter API error');
                }
                
                const data = await response.json();
                this.displayCount(data.value);
                return data.value;
            } catch (error) {
                console.warn('Could not increment counter:', error);
                return null;
            }
        },

        /**
         * Display count in UI
         */
        displayCount(count) {
            if (!elements.globalCount) return;
            
            if (count === null) {
                // Use translated fallback from data attribute
                const fallbackText = elements.globalCount.dataset.fallback || 'Many';
                elements.globalCount.textContent = fallbackText;
            } else {
                // Format number with page locale
                const lang = document.documentElement.lang || 'en';
                elements.globalCount.textContent = count.toLocaleString(lang);
            }
        },

        /**
         * Check if user has already said Shahada (from localStorage)
         */
        checkPersonalStatus() {
            const completed = localStorage.getItem(CONFIG.storageKeys.hasCompleted);
            const storedDate = localStorage.getItem(CONFIG.storageKeys.shahadaDate);
            
            if (completed === 'true' && storedDate) {
                // Format the stored date in the current page language
                const formattedDate = this.formatDateForDisplay(storedDate);
                this.showPersonalDate(formattedDate);
                this.showCongrats();
            }
        },

        /**
         * Format a date string for display in the current page language
         * Handles both ISO timestamps (new) and legacy formatted strings (old)
         */
        formatDateForDisplay(storedDate) {
            const lang = document.documentElement.lang || 'en';
            
            // Try to parse as ISO date first (new format)
            const date = new Date(storedDate);
            
            // Check if it's a valid date (ISO format)
            if (!isNaN(date.getTime()) && storedDate.includes('T')) {
                return date.toLocaleDateString(lang, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // Legacy format: already a formatted string, return as-is
            // (User will need to reset and re-complete to get translated date)
            return storedDate;
        },

        /**
         * Save personal Shahada date
         */
        savePersonalDate() {
            const now = new Date();
            // Store as ISO timestamp for language-agnostic storage
            const isoDate = now.toISOString();
            
            localStorage.setItem(CONFIG.storageKeys.hasCompleted, 'true');
            localStorage.setItem(CONFIG.storageKeys.shahadaDate, isoDate);
            
            // Return formatted date for immediate display
            return this.formatDateForDisplay(isoDate);
        },

        /**
         * Show personal date in UI
         */
        showPersonalDate(formattedDate) {
            if (!elements.personalDate || !elements.userDate) return;
            
            elements.userDate.textContent = formattedDate;
            elements.personalDate.classList.remove('hidden');
        },

        /**
         * Show congratulations message
         */
        showCongrats() {
            if (!elements.congratsMessage) return;
            elements.congratsMessage.classList.remove('hidden');
        },

        /**
         * Handle "I said the Shahada" button click - toggles between completed and reset
         */
        async onShahadaButtonClick() {
            // Check if already completed
            const alreadyCompleted = localStorage.getItem(CONFIG.storageKeys.hasCompleted) === 'true';
            
            if (alreadyCompleted) {
                // RESET: User wants to undo
                this.resetShahadaStatus();
            } else {
                // COMPLETE: First time or re-completing
                // Increment global counter (anonymous)
                await this.incrementCount();
                
                // Track conversion in Google Analytics
                if (typeof gtag === 'function') {
                    gtag('event', 'shahada_completed', {
                        event_category: 'conversion',
                        event_label: document.documentElement.lang || 'unknown'
                    });
                }
                
                // Save personal date
                const dateStr = this.savePersonalDate();
                this.showPersonalDate(dateStr);
                
                // Show congratulations
                this.showCongrats();
                
                // Update button to completed state
                this.setButtonCompleted(true);
                
                // Scroll to congrats message
                if (elements.congratsMessage) {
                    elements.congratsMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        },
        
        /**
         * Reset the Shahada status
         */
        resetShahadaStatus() {
            // Remove from localStorage
            localStorage.removeItem(CONFIG.storageKeys.hasCompleted);
            localStorage.removeItem(CONFIG.storageKeys.shahadaDate);
            
            // Hide personal date
            if (elements.personalDate) {
                elements.personalDate.classList.add('hidden');
            }
            
            // Hide congratulations
            if (elements.congratsMessage) {
                elements.congratsMessage.classList.add('hidden');
            }
            
            // Reset button
            this.setButtonCompleted(false);
        },
        
        /**
         * Set button state
         */
        setButtonCompleted(isCompleted) {
            if (!elements.shahadaBtn) return;
            
            if (isCompleted) {
                // Use translated text from data attribute
                const completedText = elements.shahadaBtn.dataset.textCompleted || 'Shahada Completed ✓';
                elements.shahadaBtn.textContent = completedText;
                elements.shahadaBtn.classList.add('completed');
            } else {
                // Use translated text from data attribute
                const readyText = elements.shahadaBtn.dataset.textReady || 'I Have Said the Shahada';
                elements.shahadaBtn.textContent = readyText;
                elements.shahadaBtn.classList.remove('completed');
            }
        }
    };

    // ============================================
    // EVENT HANDLERS
    // ============================================
    
    function setupEventListeners() {
        // Play full button
        if (elements.playFullBtn) {
            elements.playFullBtn.addEventListener('click', () => {
                if (AudioPlayer.isPlaying && AudioPlayer.endTime === null) {
                    // Currently playing full audio — pause
                    AudioPlayer.stop();
                } else {
                    // Play full
                    AudioPlayer.playFull();
                }
            });
        }

        // Word buttons (word-by-word playback)
        elements.wordButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const start = parseFloat(btn.dataset.start);
                const end = parseFloat(btn.dataset.end);
                
                if (!isNaN(start) && !isNaN(end)) {
                    AudioPlayer.playWord(start, end, btn);
                    WordTooltip.dismiss();
                }
            });
        });

        // Shahada completion button
        if (elements.shahadaBtn) {
            elements.shahadaBtn.addEventListener('click', () => {
                Counter.onShahadaButtonClick();
            });
        }

        // Keyboard accessibility for word buttons
        elements.wordButtons.forEach(btn => {
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    }

    // ============================================
    // LANGUAGE SELECTOR
    // ============================================
    
    const LanguageSelector = {
        btn: null,
        dropdown: null,
        close: null,
        backdrop: null,
        searchInput: null,
        allLinks: null,
        noResults: null,
        
        init() {
            this.btn = document.getElementById('lang-btn');
            this.footerBtn = document.getElementById('footer-lang-btn');
            this.dropdown = document.getElementById('lang-dropdown');
            this.close = document.getElementById('lang-close');
            this.backdrop = document.getElementById('lang-backdrop');
            this.searchInput = document.getElementById('lang-search-input');
            this.noResults = document.getElementById('lang-no-results');
            
            if (!this.dropdown) return;
            
            this.allLinks = this.dropdown.querySelectorAll('.lang-link');
            
            // Toggle dropdown from header button
            if (this.btn) {
                this.btn.addEventListener('click', () => this.toggle());
            }
            
            // Toggle dropdown from footer button
            if (this.footerBtn) {
                this.footerBtn.addEventListener('click', () => this.show());
            }
            
            // Close button
            if (this.close) {
                this.close.addEventListener('click', () => this.hide());
            }
            
            // Backdrop click
            if (this.backdrop) {
                this.backdrop.addEventListener('click', () => this.hide());
            }
            
            // Search functionality
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => this.search(e.target.value));
            }
            
            // Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen()) {
                    this.hide();
                }
            });
        },
        
        isOpen() {
            return this.dropdown && !this.dropdown.classList.contains('hidden');
        },
        
        toggle() {
            if (this.isOpen()) {
                this.hide();
            } else {
                this.show();
            }
        },
        
        show() {
            if (!this.dropdown || !this.btn) return;
            
            this.dropdown.classList.remove('hidden');
            this.backdrop.classList.remove('hidden');
            this.btn.setAttribute('aria-expanded', 'true');
            
            // Focus search input
            if (this.searchInput) {
                setTimeout(() => this.searchInput.focus(), 100);
            }
            
            // Prevent body scroll on mobile
            document.body.style.overflow = 'hidden';
        },
        
        hide() {
            if (!this.dropdown || !this.btn) return;
            
            this.dropdown.classList.add('hidden');
            this.backdrop.classList.add('hidden');
            this.btn.setAttribute('aria-expanded', 'false');
            
            // Clear search
            if (this.searchInput) {
                this.searchInput.value = '';
                this.search('');
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
        },
        
        search(query) {
            if (!this.allLinks) return;
            
            const normalizedQuery = query.toLowerCase().trim();
            let visibleCount = 0;
            
            this.allLinks.forEach(link => {
                const langName = (link.getAttribute('data-lang') || '').toLowerCase();
                const langCode = (link.getAttribute('lang') || '').toLowerCase();
                const textContent = link.textContent.toLowerCase();
                
                const matches = !normalizedQuery || 
                    langName.includes(normalizedQuery) || 
                    langCode.includes(normalizedQuery) ||
                    textContent.includes(normalizedQuery);
                
                if (matches) {
                    link.classList.remove('hidden');
                    visibleCount++;
                } else {
                    link.classList.add('hidden');
                }
            });
            
            // Show/hide no results message
            if (this.noResults) {
                if (visibleCount === 0 && normalizedQuery) {
                    this.noResults.classList.remove('hidden');
                } else {
                    this.noResults.classList.add('hidden');
                }
            }
        }
    };

    // ============================================
    // WORD TOOLTIP (First-time visitor hint)
    // ============================================
    
    const WordTooltip = {
        timeout: null,
        
        init() {
            if (!elements.wordTooltip) return;
            
            // Hide if user has already seen it
            if (localStorage.getItem(CONFIG.storageKeys.tooltipSeen) === 'true') {
                elements.wordTooltip.classList.add('hidden');
                return;
            }
            
            // Auto-dismiss after 8 seconds
            this.timeout = setTimeout(() => this.dismiss(), 8000);
            
            // Dismiss on scroll (after scrolling 300px)
            let scrollStart = window.scrollY;
            const onScroll = () => {
                if (Math.abs(window.scrollY - scrollStart) > 300) {
                    this.dismiss();
                    window.removeEventListener('scroll', onScroll);
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
        },
        
        dismiss() {
            if (!elements.wordTooltip) return;
            
            // Clear timeout if still pending
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            
            elements.wordTooltip.classList.add('hidden');
            localStorage.setItem(CONFIG.storageKeys.tooltipSeen, 'true');
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    
    function init() {
        // Initialize audio player
        AudioPlayer.init();
        
        // Initialize counter
        Counter.init();
        
        // Initialize language selector
        LanguageSelector.init();
        
        // Initialize word tooltip for first-time visitors
        WordTooltip.init();
        
        // Set up event listeners
        setupEventListeners();
        
        // Check if already completed on load
        const alreadyCompleted = localStorage.getItem(CONFIG.storageKeys.hasCompleted) === 'true';
        if (alreadyCompleted) {
            Counter.setButtonCompleted(true);
        }
        
        console.log('Shahada page initialized. May your journey be blessed.');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

