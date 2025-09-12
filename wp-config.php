<?php
/**
 * WordPress Multisite Configuration
 * 
 * This configuration enables subdomain-based multisite
 * for English (localhost:8080) and German (de.localhost:8080)
 */

// Database configuration
define('DB_NAME', 'wordpress');
define('DB_USER', 'wordpress');
define('DB_PASSWORD', 'wordpress');
define('DB_HOST', 'db:3306');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Authentication Keys and Salts
define('AUTH_KEY',         'your-auth-key-here');
define('SECURE_AUTH_KEY',  'your-secure-auth-key-here');
define('LOGGED_IN_KEY',    'your-logged-in-key-here');
define('NONCE_KEY',        'your-nonce-key-here');
define('AUTH_SALT',        'your-auth-salt-here');
define('SECURE_AUTH_SALT', 'your-secure-auth-salt-here');
define('LOGGED_IN_SALT',   'your-logged-in-salt-here');
define('NONCE_SALT',       'your-nonce-salt-here');

// Multisite Configuration
define('MULTISITE', true);
define('SUBDOMAIN_INSTALL', true);
define('DOMAIN_CURRENT_SITE', 'localhost');
define('PATH_CURRENT_SITE', '/');
define('SITE_ID_CURRENT_SITE', 1);
define('BLOG_ID_CURRENT_SITE', 1);

// Additional WordPress settings
define('WP_ENV', 'development');
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG', true);

// File permissions
define('FS_METHOD', 'direct');

// Memory and execution limits
ini_set('memory_limit', '512M');
ini_set('max_execution_time', 300);

// Language detection and redirection
define('WPLANG', '');

// Table prefix
$table_prefix = 'wp_';

// Absolute path to WordPress directory
if (!defined('ABSPATH')) {
    define('ABSPATH', __DIR__ . '/');
}

// Language detection function
function detect_user_language() {
    // Check if we're on the German subdomain
    if (strpos($_SERVER['HTTP_HOST'], 'de.localhost') !== false) {
        return 'de_DE';
    }
    
    // Check browser language
    $browser_lang = substr($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '', 0, 2);
    if ($browser_lang === 'de') {
        return 'de_DE';
    }
    
    return 'en_US';
}

// Set language based on subdomain or browser preference
define('WPLANG', detect_user_language());

// Load WordPress
require_once ABSPATH . 'wp-settings.php';
