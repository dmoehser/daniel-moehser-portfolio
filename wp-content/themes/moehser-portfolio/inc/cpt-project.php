<?php

// Registers the "project" custom post type and its REST-exposed meta
// ==================================================================

// Project meta field definitions
// ------------------------------
const PROJECT_META_FIELDS = [
    'project_technologies' => [
        'type' => 'string',
        'sanitize' => 'sanitize_text_field',
        'default' => ''
    ],
    'project_status' => [
        'type' => 'string',
        'sanitize' => 'sanitize_text_field',
        'default' => 'active'
    ],
    'project_url' => [
        'type' => 'string',
        'sanitize' => 'esc_url_raw',
        'default' => ''
    ],
    'project_demo_mode' => [
        'type' => 'string',
        'sanitize' => 'sanitize_text_field',
        'default' => 'iframe'
    ],
    'project_screenshot' => [
        'type' => 'string',
        'sanitize' => 'esc_url_raw',
        'default' => ''
    ],
    'project_github_url' => [
        'type' => 'string',
        'sanitize' => 'esc_url_raw',
        'default' => ''
    ]
];

// Allowed values for validation
// -----------------------------
const PROJECT_STATUSES = ['active', 'archived', 'development'];
const PROJECT_DEMO_MODES = ['iframe', 'new_window', 'fullscreen'];

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

    ?>
    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="project_url"><?php _e('Project URL', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="url" id="project_url" name="project_url" value="<?php echo esc_attr($meta_values['project_url']); ?>" class="regular-text" />
                <p class="description"><?php _e('Live URL of your deployed project (e.g., https://your-app.onrender.com)', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_github_url"><?php _e('GitHub URL', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="url" id="project_github_url" name="project_github_url" value="<?php echo esc_attr($meta_values['project_github_url']); ?>" class="regular-text" />
                <p class="description"><?php _e('Repository URL (e.g., https://github.com/username/repo)', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_screenshot"><?php _e('Screenshot URL', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="url" id="project_screenshot" name="project_screenshot" value="<?php echo esc_attr($meta_values['project_screenshot']); ?>" class="regular-text" />
                <p class="description"><?php _e('Direct URL to a preview image for the project card. If empty, the featured image will be used.', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_technologies"><?php _e('Technologies', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="text" id="project_technologies" name="project_technologies" value="<?php echo esc_attr($meta_values['project_technologies']); ?>" class="regular-text" />
                <p class="description"><?php _e('e.g.: React, Node.js, WordPress (comma-separated)', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_status"><?php _e('Status', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <select id="project_status" name="project_status">
                    <?php foreach (PROJECT_STATUSES as $status_value): ?>
                        <option value="<?php echo esc_attr($status_value); ?>" <?php selected($meta_values['project_status'], $status_value); ?>>
                            <?php echo esc_html(ucfirst(str_replace('_', ' ', $status_value))); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description">
                    <strong>Active:</strong> Will be displayed in the frontend<br>
                    <strong>Archived:</strong> Will be hidden in the frontend (only visible in admin)<br>
                    <strong>In Development:</strong> Will be hidden in the frontend (only visible in admin)
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_demo_mode"><?php _e('Demo Mode', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <select id="project_demo_mode" name="project_demo_mode">
                    <?php 
                    $demo_labels = [
                        'iframe' => 'Embed in iframe (Current)',
                        'new_window' => 'Open in new window',
                        'fullscreen' => 'Fullscreen overlay (Coming Soon)'
                    ];
                    foreach (PROJECT_DEMO_MODES as $mode_value): ?>
                        <option value="<?php echo esc_attr($mode_value); ?>" <?php selected($meta_values['project_demo_mode'], $mode_value); ?>>
                            <?php echo esc_html($demo_labels[$mode_value]); ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php _e('How the project demo should be displayed', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
    </table>
    <?php
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
            
            // Additional validation for specific fields
            if ($field_name === 'project_status' && !in_array($value, PROJECT_STATUSES, true)) {
                continue;
            }
            if ($field_name === 'project_demo_mode' && !in_array($value, PROJECT_DEMO_MODES, true)) {
                continue;
            }
            
            update_post_meta($post_id, $field_name, $value);
        }
    }
});
