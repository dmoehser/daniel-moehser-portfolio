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
// SEO Meta Descriptions
add_action('wp_head', function() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_german = strpos($request_uri, '/de/') !== false;
    
    // Homepage Meta Description
    if (is_home() || is_front_page()) {
        $description = $is_german 
            ? 'Daniel Moehser - Full-Stack Entwickler Portfolio. Zeigt Webentwicklungsprojekte, Fähigkeiten und Erfahrung in React, WordPress, PHP und modernen Technologien.'
            : 'Daniel Moehser - Full-Stack Developer Portfolio. Showcasing web development projects, skills and experience in React, WordPress, PHP and modern technologies.';
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
    }
    
    // Imprint Page Meta Description
    if (strpos($request_uri, '/imprint') !== false) {
        $description = $is_german
            ? 'Impressum von Daniel Moehser - Rechtliche Informationen, Kontaktdaten und Datenschutzhinweise für das Portfolio.'
            : 'Imprint of Daniel Moehser - Legal information, contact details and privacy policy for the portfolio.';
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
    }
}, 1);

// Open Graph Meta Tags
add_action('wp_head', function() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_german = strpos($request_uri, '/de/') !== false;
    $site_url = home_url();
    $current_url = home_url($request_uri);
    
    // Get site name and description
    $site_name = get_bloginfo('name');
    $site_description = $is_german 
        ? 'Full-Stack Entwickler Portfolio - Daniel Moehser'
        : 'Full-Stack Developer Portfolio - Daniel Moehser';
    
    // Page-specific content
    if (is_home() || is_front_page()) {
        $og_title = $is_german ? 'Daniel Moehser - Full-Stack Entwickler' : 'Daniel Moehser - Full-Stack Developer';
        $og_description = $is_german 
            ? 'Portfolio mit Webentwicklungsprojekten, Fähigkeiten und Erfahrung in React, WordPress, PHP und modernen Technologien.'
            : 'Portfolio showcasing web development projects, skills and experience in React, WordPress, PHP and modern technologies.';
    } else {
        $og_title = $is_german ? 'Impressum - Daniel Moehser' : 'Imprint - Daniel Moehser';
        $og_description = $is_german 
            ? 'Rechtliche Informationen und Kontaktdaten für das Portfolio von Daniel Moehser.'
            : 'Legal information and contact details for Daniel Moehser\'s portfolio.';
    }
    
    // Use profile avatar from customizer as default image
    $profile_avatar = get_theme_mod('moehser_profile_avatar', '');
    $og_image = $profile_avatar ?: $site_url . '/wp-content/themes/moehser-portfolio/assets/dist/images/og-default.jpg';
    
    echo '<!-- Open Graph Meta Tags -->' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($og_title) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($og_description) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($current_url) . '">' . "\n";
    echo '<meta property="og:image" content="' . esc_url($og_image) . '">' . "\n";
    echo '<meta property="og:image:width" content="1200">' . "\n";
    echo '<meta property="og:image:height" content="630">' . "\n";
    echo '<meta property="og:locale" content="' . ($is_german ? 'de_DE' : 'en_US') . '">' . "\n";
}, 2);

// Twitter Cards
add_action('wp_head', function() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_german = strpos($request_uri, '/de/') !== false;
    $site_url = home_url();
    
    // Twitter Card content
    $twitter_title = $is_german ? 'Daniel Moehser - Full-Stack Entwickler' : 'Daniel Moehser - Full-Stack Developer';
    $twitter_description = $is_german 
        ? 'Portfolio mit Webentwicklungsprojekten, Fähigkeiten und Erfahrung in React, WordPress, PHP und modernen Technologien.'
        : 'Portfolio showcasing web development projects, skills and experience in React, WordPress, PHP and modern technologies.';
    // Use profile avatar from customizer as Twitter image
    $profile_avatar = get_theme_mod('moehser_profile_avatar', '');
    $twitter_image = $profile_avatar ?: $site_url . '/wp-content/themes/moehser-portfolio/assets/dist/images/og-default.jpg';
    
    echo '<!-- Twitter Card Meta Tags -->' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:site" content="@danielmoehser">' . "\n";
    echo '<meta name="twitter:creator" content="@danielmoehser">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($twitter_title) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($twitter_description) . '">' . "\n";
    echo '<meta name="twitter:image" content="' . esc_url($twitter_image) . '">' . "\n";
}, 3);

// Canonical URLs
add_action('wp_head', function() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    
    // Remove query parameters for canonical URL
    $canonical_path = strtok($request_uri, '?');
    $canonical_url = home_url($canonical_path);
    
    echo '<link rel="canonical" href="' . esc_url($canonical_url) . '">' . "\n";
}, 4);

