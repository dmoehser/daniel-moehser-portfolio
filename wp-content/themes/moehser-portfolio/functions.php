<?php

// Theme setup
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    // Project images: unified wide crop for consistent UI & better LCP
    add_image_size('project_wide', 1440, 810, true);      // 16:9, desktop
    add_image_size('project_wide_2x', 2880, 1620, true);  // 2x for retina
    // Register navigation menu locations used by the React header
    register_nav_menus([
        'header_primary' => __('Header Primary', 'moehser-portfolio'),
        'footer' => __('Footer', 'moehser-portfolio'),
    ]);
});

// Remove customize_changeset_uuid parameter from URLs
add_action('init', function() {
    if (isset($_GET['customize_changeset_uuid']) && !is_customize_preview()) {
        $url = remove_query_arg('customize_changeset_uuid');
        wp_redirect($url, 301);
        exit;
    }
});

// Set custom title for imprint page
add_action('template_redirect', function() {
    if (strpos($_SERVER['REQUEST_URI'], '/imprint') !== false) {
        add_filter('document_title_parts', function($title) {
            $title['title'] = 'Imprint';
            $title['site'] = get_bloginfo('name');
            return $title;
        });
    }
});

// Client-side cleanup for customize_changeset_uuid - robust solution
add_action('wp_head', function() {
    if (!is_customize_preview()) {
        echo '<script>
        // Immediate cleanup function
        function cleanCustomizeParam() {
            if (window.location.search.includes("customize_changeset_uuid")) {
                const url = new URL(window.location);
                url.searchParams.delete("customize_changeset_uuid");
                window.history.replaceState({}, "", url);
                return true;
            }
            return false;
        }

        // Run immediately on script load
        cleanCustomizeParam();

        // Run on DOM ready
        document.addEventListener("DOMContentLoaded", cleanCustomizeParam);

        // Run on window load
        window.addEventListener("load", cleanCustomizeParam);

        // Watch for URL changes with multiple strategies
        let lastUrl = window.location.href;
        let urlWatcher;

        function startUrlWatcher() {
            if (urlWatcher) clearInterval(urlWatcher);
            
            urlWatcher = setInterval(function() {
                if (window.location.href !== lastUrl) {
                    if (cleanCustomizeParam()) {
                        lastUrl = window.location.href;
                    }
                }
            }, 25); // Check every 25ms for faster response
        }

        // Start watcher immediately
        startUrlWatcher();

        // Restart watcher on page visibility change (handles tab switching)
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                cleanCustomizeParam();
                startUrlWatcher();
            }
        });

        // Restart watcher on focus (handles window focus)
        window.addEventListener("focus", function() {
            cleanCustomizeParam();
            startUrlWatcher();
        });

        // Stop watching after 60 seconds (longer runtime)
        setTimeout(() => {
            if (urlWatcher) clearInterval(urlWatcher);
        }, 60000);
        </script>';
    }
});

// Register asset loader (Vite)
require_once get_theme_file_path('inc/vite.php');
add_action('wp_enqueue_scripts', 'moehser_enqueue_vite_assets');

// Ensure pretty permalinks / REST routes work after theme (re)activation
add_action('after_switch_theme', function () {
    flush_rewrite_rules();
});

// One-time fallback flush in admin (helps after container restarts)
add_action('admin_init', function () {
    if (!get_option('moehser_rewrite_flushed_once')) {
        flush_rewrite_rules(false);
        update_option('moehser_rewrite_flushed_once', 1);
    }
});

// Register custom REST endpoints
require_once get_theme_file_path('inc/api.php');




// Register custom post types
require_once get_theme_file_path('inc/cpt-project.php'); // Step 1: Basic project functions activated
require_once get_theme_file_path('inc/setup-projects.php'); // Activated: Creates example projects if none exist


// Setup default content

// Theme Customizer (UI Settings)
require_once get_theme_file_path('inc/customizer.php');

// Page Meta Boxes (Footer Settings per Page)
require_once get_theme_file_path('inc/page-meta-boxes.php');

// Layout Builder (PHP-only)
require_once get_theme_file_path('inc/layout-builder.php');

// Enqueue code-style font for hero typing effect
add_action('wp_enqueue_scripts', function () {
	wp_enqueue_style(
		'jetbrains-mono-font',
		'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
		[],
		null
	);
});

// Increase upload limits for avatar images
add_filter('upload_size_limit', function($limit) {
    // Increase limit to 5MB for all uploads in Customizer and Admin
    if (is_customize_preview() || is_admin()) {
        return 5 * 1024 * 1024; // 5MB
    }
    return $limit;
});

// Additional WordPress Media Library filter
add_filter('wp_handle_upload', function($upload) {
    // Allow larger files for images in general
    if (strpos($upload['type'], 'image/') === 0) {
        $max_image_size = 5 * 1024 * 1024; // 5MB for images
        if ($upload['file'] && filesize($upload['file']) <= $max_image_size) {
            return $upload;
        }
    }
    return $upload;
});

// Additional filter for WordPress Media Library
add_filter('wp_handle_upload_prefilter', function($file) {
    // Special handling for avatar uploads
    if (isset($_REQUEST['customize_theme']) && strpos($file['name'], 'avatar') !== false) {
        // Allow up to 5MB for avatar files
        $max_size = 5 * 1024 * 1024; // 5MB in bytes

        if ($file['size'] > $max_size) {
            $file['error'] = sprintf(
                'Avatar file is too large (%s). Maximum allowed size: %s.',
                size_format($file['size']),
                size_format($max_size)
            );
        }
    }
    return $file;
});

// Increase PHP memory limit for Customizer
add_action('customize_register', function($wp_customize) {
    if (is_customize_preview()) {
        if (function_exists('wp_raise_memory_limit')) {
            wp_raise_memory_limit('admin');
        }
    }
});

// Include projects reorder functionality
require_once get_template_directory() . '/inc/projects-reorder.php';
require_once get_template_directory() . '/inc/setup-menu-order.php';

// AJAX handler for project reordering
add_action('wp_ajax_reorder_projects', 'handle_project_reorder');
function handle_project_reorder() {
    // Verify nonce
    if (!wp_verify_nonce($_POST['nonce'], 'reorder_projects_nonce')) {
        wp_die('Security check failed');
    }
    
    // Check user permissions
    if (!current_user_can('edit_posts')) {
        wp_die('Insufficient permissions');
    }
    
    $project_ids = json_decode(stripslashes($_POST['project_ids']), true);
    
    if (!is_array($project_ids)) {
        wp_send_json_error('Invalid project IDs');
        return;
    }
    
    foreach ($project_ids as $index => $project_id) {
        $project_id = intval($project_id);
        if ($project_id <= 0) {
            continue;
        }
        
        wp_update_post([
            'ID' => $project_id,
            'menu_order' => $index
        ]);
    }
    
    wp_send_json_success('Projects reordered successfully');
}


