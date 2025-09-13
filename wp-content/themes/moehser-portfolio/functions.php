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

add_action('template_redirect', function() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_imprint_page = strpos($request_uri, '/imprint') !== false || 
                       strpos($request_uri, '/de/imprint') !== false ||
                       (is_page() && get_page_template_slug() === 'page-imprint.php');
    
    if ($is_imprint_page) {
        status_header(200);
        
        $title = 'Imprint';
        if (strpos($request_uri, '/de/imprint') !== false) {
            $title = 'Impressum';
        }
        
        add_filter('document_title_parts', function($title_parts) use ($title) {
            $title_parts['title'] = $title;
            $title_parts['site'] = get_bloginfo('name');
            return $title_parts;
        });
        
        add_action('wp_head', function() {
            $business_email_subject = get_theme_mod('moehser_business_email_subject', 'Business Inquiry - Portfolio Contact');
            
            $imprint_page_id = get_theme_mod('moehser_imprint_page_id', 0);
            $imprint_title = 'Imprint';
            $imprint_content = '';
            
            if ($imprint_page_id > 0) {
                $imprint_page = get_post($imprint_page_id);
                if ($imprint_page) {
                    $imprint_title = $imprint_page->post_title;
                    $imprint_content = apply_filters('the_content', $imprint_page->post_content);
                }
            }
            
            echo '<script>
            window.__IMPRINT_TITLE__ = ' . wp_json_encode($imprint_title) . ';
            window.__IMPRINT_HTML__ = ' . wp_json_encode($imprint_content) . ';
            window.__BUSINESS_EMAIL_SUBJECT__ = ' . json_encode($business_email_subject) . ';
            </script>';
        });
    }
});

// Force imprint page template assignment
add_filter('page_template', function($template) {
    if (is_page() && (strpos(get_permalink(), '/imprint') !== false || strpos(get_permalink(), '/de/imprint') !== false)) {
        $imprint_template = get_theme_file_path('page-imprint.php');
        if (file_exists($imprint_template)) {
            return $imprint_template;
        }
    }
    return $template;
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

// Global language detection function
if (!function_exists('get_current_language')) {
    function get_current_language() {
        $uri = $_SERVER['REQUEST_URI'] ?? '';
        // Extract language code from path (e.g., /de/, /fr/, /es/, etc.)
        if (preg_match('/\/([a-z]{2})\//', $uri, $matches)) {
            return $matches[1];
        }
        return 'en'; // Default to English
    }
}

if (!function_exists('is_localized_path')) {
    function is_localized_path() {
        return get_current_language() !== 'en';
    }
}


// Language detection handled by Multisite

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


