<?php

// REST API endpoints for React frontend
// ====================================

// Constants
// ---------
const REQUIRED_CONTACT_FIELDS = ['name', 'email', 'subject', 'message'];
const PROJECT_STATUSES = ['active', 'archived', 'development'];

// Helper function for API error responses
// --------------------------------------
function api_error($code, $message, $status = 400) {
    return new WP_Error($code, $message, ['status' => $status]);
}

// Helper function for project data processing
// ------------------------------------------
function get_project_data($project) {
    $meta = get_post_meta($project->ID);
    $featured_data = get_featured_image_data($project->ID);
    
    return array_merge([
        'id' => $project->ID,
        'title' => html_entity_decode($project->post_title, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
        'content' => $project->post_content,
        'excerpt' => $project->post_excerpt,
        'slug' => $project->post_name,
        'date' => $project->post_date,
        'modified' => $project->post_modified,
        'status' => $project->post_status,
        'menu_order' => $project->menu_order,
        'project_screenshot' => isset($meta['project_screenshot'][0]) ? $meta['project_screenshot'][0] : '',
        'project_technologies' => isset($meta['project_technologies'][0]) ? $meta['project_technologies'][0] : '',
        'project_status' => isset($meta['project_status'][0]) ? $meta['project_status'][0] : 'active',
        'project_url_external' => isset($meta['project_url'][0]) ? $meta['project_url'][0] : '',
        'project_demo_mode' => isset($meta['project_demo_mode'][0]) ? $meta['project_demo_mode'][0] : 'iframe',
        'project_github_url' => isset($meta['project_github_url'][0]) ? $meta['project_github_url'][0] : '',
    ], $featured_data);
}

// Helper function for contact form validation
// -------------------------------------------
function validate_contact_data($data) {
    foreach (REQUIRED_CONTACT_FIELDS as $field) {
        if (empty($data[$field])) {
            return api_error('missing_field', "Field '{$field}' is required", 400);
        }
    }
    
    if (!is_email($data['email'])) {
        return api_error('invalid_email', 'Invalid email address', 400);
    }
    
    return null; // No errors
}

// Helper function for menu processing
// ----------------------------------
function process_menu_items($items) {
    return array_map(function ($item) {
        return [
            'id' => (int)$item->ID,
            'parent' => (int)$item->menu_item_parent,
            'title' => wp_strip_all_tags($item->title),
            'url' => $item->url,
            'target' => $item->target,
            'attr_title' => $item->attr_title,
        ];
    }, $items);
}

// Helper function for featured image data
// --------------------------------------
function get_featured_image_data($post_id) {
	$featured_id = get_post_thumbnail_id($post_id);
	if (!$featured_id) {
		return [
			'featured_image' => '',
			'featured_image_wide' => '',
			'featured_image_wide_2x' => '',
			'featured_image_srcset' => '',
			'featured_image_wide_w' => 0,
			'featured_image_wide_h' => 0,
			'featured_image_alt' => ''
		];
	}
	
	$featured_wide = wp_get_attachment_image_src($featured_id, 'project_wide');
	$featured_wide_2x = wp_get_attachment_image_src($featured_id, 'project_wide_2x');
	$featured_srcset = wp_get_attachment_image_srcset($featured_id, 'project_wide');
	$featured_alt = get_post_meta($featured_id, '_wp_attachment_image_alt', true);
	
	return [
		'featured_image' => get_the_post_thumbnail_url($post_id, 'full'),
		'featured_image_wide' => $featured_wide ? $featured_wide[0] : '',
		'featured_image_wide_2x' => $featured_wide_2x ? $featured_wide_2x[0] : '',
		'featured_image_srcset' => $featured_srcset ?: '',
		'featured_image_wide_w' => $featured_wide ? (int) $featured_wide[1] : 0,
		'featured_image_wide_h' => $featured_wide ? (int) $featured_wide[2] : 0,
		'featured_image_alt' => $featured_alt ?: get_the_title($post_id)
	];
}

// Helper function for email template
// ---------------------------------
function get_contact_email_template($name, $email, $subject, $message) {
	return "
		<h3>New Contact Form Submission</h3>
		<p><strong>Name:</strong> {$name}</p>
		<p><strong>Email:</strong> {$email}</p>
		<p><strong>Subject:</strong> {$subject}</p>
		<p><strong>Message:</strong></p>
		<p>{$message}</p>
	";
}

// Menu request handler
// -------------------
function handle_menu_request($request) {
    $location = sanitize_key($request['location']);
    
    // Detect language from request
    $is_german = false;
    $referer = $request->get_header('referer');
    if ($referer && strpos($referer, '/de/') !== false) {
        $is_german = true;
    }
    
    // Try language-specific menu location first
    $language_specific_location = $is_german ? $location . '_de' : $location . '_en';
    $locations = get_nav_menu_locations();
    
    // Use language-specific menu if available, otherwise fallback to default
    $menu_location = isset($locations[$language_specific_location]) ? $language_specific_location : $location;
    
    if (!isset($locations[$menu_location])) {
        return api_error('menu_not_found', 'Menu location not found', 404);
    }
    
    $menu_id = $locations[$menu_location];
    $items = wp_get_nav_menu_items($menu_id) ?: [];
    
    return rest_ensure_response(process_menu_items($items));
}

// Projects request handler
// -----------------------
function handle_projects_request($request) {
    $status = $request->get_param('status');
    
    $args = [
        'post_type' => 'project',
        'post_status' => ['publish'],
        'posts_per_page' => -1,
        'orderby' => 'menu_order',
        'order' => 'ASC',
    ];

    // Filter by status if specified
    if ($status && in_array($status, PROJECT_STATUSES, true)) {
        $args['meta_query'] = [
            [
                'key' => 'project_status',
                'value' => $status,
                'compare' => '='
            ]
        ];
    }

    $projects = get_posts($args);
    $result = [];
    
    if (!empty($projects)) {
        foreach ($projects as $project) {
            $result[] = get_project_data($project);
        }
    }

    return rest_ensure_response($result);
}

// Single project request handler
// -----------------------------
function handle_single_project_request($request) {
    $project_id = intval($request['id']);
    $project = get_post($project_id);
    
    if (!$project || $project->post_type !== 'project') {
        return api_error('project_not_found', 'Project not found', 404);
    }

    return rest_ensure_response(get_project_data($project));
}

// Contact form request handler
// ---------------------------
function handle_contact_request($request) {
    try {
        $data = $request->get_json_params();
        
        // Validate data
        $validation_error = validate_contact_data($data);
        if ($validation_error) {
            return $validation_error;
        }
        
        // Get recipient email
        $recipient_email = get_theme_mod('moehser_social_email', 'hi@danielmoehser.dev');
        
        // Sanitize data
        $name = sanitize_text_field($data['name']);
        $email = sanitize_email($data['email']);
        $subject = sanitize_text_field($data['subject']);
        $message = sanitize_textarea_field($data['message']);
        
        // Prepare email
        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $name . ' <' . $email . '>',
            'Reply-To: ' . $email
        ];
        
        $email_content = get_contact_email_template($name, $email, $subject, $message);
        $email_subject = get_theme_mod('moehser_email_subject', 'Portfolio Contact - New Inquiry');
        
        // Send email
        $email_sent = wp_mail($recipient_email, $email_subject . ': ' . $subject, $email_content, $headers);
        
        if ($email_sent) {
            return rest_ensure_response([
                'success' => true,
                'message' => 'Message sent successfully!'
            ]);
        } else {
            return api_error('email_failed', 'Failed to send email', 500);
        }
        
    } catch (Exception $e) {
        return api_error('server_error', 'Internal server error: ' . $e->getMessage(), 500);
    }
}

