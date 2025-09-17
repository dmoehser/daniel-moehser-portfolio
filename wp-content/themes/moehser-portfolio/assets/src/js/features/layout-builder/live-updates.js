// Live Updates for Layout Builder
// ===============================

(function() {
    'use strict';

    // Constants
    // ---------
    const LAYOUT_CONFIG_DEFAULT = {
        order: ['about', 'skills', 'projects'],
        visibility: { about: true, skills: true, projects: true },
        all: ['about', 'skills', 'projects']
    };

    const TIMING_CONFIG = {
        RETRY_DELAY: 500,        // milliseconds
        RESIZE_DEBOUNCE: 250,    // milliseconds
        MAX_RETRIES: 10
    };

    const DOM_CONFIG = {
        SELECTORS: {
            CONTENT_SCROLL: '#content-scroll',
            PAGE_SCROLL: '.page-scroll',
            ABOUT_CONTENT: '#about .about__content-text'
        },
        ALTERNATIVE_SELECTORS: {
            DATA_SECTION: '[data-section="{sectionId}"]',
            CLASS_NAME: '.{sectionId}',
            ID_SECTION: '#{sectionId}-section'
        }
    };

    const CSS_CONFIG = {
        CLASSES: {
            SECTION_HIDDEN: 'section-hidden'
        },
        PROPERTIES: {
            DISPLAY_NONE: 'none',
            DISPLAY_FLEX: 'flex',
            SCROLL_SNAP_TYPE: 'y mandatory',
            SCROLL_SNAP_ALIGN: 'start',
            SCROLL_SNAP_STOP: 'always',
            MIN_HEIGHT: '100vh',
            HEIGHT: '100vh',
            OVERFLOW_Y: 'auto',
            WIDTH: '100%',
            FLEX: '0 0 auto',
            FLEX_DIRECTION: 'column'
        }
    };

    const CUSTOMIZER_CONFIG = {
        SECTION_PREFIX: 'moehser_show_',
        SECTIONS_ORDER: 'moehser_sections_order',
        SKILLS_LAYOUT_MODE: 'moehser_skills_layout_mode',
        SKILLS_CARD_PREFIX: 'moehser_skills_card',
        SKILLS_CARD_SUFFIX: '_enabled',
        ABOUT_PAGE_ID: 'moehser_about_page_id'
    };

    const API_CONFIG = {
        WP_REST_PAGES: '/wp-json/wp/v2/pages/',
        FIELDS_PARAM: '?_fields=content.rendered'
    };

    const GLOBAL_VARS = {
        LAYOUT_CONFIG: '__LAYOUT_CONFIG__',
        SKILLS_LAYOUT_MODE: '__SKILLS_LAYOUT_MODE__',
        SKILLS_CARDS_ENABLED: '__SKILLS_CARDS_ENABLED__',
        ABOUT_HTML: '__ABOUT_HTML__'
    };

    // State management
    // ----------------
    const layoutConfig = window[GLOBAL_VARS.LAYOUT_CONFIG] || LAYOUT_CONFIG_DEFAULT;
    let sectionElements = {};
    let containerElement = null;

    // Utility functions
    // -----------------
    const isWordPressCustomizerAvailable = () => {
        return window.wp && window.wp.customize;
    };

    const getSectionElement = (sectionId) => {
        // Try primary selector first
        let element = document.getElementById(sectionId);
        if (element) return element;

        // Try alternative selectors
        const altSelectors = [
            DOM_CONFIG.ALTERNATIVE_SELECTORS.DATA_SECTION.replace('{sectionId}', sectionId),
            DOM_CONFIG.ALTERNATIVE_SELECTORS.CLASS_NAME.replace('{sectionId}', sectionId),
            DOM_CONFIG.ALTERNATIVE_SELECTORS.ID_SECTION.replace('{sectionId}', sectionId)
        ];

        for (const selector of altSelectors) {
            element = document.querySelector(selector);
            if (element) return element;
        }

        return null;
    };

    const getMainContainer = () => {
        return document.querySelector(DOM_CONFIG.SELECTORS.CONTENT_SCROLL) || 
               document.querySelector(DOM_CONFIG.SELECTORS.PAGE_SCROLL) || 
               document.body;
    };

    const cacheSectionElements = () => {
        sectionElements = {};
        
        layoutConfig.all.forEach(sectionId => {
            const element = getSectionElement(sectionId);
            if (element) {
                sectionElements[sectionId] = element;
            }
        });
        
        containerElement = getMainContainer();
    };

    const hasCachedSections = () => {
        return Object.keys(sectionElements).length > 0;
    };

    const getVisibleSections = () => {
        return layoutConfig.order.filter(id => layoutConfig.visibility[id]);
    };

    const applySectionVisibility = (sectionId, element, isVisible) => {
        if (!element) return;
        
        if (isVisible) {
            element.style.display = '';
            element.classList.remove(CSS_CONFIG.CLASSES.SECTION_HIDDEN);
        } else {
            element.style.display = CSS_CONFIG.PROPERTIES.DISPLAY_NONE;
            element.classList.add(CSS_CONFIG.CLASSES.SECTION_HIDDEN);
        }
    };

    const applySectionOrder = (sectionId, element, orderIndex) => {
        if (!element) return;
        
        // Hero is always first (order 0), other sections start at order 1
        element.style.order = orderIndex + 1;
    };

    const applySectionScrollSnap = (element) => {
        if (!element) return;
        
        element.style.scrollSnapAlign = CSS_CONFIG.PROPERTIES.SCROLL_SNAP_ALIGN;
        element.style.scrollSnapStop = CSS_CONFIG.PROPERTIES.SCROLL_SNAP_STOP;
        element.style.minHeight = CSS_CONFIG.PROPERTIES.MIN_HEIGHT;
        element.style.width = CSS_CONFIG.PROPERTIES.WIDTH;
        element.style.flex = CSS_CONFIG.PROPERTIES.FLEX;
    };

    const applyContainerScrollSnap = (shouldEnable) => {
        const scrollSnapType = shouldEnable ? CSS_CONFIG.PROPERTIES.SCROLL_SNAP_TYPE : CSS_CONFIG.PROPERTIES.DISPLAY_NONE;
        
        document.body.style.scrollSnapType = scrollSnapType;
        
        if (containerElement) {
            containerElement.style.scrollSnapType = scrollSnapType;
            
            if (shouldEnable) {
                containerElement.style.height = CSS_CONFIG.PROPERTIES.HEIGHT;
                containerElement.style.overflowY = CSS_CONFIG.PROPERTIES.OVERFLOW_Y;
                containerElement.style.display = CSS_CONFIG.PROPERTIES.DISPLAY_FLEX;
                containerElement.style.flexDirection = CSS_CONFIG.PROPERTIES.FLEX_DIRECTION;
            }
        }
    };

    // Main functions
    // --------------
    const initializeLayoutSystem = () => {
        cacheSectionElements();
        
        if (!hasCachedSections()) {
            setupMountWaiters();
        } else {
            applyLayout();
        }
        
        if (isWordPressCustomizerAvailable()) {
            window.wp.customize.bind('preview-ready', setupCustomizerListeners);
        }
        
        window.addEventListener('resize', debounce(applyLayout, TIMING_CONFIG.RESIZE_DEBOUNCE));
    };

    const setupMountWaiters = () => {
        let retryCount = 0;
        
        const retryMounting = () => {
            if (retryCount >= TIMING_CONFIG.MAX_RETRIES) return;
            retryCount++;
            
            setTimeout(() => {
                cacheSectionElements();
                if (hasCachedSections()) {
                    applyLayout();
                } else {
                    retryMounting();
                }
            }, TIMING_CONFIG.RETRY_DELAY);
        };
        
        retryMounting();
        
        // MutationObserver for DOM changes
        const observer = new MutationObserver(() => {
            cacheSectionElements();
            if (hasCachedSections()) {
                applyLayout();
                observer.disconnect();
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
    };

    const applyLayout = () => {
        if (!containerElement) return;
        
        // Apply visibility to all sections
        Object.entries(sectionElements).forEach(([sectionId, element]) => {
            const isVisible = layoutConfig.visibility[sectionId];
            applySectionVisibility(sectionId, element, isVisible);
        });
        
        // Apply order to visible sections
        const visibleSections = getVisibleSections();
        visibleSections.forEach((sectionId, index) => {
            const element = sectionElements[sectionId];
            applySectionOrder(sectionId, element, index);
        });
        
        // Update scroll behavior
        updateScrollBehavior();
        
        // Fix scroll snap issues
        fixScrollSnap();
    };

    const updateScrollBehavior = () => {
        const visibleSections = getVisibleSections();
        const shouldEnableScrollSnap = visibleSections.length > 0;
        
        applyContainerScrollSnap(shouldEnableScrollSnap);
        
        if (shouldEnableScrollSnap) {
            // Apply scroll snap to all visible sections
            visibleSections.forEach(sectionId => {
                const element = sectionElements[sectionId];
                applySectionScrollSnap(element);
            });
        }
    };

    const fixScrollSnap = () => {
        if (!containerElement) return;
        
        // Force reflow to ensure CSS changes are applied
        containerElement.style.display = CSS_CONFIG.PROPERTIES.DISPLAY_NONE;
        containerElement.offsetHeight; // Force reflow
        containerElement.style.display = CSS_CONFIG.PROPERTIES.DISPLAY_FLEX;
        
        // Ensure proper scroll container setup for content-scroll or page-scroll
        const isScrollContainer = containerElement.id === 'content-scroll' || 
                                 containerElement.classList.contains('page-scroll');
        
        if (isScrollContainer) {
            applyContainerScrollSnap(true);
        }
        
        // Apply scroll snap styles to all visible sections
        const visibleSections = getVisibleSections();
        visibleSections.forEach(sectionId => {
            const element = sectionElements[sectionId];
            applySectionScrollSnap(element);
        });
    };

    // Customizer integration
    // ----------------------
    const setupCustomizerListeners = () => {
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
                const setting = customize('moehser_show_skills');
                if (setting && typeof setting.set === 'function') {
                    // Use 1/0 to match sanitize callback (absint)
                    setting.set(anyEnabled ? 1 : 0);
                }
            }
        }

        // Listen to layout mode changes
        const layoutSetting = customize('moehser_skills_layout_mode');
        if (layoutSetting) {
            layoutSetting.bind(function(newValue) {
                skillsState.layoutMode = newValue || 'fixed_grid';
                syncSkillsVisibilitySetting();
            });
            // Initialize current value
            skillsState.layoutMode = layoutSetting.get() || 'fixed_grid';
        }

        // Listen to per-card enable flags (only visible in adaptive but we bind regardless)
        ['c1','c2','c3','c4','c5'].forEach((key, idx) => {
            const settingId = `moehser_skills_card${idx+1}_enabled`;
            const setting = customize(settingId);
            if (setting) {
                setting.bind(function(newValue) {
                    skillsState.enabled[key] = Boolean(newValue);
                    syncSkillsVisibilitySetting();
                });
                // Initialize current value
                skillsState.enabled[key] = Boolean(setting.get());
            }
        });

        // Initial sync with current control values
        syncSkillsVisibilitySetting();

        // About content live update (page selector)
        customize('moehser_about_page_id', function(setting) {
            setting.bind(function(newValue) {
                const pageId = parseInt(newValue, 10) || 0;
                if (!pageId) {
                    window.__ABOUT_HTML__ = '';
                    const target = document.querySelector('#about .about__content-text');
                    if (target) target.innerHTML = '';
                    if (window.MoehserLayoutBuilder) {
                        window.MoehserLayoutBuilder.hideSection('about');
                    }
                    return;
                }
                // Fetch rendered page content via WP REST API
                fetch(`/wp-json/wp/v2/pages/${pageId}?_fields=content.rendered`)
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then(data => {
                        const html = data && data.content && data.content.rendered ? data.content.rendered : '';
                        window.__ABOUT_HTML__ = html;
                        const target = document.querySelector('#about .about__content-text');
                        if (target) target.innerHTML = html || '';
                        if (window.MoehserLayoutBuilder) {
                            if (html && html.trim()) {
                                window.MoehserLayoutBuilder.showSection('about');
                            } else {
                                window.MoehserLayoutBuilder.hideSection('about');
                            }
                        }
                    })
                    .catch(() => {
                        // On error, keep current content; optionally log
                        // console.warn('Failed to fetch About page content');
                    });
            });
        });
    }

    // Utility: Debounce function
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Public API
    // -----------
    const createPublicAPI = () => {
        return {
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
    };

    // Initialize public API
    window.MoehserLayoutBuilder = createPublicAPI();

    // Initialization
    // --------------
    const initializeWhenReady = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeLayoutSystem);
        } else {
            initializeLayoutSystem();
        }
    };

    // Start initialization
    initializeWhenReady();

})();
