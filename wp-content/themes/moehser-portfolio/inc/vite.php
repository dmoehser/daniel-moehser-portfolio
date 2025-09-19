<?php

// Vite Asset Management
// ====================
// Handles Vite development and production asset loading

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Configuration constants
// ----------------------
const VITE_DEV_HOST = 'localhost';
const VITE_DEV_PORT = 5173;
const VITE_CONNECTION_TIMEOUT = 0.2;
const VITE_CURL_TIMEOUT = 1;
const VITE_HTTP_SUCCESS = 200;
const THEME_BASE_PATH = '/wp-content/themes/moehser-portfolio/';

function moehser_is_vite_dev_server_running($host = VITE_DEV_HOST, $port = VITE_DEV_PORT)
{
    // Try multiple methods to check if Vite is running
    $connection = @fsockopen($host, $port, $errno, $errstr, VITE_CONNECTION_TIMEOUT);
    if (is_resource($connection)) {
        fclose($connection);
        return true;
    }
    
    // Fallback: try curl to check if Vite is responding
    $url = "http://{$host}:{$port}" . THEME_BASE_PATH;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, VITE_CURL_TIMEOUT);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, VITE_CURL_TIMEOUT);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === VITE_HTTP_SUCCESS;
}

function moehser_is_development()
{
    if (defined('WP_ENV') && WP_ENV === 'development') {
        return true;
    }
    // Force development mode when Vite is running
    if (!is_admin() && moehser_is_vite_dev_server_running()) {
        return true;
    }
    return false;
}

// Helper function to get Vite dev server URL
// ------------------------------------------
function get_vite_dev_url($path = '') {
    return 'http://' . VITE_DEV_HOST . ':' . VITE_DEV_PORT . THEME_BASE_PATH . $path;
}

// Helper function to enqueue Vite client and React refresh
// --------------------------------------------------------
function enqueue_vite_dev_client() {
    $viteBase = THEME_BASE_PATH;
    
    // Vite client
    wp_enqueue_script(
        'vite-client',
        get_vite_dev_url('@vite/client'),
        [],
        null,
        true
    );

    // Expose profile data to window
    $avatar = (string) get_theme_mod('moehser_profile_avatar') ?: '';
    $github = (string) get_theme_mod('moehser_social_github') ?: '';
    $linkedin = (string) get_theme_mod('moehser_social_linkedin') ?: '';
    $email = (string) get_theme_mod('moehser_social_email') ?: '';
    
    $inline = 'window.__PROFILE_AVATAR_URL__ = ' . json_encode($avatar) . ';'
            . 'window.__PROFILE_GITHUB__ = ' . json_encode($github) . ';'
            . 'window.__PROFILE_LINKEDIN__ = ' . json_encode($linkedin) . ';'
            . 'window.__PROFILE_EMAIL__ = ' . json_encode($email) . ';'
            . 'window.__IS_FRONT_PAGE__ = ' . (is_front_page() ? 'true' : 'false') . ';';
    wp_add_inline_script('vite-client', $inline, 'after');

    // React Refresh Preamble
    $preamble = 'import RefreshRuntime from ' . json_encode(get_vite_dev_url('@react-refresh')) . ';'
        . 'RefreshRuntime.injectIntoGlobalHook(window);'
        . 'window.$RefreshReg$ = () => {};'
        . 'window.$RefreshSig$ = () => (type) => type;'
        . 'window.__vite_plugin_react_preamble_installed__ = true;';
    if (function_exists('wp_add_inline_script')) {
        wp_add_inline_script('vite-client', $preamble, 'before');
    }
}

// Helper function to enqueue Vite dev assets
// ------------------------------------------
function enqueue_vite_dev_assets() {
    $theme_handle = 'moehser-portfolio';
    $cacheBuster = '?v=' . time();
    
    // CSS in development mode
    wp_enqueue_style(
        $theme_handle . '-style',
        get_vite_dev_url('assets/src/scss/main.scss') . $cacheBuster,
        [],
        null
    );

    // Main JS entry
    wp_enqueue_script(
        $theme_handle . '-main',
        get_vite_dev_url('assets/src/js/main.jsx') . $cacheBuster,
        ['vite-client'],
        null,
        true
    );
    
    if (function_exists('wp_script_add_data')) {
        wp_script_add_data($theme_handle . '-main', 'type', 'module');
        wp_script_add_data('vite-client', 'type', 'module');
    }
}

// Helper function to enqueue Vite production assets
// ------------------------------------------------
function enqueue_vite_prod_assets() {
    $theme_handle = 'moehser-portfolio';
    $manifest_path = get_theme_file_path('assets/dist/manifest.json');
    
    if (!file_exists($manifest_path)) {
        return;
    }

    $manifest = json_decode(file_get_contents($manifest_path), true);
    $entry = $manifest['assets/src/js/main.jsx'] ?? null;
    if (!$entry) {
        return;
    }

    // CSS linked from entry
    if (!empty($entry['css']) && is_array($entry['css'])) {
        foreach ($entry['css'] as $index => $cssFile) {
            $style_handle = $theme_handle . '-style' . ($index ? '-' . $index : '');
            wp_enqueue_style(
                $style_handle,
                get_theme_file_uri('assets/dist/' . $cssFile),
                [],
                null
            );
        }
    }

    // JS entry
    $js_file = $entry['file'] ?? '';
    if ($js_file) {
        wp_enqueue_script(
            $theme_handle . '-main',
            get_theme_file_uri('assets/dist/' . $js_file),
            [],
            null,
            true
        );
        if (function_exists('wp_script_add_data')) {
            wp_script_add_data($theme_handle . '-main', 'type', 'module');
        }
    }
}

// Main Vite asset enqueue function
// --------------------------------
function moehser_enqueue_vite_assets()
{
    // No need to check for imprint page - CSS is loaded directly in template

    if (moehser_is_development()) {
        // Development mode: use Vite dev server
        enqueue_vite_dev_client();
        enqueue_vite_dev_assets();
        return;
    }

    // Production mode: use manifest
    enqueue_vite_prod_assets();
}

// Module script handles
// ---------------------
const MODULE_SCRIPT_HANDLES = [
    'vite-client',
    'moehser-portfolio-main',
];

// Force type="module" for Vite scripts (robust if wp_script_add_data does not work)
// ---------------------------------------------------------------------------------
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    if (in_array($handle, MODULE_SCRIPT_HANDLES, true)) {
        // Remove existing type attributes to avoid duplication
        $tag = preg_replace('/\s+type=("|\')[^"\']*(\1)/i', '', $tag);
        // Add type="module"
        $tag = str_replace('<script ', '<script type="module" ', $tag);
    }
    return $tag;
}, 10, 3);


