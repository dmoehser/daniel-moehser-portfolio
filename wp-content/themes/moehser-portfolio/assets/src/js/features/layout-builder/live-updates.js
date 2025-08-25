// Live Updates for Layout Builder
// ===============================

// Handles real-time updates when user changes layout settings
// ------------------------------

(function() {
    'use strict';

    // Configuration object from PHP
    const layoutConfig = window.__LAYOUT_CONFIG__ || {
        order: ['about', 'skills', 'projects'],
        visibility: { about: true, skills: true, projects: true },
        all: ['about', 'skills', 'projects']
    };
    
    // Timing and retry constants
    const TIMING = {
        RETRY_DELAY: 500,        // milliseconds
        RESIZE_DEBOUNCE: 250,    // milliseconds
        MAX_RETRIES: 10
    };
    
    // DOM elements cache
    let sectionElements = {};
    let containerElement = null;

    // Initialize the live updates system
    function init() {
        // Cache section elements
        cacheSectionElements();
        
        // If sections not yet mounted by React, wait and observe DOM
        if (Object.keys(sectionElements).length === 0) {
            setupMountWaiters();
        } else {
            // Apply initial layout now
            applyLayout();
        }
        
        // Listen for Customizer changes
        if (window.wp && window.wp.customize) {
            setupCustomizerListeners();
        }
        
        // Listen for window resize
        window.addEventListener('resize', debounce(applyLayout, TIMING.RESIZE_DEBOUNCE));
    }

    // Cache all section elements
    function cacheSectionElements() {
        layoutConfig.all.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                sectionElements[sectionId] = element;
            } else {
                // Try alternative selectors
                const altElement = document.querySelector(`[data-section="${sectionId}"]`) || 
                                 document.querySelector(`.${sectionId}`) ||
                                 document.querySelector(`#${sectionId}-section`);
                if (altElement) {
                    sectionElements[sectionId] = altElement;
                }
            }
        });
        
        // Find main container - prioritize content-scroll over page-scroll
        containerElement = document.querySelector('#content-scroll') || 
                          document.querySelector('.page-scroll') || 
                          document.body;
    }

    // Wait for React components to mount
    function setupMountWaiters() {
        // Retry approach
        let retryCount = 0;
        
        const retry = () => {
            if (retryCount >= TIMING.MAX_RETRIES) return;
            retryCount++;
            
            setTimeout(() => {
                cacheSectionElements();
                if (Object.keys(sectionElements).length > 0) {
                    applyLayout();
                } else {
                    retry();
                }
            }, TIMING.RETRY_DELAY);
        };
        
        retry();
        
        // MutationObserver approach
        const observer = new MutationObserver(() => {
            cacheSectionElements();
            if (Object.keys(sectionElements).length > 0) {
                applyLayout();
                observer.disconnect();
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Apply the current layout configuration
    function applyLayout() {
        if (!containerElement) {
            return;
        }
        
        // Apply visibility
        Object.entries(sectionElements).forEach(([sectionId, element]) => {
            if (!element) return;
            const isVisible = layoutConfig.visibility[sectionId];
            if (isVisible) {
                element.style.display = '';
                element.classList.remove('section-hidden');
            } else {
                element.style.display = 'none';
                element.classList.add('section-hidden');
            }
        });
        
        // Apply order
        applySectionOrder();
        
        // Update scroll behavior
        updateScrollBehavior();
        
        // Fix scroll snap issues
        fixScrollSnap();
    }

    // Apply section order using CSS order property
    function applySectionOrder() {
        const visibleSections = layoutConfig.order.filter(id => layoutConfig.visibility[id]);
        
        if (visibleSections.length === 0) return;
        
        // Hero is always first (order 0), other sections start at order 1
        visibleSections.forEach((sectionId, index) => {
            const element = sectionElements[sectionId];
            if (element) {
                element.style.order = index + 1; // +1 because Hero is at order 0
            }
        });
    }

    // Update scroll behavior based on visible sections
    function updateScrollBehavior() {
        const visibleSections = layoutConfig.order.filter(id => layoutConfig.visibility[id]);
        
        // Hero is always visible, so we need at least 2 sections for scroll snapping
        if (visibleSections.length <= 0) {
            // Disable scroll snapping if no additional sections
            document.body.style.scrollSnapType = 'none';
            if (containerElement) {
                containerElement.style.scrollSnapType = 'none';
            }
        } else {
            // Enable scroll snapping (Hero + visible sections)
            document.body.style.scrollSnapType = 'y mandatory';
            if (containerElement) {
                containerElement.style.scrollSnapType = 'y mandatory';
            }
            
            // Ensure all visible sections have scroll-snap only (no layout overrides)
            visibleSections.forEach(sectionId => {
                const element = sectionElements[sectionId];
                if (!element) return;
                element.style.scrollSnapAlign = 'start';
                element.style.scrollSnapStop = 'always';
                element.style.minHeight = '100vh';
            });
        }
    }

    // Fix scroll snap issues after layout changes
    function fixScrollSnap() {
        // Force reflow to ensure CSS changes are applied
        if (containerElement) {
            containerElement.style.display = 'none';
            containerElement.offsetHeight; // Force reflow
            containerElement.style.display = 'flex';
        }
        
        // Ensure proper scroll container setup
        if (containerElement && (containerElement.id === 'content-scroll' || 
                                containerElement.classList.contains('page-scroll'))) {
            containerElement.style.height = '100vh';
            containerElement.style.overflowY = 'auto';
            containerElement.style.scrollSnapType = 'y mandatory';
            containerElement.style.display = 'flex';
            containerElement.style.flexDirection = 'column';
        }
        
        // Ensure all visible sections have scroll-snap styles only
        const visibleSections = layoutConfig.order.filter(id => layoutConfig.visibility[id]);
        visibleSections.forEach(sectionId => {
            const element = sectionElements[sectionId];
            if (!element) return;
            element.style.minHeight = '100vh';
            element.style.scrollSnapAlign = 'start';
            element.style.scrollSnapStop = 'always';
            element.style.width = '100%';
            element.style.flex = '0 0 auto';
        });
    }

    // Setup Customizer listeners for live updates
    function setupCustomizerListeners() {
        const customize = window.wp.customize;
        
        // Listen for section visibility changes
        layoutConfig.all.forEach(sectionId => {
            const settingId = `moehser_show_${sectionId}`;
            
            customize(settingId, function(setting) {
                setting.bind(function(newValue) {
                    layoutConfig.visibility[sectionId] = Boolean(newValue);
                    applyLayout();
                });
            });
        });
        
        // Listen for order changes
        customize('moehser_sections_order', function(setting) {
            setting.bind(function(newValue) {
                if (newValue && typeof newValue === 'string') {
                    const newOrder = newValue.split(',').map(s => s.trim());
                    layoutConfig.order = newOrder;
                    applyLayout();
                }
            });
        });

        // Sync Skills section checkbox with Adaptive mode card enablement
        const skillsState = {
            layoutMode: (window.__SKILLS_LAYOUT_MODE__ || 'fixed_grid'),
            enabled: Object.assign({ c1:true,c2:true,c3:true,c4:true,c5:true }, (window.__SKILLS_CARDS_ENABLED__ || {}))
        };

        function syncSkillsVisibilitySetting() {
            if (!customize) return;
            const anyEnabled = Object.values(skillsState.enabled).some(Boolean);
            if (skillsState.layoutMode === 'adaptive_grid') {
                customize('moehser_show_skills', function(setting) {
                    setting.set(anyEnabled);
                });
            }
        }

        // Listen to layout mode changes
        customize('moehser_skills_layout_mode', function(setting) {
            setting.bind(function(newValue) {
                skillsState.layoutMode = newValue || 'fixed_grid';
                syncSkillsVisibilitySetting();
            });
        });

        // Listen to per-card enable flags (only visible in adaptive but we bind regardless)
        ['c1','c2','c3','c4','c5'].forEach((key, idx) => {
            const settingId = `moehser_skills_card${idx+1}_enabled`;
            customize(settingId, function(setting) {
                setting.bind(function(newValue) {
                    skillsState.enabled[key] = Boolean(newValue);
                    syncSkillsVisibilitySetting();
                });
            });
        });

        // Initial sync
        syncSkillsVisibilitySetting();
    }

    // Utility: Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API for external use
    window.MoehserLayoutBuilder = {
        getConfig: () => ({ ...layoutConfig }),
        applyLayout: applyLayout,
        showSection: (sectionId) => {
            if (layoutConfig.visibility.hasOwnProperty(sectionId)) {
                layoutConfig.visibility[sectionId] = true;
                applyLayout();
            }
        },
        hideSection: (sectionId) => {
            if (layoutConfig.visibility.hasOwnProperty(sectionId)) {
                layoutConfig.visibility[sectionId] = false;
                applyLayout();
            }
        },
        setOrder: (newOrder) => {
            if (Array.isArray(newOrder)) {
                layoutConfig.order = newOrder;
                applyLayout();
            }
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