add_action('rest_api_init', function () {
	// Menu endpoint
	register_rest_route('moehser/v1', '/menu/(?P<location>[a-z_\-]+)', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => 'handle_menu_request',
	]);

	// Projects endpoint
	register_rest_route('moehser/v1', '/projects', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => 'handle_projects_request',
	]);

	// Single project endpoint
	register_rest_route('moehser/v1', '/projects/(?P<id>\d+)', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => 'handle_single_project_request',
	]);

	// Project reordering endpoint
	register_rest_route('moehser/v1', '/projects/reorder', [
		'methods' => 'POST',
		'permission_callback' => function () {
			return current_user_can('edit_posts');
		},
		'callback' => function ($request) {
			$project_ids = $request->get_json_params();
			
			if (!is_array($project_ids)) {
				return new WP_Error('invalid_data', 'Invalid project IDs array', ['status' => 400]);
			}
			
			foreach ($project_ids as $index => $project_id) {
				$project_id = intval($project_id);
				if ($project_id <= 0) {
					continue;
				}
				
				// Update menu_order for each project
				wp_update_post([
					'ID' => $project_id,
					'menu_order' => $index
				]);
			}
			
			return rest_ensure_response(['success' => true, 'message' => 'Projects reordered successfully']);
		},
	]);

	// Content endpoint
	register_rest_route('moehser/v1', '/content', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			// Get customizer content
			$content = [
				'language' => 'en',
				'about' => [
					'title' => get_theme_mod('moehser_about_title', 'About Me'),
					'subtitle' => get_theme_mod('moehser_about_subtitle', 'My story & experience'),
				],
				'projects' => [
					'title' => get_theme_mod('moehser_projects_title', 'Projects'),
					'subtitle' => get_theme_mod('moehser_projects_subtitle', 'My latest work and projects'),
				],
				'skills' => [
					'title' => get_theme_mod('moehser_skills_title', 'Skills'),
					'subtitle' => get_theme_mod('moehser_skills_subtitle', 'Technologies & tools I work with'),
				],
				'imprint' => [
					'title' => get_theme_mod('moehser_imprint_title', 'Imprint'),
				]
			];
			
			// Skills cards
			$skills_cards = [];
			$card_fields = ['title', 'description', 'tags', 'skills_list'];
			
			for ($i = 1; $i <= 5; $i++) {
				$card_id = "card{$i}";
				$skills_cards[$card_id] = [];
				
				foreach ($card_fields as $field) {
					$skills_cards[$card_id][$field] = get_theme_mod("moehser_skills_{$card_id}_{$field}", '');
				}
			}
			$content['skills']['cards'] = $skills_cards;
			
			return rest_ensure_response($content);
		},
	]);

	// Contact form endpoint
	register_rest_route('moehser/v1', '/contact', [
		'methods' => 'POST',
		'permission_callback' => '__return_true',
		'callback' => 'handle_contact_request',
	]);
});
