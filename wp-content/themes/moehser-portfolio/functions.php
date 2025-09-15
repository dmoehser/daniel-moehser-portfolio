<?php

// Theme Functions
// ===============
// Main theme functionality and configuration

// Configuration constants
// ----------------------
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const PROJECT_IMAGE_WIDTH = 1440;
const PROJECT_IMAGE_HEIGHT = 810;
const PROJECT_IMAGE_WIDTH_2X = 2880;
const PROJECT_IMAGE_HEIGHT_2X = 1620;
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;
const URL_WATCHER_INTERVAL = 25; // milliseconds
const URL_WATCHER_TIMEOUT = 60000; // 60 seconds

// Helper functions
// ---------------
function is_german_request() {
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    return strpos($request_uri, '/de/') !== false;
}

function get_meta_description($is_german, $type = 'homepage') {
    $descriptions = [
        'homepage' => [
            'en' => 'Daniel Moehser - Full-Stack Developer Portfolio. Showcasing web development projects, skills and experience in React, WordPress, PHP and modern technologies.',
            'de' => 'Daniel Moehser - Full-Stack Entwickler Portfolio. Zeigt Webentwicklungsprojekte, Fähigkeiten und Erfahrung in React, WordPress, PHP und modernen Technologien.'
        ],
        'imprint' => [
            'en' => 'Imprint of Daniel Moehser - Legal information, contact details and privacy policy for the portfolio.',
            'de' => 'Impressum von Daniel Moehser - Rechtliche Informationen, Kontaktdaten und Datenschutzhinweise für das Portfolio.'
        ]
    ];
    
    return $descriptions[$type][$is_german ? 'de' : 'en'] ?? '';
}

function get_og_content($is_german, $type = 'homepage') {
    $content = [
        'homepage' => [
            'title' => [
                'en' => 'Daniel Moehser - Full-Stack Developer',
                'de' => 'Daniel Moehser - Full-Stack Entwickler'
            ],
            'description' => [
                'en' => 'Portfolio showcasing web development projects, skills and experience in React, WordPress, PHP and modern technologies.',
                'de' => 'Portfolio mit Webentwicklungsprojekten, Fähigkeiten und Erfahrung in React, WordPress, PHP und modernen Technologien.'
            ]
        ],
        'imprint' => [
            'title' => [
                'en' => 'Imprint - Daniel Moehser',
                'de' => 'Impressum - Daniel Moehser'
            ],
            'description' => [
                'en' => 'Legal information and contact details for Daniel Moehser\'s portfolio.',
                'de' => 'Rechtliche Informationen und Kontaktdaten für das Portfolio von Daniel Moehser.'
            ]
        ]
    ];
    
    $lang = $is_german ? 'de' : 'en';
    return [
        'title' => $content[$type]['title'][$lang] ?? '',
        'description' => $content[$type]['description'][$lang] ?? ''
    ];
}

