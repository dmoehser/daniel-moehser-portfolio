<?php

// REST API endpoints for React frontend
// ====================================

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

add_action('rest_api_init', function () {
	// Menu endpoint
	register_rest_route('moehser/v1', '/menu/(?P<location>[a-z_\-]+)', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
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
				return new WP_Error('menu_not_found', 'Menu location not found', ['status' => 404]);
			}
			
			$menu_id = $locations[$menu_location];
			$items = wp_get_nav_menu_items($menu_id) ?: [];
			
			$result = array_map(function ($item) {
				return [
					'id' => (int)$item->ID,
					'parent' => (int)$item->menu_item_parent,
					'title' => wp_strip_all_tags($item->title),
					'url' => $item->url,
					'target' => $item->target,
					'attr_title' => $item->attr_title,
				];
			}, $items);
			
			return rest_ensure_response($result);
		},
	]);

	// Projects endpoint
	register_rest_route('moehser/v1', '/projects', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$status = $request->get_param('status');
			// Order by menu_order ASC (custom order), then by date DESC as fallback
			$orderby = 'menu_order';
			$order = 'ASC';
			
			$args = [
				'post_type' => 'project',
				'post_status' => ['publish'],
				'posts_per_page' => -1,
				'orderby' => $orderby,
				'order' => $order,
			];

			// Filter by status if specified
			if ($status && in_array($status, ['active', 'archived', 'development'], true)) {
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
					$meta = get_post_meta($project->ID);
					$featured_data = get_featured_image_data($project->ID);
					
					// Get project content
					$title = html_entity_decode($project->post_title, ENT_QUOTES | ENT_HTML5, 'UTF-8');
					
					$result[] = array_merge([
						'id' => $project->ID,
						'title' => $title,
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
			}

			return rest_ensure_response($result);
		},
	]);

	// Single project endpoint
	register_rest_route('moehser/v1', '/projects/(?P<id>\d+)', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$project_id = intval($request['id']);
			$project = get_post($project_id);
			
			if (!$project || $project->post_type !== 'project') {
				return new WP_Error('project_not_found', 'Project not found', ['status' => 404]);
			}

			$meta = get_post_meta($project_id);
			$featured_data = get_featured_image_data($project->ID);

			return rest_ensure_response(array_merge([
				'id' => $project->ID,
				'title' => html_entity_decode($project->post_title, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
				'content' => $project->post_content,
				'excerpt' => $project->post_excerpt,
				'slug' => $project->post_name,
				'date' => $project->post_date,
				'modified' => $project->post_modified,
				'project_technologies' => isset($meta['project_technologies'][0]) ? $meta['project_technologies'][0] : '',
				'project_status' => isset($meta['project_status'][0]) ? $meta['project_status'][0] : 'active',
				'project_url_external' => isset($meta['project_url'][0]) ? $meta['project_url'][0] : '',
				'project_demo_mode' => isset($meta['project_demo_mode'][0]) ? $meta['project_demo_mode'][0] : 'iframe',
				'project_github_url' => isset($meta['project_github_url'][0]) ? $meta['project_github_url'][0] : '',
			], $featured_data));
		},
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
		'callback' => function ($request) {
			try {
				$data = $request->get_json_params();
				
				// Validate fields
				$required_fields = ['name', 'email', 'subject', 'message'];
				foreach ($required_fields as $field) {
					if (empty($data[$field])) {
						return new WP_Error('missing_field', "Field '{$field}' is required", ['status' => 400]);
					}
				}
				
				// Validate email
				if (!is_email($data['email'])) {
					return new WP_Error('invalid_email', 'Invalid email address', ['status' => 400]);
				}
				
				// Get recipient email
				$recipient_email = get_theme_mod('moehser_social_email', 'hi@danielmoehser.dev');
				
				// Email content
				$name = sanitize_text_field($data['name']);
				$email = sanitize_email($data['email']);
				$subject = sanitize_text_field($data['subject']);
				$message = sanitize_textarea_field($data['message']);
				
				// Headers
				$headers = [
					'Content-Type: text/html; charset=UTF-8',
					'From: ' . $name . ' <' . $email . '>',
					'Reply-To: ' . $email
				];
				
				// Content
				$email_content = get_contact_email_template($name, $email, $subject, $message);
				
				// Email subject
				$email_subject = get_theme_mod('moehser_email_subject', 'Portfolio Contact - New Inquiry');
				
				// Send
				$email_sent = wp_mail($recipient_email, $email_subject . ': ' . $subject, $email_content, $headers);
				
				if ($email_sent) {
					return rest_ensure_response([
						'success' => true,
						'message' => 'Message sent successfully!'
					]);
				} else {
					return new WP_Error('email_failed', 'Failed to send email', ['status' => 500]);
				}
				
			} catch (Exception $e) {
				return new WP_Error('server_error', 'Internal server error: ' . $e->getMessage(), ['status' => 500]);
			}
		},
	]);
});
