<?php
/**
 * Setup About Post
 * 
 * @package Moehser_Portfolio
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Create default About post if none exists
 */
function moehser_create_default_about_post() {
    // Check if about post already exists
    $existing_about = get_posts([
        'post_type' => 'about',
        'post_status' => 'publish',
        'numberposts' => 1
    ]);

    if (!empty($existing_about)) {
        return; // Already exists
    }

    // Create default about post
    $about_post = array(
        'post_title'    => 'Über mich',
        'post_content'  => '<p>Hallo! Ich bin Daniel Moehser, ein leidenschaftlicher Web Developer mit Fokus auf moderne Web-Technologien und benutzerfreundliche Lösungen.</p>

<p>Mit über 5 Jahren Erfahrung in der Web-Entwicklung habe ich mich auf die Erstellung von performanten, skalierbaren und benutzerfreundlichen Webanwendungen spezialisiert. Mein Ansatz kombiniert solide technische Grundlagen mit einem Auge für Design und Benutzererfahrung.</p>

<h3>Meine Herangehensweise</h3>
<p>Ich glaube an sauberen, wartbaren Code und moderne Entwicklungspraktiken. Jedes Projekt beginnt mit einer gründlichen Analyse der Anforderungen, gefolgt von einem durchdachten technischen Konzept.</p>

<h3>Warum mit mir arbeiten?</h3>
<ul>
<li>✅ Moderne Technologien (React, Node.js, WordPress)</li>
<li>✅ Fokus auf Performance und SEO</li>
<li>✅ Responsive Design für alle Geräte</li>
<li>✅ Klare Kommunikation und transparente Prozesse</li>
<li>✅ Langfristige Wartung und Support</li>
</ul>',
        'post_excerpt'  => 'Leidenschaftlicher Web Developer mit Fokus auf moderne Web-Technologien und benutzerfreundliche Lösungen.',
        'post_status'   => 'publish',
        'post_type'     => 'about',
        'post_author'   => 1,
    );

    $post_id = wp_insert_post($about_post);

    if ($post_id && !is_wp_error($post_id)) {
        // Set default meta values
        update_post_meta($post_id, '_about_subtitle', 'Web Developer & Designer');
        update_post_meta($post_id, '_about_skills_list', 'React, WordPress, Docker, Node.js, TypeScript, Sass, MySQL, Git');
        update_post_meta($post_id, '_about_cta_text', 'Projekt besprechen');
        update_post_meta($post_id, '_about_cta_url', '#contact');
    }
}

// Run on theme activation
add_action('after_switch_theme', 'moehser_create_default_about_post');

// Also run on init if no about post exists (for existing themes)
add_action('init', function() {
    if (!get_posts(['post_type' => 'about', 'post_status' => 'publish', 'numberposts' => 1])) {
        moehser_create_default_about_post();
    }
});
