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
					$featured_id = get_post_thumbnail_id($project->ID);
					$featured_wide = $featured_id ? wp_get_attachment_image_src($featured_id, 'project_wide') : false;
					$featured_wide_2x = $featured_id ? wp_get_attachment_image_src($featured_id, 'project_wide_2x') : false;
					$featured_srcset = $featured_id ? wp_get_attachment_image_srcset($featured_id, 'project_wide') : '';
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
				'title' => $project->post_title,
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
});


