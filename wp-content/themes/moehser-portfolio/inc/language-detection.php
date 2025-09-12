<?php
/**
 * Language Detection and Redirection System
 * 
 * Handles automatic language detection and redirection
 * between English and German versions of the site
 */

if (!defined('ABSPATH')) {
    exit;
}

class MoehserLanguageDetection {
    
    private $current_language;
    private $is_german_subdomain;
    
    public function __construct() {
        $this->is_german_subdomain = $this->is_german_subdomain();
        $this->current_language = $this->is_german_subdomain ? 'de' : 'en';
        
        add_action('init', [$this, 'init_language_detection']);
        add_action('wp_head', [$this, 'add_language_meta']);
        add_action('wp_enqueue_scripts', [$this, 'localize_scripts']);
    }
    
    /**
     * Check if current request is on German subdomain
     */
    private function is_german_subdomain() {
        $host = $_SERVER['HTTP_HOST'] ?? '';
        return strpos($host, 'de.localhost') !== false || 
               strpos($host, 'de.') !== false;
    }
    
    /**
     * Initialize language detection and redirection
     */
    public function init_language_detection() {
        // Skip redirection for admin, AJAX, and API requests
        if (is_admin() || wp_doing_ajax() || wp_doing_cron() || 
            strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
            return;
        }
        
        // Skip if already on correct subdomain
        if ($this->should_redirect()) {
            $this->redirect_to_correct_language();
        }
    }
    
    /**
     * Check if redirection is needed
     */
    private function should_redirect() {
        // Don't redirect if cookie preference is set
        if (isset($_COOKIE['moehser_language_preference'])) {
            return false;
        }
        
        // Don't redirect if user explicitly chose language
        if (isset($_GET['lang'])) {
            return false;
        }
        
        // Check if we need to redirect based on browser language
        $browser_lang = $this->get_browser_language();
        $current_lang = $this->current_language;
        
        // Redirect to German if browser prefers German and we're on English
        if ($browser_lang === 'de' && $current_lang === 'en') {
            return true;
        }
        
        // Redirect to English if browser prefers English and we're on German
        if ($browser_lang === 'en' && $current_lang === 'de') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get browser language preference
     */
    private function get_browser_language() {
        $accept_language = $_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '';
        
        // Parse Accept-Language header
        $languages = [];
        if (preg_match_all('/([a-z]{1,8}(-[a-z]{1,8})?)\s*(;\s*q\s*=\s*(1|0\.[0-9]+))?/i', 
                          $accept_language, $matches)) {
            for ($i = 0; $i < count($matches[1]); $i++) {
                $lang = strtolower($matches[1][$i]);
                $q = $matches[4][$i] ? (float)$matches[4][$i] : 1.0;
                $languages[$lang] = $q;
            }
        }
        
        // Sort by quality value
        arsort($languages);
        
        // Return first language
        $preferred_lang = array_key_first($languages);
        
        // Extract language code (e.g., 'de' from 'de-DE')
        return substr($preferred_lang, 0, 2);
    }
    
    /**
     * Redirect to correct language version
     */
    private function redirect_to_correct_language() {
        $current_url = (is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        
        if ($this->current_language === 'en') {
            // Redirect to German subdomain
            $german_url = str_replace('localhost:8080', 'de.localhost:8080', $current_url);
        } else {
            // Redirect to English subdomain
            $german_url = str_replace('de.localhost:8080', 'localhost:8080', $current_url);
        }
        
        // Set cookie to remember preference
        setcookie('moehser_language_preference', $this->current_language, 
                 time() + (365 * 24 * 60 * 60), '/');
        
        wp_redirect($german_url, 302);
        exit;
    }
    
    /**
     * Add language meta tags
     */
    public function add_language_meta() {
        $lang_code = $this->current_language === 'de' ? 'de-DE' : 'en-US';
        echo '<meta http-equiv="Content-Language" content="' . esc_attr($lang_code) . '">' . "\n";
        echo '<html lang="' . esc_attr($lang_code) . '">' . "\n";
    }
    
    /**
     * Localize scripts with language data
     */
    public function localize_scripts() {
        wp_localize_script('moehser-portfolio', 'moehser_language', [
            'current' => $this->current_language,
            'is_german' => $this->is_german_subdomain,
            'switch_url' => $this->get_switch_url(),
            'strings' => $this->get_localized_strings()
        ]);
    }
    
    /**
     * Get URL for language switching
     */
    private function get_switch_url() {
        $current_url = (is_ssl() ? 'https://' : 'http://') . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
        
        if ($this->current_language === 'de') {
            return str_replace('de.localhost:8080', 'localhost:8080', $current_url);
        } else {
            return str_replace('localhost:8080', 'de.localhost:8080', $current_url);
        }
    }
    
    /**
     * Get localized strings for JavaScript
     */
    private function get_localized_strings() {
        if ($this->current_language === 'de') {
            return [
                'switch_to_english' => 'Switch to English',
                'switch_to_german' => 'Auf Deutsch wechseln',
                'language' => 'Sprache',
                'loading' => 'Lädt...',
                'error' => 'Fehler',
                'success' => 'Erfolgreich'
            ];
        } else {
            return [
                'switch_to_english' => 'Switch to English',
                'switch_to_german' => 'Auf Deutsch wechseln',
                'language' => 'Language',
                'loading' => 'Loading...',
                'error' => 'Error',
                'success' => 'Success'
            ];
        }
    }
    
    /**
     * Get current language
     */
    public function get_current_language() {
        return $this->current_language;
    }
    
    /**
     * Check if current site is German
     */
    public function is_german() {
        return $this->is_german_subdomain;
    }
}

// Initialize language detection
new MoehserLanguageDetection();
