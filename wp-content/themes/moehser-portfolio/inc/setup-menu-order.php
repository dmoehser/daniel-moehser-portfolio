<?php
/**
 * Setup initial menu_order for existing projects
 * 
 * @package Moehser_Portfolio
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Set initial menu_order for existing projects
 */
function moehser_setup_project_menu_order() {
    // Only run once
    if (get_option('moehser_menu_order_setup_done')) {
        return;
    }
    
    $projects = get_posts([
        'post_type' => 'project',
        'post_status' => 'publish',
        'posts_per_page' => -1,
        'orderby' => 'date',
        'order' => 'DESC'
    ]);
    
    foreach ($projects as $index => $project) {
        wp_update_post([
            'ID' => $project->ID,
            'menu_order' => $index
        ]);
    }
    
    // Mark as done
    update_option('moehser_menu_order_setup_done', true);
}

// Run on theme activation
add_action('after_switch_theme', 'moehser_setup_project_menu_order');

// Also run on admin init if not done yet
add_action('admin_init', function() {
    if (!get_option('moehser_menu_order_setup_done')) {
        moehser_setup_project_menu_order();
    }
});
