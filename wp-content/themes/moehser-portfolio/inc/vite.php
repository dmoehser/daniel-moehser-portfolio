<?php

function moehser_is_vite_dev_server_running($host = 'localhost', $port = 5173)
{
    // Try multiple methods to check if Vite is running
    $connection = @fsockopen($host, $port, $errno, $errstr, 0.2);
    if (is_resource($connection)) {
        fclose($connection);
        return true;
    }
    
    // Fallback: try curl to check if Vite is responding
    $url = "http://{$host}:{$port}/wp-content/themes/moehser-portfolio/";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 1);
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 200;
}

function moehser_is_development()
{
    if (defined('WP_ENV') && WP_ENV === 'development') {
        return true;
    }
    // Force development mode when Vite is running
    if (!is_admin()) {
        return true;
    }
    return false;
}

function moehser_enqueue_vite_assets()
{
    $theme_handle = 'moehser-portfolio';

    if (moehser_is_development()) {
        // Vite dev server
        $viteBase = '/wp-content/themes/moehser-portfolio/';
        $cacheBuster = '?v=' . time();
        // Attention: no cache buster for @vite/client, otherwise internal defines (e.g. __HMR_CONFIG_NAME__) will be missing.
        wp_enqueue_script(
            'vite-client',
            'http://localhost:5173' . $viteBase . '@vite/client',
            [],
            null,
            true
        );

        // Expose optional profile avatar URL to window
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

        // React Refresh Preamble direkt VOR dem vite-client einfügen
        // Wichtig: @react-refresh darf KEINE Query-Parameter haben, sonst 404
        $preamble = 'import RefreshRuntime from ' . json_encode('http://localhost:5173' . $viteBase . '@react-refresh') . ';'
            . 'RefreshRuntime.injectIntoGlobalHook(window);'
            . 'window.$RefreshReg$ = () => {};'
            . 'window.$RefreshSig$ = () => (type) => type;'
            . 'window.__vite_plugin_react_preamble_installed__ = true;';
        if (function_exists('wp_add_inline_script')) {
            wp_add_inline_script('vite-client', $preamble, 'before');
        }

        // Important: In vite.config.js, base is set to "/wp-content/themes/moehser-portfolio/".
        // Therefore, all dev URLs must contain the base, otherwise 404 → white page.
        $devEntry = 'http://localhost:5173' . $viteBase . 'assets/src/js/main.jsx' . $cacheBuster;

        wp_enqueue_script(
            $theme_handle . '-main',
            $devEntry,
            ['vite-client'],
            null,
            true
        );
        if (function_exists('wp_script_add_data')) {
            wp_script_add_data($theme_handle . '-main', 'type', 'module');
            wp_script_add_data('vite-client', 'type', 'module');
        }
        return;
    }

    // Production: read manifest
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

// Force type="module" for Vite scripts (robust if wp_script_add_data does not work)
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    $moduleHandles = [
        'vite-client',
        'moehser-portfolio-main',
    ];
    if (in_array($handle, $moduleHandles, true)) {
        // Remove existing type attributes to avoid duplication
        $tag = preg_replace('/\s+type=("|\')[^"\']*(\1)/i', '', $tag);
        // Add type="module"
        $tag = str_replace('<script ', '<script type="module" ', $tag);
    }
    return $tag;
}, 10, 3);


