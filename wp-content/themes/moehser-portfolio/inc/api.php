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
	
	// Endpoint for about content
	register_rest_route('moehser/v1', '/about', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$about_posts = get_posts([
				'post_type' => 'about',
				'post_status' => 'publish',
				'numberposts' => 1,
				'orderby' => 'date',
				'order' => 'DESC'
			]);
			
			if (empty($about_posts)) {
				return rest_ensure_response([
					'title' => 'Über mich',
					'subtitle' => 'Web Developer & Designer',
					'content' => 'Hier können Sie Ihren About-Text bearbeiten.',
					'skills_list' => 'React, WordPress, Docker, Node.js',
					'cta_text' => 'Kontakt aufnehmen',
					'cta_url' => '#contact'
				]);
			}
			
			$about = $about_posts[0];
			$meta = get_post_meta($about->ID);
			
			return rest_ensure_response([
				'id' => $about->ID,
				'title' => $about->post_title,
				'subtitle' => isset($meta['_about_subtitle'][0]) ? $meta['_about_subtitle'][0] : '',
				'content' => $about->post_content,
				'excerpt' => $about->post_excerpt,
				'skills_list' => isset($meta['_about_skills_list'][0]) ? $meta['_about_skills_list'][0] : '',
				'cta_text' => isset($meta['_about_cta_text'][0]) ? $meta['_about_cta_text'][0] : '',
				'cta_url' => isset($meta['_about_cta_url'][0]) ? $meta['_about_cta_url'][0] : '',
				'featured_image' => get_the_post_thumbnail_url($about->ID, 'full')
			]);
		},
	]);

	// Endpoint for projects
	register_rest_route('moehser/v1', '/projects', [
		'methods' => 'GET',
		'permission_callback' => '__return_true',
		'callback' => function ($request) {
			$status = $request->get_param('status');
			// Always order by date DESC (newest first)
			$orderby = 'date';
			$order = 'DESC';
			
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
					$result[] = [
						'id' => $project->ID,
						'title' => $project->post_title,
						'content' => $project->post_content,
						'excerpt' => $project->post_excerpt,
						'slug' => $project->post_name,
						'date' => $project->post_date,
						'modified' => $project->post_modified,
						'status' => $project->post_status,
						'featured_image' => get_the_post_thumbnail_url($project->ID, 'full'),
						'project_screenshot' => isset($meta['project_screenshot'][0]) ? $meta['project_screenshot'][0] : '',
						'project_technologies' => isset($meta['project_technologies'][0]) ? $meta['project_technologies'][0] : '',
						'project_status' => isset($meta['project_status'][0]) ? $meta['project_status'][0] : 'active',
						'project_url_external' => isset($meta['project_url'][0]) ? $meta['project_url'][0] : '',
						'project_demo_mode' => isset($meta['project_demo_mode'][0]) ? $meta['project_demo_mode'][0] : 'iframe',
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
			
			return rest_ensure_response([
				'id' => $project->ID,
				'title' => $project->post_title,
				'content' => $project->post_content,
				'excerpt' => $project->post_excerpt,
				'slug' => $project->post_name,
				'date' => $project->post_date,
				'modified' => $project->post_modified,
				'featured_image' => get_the_post_thumbnail_url($project->ID, 'full'),
				'project_technologies' => isset($meta['project_technologies'][0]) ? $meta['project_technologies'][0] : '',
				'project_status' => isset($meta['project_status'][0]) ? $meta['project_status'][0] : 'active',
				'project_url_external' => isset($meta['project_url'][0]) ? $meta['project_url'][0] : '',
				'project_demo_mode' => isset($meta['project_demo_mode'][0]) ? $meta['project_demo_mode'][0] : 'iframe',
			]);
		},
	]);
});