// Theme setup
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    
    // Project images: unified wide crop for consistent UI & better LCP
    add_image_size('project_wide', PROJECT_IMAGE_WIDTH, PROJECT_IMAGE_HEIGHT, true);
    add_image_size('project_wide_2x', PROJECT_IMAGE_WIDTH_2X, PROJECT_IMAGE_HEIGHT_2X, true);
    
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
                       strpos($request_uri, '/de/imprint') !== false;
    
    if ($is_imprint_page) {
        status_header(200);
        
        $is_german = is_german_request();
        $title = $is_german ? 'Impressum' : 'Imprint';
        
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


// Client-side cleanup for customize_changeset_uuid - robust solution
// SEO Meta Descriptions
// ---------------------
add_action('wp_head', function() {
    $is_german = is_german_request();
    
    // Homepage Meta Description
    if (is_home() || is_front_page()) {
        $description = get_meta_description($is_german, 'homepage');
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
    }
    
    // Imprint Page Meta Description
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    if (strpos($request_uri, '/imprint') !== false) {
        $description = get_meta_description($is_german, 'imprint');
        echo '<meta name="description" content="' . esc_attr($description) . '">' . "\n";
    }
}, 1);

// Open Graph Meta Tags
// --------------------
add_action('wp_head', function() {
    $is_german = is_german_request();
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $site_url = home_url();
    $current_url = home_url($request_uri);
    
    // Get site name and description
    $site_name = get_bloginfo('name');
    $site_description = $is_german 
        ? 'Full-Stack Entwickler Portfolio - Daniel Moehser'
        : 'Full-Stack Developer Portfolio - Daniel Moehser';
    
    // Page-specific content
    $page_type = (is_home() || is_front_page()) ? 'homepage' : 'imprint';
    $og_content = get_og_content($is_german, $page_type);
    
    // Use profile avatar from customizer as default image
    $profile_avatar = get_theme_mod('moehser_profile_avatar', '');
    $og_image = $profile_avatar ?: $site_url . '/wp-content/themes/moehser-portfolio/assets/dist/images/og-default.jpg';
    
    echo '<!-- Open Graph Meta Tags -->' . "\n";
    echo '<meta property="og:type" content="website">' . "\n";
    echo '<meta property="og:site_name" content="' . esc_attr($site_name) . '">' . "\n";
    echo '<meta property="og:title" content="' . esc_attr($og_content['title']) . '">' . "\n";
    echo '<meta property="og:description" content="' . esc_attr($og_content['description']) . '">' . "\n";
    echo '<meta property="og:url" content="' . esc_url($current_url) . '">' . "\n";
    echo '<meta property="og:image" content="' . esc_url($og_image) . '">' . "\n";
    echo '<meta property="og:image:width" content="' . OG_IMAGE_WIDTH . '">' . "\n";
    echo '<meta property="og:image:height" content="' . OG_IMAGE_HEIGHT . '">' . "\n";
    echo '<meta property="og:locale" content="' . ($is_german ? 'de_DE' : 'en_US') . '">' . "\n";
}, 2);

// Twitter Cards
// ------------
add_action('wp_head', function() {
    $is_german = is_german_request();
    $site_url = home_url();
    
    // Twitter Card content
    $twitter_content = get_og_content($is_german, 'homepage');
    
    // Use profile avatar from customizer as Twitter image
    $profile_avatar = get_theme_mod('moehser_profile_avatar', '');
    $twitter_image = $profile_avatar ?: $site_url . '/wp-content/themes/moehser-portfolio/assets/dist/images/og-default.jpg';
    
    echo '<!-- Twitter Card Meta Tags -->' . "\n";
    echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
    echo '<meta name="twitter:site" content="@danielmoehser">' . "\n";
    echo '<meta name="twitter:creator" content="@danielmoehser">' . "\n";
    echo '<meta name="twitter:title" content="' . esc_attr($twitter_content['title']) . '">' . "\n";
    echo '<meta name="twitter:description" content="' . esc_attr($twitter_content['description']) . '">' . "\n";
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
// -----------------------
add_action('wp_head', function() {
    $is_german = is_german_request();
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
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

function auto_language_redirect() {
    if (!is_home() && !is_front_page()) return;
    if (is_admin() || is_customize_preview()) return;
    
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    if (is_german_request()) return;
    
    if (isset($_GET['lang'])) {
        if ($_GET['lang'] === 'en') {
            wp_redirect(home_url('/'), 302);
            exit;
        } elseif ($_GET['lang'] === 'de') {
            wp_redirect('/de/', 302);
            exit;
        }
        return;
    }
    
    if (isset($_GET['no-redirect'])) return;
    
    ?>
    <script>
    (function() {
        const userPref = localStorage.getItem('user_language_preference');
        if (userPref === 'en') return;
        
        if (userPref === 'de' || !userPref) {
            const acceptLanguage = navigator.language || navigator.userLanguage || '';
            const germanVariants = ['de', 'de-DE', 'de-AT', 'de-CH', 'de-LU', 'de-LI'];
            const isGermanPreferred = germanVariants.some(variant => 
                acceptLanguage.startsWith(variant) || 
                acceptLanguage.includes(variant + ',') ||
                acceptLanguage.includes(variant + ';')
            );
            
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
        $watcher_interval = URL_WATCHER_INTERVAL;
        $watcher_timeout = URL_WATCHER_TIMEOUT;
        
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
            }, ' . $watcher_interval . '); // Check every 25ms for faster response
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
        }, ' . $watcher_timeout . ');
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
// ----------------------------------------
add_filter('upload_size_limit', function($limit) {
    // Increase limit to 5MB for all uploads in Customizer and Admin
    if (is_customize_preview() || is_admin()) {
        return MAX_UPLOAD_SIZE;
    }
    return $limit;
});

// Additional WordPress Media Library filter
// -----------------------------------------
add_filter('wp_handle_upload', function($upload) {
    // Allow larger files for images in general
    if (strpos($upload['type'], 'image/') === 0) {
        if ($upload['file'] && filesize($upload['file']) <= MAX_UPLOAD_SIZE) {
            return $upload;
        }
    }
    return $upload;
});

// Additional filter for WordPress Media Library
// --------------------------------------------
add_filter('wp_handle_upload_prefilter', function($file) {
    // Special handling for avatar uploads
    if (isset($_REQUEST['customize_theme']) && strpos($file['name'], 'avatar') !== false) {
        if ($file['size'] > MAX_UPLOAD_SIZE) {
            $file['error'] = sprintf(
                'Avatar file is too large (%s). Maximum allowed size: %s.',
                size_format($file['size']),
                size_format(MAX_UPLOAD_SIZE)
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

// Multisite URL Fixes
// ===================
if (is_multisite()) {
    // Fix home_url for multisite subdirectory sites
    add_filter('home_url', function($url, $path, $scheme, $blog_id) {
        if (is_multisite() && get_current_blog_id() > 1) {
            $site_url = get_site_url();
            if ($path) {
                return $site_url . '/' . ltrim($path, '/');
            }
            return $site_url;
        }
        return $url;
    }, 1, 4);

    // Force absolute URLs for multisite (removed to prevent infinite loops)

    // Fix wp-includes URLs for multisite
    add_filter('includes_url', function($url, $path) {
        if (get_current_blog_id() > 1) {
            $site_url = get_site_url();
            return $site_url . '/wp-includes/' . $path;
        }
        return $url;
    }, 1, 2);

    // Fix content URLs for multisite
    add_filter('content_url', function($url, $path, $blog_id = null) {
        if (is_multisite() && get_current_blog_id() > 1) {
            $site_url = get_site_url();
            return $site_url . '/wp-content' . $path;
        }
        return $url;
    }, 10, 3);

    // Fix plugins URLs for multisite
    add_filter('plugins_url', function($url, $path, $plugin) {
        if (get_current_blog_id() > 1) {
            $site_url = get_site_url();
            return $site_url . '/wp-content/plugins/' . $path;
        }
        return $url;
    }, 10, 3);

    // Fix admin URLs for multisite
    add_filter('admin_url', function($url, $path, $blog_id) {
        if ($blog_id > 1) {
            $site_url = get_site_url($blog_id);
            return $site_url . '/wp-admin/' . $path;
        }
        return $url;
    }, 10, 3);

    // Fix script and style URLs for multisite
    add_filter('script_loader_src', function($src, $handle) {
        if (get_current_blog_id() > 1) {
            $site_url = get_site_url();
            // Fix relative URLs that start with wp-includes
            if (strpos($src, 'wp-includes/') === 0) {
                $src = $site_url . '/' . $src;
            }
            // Fix relative URLs that start with wp-content
            if (strpos($src, 'wp-content/') === 0) {
                $src = $site_url . '/' . $src;
            }
            // Fix relative URLs that start with /
            if (strpos($src, '/') === 0 && strpos($src, '//') !== 0) {
                $src = $site_url . $src;
            }
            // Fix URLs that don't have the site URL prefix
            if (strpos($src, $site_url) !== 0 && strpos($src, '//') === 0) {
                $src = $site_url . '/' . ltrim($src, '/');
            }
        }
        return $src;
    }, 1, 2);

    add_filter('style_loader_src', function($src, $handle) {
        if (get_current_blog_id() > 1) {
            $site_url = get_site_url();
            // Fix relative URLs that start with wp-includes
            if (strpos($src, 'wp-includes/') === 0) {
                $src = $site_url . '/' . $src;
            }
            // Fix relative URLs that start with wp-content
            if (strpos($src, 'wp-content/') === 0) {
                $src = $site_url . '/' . $src;
            }
            // Fix relative URLs that start with /
            if (strpos($src, '/') === 0 && strpos($src, '//') !== 0) {
                $src = $site_url . $src;
            }
            // Fix URLs that don't have the site URL prefix
            if (strpos($src, $site_url) !== 0 && strpos($src, '//') === 0) {
                $src = $site_url . '/' . ltrim($src, '/');
            }
        }
        return $src;
    }, 1, 2);
}


