<?php
// Setup initial menu_order for existing projects
// =============================================

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Configuration constants
// ----------------------
const SETUP_OPTION_NAME = 'moehser_menu_order_setup_done';
// PROJECTS_PER_PAGE is defined in projects-reorder.php

// Set initial menu_order for existing projects
// -------------------------------------------
function moehser_setup_project_menu_order() {
    // Only run once
    if (get_option(SETUP_OPTION_NAME)) {
        return;
    }
    
    $projects = get_posts([
        'post_type' => 'project',
        'post_status' => 'publish',
        'posts_per_page' => PROJECTS_PER_PAGE,
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
    update_option(SETUP_OPTION_NAME, true);
}

// Run on theme activation
add_action('after_switch_theme', 'moehser_setup_project_menu_order');

// Also run on admin init if not done yet
// --------------------------------------
add_action('admin_init', function() {
    if (!get_option(SETUP_OPTION_NAME)) {
        moehser_setup_project_menu_order();
    }
});
