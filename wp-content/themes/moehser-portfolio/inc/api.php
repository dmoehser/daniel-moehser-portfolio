<?php

/**
 * Minimal REST endpoints consumed by the React app.
 */

add_action('rest_api_init', function () {
	// Simple menu endpoint - just get current site's menu
	register_rest_route('moehser/v1', '/menu/(?P<location>[a-z_\-]+)', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$location = sanitize_key($request['location']);
			
			// Get menu locations from current site
			$locations = get_nav_menu_locations();
			
			if (!isset($locations[$location])) {
				return new WP_Error('menu_not_found', 'Menu location not found', ['status' => 404]);
			}
			
			$menu_id = $locations[$location];
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

	// Endpoint for projects
	register_rest_route('moehser/v1', '/projects', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			// Check if we're on localized path
			$is_localized = preg_match('/\/[a-z]{2}\//', $_SERVER['REQUEST_URI'] ?? '');
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
					
					// Get language-specific content
					$title = html_entity_decode($project->post_title, ENT_QUOTES | ENT_HTML5, 'UTF-8');
					$content = $project->post_content;
					$excerpt = $project->post_excerpt;
					
					// Check for German translations in meta
					if ($is_localized) {
						$title_de = isset($meta['project_title_de'][0]) ? $meta['project_title_de'][0] : '';
						$content_de = isset($meta['project_content_de'][0]) ? $meta['project_content_de'][0] : '';
						$excerpt_de = isset($meta['project_excerpt_de'][0]) ? $meta['project_excerpt_de'][0] : '';
						
						if (!empty($title_de)) $title = $title_de;
						if (!empty($content_de)) $content = $content_de;
						if (!empty($excerpt_de)) $excerpt = $excerpt_de;
					}
					
					$result[] = [
						'id' => $project->ID,
						'title' => $title,
						'content' => $content,
						'excerpt' => $excerpt,
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
						'language' => $is_localized ? 'de' : 'en',
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

	// Language-specific content endpoint
	register_rest_route('moehser/v1', '/content', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$is_localized = preg_match('/\/[a-z]{2}\//', $_SERVER['REQUEST_URI'] ?? '');
			
			// Get language-specific content from customizer
			$content = [
				'language' => $is_localized ? 'de' : 'en',
				'about' => [
					'title' => $is_localized ? 
						get_theme_mod('moehser_about_title_de', 'Über mich') : 
						get_theme_mod('moehser_about_title', 'About Me'),
					'subtitle' => $is_localized ? 
						get_theme_mod('moehser_about_subtitle_de', 'Meine Geschichte & Erfahrung') : 
						get_theme_mod('moehser_about_subtitle', 'My story & experience'),
				],
				'projects' => [
					'title' => $is_localized ? 
						get_theme_mod('moehser_projects_title_de', 'Projekte') : 
						get_theme_mod('moehser_projects_title', 'Projects'),
					'subtitle' => $is_localized ? 
						get_theme_mod('moehser_projects_subtitle_de', 'Meine neuesten Arbeiten und Projekte') : 
						get_theme_mod('moehser_projects_subtitle', 'My latest work and projects'),
				],
				'skills' => [
					'title' => $is_localized ? 
						get_theme_mod('moehser_skills_title_de', 'Fähigkeiten') : 
						get_theme_mod('moehser_skills_title', 'Skills'),
					'subtitle' => $is_localized ? 
						get_theme_mod('moehser_skills_subtitle_de', 'Technologien & Tools mit denen ich arbeite') : 
						get_theme_mod('moehser_skills_subtitle', 'Technologies & tools I work with'),
				],
				'imprint' => [
					'title' => $is_localized ? 
						get_theme_mod('moehser_imprint_title_de', 'Impressum') : 
						get_theme_mod('moehser_imprint_title', 'Imprint'),
				]
			];
			
			// Add skills cards
			$skills_cards = [];
			for ($i = 1; $i <= 5; $i++) {
				$card_id = "card{$i}";
				$skills_cards[$card_id] = [
					'title' => $is_localized ? 
						get_theme_mod("moehser_skills_{$card_id}_title_de", '') : 
						get_theme_mod("moehser_skills_{$card_id}_title", ''),
					'description' => $is_localized ? 
						get_theme_mod("moehser_skills_{$card_id}_description_de", '') : 
						get_theme_mod("moehser_skills_{$card_id}_description", ''),
					'tags' => $is_localized ? 
						get_theme_mod("moehser_skills_{$card_id}_tags_de", '') : 
						get_theme_mod("moehser_skills_{$card_id}_tags", ''),
					'skills_list' => $is_localized ? 
						get_theme_mod("moehser_skills_{$card_id}_skills_list_de", '') : 
						get_theme_mod("moehser_skills_{$card_id}_skills_list", ''),
				];
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
				
				// Get recipient email from customizer (Social email setting)
				$recipient_email = get_theme_mod('moehser_social_email', 'hi@danielmoehser.dev');
				
				// Prepare email content
				$name = sanitize_text_field($data['name']);
				$email = sanitize_email($data['email']);
				$subject = sanitize_text_field($data['subject']);
				$message = sanitize_textarea_field($data['message']);
				
				// Email headers
				$headers = [
					'Content-Type: text/html; charset=UTF-8',
					'From: ' . $name . ' <' . $email . '>',
					'Reply-To: ' . $email
				];
				
				// Email content
				$email_content = "
					<h3>New Contact Form Submission</h3>
					<p><strong>Name:</strong> {$name}</p>
					<p><strong>Email:</strong> {$email}</p>
					<p><strong>Subject:</strong> {$subject}</p>
					<p><strong>Message:</strong></p>
					<p>{$message}</p>
				";
				
				// Get email subject from customizer
				$email_subject = get_theme_mod('moehser_email_subject', 'Portfolio Contact - New Inquiry');
				
				// Send email
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


