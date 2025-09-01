<?php
/**
 * Theme Customizer Settings for Moehser Portfolio
 */

if (!defined('ABSPATH')) {
    exit;
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

    // Section: About Settings
    $wp_customize->add_section('moehser_about', [
        'title' => __('About Settings', 'moehser-portfolio'),
        'description' => __('Configure the about section content', 'moehser-portfolio'),
        'priority' => 30,
    ]);

    // About Section Title
    $wp_customize->add_setting('moehser_about_title', [
        'default' => __('About Me', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
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

    // Section: Projects Settings
    $wp_customize->add_section('moehser_projects', [
        'title' => __('Projects Settings', 'moehser-portfolio'),
        'description' => __('Configure how projects are displayed and behave', 'moehser-portfolio'),
        'priority' => 32,
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
        'default' => __('Projekte', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
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

    // Projects Layout Mode (future-proof, currently only side-by-side)
    $wp_customize->add_setting('moehser_projects_layout_mode', [
        'default' => 'side_by_side',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_projects_layout_mode', [
        'label' => __('Projects Layout Mode', 'moehser-portfolio'),
        'description' => __('Choose how projects are visually arranged. Currently only Side by side is available.', 'moehser-portfolio'),
        'section' => 'moehser_projects',
        'type' => 'select',
        'choices' => [
            'side_by_side' => __('Side by side (image left, details right)', 'moehser-portfolio'),
        ],
    ]);

    // Section: Skills Settings
    $wp_customize->add_section('moehser_skills', [
        'title' => __('Skills Settings', 'moehser-portfolio'),
        'description' => __('Configure the skills section content and layout', 'moehser-portfolio'),
        'priority' => 33,
    ]);

    // Skills Section Title
    $wp_customize->add_setting('moehser_skills_title', [
        'default' => __('Skills', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
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
            'fixed_grid' => __('Fixed Grid (3+2 arrangement)', 'moehser-portfolio'),
            'adaptive_grid' => __('Adaptive Grid (responsive layout)', 'moehser-portfolio'),
        ],
    ]);

    // Adaptive density (spacing/font sizing)
    $wp_customize->add_setting('moehser_skills_density', [
        'default' => 'normal',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_density', [
        'label' => __('Adaptive Density', 'moehser-portfolio'),
        'description' => __('Controls spacing and text size in Adaptive Grid (normal, compact, tight).', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'select',
        'choices' => [
            'normal' => __('Normal', 'moehser-portfolio'),
            'compact' => __('Compact', 'moehser-portfolio'),
            'tight' => __('Tight', 'moehser-portfolio'),
        ],
        'active_callback' => function () { return get_theme_mod('moehser_skills_layout_mode', 'fixed_grid') === 'adaptive_grid'; },
    ]);

    // Enable/Disable cards (only when adaptive mode is active)
    $enable_control_active_cb = function () {
        return get_theme_mod('moehser_skills_layout_mode', 'fixed_grid') === 'adaptive_grid';
    };

    $wp_customize->add_setting('moehser_skills_card1_enabled', [
        'default' => 1,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_card1_enabled', [
        'label' => __('Enable Card 1 – List Card', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'checkbox',
        'active_callback' => $enable_control_active_cb,
    ]);

    $wp_customize->add_setting('moehser_skills_card2_enabled', [
        'default' => 1,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_card2_enabled', [
        'label' => __('Enable Card 2 – List Card', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'checkbox',
        'active_callback' => $enable_control_active_cb,
    ]);

    $wp_customize->add_setting('moehser_skills_card3_enabled', [
        'default' => 1,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_card3_enabled', [
        'label' => __('Enable Card 3 – List Card', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'checkbox',
        'active_callback' => $enable_control_active_cb,
    ]);

    $wp_customize->add_setting('moehser_skills_card4_enabled', [
        'default' => 1,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_card4_enabled', [
        'label' => __('Enable Card 4 – Description Card', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'checkbox',
        'active_callback' => $enable_control_active_cb,
    ]);

    $wp_customize->add_setting('moehser_skills_card5_enabled', [
        'default' => 1,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_skills_card5_enabled', [
        'label' => __('Enable Card 5 – Description Card', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'checkbox',
        'active_callback' => $enable_control_active_cb,
    ]);

    // Skills Card 1
    $wp_customize->add_setting('moehser_skills_card1_title', [
        'default' => __('Frontend Development', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card1_title', [
        'label' => __('Skills Card 1 - Title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 100,
    ]);



    $wp_customize->add_setting('moehser_skills_card1_tags', [
        'default' => 'React, JavaScript, CSS, HTML',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card1_tags', [
        'label' => __('Skills Card 1 - Tags (comma separated)', 'moehser-portfolio'),
        'description' => __('Tags for this skill card. In Fixed Grid mode, max 3 tags are allowed.', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 120,
    ]);

    $wp_customize->add_setting('moehser_skills_card1_skills_list', [
        'default' => 'React + Vite + TypeScript, Animations with Framer Motion, Accessibility & Core Web Vitals',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card1_skills_list', [
        'label' => __('Skills Card 1 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Skills list for this card. In Fixed Grid mode, max 3 items are allowed.', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
        'priority' => 110,
    ]);

    // Skills Card 2
    $wp_customize->add_setting('moehser_skills_card2_title', [
        'default' => __('Backend Development', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card2_title', [
        'label' => __('Skills Card 2 - Title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 200,
    ]);

 

    $wp_customize->add_setting('moehser_skills_card2_tags', [
        'default' => 'Node.js, PHP, MySQL, WordPress',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card2_tags', [
        'label' => __('Skills Card 2 - Tags (comma separated)', 'moehser-portfolio'),
        'description' => __('Tags for this skill card. In Fixed Grid mode, max 3 tags are allowed.', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 220,
    ]);

    $wp_customize->add_setting('moehser_skills_card2_skills_list', [
        'default' => 'Node.js / Express & PHP, REST APIs, auth, caching, Robust release pipelines',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card2_skills_list', [
        'label' => __('Skills Card 2 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Skills list for this card. In Fixed Grid mode, max 3 items are allowed.', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
        'priority' => 210,
    ]);

    // Skills Card 3
    $wp_customize->add_setting('moehser_skills_card3_title', [
        'default' => __('Design & UX', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card3_title', [
        'label' => __('Skills Card 3 - Title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 300,
    ]);



    $wp_customize->add_setting('moehser_skills_card3_tags', [
        'default' => 'Figma, Adobe XD, User Research',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card3_tags', [
        'label' => __('Skills Card 3 - Tags (comma separated)', 'moehser-portfolio'),
        'description' => __('Tags for this skill card. In Fixed Grid mode, max 3 tags are allowed.', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 320,
    ]);

    $wp_customize->add_setting('moehser_skills_card3_skills_list', [
        'default' => 'Design tokens, SCSS architecture, Tailwind when it speeds things up without clutter',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card3_skills_list', [
        'label' => __('Skills Card 3 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Skills list for this card. In Fixed Grid mode, max 3 items are allowed.', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
        'priority' => 310,
    ]);

    // Skills Card 4
    $wp_customize->add_setting('moehser_skills_card4_title', [
        'default' => __('DevOps & Tools', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card4_title', [
        'label' => __('Skills Card 4 - Title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 400,
    ]);

    $wp_customize->add_setting('moehser_skills_card4_description', [
        'default' => __('Streamlining development workflows and deployment processes.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card4_description', [
        'label' => __('Skills Card 4 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
        'priority' => 410,
    ]);

    $wp_customize->add_setting('moehser_skills_card4_tags', [
        'default' => 'Git, Docker, CI/CD, AWS',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card4_tags', [
        'label' => __('Skills Card 4 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 420,
    ]);



    // Skills Card 5
    $wp_customize->add_setting('moehser_skills_card5_title', [
        'default' => __('Mobile Development', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card5_title', [
        'label' => __('Skills Card 5 - Title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 500,
    ]);

    $wp_customize->add_setting('moehser_skills_card5_description', [
        'default' => __('Building native and cross-platform mobile applications.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card5_description', [
        'label' => __('Skills Card 5 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
        'priority' => 510,
    ]);

    $wp_customize->add_setting('moehser_skills_card5_tags', [
        'default' => 'React Native, Flutter, iOS, Android',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card5_tags', [
        'label' => __('Skills Card 5 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
        'priority' => 520,
    ]);


});

// Pass Customizer values to frontend
add_action('wp_head', function () {
    // Profile and Social Settings
    $profile_avatar = get_theme_mod('moehser_profile_avatar', '');
    $social_github = get_theme_mod('moehser_social_github', '');
    $social_linkedin = get_theme_mod('moehser_social_linkedin', '');
    $social_email = get_theme_mod('moehser_social_email', '');
    
    // About texts
    $about_title = get_theme_mod('moehser_about_title', 'About Me');
    $about_subtitle = get_theme_mod('moehser_about_subtitle', 'My story & experience');
    $about_page_id = (int) get_theme_mod('moehser_about_page_id', 0);
    $about_html = '';
    if ($about_page_id > 0) {
        $about_post = get_post($about_page_id);
        if ($about_post && $about_post->post_status === 'publish') {
            // Apply standard content filters so shortcodes/blocks are rendered
            $about_html = apply_filters('the_content', $about_post->post_content);
        }
    }
    
    // Projects Settings
    $show_only_active_projects = get_theme_mod('moehser_show_only_active_projects', 1);
    $projects_title = get_theme_mod('moehser_projects_title', 'Projekte');
    $projects_subtitle = get_theme_mod('moehser_projects_subtitle', 'Subtitle below the main title');
    
    // Skills Settings
    $skills_title = get_theme_mod('moehser_skills_title', 'Skills');
    $skills_subtitle = get_theme_mod('moehser_skills_subtitle', 'Technologies & tools I work with');
    $skills_layout_mode = get_theme_mod('moehser_skills_layout_mode', 'fixed_grid');
    $skills_card1_enabled = get_theme_mod('moehser_skills_card1_enabled', 1);
    $skills_card2_enabled = get_theme_mod('moehser_skills_card2_enabled', 1);
    $skills_card3_enabled = get_theme_mod('moehser_skills_card3_enabled', 1);
    $skills_card4_enabled = get_theme_mod('moehser_skills_card4_enabled', 1);
    $skills_card5_enabled = get_theme_mod('moehser_skills_card5_enabled', 1);
    
    // Skills Cards
    $skills_card1_title = get_theme_mod('moehser_skills_card1_title', 'Frontend Development');
    $skills_card1_description = get_theme_mod('moehser_skills_card1_description', 'Building responsive and interactive user interfaces with modern web technologies.');
    $skills_card1_tags = get_theme_mod('moehser_skills_card1_tags', 'React, JavaScript, CSS, HTML');
    $skills_card1_skills_list = get_theme_mod('moehser_skills_card1_skills_list', 'React + Vite + TypeScript, Animations with Framer Motion, Accessibility & Core Web Vitals');
    
    $skills_card2_title = get_theme_mod('moehser_skills_card2_title', 'Backend Development');
    $skills_card2_description = get_theme_mod('moehser_skills_card2_description', 'Creating robust server-side applications and APIs.');
    $skills_card2_tags = get_theme_mod('moehser_skills_card2_tags', 'Node.js, PHP, MySQL, WordPress');
    $skills_card2_skills_list = get_theme_mod('moehser_skills_card2_skills_list', 'Node.js / Express & PHP, REST APIs, auth, caching, Robust release pipelines');
    
    $skills_card3_title = get_theme_mod('moehser_skills_card3_title', 'Design & UX');
    $skills_card3_description = get_theme_mod('moehser_skills_card3_description', 'Creating intuitive and beautiful user experiences.');
    $skills_card3_tags = get_theme_mod('moehser_skills_card3_tags', 'Figma, Adobe XD, User Research');
    $skills_card3_skills_list = get_theme_mod('moehser_skills_card3_skills_list', 'Design tokens, SCSS architecture, Tailwind when it speeds things up without clutter');
    
    $skills_card4_title = get_theme_mod('moehser_skills_card4_title', 'DevOps & Tools');
    $skills_card4_description = get_theme_mod('moehser_skills_card4_description', 'Streamlining development workflows and deployment processes.');
    $skills_card4_tags = get_theme_mod('moehser_skills_card4_tags', 'Git, Docker, CI/CD, AWS');
    $skills_card4_skills_list = get_theme_mod('moehser_skills_card4_skills_list', 'Git, Docker, CI/CD, AWS, Streamlining development workflows');
    
    $skills_card5_title = get_theme_mod('moehser_skills_card5_title', 'Mobile Development');
    $skills_card5_description = get_theme_mod('moehser_skills_card5_description', 'Building native and cross-platform mobile applications.');
    $skills_card5_tags = get_theme_mod('moehser_skills_card5_tags', 'React Native, Flutter, iOS, Android');
    $skills_card5_skills_list = get_theme_mod('moehser_skills_card5_skills_list', 'React Native, Flutter, iOS, Android, Building native and cross-platform mobile applications');
    
    echo '<script>';
    // About texts to frontend
    echo 'window.__ABOUT_TITLE__ = "' . esc_js($about_title) . '";';
    echo 'window.__ABOUT_SUBTITLE__ = "' . esc_js($about_subtitle) . '";';
    echo 'window.__ABOUT_HTML__ = ' . wp_json_encode($about_html) . ';';
    
    // Projects Settings to frontend
    echo 'window.__SHOW_ONLY_ACTIVE_PROJECTS__ = ' . ($show_only_active_projects ? 'true' : 'false') . ';';
    echo 'window.__PROJECTS_TITLE__ = "' . esc_js($projects_title) . '";';
    echo 'window.__PROJECTS_SUBTITLE__ = "' . esc_js($projects_subtitle) . '";';
    echo 'window.__PROJECTS_LAYOUT_MODE__ = "' . esc_js(get_theme_mod('moehser_projects_layout_mode', 'side_by_side')) . '";';
    
    // Skills Settings to frontend
    echo 'window.__SKILLS_TITLE__ = "' . esc_js($skills_title) . '";';
    echo 'window.__SKILLS_SUBTITLE__ = "' . esc_js($skills_subtitle) . '";';
    echo 'window.__SKILLS_LAYOUT_MODE__ = "' . esc_js($skills_layout_mode) . '";';
    echo 'window.__SKILLS_DENSITY__ = "' . esc_js(get_theme_mod('moehser_skills_density','normal')) . '";';
    echo 'window.__SKILLS_CARDS_ENABLED__ = { c1: ' . ($skills_card1_enabled ? 'true' : 'false') . ', c2: ' . ($skills_card2_enabled ? 'true' : 'false') . ', c3: ' . ($skills_card3_enabled ? 'true' : 'false') . ', c4: ' . ($skills_card4_enabled ? 'true' : 'false') . ', c5: ' . ($skills_card5_enabled ? 'true' : 'false') . ' };';
    
    // Skills Cards to frontend
    echo 'window.__SKILLS_CARD1__ = { title: "' . esc_js($skills_card1_title) . '", description: "' . esc_js($skills_card1_description) . '", tags: "' . esc_js($skills_card1_tags) . '", skills_list: "' . esc_js($skills_card1_skills_list) . '" };';
    echo 'window.__SKILLS_CARD2__ = { title: "' . esc_js($skills_card2_title) . '", description: "' . esc_js($skills_card2_description) . '", tags: "' . esc_js($skills_card2_tags) . '", skills_list: "' . esc_js($skills_card2_skills_list) . '" };';
    echo 'window.__SKILLS_CARD3__ = { title: "' . esc_js($skills_card3_title) . '", description: "' . esc_js($skills_card3_description) . '", tags: "' . esc_js($skills_card3_tags) . '", skills_list: "' . esc_js($skills_card3_skills_list) . '" };';
    echo 'window.__SKILLS_CARD4__ = { title: "' . esc_js($skills_card4_title) . '", description: "' . esc_js($skills_card4_description) . '", tags: "' . esc_js($skills_card4_tags) . '", skills_list: "' . esc_js($skills_card4_skills_list) . '" };';
    echo 'window.__SKILLS_CARD5__ = { title: "' . esc_js($skills_card5_title) . '", description: "' . esc_js($skills_card5_description) . '", tags: "' . esc_js($skills_card5_tags) . '", skills_list: "' . esc_js($skills_card5_skills_list) . '" };';
    
    // Profile and Social JavaScript Variables
    if ($profile_avatar) echo 'window.__PROFILE_AVATAR_URL__ = "' . esc_js($profile_avatar) . '";';
    if ($social_github) echo 'window.__SOCIAL_GITHUB__ = "' . esc_js($social_github) . '";';
    if ($social_linkedin) echo 'window.__SOCIAL_LINKEDIN__ = "' . esc_js($social_linkedin) . '";';
    if ($social_email) echo 'window.__SOCIAL_EMAIL__ = "' . esc_js($social_email) . '";';
    echo '</script>';
});
