<?php
/**
 * Custom Post Type: About
 * 
 * @package Moehser_Portfolio
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Register About Custom Post Type
 */
function moehser_register_about_cpt() {
    $labels = array(
        'name'                  => 'About',
        'singular_name'         => 'About',
        'menu_name'             => 'About',
        'add_new'               => 'Neuen About hinzufügen',
        'add_new_item'          => 'Neuen About hinzufügen',
        'edit_item'             => 'About bearbeiten',
        'new_item'              => 'Neuer About',
        'view_item'             => 'About anzeigen',
        'search_items'          => 'About durchsuchen',
        'not_found'             => 'Kein About gefunden',
        'not_found_in_trash'    => 'Kein About im Papierkorb gefunden',
    );

    $args = array(
        'labels'              => $labels,
        'public'              => true,
        'publicly_queryable'  => false, // Nicht als einzelne Seite verfügbar
        'show_ui'             => true,
        'show_in_menu'        => true,
        'show_in_rest'        => true, // Für Gutenberg Editor
        'query_var'           => false,
        'rewrite'             => false,
        'capability_type'     => 'post',
        'has_archive'         => false,
        'hierarchical'        => false,
        'menu_position'       => 20,
        'menu_icon'           => 'dashicons-admin-users',
        'supports'            => array('title', 'editor', 'thumbnail', 'excerpt'),
        'show_in_nav_menus'   => false,
    );

    register_post_type('about', $args);
}
add_action('init', 'moehser_register_about_cpt');

/**
 * Add custom meta fields for About
 */
function moehser_add_about_meta_boxes() {
    add_meta_box(
        'about_details',
        'About Details',
        'moehser_about_meta_box_callback',
        'about',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'moehser_add_about_meta_boxes');

/**
 * Meta box callback function
 */
function moehser_about_meta_box_callback($post) {
    wp_nonce_field('moehser_about_meta_box', 'moehser_about_meta_box_nonce');

    $subtitle = get_post_meta($post->ID, '_about_subtitle', true);
    $skills_list = get_post_meta($post->ID, '_about_skills_list', true);
    $cta_text = get_post_meta($post->ID, '_about_cta_text', true);
    $cta_url = get_post_meta($post->ID, '_about_cta_url', true);

    ?>
    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="about_subtitle">Untertitel</label>
            </th>
            <td>
                <input type="text" id="about_subtitle" name="about_subtitle" value="<?php echo esc_attr($subtitle); ?>" class="regular-text" />
                <p class="description">Kurzer Untertitel unter dem Haupttitel</p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="about_skills_list">Fähigkeiten (kommagetrennt)</label>
            </th>
            <td>
                <input type="text" id="about_skills_list" name="about_skills_list" value="<?php echo esc_attr($skills_list); ?>" class="regular-text" />
                <p class="description">z.B.: React, WordPress, Docker, Node.js</p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="about_cta_text">CTA Button Text</label>
            </th>
            <td>
                <input type="text" id="about_cta_text" name="about_cta_text" value="<?php echo esc_attr($cta_text); ?>" class="regular-text" />
                <p class="description">Text für den Call-to-Action Button</p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="about_cta_url">CTA Button URL</label>
            </th>
            <td>
                <input type="url" id="about_cta_url" name="about_cta_url" value="<?php echo esc_attr($cta_url); ?>" class="regular-text" />
                <p class="description">URL für den Call-to-Action Button</p>
            </td>
        </tr>
    </table>
    <?php
}

/**
 * Save meta box data
 */
function moehser_save_about_meta_box_data($post_id) {
    // Check if nonce is valid
    if (!isset($_POST['moehser_about_meta_box_nonce']) || !wp_verify_nonce($_POST['moehser_about_meta_box_nonce'], 'moehser_about_meta_box')) {
        return;
    }

    // Check if user has permissions
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Save fields
    if (isset($_POST['about_subtitle'])) {
        update_post_meta($post_id, '_about_subtitle', sanitize_text_field($_POST['about_subtitle']));
    }
    if (isset($_POST['about_skills_list'])) {
        update_post_meta($post_id, '_about_skills_list', sanitize_text_field($_POST['about_skills_list']));
    }
    if (isset($_POST['about_cta_text'])) {
        update_post_meta($post_id, '_about_cta_text', sanitize_text_field($_POST['about_cta_text']));
    }
    if (isset($_POST['about_cta_url'])) {
        update_post_meta($post_id, '_about_cta_url', esc_url_raw($_POST['about_cta_url']));
    }
}
add_action('save_post', 'moehser_save_about_meta_box_data');

/**
 * Register REST API fields for About
 */
function moehser_register_about_rest_fields() {
    register_rest_field('about', 'about_meta', array(
        'get_callback' => 'moehser_get_about_meta_for_rest',
        'schema' => null,
    ));
}
add_action('rest_api_init', 'moehser_register_about_rest_fields');

/**
 * Get About meta for REST API
 */
function moehser_get_about_meta_for_rest($post) {
    $post_id = $post['id'];
    
    return array(
        'subtitle' => get_post_meta($post_id, '_about_subtitle', true),
        'skills_list' => get_post_meta($post_id, '_about_skills_list', true),
        'cta_text' => get_post_meta($post_id, '_about_cta_text', true),
        'cta_url' => get_post_meta($post_id, '_about_cta_url', true),
    );
}
