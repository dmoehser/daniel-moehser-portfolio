<?php

// Theme setup
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    // Register navigation menu locations used by the React header
    register_nav_menus([
        'header_primary' => __('Header Primary', 'moehser-portfolio'),
        'footer' => __('Footer', 'moehser-portfolio'),
    ]);
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
require_once get_theme_file_path('inc/cpt-about.php');
require_once get_theme_file_path('inc/cpt-project.php'); // Schritt 1: Grundlegende Projekt-Funktionen aktiviert
require_once get_theme_file_path('inc/setup-projects.php'); // Aktiviert: Erstellt Beispiel-Projekte falls keine vorhanden sind


// Setup default content
require_once get_theme_file_path('inc/setup-about.php');

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


