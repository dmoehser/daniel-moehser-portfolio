<?php
/**
 * Page Meta Boxes for Moehser Portfolio
 */

if (!defined('ABSPATH')) {
    exit;
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
function moehser_page_footer_meta_box_callback($post) {
    // Add nonce for security
    wp_nonce_field('moehser_page_footer_meta_box', 'moehser_page_footer_meta_box_nonce');
    
    // Get current value
    $footer_enabled = get_post_meta($post->ID, '_moehser_footer_enabled', true);
    if ($footer_enabled === '') {
        $footer_enabled = '1'; // Default to enabled
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
add_action('save_post', function($post_id) {
    // Check if nonce is valid
    if (!isset($_POST['moehser_page_footer_meta_box_nonce']) || 
        !wp_verify_nonce($_POST['moehser_page_footer_meta_box_nonce'], 'moehser_page_footer_meta_box')) {
        return;
    }
    
    // Check if user has permission
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Check if this is an autosave
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Save footer setting
    $footer_enabled = isset($_POST['moehser_footer_enabled']) ? '1' : '0';
    update_post_meta($post_id, '_moehser_footer_enabled', $footer_enabled);
});

// Footer is now handled entirely by React component
// No WordPress integration needed for SPA
