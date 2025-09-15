<?php

// Theme Customizer Settings for Moehser Portfolio
// ===============================================

if (!defined('ABSPATH')) {
    exit;
}

// Skills Cards Configuration
// -------------------------
const SKILLS_CARDS_CONFIG = [
    1 => [
        'title' => 'Frontend Development',
        'description' => '',
        'type' => 'list'
    ],
    2 => [
        'title' => 'Backend Development', 
        'description' => '',
        'type' => 'list'
    ],
    3 => [
        'title' => 'Design & UX',
        'description' => '',
        'type' => 'list'
    ],
    4 => [
        'title' => 'DevOps & Tools',
        'description' => 'Streamlining development workflows and deployment processes.',
        'type' => 'description'
    ],
    5 => [
        'title' => 'Mobile Development',
        'description' => 'Building native and cross-platform mobile applications.',
        'type' => 'description'
    ]
];

// Helper function to register skills cards
// ---------------------------------------
function register_skills_cards($wp_customize) {
    foreach (SKILLS_CARDS_CONFIG as $card_num => $config) {
        $card_id = "moehser_skills_card{$card_num}";
        
        // Enable/Disable control
        $wp_customize->add_setting("{$card_id}_enabled", [
            'default' => 1,
            'sanitize_callback' => 'absint',
            'transport' => 'postMessage',
        ]);
        $wp_customize->add_control("{$card_id}_enabled", [
            'label' => sprintf(__('Enable Card %d – %s Card', 'moehser-portfolio'), $card_num, ucfirst($config['type'])),
            'section' => 'moehser_skills',
            'type' => 'checkbox',
            'active_callback' => function () {
                return get_theme_mod('moehser_skills_layout_mode', 'fixed_grid') === 'adaptive_grid';
            },
        ]);
        
        // Title
        $wp_customize->add_setting("{$card_id}_title", [
            'default' => __($config['title'], 'moehser-portfolio'),
            'sanitize_callback' => 'wp_kses_post',
        ]);
        $wp_customize->add_control("{$card_id}_title", [
            'label' => sprintf(__('Skills Card %d - Title', 'moehser-portfolio'), $card_num),
            'section' => 'moehser_skills',
            'type' => 'text',
            'priority' => $card_num * 100,
        ]);
        
        // Description
        if ($config['type'] === 'description') {
            $wp_customize->add_setting("{$card_id}_description", [
                'default' => __($config['description'], 'moehser-portfolio'),
                'sanitize_callback' => 'wp_kses_post',
            ]);
            $wp_customize->add_control("{$card_id}_description", [
                'label' => sprintf(__('Skills Card %d - Description', 'moehser-portfolio'), $card_num),
                'section' => 'moehser_skills',
                'type' => 'textarea',
                'priority' => $card_num * 100 + 10,
            ]);
        }
        
        // Tags
        $wp_customize->add_setting("{$card_id}_tags", [
            'default' => '',
            'sanitize_callback' => 'sanitize_text_field',
        ]);
        $wp_customize->add_control("{$card_id}_tags", [
            'label' => sprintf(__('Skills Card %d - Tags (comma separated)', 'moehser-portfolio'), $card_num),
            'description' => __('Tags for this skill card. In Fixed Grid mode, max 3 tags are allowed.', 'moehser-portfolio'),
            'section' => 'moehser_skills',
            'type' => 'text',
            'priority' => $card_num * 100 + 20,
        ]);
        
        // Skills List
        if ($config['type'] === 'list') {
            $wp_customize->add_setting("{$card_id}_skills_list", [
                'default' => '',
                'sanitize_callback' => 'wp_kses_post',
            ]);
            $wp_customize->add_control("{$card_id}_skills_list", [
                'label' => sprintf(__('Skills Card %d - Skills List (comma separated)', 'moehser-portfolio'), $card_num),
                'description' => __('Skills list for this card. In Fixed Grid mode, max 3 items are allowed.', 'moehser-portfolio'),
                'section' => 'moehser_skills',
                'type' => 'textarea',
                'priority' => $card_num * 100 + 10,
            ]);
        }
    }
}

// Helper function to get skills cards data
// --------------------------------------
function get_skills_cards_data() {
    $cards_data = [];
    
    foreach (SKILLS_CARDS_CONFIG as $card_num => $config) {
        $card_id = "moehser_skills_card{$card_num}";
        $card_data = [
            'title' => get_theme_mod("{$card_id}_title", ''),
            'tags' => get_theme_mod("{$card_id}_tags", ''),
        ];
        
        // Add description
        if ($config['type'] === 'description') {
            $card_data['description'] = get_theme_mod("{$card_id}_description", '');
        }
        
        // Add skills_list
        if ($config['type'] === 'list') {
            $card_data['skills_list'] = get_theme_mod("{$card_id}_skills_list", '');
        }
        
        $cards_data["card{$card_num}"] = $card_data;
    }
    
    return $cards_data;
}

