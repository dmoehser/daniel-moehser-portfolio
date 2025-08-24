<?php
/**
 * Setup Default Projects
 * 
 * @package Moehser_Portfolio
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Create default projects if none exist
 */
function moehser_create_default_projects() {
    // Check if projects already exist
    $existing_projects = get_posts([
        'post_type' => 'project',
        'post_status' => 'publish',
        'numberposts' => 1
    ]);

    if (!empty($existing_projects)) {
        return; // Already exists
    }

    // Create default project 1
    $project1 = array(
        'post_title'    => 'React Portfolio Website',
        'post_content'  => '<p>Eine moderne Portfolio-Website, entwickelt mit React und modernen Web-Technologien. Das Projekt demonstriert fortgeschrittene React-Patterns, responsive Design und optimale Performance.</p>

<h3>Features</h3>
<ul>
<li>✅ Responsive Design für alle Geräte</li>
<li>✅ Moderne React Hooks und Context API</li>
<li>✅ Optimierte Performance mit Code-Splitting</li>
<li>✅ SEO-optimiert mit Meta-Tags</li>
<li>✅ Dark/Light Mode Toggle</li>
</ul>

<h3>Technologien</h3>
<p>React 18, Vite, TypeScript, Tailwind CSS, Framer Motion</p>',
        'post_excerpt'  => 'Moderne Portfolio-Website entwickelt mit React und modernen Web-Technologien.',
        'post_status'   => 'publish',
        'post_type'     => 'project',
        'post_author'   => 1,
    );

    $project1_id = wp_insert_post($project1);

    if ($project1_id && !is_wp_error($project1_id)) {
        // Set default meta values
        update_post_meta($project1_id, 'project_technologies', 'React, TypeScript, Vite, Tailwind CSS, Framer Motion');
        update_post_meta($project1_id, 'project_status', 'active');
        update_post_meta($project1_id, 'project_order', 1);
        update_post_meta($project1_id, 'project_demo_mode', 'iframe');
    }

    // Create default project 2
    $project2 = array(
        'post_title'    => 'WordPress E-Commerce Theme',
        'post_content'  => '<p>Ein vollständig angepasstes WordPress-Theme für E-Commerce-Websites. Das Theme bietet eine moderne Benutzeroberfläche, optimierte Performance und umfangreiche Anpassungsmöglichkeiten.</p>

<h3>Features</h3>
<ul>
<li>✅ WooCommerce Integration</li>
<li>✅ Responsive Design</li>
<li>✅ Customizer-Unterstützung</li>
<li>✅ SEO-optimiert</li>
<li>✅ Performance-optimiert</li>
</ul>

<h3>Technologien</h3>
<p>WordPress, PHP, WooCommerce, SCSS, JavaScript</p>',
        'post_excerpt'  => 'Vollständig angepasstes WordPress-Theme für E-Commerce-Websites mit WooCommerce-Integration.',
        'post_status'   => 'publish',
        'post_type'     => 'project',
        'post_author'   => 1,
    );

    $project2_id = wp_insert_post($project2);

    if ($project2_id && !is_wp_error($project2_id)) {
        // Set default meta values
        update_post_meta($project2_id, 'project_technologies', 'WordPress, PHP, WooCommerce, SCSS, JavaScript');
        update_post_meta($project2_id, 'project_status', 'active');
        update_post_meta($project2_id, 'project_order', 2);
        update_post_meta($project2_id, 'project_demo_mode', 'iframe');
    }

    // Create default project 3
    $project3 = array(
        'post_title'    => 'Node.js REST API',
        'post_content'  => '<p>Eine robuste REST API, entwickelt mit Node.js und Express. Die API bietet Authentifizierung, Datenbank-Integration und umfangreiche Endpunkte für moderne Web-Anwendungen.</p>

<h3>Features</h3>
<ul>
<li>✅ JWT-basierte Authentifizierung</li>
<li>✅ MongoDB Integration</li>
<li>✅ Rate Limiting</li>
<li>✅ API Dokumentation</li>
<li>✅ Unit Tests</li>
</ul>

<h3>Technologien</h3>
<p>Node.js, Express, MongoDB, JWT, Jest</p>',
        'post_excerpt'  => 'Robuste REST API entwickelt mit Node.js und Express, mit Authentifizierung und Datenbank-Integration.',
        'post_status'   => 'publish',
        'post_type'     => 'project',
        'post_author'   => 1,
    );

    $project3_id = wp_insert_post($project3);

    if ($project3_id && !is_wp_error($project3_id)) {
        // Set default meta values
        update_post_meta($project3_id, 'project_technologies', 'Node.js, Express, MongoDB, JWT, Jest');
        update_post_meta($project3_id, 'project_status', 'active');
        update_post_meta($project3_id, 'project_order', 3);
        update_post_meta($project3_id, 'project_demo_mode', 'iframe');
    }
}

// Run on theme activation
add_action('after_switch_theme', 'moehser_create_default_projects');

// Also run on init if no projects exist (for existing themes)
add_action('init', function() {
    if (!get_posts(['post_type' => 'project', 'post_status' => 'publish', 'numberposts' => 1])) {
        moehser_create_default_projects();
    }
});
