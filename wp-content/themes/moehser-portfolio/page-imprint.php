<?php
/**
 * Template Name: Imprint Page
 * 
 * Custom template for the imprint page
 */

get_header(); ?>

<!-- Load main CSS and JS for imprint page -->
<?php
// Load CSS and JS dynamically from manifest
$manifest_path = get_theme_file_path('assets/dist/manifest.json');
if (file_exists($manifest_path)) {
    $manifest = json_decode(file_get_contents($manifest_path), true);
    $entry = $manifest['assets/src/js/main.jsx'] ?? null;
    if ($entry) {
        // Load CSS
        if (!empty($entry['css']) && is_array($entry['css'])) {
            foreach ($entry['css'] as $cssFile) {
                echo '<link rel="stylesheet" href="' . get_theme_file_uri('assets/dist/' . $cssFile) . '" type="text/css" media="all" />' . "\n";
            }
        }
        // Load JS
        if (!empty($entry['file'])) {
            echo '<script type="module" src="' . get_theme_file_uri('assets/dist/' . $entry['file']) . '"></script>' . "\n";
        }
    }
}
?>

<div id="react-root">
    <!-- React will mount here -->
</div>

<?php get_footer(); ?>
