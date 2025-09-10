<?php

/**
 * Minimal REST endpoints consumed by the React app.
 */

add_action('rest_api_init', function () {
	// Expose a menu location as a flat list of items with parent references
	register_rest_route('moehser/v1', '/menu/(?P<location>[a-z_\-]+)', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$location = sanitize_key($request['location']);
			$locations = get_nav_menu_locations();
			if (!isset($locations[$location])) {
				return new WP_Error('menu_not_found', 'Menu location not found', ['status' => 404]);
			}
			$menu_id = $locations[$location];
			$items = wp_get_nav_menu_items($menu_id) ?: [];
			$result = array_map(function ($item) {
				// Clean URL from customize_changeset_uuid parameter
				$clean_url = $item->url;
				$original_url = $item->url;
				
				// Debug: Log original URL
				error_log("DEBUG API - Original URL: " . $original_url);
				
				if (strpos($clean_url, 'customize_changeset_uuid=') !== false) {
					$clean_url = remove_query_arg('customize_changeset_uuid', $clean_url);
					error_log("DEBUG API - Cleaned URL: " . $clean_url);
				}
				
				return [
					'id' => (int)$item->ID,
					'parent' => (int)$item->menu_item_parent,
					'title' => wp_strip_all_tags($item->title),
					'url' => $clean_url,
					'target' => $item->target,
					'attr_title' => $item->attr_title,
				];
			}, $items);
			return rest_ensure_response($result);
		},
	]);

	// Endpoint for projects
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
					$featured_id = get_post_thumbnail_id($project->ID);
					$featured_wide = $featured_id ? wp_get_attachment_image_src($featured_id, 'project_wide') : false;
					$featured_wide_2x = $featured_id ? wp_get_attachment_image_src($featured_id, 'project_wide_2x') : false;
					$featured_srcset = $featured_id ? wp_get_attachment_image_srcset($featured_id, 'project_wide') : '';
					$result[] = [
						'id' => $project->ID,
						'title' => html_entity_decode($project->post_title, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
						'content' => $project->post_content,
						'excerpt' => $project->post_excerpt,
						'slug' => $project->post_name,
						'date' => $project->post_date,
						'modified' => $project->post_modified,
						'status' => $project->post_status,
						'menu_order' => $project->menu_order,
						'featured_image' => get_the_post_thumbnail_url($project->ID, 'full'),
						'featured_image_wide' => $featured_wide ? $featured_wide[0] : '',
						'featured_image_wide_2x' => $featured_wide_2x ? $featured_wide_2x[0] : '',
						'featured_image_srcset' => $featured_srcset ?: '',
						'featured_image_wide_w' => $featured_wide ? (int) $featured_wide[1] : 0,
						'featured_image_wide_h' => $featured_wide ? (int) $featured_wide[2] : 0,
						'project_screenshot' => isset($meta['project_screenshot'][0]) ? $meta['project_screenshot'][0] : '',
						'project_technologies' => isset($meta['project_technologies'][0]) ? $meta['project_technologies'][0] : '',
						'project_status' => isset($meta['project_status'][0]) ? $meta['project_status'][0] : 'active',
						'project_url_external' => isset($meta['project_url'][0]) ? $meta['project_url'][0] : '',
						'project_demo_mode' => isset($meta['project_demo_mode'][0]) ? $meta['project_demo_mode'][0] : 'iframe',
						'project_github_url' => isset($meta['project_github_url'][0]) ? $meta['project_github_url'][0] : '',
					];
				}
			}

			return rest_ensure_response($result);
		},
	]);

	// Endpoint for single project
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
			
			$featured_id = get_post_thumbnail_id($project->ID);
			$featured_wide = $featured_id ? wp_get_attachment_image_src($featured_id, 'project_wide') : false;
			$featured_wide_2x = $featured_id ? wp_get_attachment_image_src($featured_id, 'project_wide_2x') : false;
			$featured_srcset = $featured_id ? wp_get_attachment_image_srcset($featured_id, 'project_wide') : '';

			return rest_ensure_response([
				'id' => $project->ID,
				'title' => html_entity_decode($project->post_title, ENT_QUOTES | ENT_HTML5, 'UTF-8'),
				'content' => $project->post_content,
				'excerpt' => $project->post_excerpt,
				'slug' => $project->post_name,
				'date' => $project->post_date,
				'modified' => $project->post_modified,
				'featured_image' => get_the_post_thumbnail_url($project->ID, 'full'),
				'featured_image_wide' => $featured_wide ? $featured_wide[0] : '',
				'featured_image_wide_2x' => $featured_wide_2x ? $featured_wide_2x[0] : '',
				'featured_image_srcset' => $featured_srcset ?: '',
				'project_technologies' => isset($meta['project_technologies'][0]) ? $meta['project_technologies'][0] : '',
				'project_status' => isset($meta['project_status'][0]) ? $meta['project_status'][0] : 'active',
				'project_url_external' => isset($meta['project_url'][0]) ? $meta['project_url'][0] : '',
				'project_demo_mode' => isset($meta['project_demo_mode'][0]) ? $meta['project_demo_mode'][0] : 'iframe',
				'project_github_url' => isset($meta['project_github_url'][0]) ? $meta['project_github_url'][0] : '',
			]);
		},
	]);

	// Endpoint for reordering projects
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

	// Contact form endpoint
	register_rest_route('moehser/v1', '/contact', [
		'methods' => 'POST',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$data = $request->get_json_params();
			
			// Validate required fields
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
			
			// Verify reCAPTCHA (optional for now)
			$recaptcha_token = $data['recaptchaToken'] ?? '';
			if (!empty($recaptcha_token)) {
				// TODO: Add reCAPTCHA verification
				// For now, we'll just log it
				error_log('reCAPTCHA token received: ' . substr($recaptcha_token, 0, 20) . '...');
			}
			
			// Get recipient email from customizer
			$recipient_email = get_theme_mod('moehser_social_email', 'hi@danielmoehser.dev');
			
			// Prepare email content
			$subject = 'Portfolio Contact: ' . sanitize_text_field($data['subject']);
			$message = "Name: " . sanitize_text_field($data['name']) . "\n";
			$message .= "Email: " . sanitize_email($data['email']) . "\n";
			$message .= "Subject: " . sanitize_text_field($data['subject']) . "\n\n";
			$message .= "Message:\n" . sanitize_textarea_field($data['message']);
			
			$headers = [
				'Content-Type: text/plain; charset=UTF-8',
				'From: ' . sanitize_text_field($data['name']) . ' <' . sanitize_email($data['email']) . '>',
				'Reply-To: ' . sanitize_email($data['email'])
			];
			
			// Send email
			$mail_sent = wp_mail($recipient_email, $subject, $message, $headers);
			
			if ($mail_sent) {
				return rest_ensure_response([
					'success' => true,
					'message' => 'Message sent successfully'
				]);
			} else {
				return new WP_Error('mail_failed', 'Failed to send email', ['status' => 500]);
			}
		},
	]);
});


