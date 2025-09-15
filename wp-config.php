<?php
// WordPress Configuration
// ======================

// Configuration constants
// ----------------------
const DB_NAME = 'wordpress';
const DB_USER = 'wordpress';
const DB_PASSWORD = 'wordpress';
const DB_HOST = 'db:3306';
const DB_CHARSET = 'utf8mb4';
const DB_COLLATE = '';

const MEMORY_LIMIT = '512M';
const MAX_EXECUTION_TIME = 300;
const TABLE_PREFIX = 'wp_';
const DOMAIN_CURRENT_SITE = 'localhost:8080';
const PATH_CURRENT_SITE = '/';
const SITE_ID_CURRENT_SITE = 1;
const BLOG_ID_CURRENT_SITE = 1;

// Database Configuration
// ---------------------
define('DB_NAME', DB_NAME);
define('DB_USER', DB_USER);
define('DB_PASSWORD', DB_PASSWORD);
define('DB_HOST', DB_HOST);
define('DB_CHARSET', DB_CHARSET);
define('DB_COLLATE', DB_COLLATE);

// Authentication Keys & Salts
// ---------------------------
define('AUTH_KEY',         'your-auth-key-here');
define('SECURE_AUTH_KEY',  'your-secure-auth-key-here');
define('LOGGED_IN_KEY',    'your-logged-in-key-here');
define('NONCE_KEY',        'your-nonce-key-here');
define('AUTH_SALT',        'your-auth-salt-here');
define('SECURE_AUTH_SALT', 'your-secure-auth-salt-here');
define('LOGGED_IN_SALT',   'your-logged-in-salt-here');
define('NONCE_SALT',       'your-nonce-salt-here');

// WordPress Settings
// -----------------
define('WP_ENV', 'development');
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', true);
define('WP_DEBUG', true);
define('FS_METHOD', 'direct');

// Performance Settings
// -------------------
ini_set('memory_limit', MEMORY_LIMIT);
ini_set('max_execution_time', MAX_EXECUTION_TIME);

// Multi-Site Configuration
// ------------------------
define('WP_ALLOW_MULTISITE', true);
define('MULTISITE', true);
define('SUBDOMAIN_INSTALL', false);
define('DOMAIN_CURRENT_SITE', DOMAIN_CURRENT_SITE);
define('PATH_CURRENT_SITE', PATH_CURRENT_SITE);
define('SITE_ID_CURRENT_SITE', SITE_ID_CURRENT_SITE);
define('BLOG_ID_CURRENT_SITE', BLOG_ID_CURRENT_SITE);

// Cookie Domain for Multisite
// ---------------------------
define('COOKIE_DOMAIN', '');
define('COOKIEPATH', '/');
define('SITECOOKIEPATH', '/');

// Basic Configuration
// ------------------
define('WPLANG', '');
$table_prefix = TABLE_PREFIX;

if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

// Multisite URL Fixes
// ===================
if (defined('MULTISITE') && MULTISITE) {
    // Helper function to fix multisite URLs
    // -------------------------------------
    function fix_multisite_url($src, $site_url) {
        if (strpos($src, '//') === false && strpos($src, $site_url) === false) {
            if (strpos($src, '/') === 0) {
                return $site_url . $src;
            } else {
                return $site_url . '/' . $src;
            }
        }
        return $src;
    }
    
    // Fix script and style URLs for subdirectory multisite
    // ----------------------------------------------------
    add_filter('script_loader_src', function($src, $handle) {
        if (is_multisite() && get_current_blog_id() > 1) {
            return fix_multisite_url($src, get_site_url());
        }
        return $src;
    }, 10, 2);

    add_filter('style_loader_src', function($src, $handle) {
        if (is_multisite() && get_current_blog_id() > 1) {
            return fix_multisite_url($src, get_site_url());
        }
        return $src;
    }, 10, 2);
    
    // Fix wp-includes URLs
    // --------------------
    add_filter('includes_url', function($url, $path) {
        if (is_multisite() && get_current_blog_id() > 1) {
            return get_site_url() . '/wp-includes/' . $path;
        }
        return $url;
    }, 10, 2);
    
    // Fix wp-content URLs
    // -------------------
    add_filter('content_url', function($url, $path, $blog_id = null) {
        if (is_multisite() && get_current_blog_id() > 1) {
            return get_site_url() . '/wp-content' . $path;
        }
        return $url;
    }, 10, 3);
}

// Load WordPress
require_once ABSPATH . 'wp-settings.php';
