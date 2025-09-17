// Skills Notes Visibility Manager
// ===============================

(function() {
  'use strict';

  // Early exit if WordPress Customizer is not available
  if (!window.wp || !window.wp.customize || !window.jQuery) return;

  // Constants
  // ---------
  const CUSTOMIZER_CONFIG = {
    SKILLS_LAYOUT_MODE: 'moehser_skills_layout_mode'
  };

  const LAYOUT_MODES = {
    FIXED_GRID: 'fixed_grid',
    ADAPTIVE_GRID: 'adaptive_grid'
  };

  const CONTROL_CONFIG = {
    // Controls with built-in description notes
    EXISTING_NOTES: [
      'moehser_skills_card1_skills_list',
      'moehser_skills_card1_tags',
      'moehser_skills_card2_skills_list',
      'moehser_skills_card2_tags',
      'moehser_skills_card3_skills_list',
      'moehser_skills_card3_tags'
    ],
    
    // Controls needing injected description notes
    INJECTED_NOTES: {
      'moehser_skills_card4_tags': 'In Fixed Grid mode, max 3 tags.',
      'moehser_skills_card5_tags': 'In Fixed Grid mode, max 3 tags.'
    }
  };

  const CSS_SELECTORS = {
    CONTROL_PREFIX: '#customize-control-',
    DESCRIPTION_CLASS: '.customize-control-description',
    DESCRIPTION_ELEMENT: 'span'
  };

  const CSS_CLASSES = {
    DESCRIPTION: 'description customize-control-description'
  };

  // jQuery and Customizer references
  const $ = window.jQuery;
  const customize = window.wp.customize;

  // Utility functions
  // -----------------
  const getControlSelector = (controlId) => {
    return CSS_SELECTORS.CONTROL_PREFIX + controlId;
  };

  const getDescriptionSelector = (controlId) => {
    return getControlSelector(controlId) + CSS_SELECTORS.DESCRIPTION_CLASS;
  };

  const hasExistingDescription = (controlId) => {
    const selector = getDescriptionSelector(controlId);
    return $(selector).length > 0;
  };

  const createDescriptionElement = (text) => {
    return $('<' + CSS_SELECTORS.DESCRIPTION_ELEMENT + '/>', {
      'class': CSS_CLASSES.DESCRIPTION,
      text: text
    });
  };

  const injectDescriptionIfNeeded = (controlId) => {
    if (hasExistingDescription(controlId)) return;
    
    const container = $(getControlSelector(controlId));
    if (!container.length) return;
    
    const noteText = CONTROL_CONFIG.INJECTED_NOTES[controlId];
    if (!noteText) return;
    
    const descriptionElement = createDescriptionElement(noteText);
    container.append(descriptionElement);
  };

  const toggleControlDescription = (controlId, shouldShow) => {
    const descriptionElement = $(getDescriptionSelector(controlId));
    if (descriptionElement.length) {
      descriptionElement.toggle(shouldShow);
    }
  };

  const getCurrentLayoutMode = () => {
    const modeControl = customize(CUSTOMIZER_CONFIG.SKILLS_LAYOUT_MODE);
    return modeControl ? (modeControl.get() || LAYOUT_MODES.FIXED_GRID) : LAYOUT_MODES.FIXED_GRID;
  };

  const isFixedGridMode = (layoutMode = null) => {
    const mode = layoutMode || getCurrentLayoutMode();
    return mode === LAYOUT_MODES.FIXED_GRID;
  };

  // Main functions
  // --------------
  const toggleAllNotesVisibility = (shouldShowNotes) => {
    // Toggle existing notes
    CONTROL_CONFIG.EXISTING_NOTES.forEach(controlId => {
      toggleControlDescription(controlId, shouldShowNotes);
    });
    
    // Toggle injected notes (ensure they exist first)
    Object.keys(CONTROL_CONFIG.INJECTED_NOTES).forEach(controlId => {
      injectDescriptionIfNeeded(controlId);
      toggleControlDescription(controlId, shouldShowNotes);
    });
  };

  const handleLayoutModeChange = (newMode) => {
    const shouldShowNotes = isFixedGridMode(newMode);
    toggleAllNotesVisibility(shouldShowNotes);
  };

  const initializeSkillsNotesManager = () => {
    const modeControl = customize(CUSTOMIZER_CONFIG.SKILLS_LAYOUT_MODE);
    if (!modeControl) return;
    
    // Apply initial state
    const currentMode = getCurrentLayoutMode();
    handleLayoutModeChange(currentMode);
    
    // Bind to mode changes
    modeControl.bind(handleLayoutModeChange);
  };

  // Customizer ready handler
  // ------------------------
  customize.bind('ready', initializeSkillsNotesManager);
})();


