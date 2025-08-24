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
    
    echo '<script>';
    // About texts to frontend
    echo 'window.__ABOUT_TITLE__ = "' . esc_js($about_title) . '";';
    echo 'window.__ABOUT_SUBTITLE__ = "' . esc_js($about_subtitle) . '";';
    
    // Projects Settings to frontend
    echo 'window.__SHOW_ONLY_ACTIVE_PROJECTS__ = ' . ($show_only_active_projects ? 'true' : 'false') . ';';
    echo 'window.__PROJECTS_TITLE__ = "' . esc_js($projects_title) . '";';
    echo 'window.__PROJECTS_SUBTITLE__ = "' . esc_js($projects_subtitle) . '";';
    
    // Profile and Social JavaScript Variables
    if ($profile_avatar) echo 'window.__PROFILE_AVATAR_URL__ = "' . esc_js($profile_avatar) . '";';
    if ($social_github) echo 'window.__SOCIAL_GITHUB__ = "' . esc_js($social_github) . '";';
    if ($social_linkedin) echo 'window.__SOCIAL_LINKEDIN__ = "' . esc_js($social_linkedin) . '";';
    if ($social_email) echo 'window.__SOCIAL_EMAIL__ = "' . esc_js($social_email) . '";';
    echo '</script>';
});
