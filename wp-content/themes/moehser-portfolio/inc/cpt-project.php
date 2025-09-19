<?php

// Registers the "project" custom post type and its REST-exposed meta
// ==================================================================

// Project meta field definitions
// ------------------------------
const PROJECT_META_FIELDS = [
    'project_technologies' => [
        'type' => 'string',
        'sanitize' => 'sanitize_text_field',
        'default' => '',
        'field_type' => 'text',
        'label' => 'Technologies',
        'description' => 'e.g.: React, Node.js, WordPress (comma-separated)'
    ],
    'project_status' => [
        'type' => 'string',
        'sanitize' => 'sanitize_text_field',
        'default' => 'active',
        'field_type' => 'select',
        'label' => 'Status',
        'description' => 'Active: Will be displayed in the frontend<br>Archived: Will be hidden in the frontend (only visible in admin)<br>In Development: Will be hidden in the frontend (only visible in admin)',
        'options' => 'PROJECT_STATUSES'
    ],
    'project_url' => [
        'type' => 'string',
        'sanitize' => 'esc_url_raw',
        'default' => '',
        'field_type' => 'url',
        'label' => 'Project URL',
        'description' => 'Live URL of your deployed project (e.g., https://your-app.onrender.com)'
    ],
    'project_demo_mode' => [
        'type' => 'string',
        'sanitize' => 'sanitize_text_field',
        'default' => 'iframe',
        'field_type' => 'select',
        'label' => 'Demo Mode',
        'description' => 'How the project demo should be displayed',
        'options' => 'PROJECT_DEMO_MODES',
        'labels' => 'PROJECT_DEMO_LABELS'
    ],
    'project_screenshot' => [
        'type' => 'string',
        'sanitize' => 'esc_url_raw',
        'default' => '',
        'field_type' => 'url',
        'label' => 'Screenshot URL',
        'description' => 'Direct URL to a preview image for the project card. If empty, the featured image will be used.'
    ],
    'project_github_url' => [
        'type' => 'string',
        'sanitize' => 'esc_url_raw',
        'default' => '',
        'field_type' => 'url',
        'label' => 'GitHub URL',
        'description' => 'Repository URL (e.g., https://github.com/username/repo)'
    ]
];

// Allowed values for validation
// -----------------------------
const PROJECT_STATUSES = ['active', 'archived', 'development'];
const PROJECT_DEMO_MODES = ['iframe', 'new_window'];

// Demo mode labels for admin interface
// -----------------------------------
const PROJECT_DEMO_LABELS = [
    'iframe' => 'Embed in iframe',
    'new_window' => 'Open in new window'
];

// Helper function to render meta field input
// -----------------------------------------
function render_meta_field_input($field_name, $field_config, $value) {
    $field_type = $field_config['field_type'];
    $label = $field_config['label'];
    $description = $field_config['description'];
    
    echo '<tr>';
    echo '<th scope="row">';
    echo '<label for="' . esc_attr($field_name) . '">' . esc_html(__($label, 'moehser-portfolio')) . '</label>';
    echo '</th>';
    echo '<td>';
    
    switch ($field_type) {
        case 'url':
            echo '<input type="url" id="' . esc_attr($field_name) . '" name="' . esc_attr($field_name) . '" value="' . esc_attr($value) . '" class="regular-text" />';
            break;
        case 'text':
            echo '<input type="text" id="' . esc_attr($field_name) . '" name="' . esc_attr($field_name) . '" value="' . esc_attr($value) . '" class="regular-text" />';
            break;
        case 'select':
            echo '<select id="' . esc_attr($field_name) . '" name="' . esc_attr($field_name) . '">';
            
            $options = constant($field_config['options']);
            $labels = isset($field_config['labels']) ? constant($field_config['labels']) : null;
            
            foreach ($options as $option_value) {
                $option_label = $labels ? $labels[$option_value] : ucfirst(str_replace('_', ' ', $option_value));
                $selected = selected($value, $option_value, false);
                
                // Add "(Current)" to the selected option
                if ($selected && $field_name === 'project_demo_mode') {
                    $option_label .= ' (Current)';
                }
                
                echo '<option value="' . esc_attr($option_value) . '" ' . $selected . '>';
                echo esc_html($option_label);
                echo '</option>';
            }
            
            echo '</select>';
            break;
    }
    
    echo '<p class="description">' . wp_kses_post(__($description, 'moehser-portfolio')) . '</p>';
    echo '</td>';
    echo '</tr>';
}

