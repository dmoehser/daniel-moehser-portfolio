<?php
/**
 * German Customizer Settings for Moehser Portfolio
 * 
 * Provides German-specific customizer options
 * that override English defaults when on DE subdomain
 */

if (!defined('ABSPATH')) {
    exit;
}

// Only load German customizer on German subdomain
if (!is_german_subdomain()) {
    return;
}

add_action('customize_register', function (WP_Customize_Manager $wp_customize) {
    
    // Section: German Profile Settings
    $wp_customize->add_section('moehser_profile_de', [
        'title' => __('Profil-Einstellungen (Deutsch)', 'moehser-portfolio'),
        'description' => __('Konfigurieren Sie Ihr persönliches Profil und soziale Links für die deutsche Version', 'moehser-portfolio'),
        'priority' => 30,
    ]);

    // German About Section Title
    $wp_customize->add_setting('moehser_about_title_de', [
        'default' => __('Über mich', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_about_title_de', [
        'label' => __('About-Sektion Titel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Haupttitel für die About-Sektion auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'text',
    ]);

    // German About Section Subtitle
    $wp_customize->add_setting('moehser_about_subtitle_de', [
        'default' => __('Meine Geschichte & Erfahrung', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_about_subtitle_de', [
        'label' => __('About-Sektion Untertitel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Untertitel unter dem Haupttitel auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'textarea',
    ]);

    // German About content source page
    $wp_customize->add_setting('moehser_about_page_id_de', [
        'default' => 0,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_about_page_id_de', [
        'label' => __('About-Inhalt Seite (Deutsch)', 'moehser-portfolio'),
        'description' => __('Wählen Sie die WordPress-Seite für den deutschen About-Inhalt', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'dropdown-pages',
        'allow_addition' => true,
    ]);

    // German Projects Section Title
    $wp_customize->add_setting('moehser_projects_title_de', [
        'default' => __('Projekte', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_projects_title_de', [
        'label' => __('Projekte-Sektion Titel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Haupttitel für die Projekte-Sektion auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'text',
    ]);

    // German Projects Section Subtitle
    $wp_customize->add_setting('moehser_projects_subtitle_de', [
        'default' => __('Meine neuesten Arbeiten und Projekte', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_projects_subtitle_de', [
        'label' => __('Projekte-Sektion Untertitel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Untertitel für die Projekte-Sektion auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'text',
    ]);

    // German Skills Section Title
    $wp_customize->add_setting('moehser_skills_title_de', [
        'default' => __('Fähigkeiten', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_title_de', [
        'label' => __('Skills-Sektion Titel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Haupttitel für die Skills-Sektion auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'text',
    ]);

    // German Skills Section Subtitle
    $wp_customize->add_setting('moehser_skills_subtitle_de', [
        'default' => __('Technologien & Tools mit denen ich arbeite', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_skills_subtitle_de', [
        'label' => __('Skills-Sektion Untertitel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Untertitel für die Skills-Sektion auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'text',
    ]);

    // German Skills Cards
    $this->add_german_skills_cards($wp_customize);

    // German Imprint Settings
    $wp_customize->add_setting('moehser_imprint_title_de', [
        'default' => __('Impressum', 'moehser-portfolio'),
        'sanitize_callback' => 'wp_kses_post',
    ]);
    $wp_customize->add_control('moehser_imprint_title_de', [
        'label' => __('Impressum Titel (Deutsch)', 'moehser-portfolio'),
        'description' => __('Titel für die Impressum-Seite auf Deutsch', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'text',
    ]);

    // German Imprint content source page
    $wp_customize->add_setting('moehser_imprint_page_id_de', [
        'default' => 0,
        'sanitize_callback' => 'absint',
        'transport' => 'postMessage',
    ]);
    $wp_customize->add_control('moehser_imprint_page_id_de', [
        'label' => __('Impressum-Inhalt Seite (Deutsch)', 'moehser-portfolio'),
        'description' => __('Wählen Sie eine Seite für den deutschen Impressum-Inhalt', 'moehser-portfolio'),
        'section' => 'moehser_profile_de',
        'type' => 'dropdown-pages',
    ]);
});

/**
 * Add German skills cards to customizer
 */
function add_german_skills_cards($wp_customize) {
    $skills_cards = [
        [
            'id' => 'card1',
            'title' => 'Frontend-Entwicklung',
            'description' => '',
            'tags' => 'React, Vue.js, TypeScript',
            'skills' => 'HTML5, CSS3, JavaScript, React, Vue.js, TypeScript, SCSS, Tailwind CSS'
        ],
        [
            'id' => 'card2', 
            'title' => 'Backend-Entwicklung',
            'description' => '',
            'tags' => 'Node.js, PHP, Python',
            'skills' => 'Node.js, PHP, Python, MySQL, PostgreSQL, MongoDB, REST APIs, GraphQL'
        ],
        [
            'id' => 'card3',
            'title' => 'Design & UX',
            'description' => '',
            'tags' => 'Figma, Adobe XD, Sketch',
            'skills' => 'UI/UX Design, Prototyping, Wireframing, User Research, Design Systems'
        ],
        [
            'id' => 'card4',
            'title' => 'DevOps & Tools',
            'description' => 'Optimierung von Entwicklungs-Workflows und Deployment-Prozessen.',
            'tags' => 'Docker, AWS, CI/CD',
            'skills' => 'Docker, AWS, CI/CD, Git, GitHub Actions, Linux, Nginx, Apache'
        ],
        [
            'id' => 'card5',
            'title' => 'Mobile Entwicklung',
            'description' => 'Entwicklung nativer und plattformübergreifender mobiler Anwendungen.',
            'tags' => 'React Native, Flutter',
            'skills' => 'React Native, Flutter, iOS, Android, Progressive Web Apps'
        ]
    ];

    foreach ($skills_cards as $card) {
        // Card Title
        $wp_customize->add_setting("moehser_skills_{$card['id']}_title_de", [
            'default' => $card['title'],
            'sanitize_callback' => 'wp_kses_post',
        ]);
        $wp_customize->add_control("moehser_skills_{$card['id']}_title_de", [
            'label' => sprintf(__('Skills Card %s - Titel (Deutsch)', 'moehser-portfolio'), 
                             strtoupper($card['id'])),
            'section' => 'moehser_profile_de',
            'type' => 'text',
        ]);

        // Card Description (if applicable)
        if (!empty($card['description'])) {
            $wp_customize->add_setting("moehser_skills_{$card['id']}_description_de", [
                'default' => $card['description'],
                'sanitize_callback' => 'wp_kses_post',
            ]);
            $wp_customize->add_control("moehser_skills_{$card['id']}_description_de", [
                'label' => sprintf(__('Skills Card %s - Beschreibung (Deutsch)', 'moehser-portfolio'), 
                                 strtoupper($card['id'])),
                'section' => 'moehser_profile_de',
                'type' => 'textarea',
            ]);
        }

        // Card Tags
        $wp_customize->add_setting("moehser_skills_{$card['id']}_tags_de", [
            'default' => $card['tags'],
            'sanitize_callback' => 'sanitize_text_field',
        ]);
        $wp_customize->add_control("moehser_skills_{$card['id']}_tags_de", [
            'label' => sprintf(__('Skills Card %s - Tags (Deutsch)', 'moehser-portfolio'), 
                             strtoupper($card['id'])),
            'description' => __('Tags für diese Skill-Card (durch Komma getrennt)', 'moehser-portfolio'),
            'section' => 'moehser_profile_de',
            'type' => 'text',
        ]);

        // Card Skills List
        $wp_customize->add_setting("moehser_skills_{$card['id']}_skills_list_de", [
            'default' => $card['skills'],
            'sanitize_callback' => 'wp_kses_post',
        ]);
        $wp_customize->add_control("moehser_skills_{$card['id']}_skills_list_de", [
            'label' => sprintf(__('Skills Card %s - Skills Liste (Deutsch)', 'moehser-portfolio'), 
                             strtoupper($card['id'])),
            'description' => __('Skills-Liste für diese Card (durch Komma getrennt)', 'moehser-portfolio'),
            'section' => 'moehser_profile_de',
            'type' => 'textarea',
        ]);
    }
}

/**
 * Check if current site is German subdomain
 */
function is_german_subdomain() {
    $host = $_SERVER['HTTP_HOST'] ?? '';
    return strpos($host, 'de.localhost') !== false || 
           strpos($host, 'de.') !== false;
}

// Pass German customizer values to frontend
add_action('wp_head', function () {
    if (!is_german_subdomain()) {
        return;
    }
    
    echo '<script>';
    
    // German About texts
    $about_title_de = get_theme_mod('moehser_about_title_de', 'Über mich');
    $about_subtitle_de = get_theme_mod('moehser_about_subtitle_de', 'Meine Geschichte & Erfahrung');
    $about_page_id_de = (int) get_theme_mod('moehser_about_page_id_de', 0);
    $about_html_de = '';
    
    if ($about_page_id_de > 0) {
        $about_post_de = get_post($about_page_id_de);
        if ($about_post_de && $about_post_de->post_status === 'publish') {
            $about_html_de = apply_filters('the_content', $about_post_de->post_content);
        }
    }
    
    echo 'window.__ABOUT_TITLE__ = "' . esc_js($about_title_de) . '";';
    echo 'window.__ABOUT_SUBTITLE__ = "' . esc_js($about_subtitle_de) . '";';
    echo 'window.__ABOUT_HTML__ = ' . wp_json_encode($about_html_de) . ';';
    
    // German Projects Settings
    $projects_title_de = get_theme_mod('moehser_projects_title_de', 'Projekte');
    $projects_subtitle_de = get_theme_mod('moehser_projects_subtitle_de', 'Meine neuesten Arbeiten und Projekte');
    echo 'window.__PROJECTS_TITLE__ = ' . wp_json_encode($projects_title_de) . ';';
    echo 'window.__PROJECTS_SUBTITLE__ = ' . wp_json_encode($projects_subtitle_de) . ';';
    
    // German Skills Settings
    $skills_title_de = get_theme_mod('moehser_skills_title_de', 'Fähigkeiten');
    $skills_subtitle_de = get_theme_mod('moehser_skills_subtitle_de', 'Technologien & Tools mit denen ich arbeite');
    echo 'window.__SKILLS_TITLE__ = ' . wp_json_encode($skills_title_de) . ';';
    echo 'window.__SKILLS_SUBTITLE__ = "' . esc_js($skills_subtitle_de) . '";';
    
    // German Skills Cards
    $skills_cards = ['card1', 'card2', 'card3', 'card4', 'card5'];
    foreach ($skills_cards as $card_id) {
        $title = get_theme_mod("moehser_skills_{$card_id}_title_de", '');
        $description = get_theme_mod("moehser_skills_{$card_id}_description_de", '');
        $tags = get_theme_mod("moehser_skills_{$card_id}_tags_de", '');
        $skills_list = get_theme_mod("moehser_skills_{$card_id}_skills_list_de", '');
        
        echo "window.__SKILLS_{$card_id}__ = { ";
        echo "title: \"" . esc_js($title) . "\", ";
        echo "description: \"" . esc_js($description) . "\", ";
        echo "tags: \"" . esc_js($tags) . "\", ";
        echo "skills_list: \"" . esc_js($skills_list) . "\" ";
        echo "};";
    }
    
    // German Imprint Settings
    $imprint_title_de = get_theme_mod('moehser_imprint_title_de', 'Impressum');
    $imprint_page_id_de = get_theme_mod('moehser_imprint_page_id_de', 0);
    $imprint_content_de = '';
    
    if ($imprint_page_id_de > 0) {
        $imprint_page_de = get_post($imprint_page_id_de);
        if ($imprint_page_de) {
            $imprint_content_de = apply_filters('the_content', $imprint_page_de->post_content);
        }
    }
    
    echo 'window.__IMPRINT_TITLE__ = ' . wp_json_encode($imprint_title_de) . ';';
    echo 'window.__IMPRINT_HTML__ = ' . wp_json_encode($imprint_content_de) . ';';
    
    echo '</script>';
});
