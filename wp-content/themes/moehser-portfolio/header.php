<!DOCTYPE html>
<html <?php language_attributes(); ?>>
  <head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- Critical Resource Preloading -->
    <!-- ============================= -->
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Preload critical fonts -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" as="style" crossorigin>
    
    <!-- Preload critical CSS -->
    <link rel="preload" href="<?php echo get_template_directory_uri(); ?>/assets/dist/assets/main.css" as="style" type="text/css">
    
    <!-- Preload critical JavaScript -->
    <link rel="preload" href="<?php echo get_template_directory_uri(); ?>/assets/dist/assets/main.js" as="script" type="text/javascript">
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    
    <?php wp_head(); ?>
  </head>
  <body <?php body_class(); ?>>
    <header></header>


