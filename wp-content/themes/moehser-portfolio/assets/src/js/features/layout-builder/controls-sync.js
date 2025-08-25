// Layout Controls Sync
// ====================
(function() {
  // Controls-frame sync
  // Hide skills checkbox when
  // adaptive mode and all off
  'use strict';

  if (!window.wp || !window.wp.customize) return;

  const customize = window.wp.customize;

  function syncCheckbox() {
    // Get current layout mode
    const mode = customize('moehser_skills_layout_mode');
    if (!mode) return;
    const layoutMode = mode.get() || 'fixed_grid';
    if (layoutMode !== 'adaptive_grid') return;

    // Read per-card enabled flags
    const enabled = [1,2,3,4,5].map(i => {
      const s = customize('moehser_skills_card' + i + '_enabled');
      return s ? Boolean(s.get()) : true;
    });
    // Any card enabled?
    const anyEnabled = enabled.some(Boolean);

    // Toggle skills section flag
    const showSkills = customize('moehser_show_skills');
    if (showSkills && typeof showSkills.set === 'function') {
      showSkills.set(anyEnabled ? 1 : 0);
    }
  }

  customize.bind('ready', function() {
    // Initial sync
    syncCheckbox();

    // React to mode changes
    const mode = customize('moehser_skills_layout_mode');
    if (mode) {
      mode.bind(syncCheckbox);
    }

    // React to card toggles
    [1,2,3,4,5].forEach(function(i) {
      const s = customize('moehser_skills_card' + i + '_enabled');
      if (s) s.bind(syncCheckbox);
    });
  });
})();


