<?php
// Database Configuration
// =====================
define('DB_NAME', 'wordpress');
define('DB_USER', 'wordpress');
define('DB_PASSWORD', 'wordpress');
define('DB_HOST', 'db:3306');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Authentication Keys & Salts
// ===========================
define('AUTH_KEY',         'your-auth-key-here');
define('SECURE_AUTH_KEY',  'your-secure-auth-key-here');
define('LOGGED_IN_KEY',    'your-logged-in-key-here');
define('NONCE_KEY',        'your-nonce-key-here');
define('AUTH_SALT',        'your-auth-salt-here');
define('SECURE_AUTH_SALT', 'your-secure-auth-salt-here');
define('LOGGED_IN_SALT',   'your-logged-in-salt-here');
define('NONCE_SALT',       'your-nonce-salt-here');

// WordPress Settings
// ==================
define('WP_ENV', 'development');
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', true);
define('WP_DEBUG', true);
define('FS_METHOD', 'direct');

// Performance Settings
// ====================
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);

// Multi-Site Configuration
// ========================
define('WP_ALLOW_MULTISITE', true);
define('MULTISITE', true);
define('SUBDOMAIN_INSTALL', false);
define('DOMAIN_CURRENT_SITE', 'localhost:8080');
define('PATH_CURRENT_SITE', '/');
define('SITE_ID_CURRENT_SITE', 1);
define('BLOG_ID_CURRENT_SITE', 1);

// Cookie Domain for Multisite
// ---------------------------
define('COOKIE_DOMAIN', '');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');

// Basic Configuration
// ===================
define('WPLANG', '');
$table_prefix = 'wp_';

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

// Multisite URL Fixes
// ===================
if (defined('MULTISITE') && MULTISITE) {
    // Fix script and style URLs for subdirectory multisite
    add_filter('script_loader_src', function($src, $handle) {
        if (is_multisite() && get_current_blog_id() > 1) {
            $site_url = get_site_url();
            if (strpos($src, '//') === false && strpos($src, $site_url) === false) {
                if (strpos($src, '/') === 0) {
                    $src = $site_url . $src;
                } else {
                    $src = $site_url . '/' . $src;
                }
            }
        }
        return $src;
    }, 10, 2);

    add_filter('style_loader_src', function($src, $handle) {
        if (is_multisite() && get_current_blog_id() > 1) {
            $site_url = get_site_url();
            if (strpos($src, '//') === false && strpos($src, $site_url) === false) {
                if (strpos($src, '/') === 0) {
                    $src = $site_url . $src;
                } else {
                    $src = $site_url . '/' . $src;
                }
            }
        }
        return $src;
    }, 10, 2);
    
    // Fix wp-includes URLs
    add_filter('includes_url', function($url, $path) {
        if (is_multisite() && get_current_blog_id() > 1) {
            $site_url = get_site_url();
            return $site_url . '/wp-includes/' . $path;
        }
        return $url;
    }, 10, 2);
    
    // Fix wp-content URLs
    add_filter('content_url', function($url, $path, $blog_id = null) {
        if (is_multisite() && get_current_blog_id() > 1) {
            $site_url = get_site_url();
            return $site_url . '/wp-content' . $path;
        }
        return $url;
    }, 10, 3);
}

// Load WordPress
require_once ABSPATH . 'wp-settings.php';
