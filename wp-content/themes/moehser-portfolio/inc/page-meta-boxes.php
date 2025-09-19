<?php

// Page Meta Boxes for Moehser Portfolio
// =====================================

if (!defined('ABSPATH')) {
    exit;
}

// Meta box configuration
// ----------------------
const FOOTER_META_KEY = '_moehser_footer_enabled';
const FOOTER_DEFAULT_VALUE = '1';
const FOOTER_NONCE_ACTION = 'moehser_page_footer_meta_box';

// Helper function to validate meta box security
// --------------------------------------------
function validate_meta_box_security($post_id, $nonce_name, $nonce_action) {
    // Check if nonce is valid
    if (!isset($_POST[$nonce_name]) || !wp_verify_nonce($_POST[$nonce_name], $nonce_action)) {
        return false;
    }
    
    // Check if user has permission
    if (!current_user_can('edit_post', $post_id)) {
        return false;
    }
    
    // Check if this is an autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return false;
    }
    
    return true;
}

// Add meta box to pages
add_action('add_meta_boxes', function() {
    add_meta_box(
        'moehser_page_footer_settings',
        __('Footer Settings', 'moehser-portfolio'),
        'moehser_page_footer_meta_box_callback',
        'page',
        'side',
        'default'
    );
});

// Meta box callback
// ----------------
function moehser_page_footer_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field(FOOTER_NONCE_ACTION, FOOTER_NONCE_ACTION . '_nonce');
    
    // Get current value with default
    $footer_enabled = get_post_meta($post->ID, FOOTER_META_KEY, true);
    if ($footer_enabled === '') {
        $footer_enabled = FOOTER_DEFAULT_VALUE;
    }
    
    echo '<p>';
    echo '<label for="moehser_footer_enabled">';
    echo '<input type="checkbox" id="moehser_footer_enabled" name="moehser_footer_enabled" value="1" ' . checked($footer_enabled, '1', false) . ' />';
    echo ' ' . __('Show Footer', 'moehser-portfolio');
    echo '</label>';
    echo '</p>';
    
    echo '<p class="description">';
    echo __('Enable footer on this page (appears only in Projects section on main page)', 'moehser-portfolio');
    echo '</p>';
}

// Save meta box data
// -----------------
add_action('save_post', function($post_id) {
    // Validate security using helper function
    if (!validate_meta_box_security($post_id, FOOTER_NONCE_ACTION . '_nonce', FOOTER_NONCE_ACTION)) {
        return;
    }
    
    // Save footer setting
    $footer_enabled = isset($_POST['moehser_footer_enabled']) ? '1' : '0';
    update_post_meta($post_id, FOOTER_META_KEY, $footer_enabled);
});

// Footer is now handled entirely by React component
// No WordPress integration needed for SPA
