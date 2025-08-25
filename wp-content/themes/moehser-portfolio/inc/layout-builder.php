<?php
/**
 * Simple Layout Builder (PHP-only)
 *
 * - Enable/disable sections (About, Skills, Projects)
 * - Define order via comma-separated field
 * - Expose window.__LAYOUT_CONFIG__ for frontend
 * - Hero section is fixed and always visible
 */

if (!defined('ABSPATH')) { exit; }

// Register Customizer controls
function moehser_register_simple_layout_builder($wp_customize) {
	$wp_customize->add_section('moehser_layout_simple', [
		'title'       => __('Layout & Sections', 'moehser-portfolio'),
		'description' => __('Enable/disable sections and define their order (comma-separated).', 'moehser-portfolio'),
		'priority'    => 25,
	]);

	$sections = ['about' => 'About', 'skills' => 'Skills', 'projects' => 'Projects'];
	foreach ($sections as $id => $label) {
		$setting_id = "moehser_show_{$id}";
		$wp_customize->add_setting($setting_id, [
			'default'           => 1,
			'sanitize_callback' => function ($v) { return (int) (bool) $v; },
			'transport'         => 'postMessage',
		]);
		$wp_customize->add_control($setting_id, [
			'label'       => sprintf(__('Show %s Section', 'moehser-portfolio'), $label),
			'section'     => 'moehser_layout_simple',
			'type'        => 'checkbox',
			'description' => sprintf(__('Toggle visibility of the %s section.', 'moehser-portfolio'), strtolower($label)),
		]);
	}

	$wp_customize->add_setting('moehser_sections_order', [
		'default'           => 'about,skills,projects',
		'sanitize_callback' => 'moehser_sanitize_sections_order',
		'transport'         => 'postMessage',
	]);
	$wp_customize->add_control('moehser_sections_order', [
		'label'       => __('Sections Order', 'moehser-portfolio'),
		'description' => __('Comma-separated: about, skills, projects. Example: about,projects,skills', 'moehser-portfolio'),
		'section'    => 'moehser_layout_simple',
		'type'        => 'text',
		'input_attrs' => ['placeholder' => 'about,skills,projects'],
	]);
}
add_action('customize_register', 'moehser_register_simple_layout_builder');

function moehser_sanitize_sections_order($value) {
	$allowed = ['about','skills','projects'];
	if (!is_string($value)) return 'about,skills,projects';
	$parts = array_map('trim', explode(',', strtolower($value)));
	$parts = array_values(array_unique(array_filter($parts, fn($p)=>in_array($p,$allowed,true))));
	foreach ($allowed as $id) if (!in_array($id,$parts,true)) $parts[]=$id;
	return implode(',', $parts);
}

function moehser_get_layout_config() {
	$visibility = [
		'about'    => (bool) get_theme_mod('moehser_show_about', 1),
		'skills'   => (bool) get_theme_mod('moehser_show_skills', 1),
		'projects' => (bool) get_theme_mod('moehser_show_projects', 1),
	];
	$order_str = get_theme_mod('moehser_sections_order', 'about,skills,projects');
	$order = array_map('trim', explode(',', $order_str));
	$order = array_values(array_filter($order, fn($id)=>isset($visibility[$id]) && $visibility[$id]));
	return ['order'=>$order,'visibility'=>$visibility,'all'=>['about','skills','projects']];
}

function moehser_output_layout_config_inline() {
	$config = moehser_get_layout_config();
	echo "\n<script id=\"moehser-layout-config\">";
	echo 'window.__LAYOUT_CONFIG__ = ' . wp_json_encode($config) . ';';
	echo "</script>\n";
}
add_action('wp_head', 'moehser_output_layout_config_inline', 40);

/**
 * Enqueue Layout Builder JavaScript
 */
function moehser_enqueue_layout_builder_js() {
	// Only load on frontend
	if (is_admin()) {
		return;
	}

	// Enqueue live-updates.js AFTER main React bundle so sections exist
	// Also ensure Customizer preview API is available
	$deps = ['moehser-portfolio-main', 'customize-preview'];
	wp_enqueue_script(
		'moehser-layout-builder',
		get_theme_file_uri('assets/src/js/features/layout-builder/live-updates.js'),
		$deps,
		'1.0.0',
		true
	);
}
add_action('wp_enqueue_scripts', 'moehser_enqueue_layout_builder_js');

/**
 * Enqueue a Customizer controls-side script to sync 'Show Skills Section'
 * with Adaptive mode card enablement, so the checkbox state updates in the UI.
 */
function moehser_enqueue_layout_builder_controls_js() {
    wp_enqueue_script(
        'moehser-layout-builder-controls',
        get_theme_file_uri('assets/src/js/features/layout-builder/controls-sync.js'),
        ['customize-controls'],
        '1.0.0',
        true
    );
}
add_action('customize_controls_enqueue_scripts', 'moehser_enqueue_layout_builder_controls_js');