// JSON-LD Structured Data
add_action('wp_head', function() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_german = strpos($request_uri, '/de/') !== false;
    $site_url = home_url();
    $current_url = home_url($request_uri);
    
    // Person Schema
    $person_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Person',
        'name' => 'Daniel Moehser',
        'url' => $site_url,
        'jobTitle' => $is_german ? 'Full-Stack Entwickler' : 'Full-Stack Developer',
        'description' => $is_german 
            ? 'Full-Stack Entwickler mit Erfahrung in React, WordPress, PHP und modernen Web-Technologien.'
            : 'Full-Stack Developer with experience in React, WordPress, PHP and modern web technologies.',
        'sameAs' => [
            'https://github.com/dmoehser',
            'https://linkedin.com/in/danielmoehser'
        ],
        'knowsAbout' => [
            'JavaScript', 'React', 'WordPress', 'PHP', 'Node.js', 
            'SCSS', 'HTML5', 'CSS3', 'MySQL', 'Git'
        ]
    ];
    
    // Organization Schema
    $organization_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'Daniel Moehser Portfolio',
        'url' => $site_url,
        'founder' => [
            '@type' => 'Person',
            'name' => 'Daniel Moehser'
        ],
        'description' => $is_german 
            ? 'Portfolio-Website von Daniel Moehser - Full-Stack Entwickler'
            : 'Portfolio website of Daniel Moehser - Full-Stack Developer'
    ];
    
    // WebSite Schema with SearchAction
    $website_schema = [
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => get_bloginfo('name'),
        'url' => $site_url,
        'description' => $is_german 
            ? 'Portfolio-Website von Daniel Moehser - Full-Stack Entwickler'
            : 'Portfolio website of Daniel Moehser - Full-Stack Developer',
        'author' => [
            '@type' => 'Person',
            'name' => 'Daniel Moehser'
        ],
        'inLanguage' => $is_german ? 'de' : 'en'
    ];
    
    echo '<!-- JSON-LD Structured Data -->' . "\n";
    echo '<script type="application/ld+json">' . wp_json_encode($person_schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
    echo '<script type="application/ld+json">' . wp_json_encode($organization_schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
    echo '<script type="application/ld+json">' . wp_json_encode($website_schema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>' . "\n";
}, 5);

// Auto Language Redirect based on Browser Language
// ----------------------------------------------
add_action('template_redirect', 'auto_language_redirect');

// Debug Admin Redirect Issues
// ---------------------------
add_action('template_redirect', 'debug_admin_redirects', 1);

function debug_admin_redirects() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    error_log('DEBUG ADMIN: Request URI: ' . $request_uri);
    error_log('DEBUG ADMIN: is_admin: ' . (is_admin() ? 'true' : 'false'));
    error_log('DEBUG ADMIN: HTTP_HOST: ' . ($_SERVER['HTTP_HOST'] ?? 'unknown'));
    error_log('DEBUG ADMIN: SERVER_NAME: ' . ($_SERVER['SERVER_NAME'] ?? 'unknown'));
    
    if (strpos($request_uri, '/wp-admin') !== false) {
        error_log('DEBUG ADMIN: wp-admin request detected');
        error_log('DEBUG ADMIN: Current blog ID: ' . get_current_blog_id());
        error_log('DEBUG ADMIN: Site URL: ' . get_site_url());
        error_log('DEBUG ADMIN: Home URL: ' . get_home_url());
    }
}

function auto_language_redirect() {
    // DEBUG: Log all redirect attempts
    error_log('DEBUG: auto_language_redirect called for: ' . ($_SERVER['REQUEST_URI'] ?? 'unknown'));
    error_log('DEBUG: is_home: ' . (is_home() ? 'true' : 'false') . ', is_front_page: ' . (is_front_page() ? 'true' : 'false'));
    error_log('DEBUG: is_admin: ' . (is_admin() ? 'true' : 'false') . ', is_customize_preview: ' . (is_customize_preview() ? 'true' : 'false'));
    
    // Only redirect on homepage, not on subpages or admin
    if (!is_home() && !is_front_page()) {
        error_log('DEBUG: Not homepage, returning');
        return;
    }
    
    // Don't redirect in admin or customize preview
    if (is_admin() || is_customize_preview()) {
        error_log('DEBUG: Admin or customize preview, returning');
        return;
    }
    
    // Don't redirect on wp-admin pages (multisite fix)
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($request_uri, '/wp-admin') !== false) {
        error_log('DEBUG: wp-admin detected in URI, returning');
        return;
    }
    
    // Don't redirect if already on German page
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    error_log('DEBUG: Request URI: ' . $request_uri);
    if (strpos($request_uri, '/de/') !== false) {
        error_log('DEBUG: Already on German page, returning');
        return;
    }
    
    // Check if user has manually chosen a language via URL parameters
    if (isset($_GET['lang'])) {
        if ($_GET['lang'] === 'en') {
            // User explicitly chose English - redirect to clean URL without parameters
            wp_redirect(home_url('/'), 302);
            exit;
        } elseif ($_GET['lang'] === 'de') {
            // User explicitly chose German - redirect to German homepage
            wp_redirect('/de/', 302);
            exit;
        }
        return; // Don't auto-redirect if manual language selection
    }
    
    // Don't redirect if user explicitly disabled auto-redirect
    if (isset($_GET['no-redirect'])) {
        return;
    }
    
    // Add JavaScript to check localStorage for manual language preference
    // This will run before the auto-redirect logic
    ?>
    <script>
    (function() {
        // Check if user has manually set language preference
        const userPref = localStorage.getItem('user_language_preference');
        if (userPref === 'en') {
            // User previously chose English, don't auto-redirect
            return;
        }
        
        // Only proceed with auto-redirect if no manual preference or preference is German
        if (userPref === 'de' || !userPref) {
            // Get browser language preferences
            const acceptLanguage = navigator.language || navigator.userLanguage || '';
            
            // Check if German is preferred language
            const germanVariants = ['de', 'de-DE', 'de-AT', 'de-CH', 'de-LU', 'de-LI'];
            const isGermanPreferred = germanVariants.some(variant => 
                acceptLanguage.startsWith(variant) || 
                acceptLanguage.includes(variant + ',') ||
                acceptLanguage.includes(variant + ';')
            );
            
            // Redirect to German homepage if German is preferred
            if (isGermanPreferred) {
                window.location.href = '/de/';
            }
        }
    })();
    </script>
    <?php
}

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


