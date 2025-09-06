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
require_once get_theme_file_path('inc/cpt-project.php'); // Schritt 1: Grundlegende Projekt-Funktionen aktiviert
require_once get_theme_file_path('inc/setup-projects.php'); // Aktiviert: Erstellt Beispiel-Projekte falls keine vorhanden sind


// Setup default content

// Theme Customizer (UI Settings)
require_once get_theme_file_path('inc/customizer.php');

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