// Helper function to register project meta fields
// -----------------------------------------------
function register_project_meta_fields() {
    foreach (PROJECT_META_FIELDS as $field_name => $config) {
        register_post_meta('project', $field_name, [
            'show_in_rest' => true,
            'type' => $config['type'],
            'single' => true,
            'sanitize_callback' => function ($value) use ($config) {
                return call_user_func($config['sanitize'], $value);
            },
            'default' => $config['default'],
            'auth_callback' => function () {
                return current_user_can('edit_posts');
            },
        ]);
    }
}

add_action('init', function () {
    register_post_type('project', [
        'labels' => [
            'name' => __('Projects', 'moehser-portfolio'),
            'singular_name' => __('Project', 'moehser-portfolio'),
            'add_new' => __('Add New Project', 'moehser-portfolio'),
            'add_new_item' => __('Add New Project', 'moehser-portfolio'),
            'edit_item' => __('Edit Project', 'moehser-portfolio'),
            'new_item' => __('New Project', 'moehser-portfolio'),
            'view_item' => __('View Project', 'moehser-portfolio'),
            'search_items' => __('Search Projects', 'moehser-portfolio'),
            'not_found' => __('No projects found', 'moehser-portfolio'),
            'not_found_in_trash' => __('No projects found in trash', 'moehser-portfolio'),
        ],
        'public' => true,
        'show_in_rest' => true,
        'has_archive' => true,
        'rewrite' => ['slug' => 'projects'],
        'menu_position' => 20,
        'menu_icon' => 'dashicons-portfolio',
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields', 'page-attributes'],
        'show_in_menu' => true,
        'capability_type' => 'post',
        'hierarchical' => false,
        'show_in_nav_menus' => false,
    ]);

    // Register all project meta fields
    register_project_meta_fields();
});

// Add custom meta boxes for project management
add_action('add_meta_boxes', function () {
    add_meta_box(
        'project_details',
        __('Project Details', 'moehser-portfolio'),
        'moehser_project_meta_box_callback',
        'project',
        'normal',
        'high'
    );
});

// Meta box callback function
// --------------------------
function moehser_project_meta_box_callback($post) {
    wp_nonce_field('moehser_project_meta_box', 'moehser_project_meta_box_nonce');

    // Get all meta values
    $meta_values = [];
    foreach (array_keys(PROJECT_META_FIELDS) as $field) {
        $meta_values[$field] = get_post_meta($post->ID, $field, true);
    }

    echo '<table class="form-table">';
    
    // Render all meta fields using the helper function
    foreach (PROJECT_META_FIELDS as $field_name => $field_config) {
        render_meta_field_input($field_name, $field_config, $meta_values[$field_name]);
    }
    
    echo '</table>';
}

// Helper function to validate field value
// --------------------------------------
function validate_meta_field_value($field_name, $value) {
    switch ($field_name) {
        case 'project_status':
            return in_array($value, PROJECT_STATUSES, true);
        case 'project_demo_mode':
            return in_array($value, PROJECT_DEMO_MODES, true);
        default:
            return true;
    }
}

// Save project meta data
// ----------------------
add_action('save_post', function ($post_id) {
    // Security checks
    if (!isset($_POST['moehser_project_meta_box_nonce']) || 
        !wp_verify_nonce($_POST['moehser_project_meta_box_nonce'], 'moehser_project_meta_box')) {
        return;
    }
    
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    // Save all project meta fields
    foreach (PROJECT_META_FIELDS as $field_name => $config) {
        if (isset($_POST[$field_name])) {
            $value = call_user_func($config['sanitize'], $_POST[$field_name]);
            
            // Validate field value
            if (!validate_meta_field_value($field_name, $value)) {
                continue;
            }
            
            update_post_meta($post_id, $field_name, $value);
        }
    }
});
