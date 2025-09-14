<!DOCTYPE html>
<html <?php 
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $is_german = strpos($request_uri, '/de/') !== false;
    echo $is_german ? 'lang="de" dir="ltr"' : 'lang="en" dir="ltr"';
?>>
  <head>
    <meta charset="<?php bloginfo('charset'); ?>" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    
    <!-- Critical Resource Preloading -->
    <!-- ============================= -->
    
    <!-- Preconnect to external domains -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    
    <!-- Fonts loaded asynchronously without preload -->
    
    <!-- CSS/JS loaded by Vite/WordPress - no preload needed -->
    
    <!-- DNS prefetch for external resources -->
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"></noscript>
    
    <?php wp_head(); ?>
  </head>
  <body <?php body_class(); ?>>
    <header></header>


