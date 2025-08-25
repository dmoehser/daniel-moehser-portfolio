// Skills notes visibility
// =======================
(function() {
  // Toggle help notes per mode
  'use strict';

  if (!window.wp || !window.wp.customize) return;
  var $ = window.jQuery;
  var customize = window.wp.customize;

  // Controls with built-in notes
  var existing = [
    'moehser_skills_card1_skills_list',
    'moehser_skills_card1_tags',
    'moehser_skills_card2_skills_list',
    'moehser_skills_card2_tags',
    'moehser_skills_card3_skills_list',
    'moehser_skills_card3_tags'
  ];

  // Controls needing injected note
  var injected = {
    'moehser_skills_card4_tags': 'In Fixed Grid mode, max 3 tags.',
    'moehser_skills_card5_tags': 'In Fixed Grid mode, max 3 tags.'
  };

  function ensureInjectedDesc(id) {
    var sel = '#customize-control-' + id + ' .customize-control-description';
    var has = $(sel).length > 0;
    if (!has) {
      var container = $('#customize-control-' + id);
      if (container.length) {
        var text = injected[id] || '';
        if (text) {
          var span = $('<span/>', {
            'class': 'description customize-control-description',
            text: text
          });
          container.append(span);
        }
      }
    }
  }

  function toggleNotes(isFixed) {
    existing.forEach(function(id) {
      var desc = $('#customize-control-' + id + ' .customize-control-description');
      if (desc.length) desc.toggle(isFixed);
    });
    Object.keys(injected).forEach(function(id) {
      ensureInjectedDesc(id);
      var desc = $('#customize-control-' + id + ' .customize-control-description');
      if (desc.length) desc.toggle(isFixed);
    });
  }

  customize.bind('ready', function() {
    var mode = customize('moehser_skills_layout_mode');
    if (!mode) return;
    var isFixed = (mode.get() || 'fixed_grid') === 'fixed_grid';
    toggleNotes(isFixed);
    mode.bind(function(val) {
      toggleNotes((val || 'fixed_grid') === 'fixed_grid');
    });
  });
})();


