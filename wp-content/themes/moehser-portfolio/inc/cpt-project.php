<?php

/**
 * Registers the "project" custom post type and its REST-exposed meta.
 */
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
        'supports' => ['title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'],
        'show_in_menu' => true,
        'capability_type' => 'post',
        'hierarchical' => false,
        'show_in_nav_menus' => false,
    ]);

    // Project technologies (comma-separated)
    register_post_meta('project', 'project_technologies', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'sanitize_callback' => function ($value) {
            return sanitize_text_field($value);
        },
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);

    // Project status (active, archived, etc.)
    register_post_meta('project', 'project_status', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'sanitize_callback' => function ($value) {
            return sanitize_text_field($value);
        },
        'default' => 'active',
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);

    // External project URL (optional)
    register_post_meta('project', 'project_url', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'sanitize_callback' => function ($value) {
            return esc_url_raw($value);
        },
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);

    // Project demo mode (iframe, new window, etc.)
    register_post_meta('project', 'project_demo_mode', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'sanitize_callback' => function ($value) {
            return sanitize_text_field($value);
        },
        'default' => 'iframe',
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);

    // Optional screenshot/preview image URL for the project card
    register_post_meta('project', 'project_screenshot', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'sanitize_callback' => function ($value) {
            return esc_url_raw($value);
        },
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);

    // Optional GitHub URL for secondary CTA
    register_post_meta('project', 'project_github_url', [
        'show_in_rest' => true,
        'type' => 'string',
        'single' => true,
        'sanitize_callback' => function ($value) {
            return esc_url_raw($value);
        },
        'auth_callback' => function () {
            return current_user_can('edit_posts');
        },
    ]);
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
function moehser_project_meta_box_callback($post) {
    wp_nonce_field('moehser_project_meta_box', 'moehser_project_meta_box_nonce');

    $technologies = get_post_meta($post->ID, 'project_technologies', true);
    $status = get_post_meta($post->ID, 'project_status', true);
    $url = get_post_meta($post->ID, 'project_url', true);
    $github_url = get_post_meta($post->ID, 'project_github_url', true);
    $demo_mode = get_post_meta($post->ID, 'project_demo_mode', true);
    $screenshot = get_post_meta($post->ID, 'project_screenshot', true);

    ?>
    <table class="form-table">
        <tr>
            <th scope="row">
                <label for="project_url"><?php _e('Project URL', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="url" id="project_url" name="project_url" value="<?php echo esc_attr($url); ?>" class="regular-text" />
                <p class="description"><?php _e('Live URL of your deployed project (e.g., https://your-app.onrender.com)', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_github_url"><?php _e('GitHub URL', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="url" id="project_github_url" name="project_github_url" value="<?php echo esc_attr($github_url); ?>" class="regular-text" />
                <p class="description"><?php _e('Repository URL (e.g., https://github.com/username/repo). Optional – zeigt zusätzlichen CTA an.', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_screenshot"><?php _e('Screenshot URL', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="url" id="project_screenshot" name="project_screenshot" value="<?php echo esc_attr($screenshot); ?>" class="regular-text" />
                <p class="description"><?php _e('Direct URL to a preview image for the project card. If empty, the featured image will be used.', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_technologies"><?php _e('Technologies', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <input type="text" id="project_technologies" name="project_technologies" value="<?php echo esc_attr($technologies); ?>" class="regular-text" />
                <p class="description"><?php _e('e.g.: React, Node.js, WordPress (comma-separated)', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="project_status"><?php _e('Status', 'moehser-portfolio'); ?></label>
            </th>
            <td>
                <select id="project_status" name="project_status">
                    <option value="active" <?php selected($status, 'active'); ?>><?php _e('Active', 'moehser-portfolio'); ?></option>
                    <option value="archived" <?php selected($status, 'archived'); ?>><?php _e('Archived', 'moehser-portfolio'); ?></option>
                    <option value="development" <?php selected($status, 'development'); ?>><?php _e('In Development', 'moehser-portfolio'); ?></option>
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
                    <option value="iframe" <?php selected($demo_mode, 'iframe'); ?>><?php _e('Embed in iframe (Current)', 'moehser-portfolio'); ?></option>
                    <option value="new_window" <?php selected($demo_mode, 'new_window'); ?>><?php _e('Open in new window', 'moehser-portfolio'); ?></option>
                    <option value="fullscreen" <?php selected($demo_mode, 'fullscreen'); ?>><?php _e('Fullscreen overlay (Coming Soon)', 'moehser-portfolio'); ?></option>
                </select>
                <p class="description"><?php _e('How the project demo should be displayed', 'moehser-portfolio'); ?></p>
            </td>
        </tr>
    </table>
    <?php
}

// Save project meta data
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

    // Save project technologies
    if (isset($_POST['project_technologies'])) {
        update_post_meta($post_id, 'project_technologies', sanitize_text_field($_POST['project_technologies']));
    }

    // Save project status
    if (isset($_POST['project_status'])) {
        $status = sanitize_text_field($_POST['project_status']);
        $allowed_statuses = ['active', 'archived', 'development'];
        if (in_array($status, $allowed_statuses, true)) {
            update_post_meta($post_id, 'project_status', $status);
        }
    }

    // Save project URL
    if (isset($_POST['project_url'])) {
        update_post_meta($post_id, 'project_url', esc_url_raw($_POST['project_url']));
    }

    // Save GitHub URL
    if (isset($_POST['project_github_url'])) {
        update_post_meta($post_id, 'project_github_url', esc_url_raw($_POST['project_github_url']));
    }

    // Save project demo mode
    if (isset($_POST['project_demo_mode'])) {
        $demo_mode = sanitize_text_field($_POST['project_demo_mode']);
        $allowed_modes = ['iframe', 'new_window', 'fullscreen'];
        if (in_array($demo_mode, $allowed_modes, true)) {
            update_post_meta($post_id, 'project_demo_mode', $demo_mode);
        }
    }

    // Save project screenshot
    if (isset($_POST['project_screenshot'])) {
        update_post_meta($post_id, 'project_screenshot', esc_url_raw($_POST['project_screenshot']));
    }
});