// Helper function to output JavaScript variables
// ---------------------------------------------
function output_js_variable($name, $value, $is_json = false) {
    if ($is_json) {
        echo "window.{$name} = " . wp_json_encode($value) . ";";
    } else {
        echo "window.{$name} = \"" . esc_js($value) . "\";";
    }
}

add_action('customize_register', function (WP_Customize_Manager $wp_customize) {
    // Section: Profile Settings
    $wp_customize->add_section('moehser_profile', [
        'title' => __('Profile Settings', 'moehser-portfolio'),
        'description' => __('Configure your personal profile and social links', 'moehser-portfolio'),
        'priority' => 30,
    ]);

    // Profile avatar (Media Upload)
    $wp_customize->add_setting('moehser_profile_avatar', [
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
    ]);
    $wp_customize->add_control(new WP_Customize_Image_Control($wp_customize, 'moehser_profile_avatar', [
        'label' => __('Profile Avatar', 'moehser-portfolio'),
        'description' => __('Upload or select your profile picture', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'settings' => 'moehser_profile_avatar',
    ]));

    // Social: GitHub
    $wp_customize->add_setting('moehser_social_github', [
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_social_github', [
        'label' => __('GitHub Username or URL', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'type' => 'text',
    ]);

    // Social: LinkedIn
    $wp_customize->add_setting('moehser_social_linkedin', [
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_social_linkedin', [
        'label' => __('LinkedIn Username or URL', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'type' => 'text',
    ]);

    // Social: Email
    $wp_customize->add_setting('moehser_social_email', [
        'default' => '',
        'sanitize_callback' => 'sanitize_email',
    ]);
    $wp_customize->add_control('moehser_social_email', [
        'label' => __('Contact Email', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'type' => 'email',
    ]);

    // Email Subject
    $wp_customize->add_setting('moehser_email_subject', [
        'default' => 'Portfolio Contact - New Inquiry',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_email_subject', [
        'label' => __('Email Subject Line', 'moehser-portfolio'),
        'description' => __('Default subject line for contact emails', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'type' => 'text',
    ]);

    // Business Email Subject
    $wp_customize->add_setting('moehser_business_email_subject', [
        'default' => 'Business Inquiry - Portfolio Contact',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_business_email_subject', [
        'label' => __('Business Email Subject Line', 'moehser-portfolio'),
        'description' => __('Subject line for business/legal inquiries from imprint page', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'type' => 'text',
    ]);

    // reCAPTCHA Site Key
    $wp_customize->add_setting('moehser_recaptcha_site_key', [
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_recaptcha_site_key', [
        'label' => __('reCAPTCHA Site Key', 'moehser-portfolio'),
        'description' => __('Google reCAPTCHA site key for contact form spam protection', 'moehser-portfolio'),
        'section' => 'moehser_profile',
        'type' => 'text',
    ]);

    // Section: About Settings
    $wp_customize->add_section('moehser_about', [
        'title' => __('About Settings', 'moehser-portfolio'),
        'description' => __('Configure the about section content', 'moehser-portfolio'),
        'priority' => 30,
    ]);

    // Section: Imprint Settings
    $wp_customize->add_section('moehser_imprint', [
        'title' => __('Imprint Page', 'moehser-portfolio'),
        'description' => __('Configure the Imprint page content', 'moehser-portfolio'),
        'priority' => 60,
    ]);

    // About Section Title
    $wp_customize->add_setting('moehser_about_title', [
        'default' => __('About Me', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);

    $wp_customize->add_control('moehser_about_title', [
        'label' => __('About Section Title', 'moehser-portfolio'),
        'description' => __('Main title for the about section', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'text',
    ]);

    // About Section Subtitle
    $wp_customize->add_setting('moehser_about_subtitle', [
        'default' => __('My story & experience', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);

    $wp_customize->add_control('moehser_about_subtitle', [
        'label' => __('About Section Subtitle', 'moehser-portfolio'),
        'description' => __('Subtitle below the main title', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'textarea',
    ]);

    // About content source page
    $wp_customize->add_setting('moehser_about_page_id', [
        'default' => 0,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_about_page_id', [
        'label' => __('About Content Page', 'moehser-portfolio'),
        'description' => __('Select the WordPress page used as the About content. The page\'s content will be rendered in the About section.', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'dropdown-pages',
        'allow_addition' => true,
    ]);

    // About CTA Enable/Disable
    $wp_customize->add_setting('moehser_about_cta_enabled', [
        'default' => 0,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_about_cta_enabled', [
        'label' => __('Enable CTA Button', 'moehser-portfolio'),
        'description' => __('Show a call-to-action button below the about content', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'checkbox',
    ]);

    // About CTA Button Text
    $wp_customize->add_setting('moehser_about_cta_text', [
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_about_cta_text', [
        'label' => __('CTA Button Text', 'moehser-portfolio'),
        'description' => __('Text displayed on the CTA button', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'text',
    ]);

    // About CTA Button URL
    $wp_customize->add_setting('moehser_about_cta_url', [
        'default' => '',
        'sanitize_callback' => 'esc_url_raw',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_about_cta_url', [
        'label' => __('CTA Button URL', 'moehser-portfolio'),
        'description' => __('URL the CTA button should link to', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'url',
    ]);

    // About CTA Email Subject
    $wp_customize->add_setting('moehser_about_cta_subject', [
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_about_cta_subject', [
        'label' => __('CTA Email Subject', 'moehser-portfolio'),
        'description' => __('Subject line for CTA email (when using mailto: URL)', 'moehser-portfolio'),
        'section' => 'moehser_about',
        'type' => 'text',
    ]);

    // Hero Section
    $wp_customize->add_section('moehser_hero', [
        'title' => __('Hero Section', 'moehser-portfolio'),
        'description' => __('Configure the hero section content', 'moehser-portfolio'),
        'priority' => 25,
    ]);


    // Hero Title
    $wp_customize->add_setting('moehser_hero_title', [
        'default' => '',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_hero_title', [
        'label' => __('Hero Title', 'moehser-portfolio'),
        'description' => __('Main title for the hero section', 'moehser-portfolio'),
        'section' => 'moehser_hero',
        'type' => 'text',
    ]);

    // Hero Subtitle
    $wp_customize->add_setting('moehser_hero_subtitle', [
        'default' => '',
        'sanitize_callback' => 'sanitize_textarea_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_hero_subtitle', [
        'label' => __('Hero Subtitle', 'moehser-portfolio'),
        'description' => __('Subtitle text for the hero section', 'moehser-portfolio'),
        'section' => 'moehser_hero',
        'type' => 'textarea',
    ]);


    // Imprint content source page
    $wp_customize->add_setting('moehser_imprint_page_id', [
        'default' => 0,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_imprint_page_id', [
        'label' => __('Imprint Content Page', 'moehser-portfolio'),
        'description' => __('Select a page to use as imprint content source', 'moehser-portfolio'),
        'section' => 'moehser_imprint',
        'type' => 'dropdown-pages',
    ]);

    // Section: Projects Settings
    $wp_customize->add_section('moehser_projects', [
        'title' => __('Projects Settings', 'moehser-portfolio'),
        'description' => __('Configure how projects are displayed and behave', 'moehser-portfolio'),
        'priority' => 33,
    ]);

    // Show Only Active Projects
    $wp_customize->add_setting('moehser_show_only_active_projects', [
        'default' => 1,
        'sanitize_callback' => function ($value) { return (int) (bool) $value; },
    ]);
    $wp_customize->add_control('moehser_show_only_active_projects', [
        'label' => __('Show Only Active Projects', 'moehser-portfolio'),
        'description' => __('Hide archived and development projects from the frontend (they remain visible in admin)', 'moehser-portfolio'),
        'section' => 'moehser_projects',
        'type' => 'checkbox',
    ]);

    // Projects Section Title
    $wp_customize->add_setting('moehser_projects_title', [
        'default' => __('Projects', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_projects_title', [
        'label' => __('Projects Section Title', 'moehser-portfolio'),
        'description' => __('Main title for the projects section', 'moehser-portfolio'),
        'section' => 'moehser_projects',
        'type' => 'text',
    ]);

    // Projects Section Subtitle
    $wp_customize->add_setting('moehser_projects_subtitle', [
        'default' => __('Subtitle below the main title', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_projects_subtitle', [
        'label' => __('Projects Section Subtitle', 'moehser-portfolio'),
        'description' => __('Subtitle below the main title', 'moehser-portfolio'),
        'section' => 'moehser_projects',
        'type' => 'text',
    ]);

    // Projects Layout Mode (add grid and list)
    $wp_customize->add_setting('moehser_projects_layout_mode', [
        'default' => 'side_by_side',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_projects_layout_mode', [
        'label' => __('Projects Layout Mode', 'moehser-portfolio'),
        'description' => __('Choose how projects are displayed: side-by-side for focus, grid/list for overview.', 'moehser-portfolio'),
        'section' => 'moehser_projects',
        'type' => 'select',
        'priority' => 1,
        'choices' => [
            'side_by_side' => __('Side by side (image left, details right)', 'moehser-portfolio'),
            'grid' => __('Grid with toggle (default: grid view)', 'moehser-portfolio'),
            'list' => __('List with toggle (default: list view)', 'moehser-portfolio'),
        ],
    ]);

    // Show Grid/List Toggle Option
    $wp_customize->add_setting('moehser_projects_show_view_toggle', [
        'default' => 1,
        'sanitize_callback' => function ($value) { return (int) (bool) $value; },
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_projects_show_view_toggle', [
        'label' => __('Show Grid/List Toggle', 'moehser-portfolio'),
        'description' => __('Allow users to switch between grid and list view', 'moehser-portfolio'),
        'section' => 'moehser_projects',
        'type' => 'checkbox',
        'priority' => 2,
        'active_callback' => function () {
            $layout_mode = get_theme_mod('moehser_projects_layout_mode', 'side_by_side');
            return in_array($layout_mode, ['grid', 'list']);
        },
    ]);


    // Section: Skills Settings
    $wp_customize->add_section('moehser_skills', [
        'title' => __('Skills Settings', 'moehser-portfolio'),
        'description' => __('Configure the skills section content and layout', 'moehser-portfolio'),
        'priority' => 32,
    ]);

    // Skills Section Title
    $wp_customize->add_setting('moehser_skills_title', [
        'default' => __('Skills', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_title', [
        'label' => __('Skills Section Title', 'moehser-portfolio'),
        'description' => __('Main title for the skills section', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    // Skills Section Subtitle
    $wp_customize->add_setting('moehser_skills_subtitle', [
        'default' => __('Technologies & tools I work with', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_subtitle', [
        'label' => __('Skills Section Subtitle', 'moehser-portfolio'),
        'description' => __('Subtitle below the main title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    // Skills Layout Mode
    $wp_customize->add_setting('moehser_skills_layout_mode', [
        'default' => 'fixed_grid',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_layout_mode', [
        'label' => __('Skills Layout Mode', 'moehser-portfolio'),
        'description' => __('Choose between fixed grid layout or adaptive responsive layout that automatically adjusts to screen size and content', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'select',
        'choices' => [
            'fixed_grid' => __('Fixed Grid 3+2 arrangement', 'moehser-portfolio'),
            'adaptive_grid' => __('Adaptive Grid (responsive layout)', 'moehser-portfolio'),
        ],
    ]);


    // Register all skills cards
    register_skills_cards($wp_customize);
});

// Pass Customizer values to frontend
// ==================================
add_action('wp_head', function () {
    echo '<script>';
    
    // About section data
    $about_title = get_theme_mod('moehser_about_title', '');
    $about_subtitle = get_theme_mod('moehser_about_subtitle', '');
    $about_page_id = (int) get_theme_mod('moehser_about_page_id', 0);
    $about_html = '';
    
    // Get about content from page if no custom title
    if (empty($about_title) && $about_page_id > 0) {
        $about_post = get_post($about_page_id);
        if ($about_post && $about_post->post_status === 'publish') {
            $about_title = $about_post->post_title;
        }
    }
    
    // Get about HTML content
    if ($about_page_id > 0) {
        $about_post = get_post($about_page_id);
        if ($about_post && $about_post->post_status === 'publish') {
            $about_html = apply_filters('the_content', $about_post->post_content);
        }
    }
    
    output_js_variable('__ABOUT_TITLE__', $about_title);
    output_js_variable('__ABOUT_SUBTITLE__', $about_subtitle);
    output_js_variable('__ABOUT_HTML__', $about_html, true);
    
    // About CTA settings
    $about_cta_enabled = get_theme_mod('moehser_about_cta_enabled', 0);
    $about_cta_text = get_theme_mod('moehser_about_cta_text', '');
    $about_cta_url = get_theme_mod('moehser_about_cta_url', '');
    $about_cta_subject = get_theme_mod('moehser_about_cta_subject', '');
    echo "window.__ABOUT_CTA_ENABLED__ = " . ($about_cta_enabled ? 'true' : 'false') . ";";
    output_js_variable('__ABOUT_CTA_TEXT__', $about_cta_text);
    output_js_variable('__ABOUT_CTA_URL__', $about_cta_url);
    output_js_variable('__ABOUT_CTA_SUBJECT__', $about_cta_subject);
    
    // Hero settings
    output_js_variable('__HERO_TITLE__', get_theme_mod('moehser_hero_title', ''));
    output_js_variable('__HERO_SUBTITLE__', get_theme_mod('moehser_hero_subtitle', ''));
    
    // Imprint settings
    $imprint_page_id = get_theme_mod('moehser_imprint_page_id', 0);
    $imprint_title = __('Impressum', 'moehser-portfolio');
    $imprint_content = '';
    
    if ($imprint_page_id > 0) {
        $imprint_page = get_post($imprint_page_id);
        if ($imprint_page) {
            $imprint_title = $imprint_page->post_title;
            $imprint_content = apply_filters('the_content', $imprint_page->post_content);
        }
    }
    
    output_js_variable('__IMPRINT_TITLE__', $imprint_title, true);
    output_js_variable('__IMPRINT_HTML__', $imprint_content, true);
    
    // Projects settings
    $show_only_active_projects = get_theme_mod('moehser_show_only_active_projects', 1);
    echo "window.__SHOW_ONLY_ACTIVE_PROJECTS__ = " . ($show_only_active_projects ? 'true' : 'false') . ";";
    output_js_variable('__PROJECTS_TITLE__', get_theme_mod('moehser_projects_title', ''), true);
    output_js_variable('__PROJECTS_SUBTITLE__', get_theme_mod('moehser_projects_subtitle', ''), true);
    output_js_variable('__PROJECTS_LAYOUT_MODE__', get_theme_mod('moehser_projects_layout_mode', 'side_by_side'));
    $projects_show_view_toggle = get_theme_mod('moehser_projects_show_view_toggle', 1);
    echo "window.__PROJECTS_SHOW_VIEW_TOGGLE__ = " . ($projects_show_view_toggle ? 'true' : 'false') . ";";
    
    // Skills settings
    output_js_variable('__SKILLS_TITLE__', get_theme_mod('moehser_skills_title', ''), true);
    output_js_variable('__SKILLS_SUBTITLE__', get_theme_mod('moehser_skills_subtitle', ''));
    output_js_variable('__SKILLS_LAYOUT_MODE__', get_theme_mod('moehser_skills_layout_mode', 'fixed_grid'));
    
    // Skills cards enabled status
    $cards_enabled = [];
    foreach (array_keys(SKILLS_CARDS_CONFIG) as $card_num) {
        $cards_enabled["c{$card_num}"] = get_theme_mod("moehser_skills_card{$card_num}_enabled", 1) ? true : false;
    }
    output_js_variable('__SKILLS_CARDS_ENABLED__', $cards_enabled, true);
    
    // Skills cards data
    $skills_cards = get_skills_cards_data();
    foreach ($skills_cards as $card_key => $card_data) {
        $card_number = str_replace('card', '', $card_key);
        output_js_variable("__SKILLS_CARD{$card_number}__", $card_data, true);
    }
    
    // Profile and social settings
    $profile_avatar = get_theme_mod('moehser_profile_avatar', '');
    $social_github = get_theme_mod('moehser_social_github', '');
    $social_linkedin = get_theme_mod('moehser_social_linkedin', '');
    $social_email = get_theme_mod('moehser_social_email', '');
    $email_subject = get_theme_mod('moehser_email_subject', 'Portfolio Contact - New Inquiry');
    
    if ($profile_avatar) output_js_variable('__PROFILE_AVATAR_URL__', $profile_avatar);
    if ($social_github) output_js_variable('__SOCIAL_GITHUB__', $social_github);
    if ($social_linkedin) output_js_variable('__SOCIAL_LINKEDIN__', $social_linkedin);
    if ($social_email) output_js_variable('__SOCIAL_EMAIL__', $social_email);
    if ($email_subject) output_js_variable('__EMAIL_SUBJECT__', $email_subject);
    
    // Contact form settings
    $business_email_subject = get_theme_mod('moehser_business_email_subject', 'Business Inquiry - Portfolio Contact');
    $recaptcha_site_key = get_theme_mod('moehser_recaptcha_site_key', '');
    if ($business_email_subject) output_js_variable('__BUSINESS_EMAIL_SUBJECT__', $business_email_subject);
    if ($recaptcha_site_key) output_js_variable('__RECAPTCHA_SITE_KEY__', $recaptcha_site_key);
    
    echo '</script>';
});
