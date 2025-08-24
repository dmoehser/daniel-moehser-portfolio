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

    // Skills Card 1
    $wp_customize->add_setting('moehser_skills_card1_title', [
        'default' => __('Frontend Development', 'moehser-portfolio'),
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card1_title', [
        'label' => __('Skills Card 1 - Title', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('moehser_skills_card1_description', [
        'default' => __('Building responsive and interactive user interfaces with modern web technologies.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card1_description', [
        'label' => __('Skills Card 1 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
    ]);

    $wp_customize->add_setting('moehser_skills_card1_tags', [
        'default' => 'React, JavaScript, CSS, HTML',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card1_tags', [
        'label' => __('Skills Card 1 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('moehser_skills_card1_skills_list', [
        'default' => 'React + Vite + TypeScript, Animations with Framer Motion, Accessibility & Core Web Vitals',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card1_skills_list', [
        'label' => __('Skills Card 1 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Leave empty if you only want to show description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
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
    ]);

    $wp_customize->add_setting('moehser_skills_card2_description', [
        'default' => __('Creating robust server-side applications and APIs.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card2_description', [
        'label' => __('Skills Card 2 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
    ]);

    $wp_customize->add_setting('moehser_skills_card2_tags', [
        'default' => 'Node.js, PHP, MySQL, WordPress',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card2_tags', [
        'label' => __('Skills Card 2 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('moehser_skills_card2_skills_list', [
        'default' => 'Node.js / Express & PHP, REST APIs, auth, caching, Robust release pipelines',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card2_skills_list', [
        'label' => __('Skills Card 2 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Leave empty if you only want to show description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
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
    ]);

    $wp_customize->add_setting('moehser_skills_card3_description', [
        'default' => __('Creating intuitive and beautiful user experiences.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card3_description', [
        'label' => __('Skills Card 3 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
    ]);

    $wp_customize->add_setting('moehser_skills_card3_tags', [
        'default' => 'Figma, Adobe XD, User Research',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card3_tags', [
        'label' => __('Skills Card 3 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('moehser_skills_card3_skills_list', [
        'default' => 'Design tokens, SCSS architecture, Tailwind when it speeds things up without clutter',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card3_skills_list', [
        'label' => __('Skills Card 3 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Leave empty if you only want to show description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
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
    ]);

    $wp_customize->add_setting('moehser_skills_card4_description', [
        'default' => __('Streamlining development workflows and deployment processes.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card4_description', [
        'label' => __('Skills Card 4 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
    ]);

    $wp_customize->add_setting('moehser_skills_card4_tags', [
        'default' => 'Git, Docker, CI/CD, AWS',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card4_tags', [
        'label' => __('Skills Card 4 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('moehser_skills_card4_skills_list', [
        'default' => 'Git, Docker, CI/CD, AWS, Streamlining development workflows',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card4_skills_list', [
        'label' => __('Skills Card 4 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Leave empty if you only want to show description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
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
    ]);

    $wp_customize->add_setting('moehser_skills_card5_description', [
        'default' => __('Building native and cross-platform mobile applications.', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card5_description', [
        'label' => __('Skills Card 5 - Description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
    ]);

    $wp_customize->add_setting('moehser_skills_card5_tags', [
        'default' => 'React Native, Flutter, iOS, Android',
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    $wp_customize->add_control('moehser_skills_card5_tags', [
        'label' => __('Skills Card 5 - Tags (comma separated)', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'text',
    ]);

    $wp_customize->add_setting('moehser_skills_card5_skills_list', [
        'default' => 'React Native, Flutter, iOS, Android, Building native and cross-platform mobile applications',
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_card5_skills_list', [
        'label' => __('Skills Card 5 - Skills List (comma separated)', 'moehser-portfolio'),
        'description' => __('Leave empty if you only want to show description', 'moehser-portfolio'),
        'section' => 'moehser_skills',
        'type' => 'textarea',
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
    
    // Projects Settings
    $show_only_active_projects = get_theme_mod('moehser_show_only_active_projects', 1);
    $projects_title = get_theme_mod('moehser_projects_title', 'Projekte');
    $projects_subtitle = get_theme_mod('moehser_projects_subtitle', 'Subtitle below the main title');
    
    // Skills Settings
    $skills_title = get_theme_mod('moehser_skills_title', 'Skills');
    $skills_subtitle = get_theme_mod('moehser_skills_subtitle', 'Technologies & tools I work with');
    
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
    
    // Projects Settings to frontend
    echo 'window.__SHOW_ONLY_ACTIVE_PROJECTS__ = ' . ($show_only_active_projects ? 'true' : 'false') . ';';
    echo 'window.__PROJECTS_TITLE__ = "' . esc_js($projects_title) . '";';
    echo 'window.__PROJECTS_SUBTITLE__ = "' . esc_js($projects_subtitle) . '";';
    
    // Skills Settings to frontend
    echo 'window.__SKILLS_TITLE__ = "' . esc_js($skills_title) . '";';
    echo 'window.__SKILLS_SUBTITLE__ = "' . esc_js($skills_subtitle) . '";';
    
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
