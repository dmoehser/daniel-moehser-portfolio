// Layout & Sections Controls Sync
// ===============================

(function() {
  'use strict';

  // Early exit if WordPress Customizer is not available
  if (!window.wp || !window.wp.customize) return;

  // Constants
  // ---------
  const CUSTOMIZER_CONFIG = {
    SKILLS_LAYOUT_MODE: 'moehser_skills_layout_mode',
    SHOW_SKILLS: 'moehser_show_skills',
    SKILLS_CARD_PREFIX: 'moehser_skills_card',
    SKILLS_CARD_SUFFIX: '_enabled'
  };

  const LAYOUT_MODES = {
    FIXED_GRID: 'fixed_grid',
    ADAPTIVE_GRID: 'adaptive_grid'
  };

  const SKILLS_CARD_INDICES = [1, 2, 3, 4, 5];

  const customize = window.wp.customize;

  // Utility functions
  // -----------------
  const getCustomizerControl = (controlId) => {
    return customize(controlId) || null;
  };

  const getLayoutMode = () => {
    const modeControl = getCustomizerControl(CUSTOMIZER_CONFIG.SKILLS_LAYOUT_MODE);
    return modeControl ? (modeControl.get() || LAYOUT_MODES.FIXED_GRID) : LAYOUT_MODES.FIXED_GRID;
  };

  const isAdaptiveGridMode = () => {
    return getLayoutMode() === LAYOUT_MODES.ADAPTIVE_GRID;
  };

  const getSkillsCardControlId = (cardIndex) => {
    return CUSTOMIZER_CONFIG.SKILLS_CARD_PREFIX + cardIndex + CUSTOMIZER_CONFIG.SKILLS_CARD_SUFFIX;
  };

  const getSkillsCardEnabledStates = () => {
    return SKILLS_CARD_INDICES.map(index => {
      const control = getCustomizerControl(getSkillsCardControlId(index));
      return control ? Boolean(control.get()) : true;
    });
  };

  const isAnySkillsCardEnabled = () => {
    const enabledStates = getSkillsCardEnabledStates();
    return enabledStates.some(Boolean);
  };

  const updateShowSkillsControl = (shouldShow) => {
    const showSkillsControl = getCustomizerControl(CUSTOMIZER_CONFIG.SHOW_SKILLS);
    if (showSkillsControl && typeof showSkillsControl.set === 'function') {
      showSkillsControl.set(shouldShow ? 1 : 0);
    }
  };

  // Main sync function
  // ------------------
  const syncSkillsVisibility = () => {
    // Only sync when in adaptive grid mode
    if (!isAdaptiveGridMode()) return;

    // Update skills section visibility based on enabled cards
    const anyCardEnabled = isAnySkillsCardEnabled();
    updateShowSkillsControl(anyCardEnabled);
  };

  const bindControlEvents = () => {
    // Bind to layout mode changes
    const modeControl = getCustomizerControl(CUSTOMIZER_CONFIG.SKILLS_LAYOUT_MODE);
    if (modeControl) {
      modeControl.bind(syncSkillsVisibility);
    }

    // Bind to individual card toggle changes
    SKILLS_CARD_INDICES.forEach(index => {
      const cardControl = getCustomizerControl(getSkillsCardControlId(index));
      if (cardControl) {
        cardControl.bind(syncSkillsVisibility);
      }
    });
  };

  // Customizer ready handler
  // ------------------------
  customize.bind('ready', function() {
    // Initial sync
    syncSkillsVisibility();
    
    // Bind event listeners
    bindControlEvents();
  });
})();


