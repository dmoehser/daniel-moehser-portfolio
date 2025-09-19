# Daniel Moehser | Portfolio Website

A responsive portfolio website built with WordPress, featuring a custom theme, dynamic project management, and interactive UI components. Showcases my web development projects and skills with a clean, professional design.

## Live Website

Visit the live website: [https://danielmoehser.dev](https://danielmoehser.dev)

## What This Is

My personal portfolio website built with WordPress. I built it as a custom theme to dive deep into WordPress development and understand how the platform works.

The project includes custom PHP backend logic, a comprehensive SCSS design system, and React/JSX components for interactive features.

## Github Repository
View source code: [https://github.com/dmoehser/daniel-moehser-portfolio](https://github.com/dmoehser/daniel-moehser-portfolio)

## Features

- **Custom WordPress Theme**: Built with PHP and SCSS
- **Dynamic Project Management**: Custom Post Types with drag & drop reordering
- **Interactive UI**: Smooth animations, hover effects, and responsive design
- **Terminal Interface**: Yes, there's actually a working terminal on the website for website control (type `help` to see all commands)
- **Dark/Light Mode**: Toggle between themes with persistent user preference
- **Project Showcase**: Grid and list views with detailed project information
- **Skills Section**: Animated skill bars and technology tags
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Clean URLs, meta tags, and structured data
- **Performance Metrics**: Real-time performance monitoring with Google Core Web Vitals
- **Print Optimization**: Optimized print styles for all sections

## Technologies Used

- **WordPress**: Content Management System
- **PHP**: Backend development and theme customization
- **React/JSX + ES6+**: Interactive components and features
- **SCSS**: CSS preprocessing with organized design system
- **Custom Post Types**: Dynamic content management
- **REST API**: Custom endpoints for project data
- **Vite**: Asset compilation and development

## Project Structure

```
wp-content/themes/moehser-portfolio/
├── assets/
│   ├── src/
│   │   ├── js/                    # React/JSX components
│   │   │   ├── main.jsx           # Main entry point
│   │   │   ├── components/        # UI components
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── Projects.jsx
│   │   │   │   ├── Skills.jsx
│   │   │   │   ├── Terminal.jsx
│   │   │   │   └── ui/            # Reusable UI components
│   │   │   ├── features/          # Feature modules
│   │   │   │   ├── terminal/
│   │   │   │   ├── performance/
│   │   │   │   └── accessibility/
│   │   │   └── utils/             # Helper functions
│   │   └── scss/                  # SCSS with design system
│   │       ├── main.scss          # Main entry point
│   │       ├── utils/
│   │       │   └── _tokens.scss   # Design tokens
│   │       ├── components/        # Component styles
│   │       ├── features/          # Feature styles
│   │       └── pages/             # Page styles
│   └── dist/                      # Compiled assets (Vite output)
├── inc/
│   ├── api.php                   # REST API endpoints
│   ├── cpt-project.php           # Custom Post Types
│   ├── layout-builder.php        # Layout building features
│   ├── projects-reorder.php      # Drag & drop functionality
│   └── vite.php                  # Vite integration
├── functions.php                  # Theme functions
├── header.php, footer.php, index.php # WordPress templates
├── package.json                   # Node.js dependencies
├── vite.config.js                # Vite configuration
└── style.css                     # WordPress required file
```

## What I Learned

- **WordPress Development**: Custom themes, APIs, and WordPress core integration
- **PHP Programming**: Object-oriented PHP and WordPress functions
- **React/JSX**: Building interactive UI components
- **SCSS Architecture**: Organized stylesheets with design systems
- **REST API Development**: Custom endpoints and data management
- **Performance Optimization**: Core Web Vitals and asset optimization
- **Drag & Drop Interfaces**: HTML5 drag & drop with AJAX integration

## Why I Built This

I wanted to create a professional portfolio website that showcases my development skills while being easy to maintain and update. This project demonstrates my ability to work with WordPress, create custom themes, and build interactive user interfaces.

Building everything from scratch allowed me to experiment with WordPress APIs, implement proper SCSS architecture, and create unique interactive features.

## Development Setup

If you want to run this locally or contribute:

### What You Need
- WordPress (5.0+)
- PHP (7.4+)
- Node.js (for building assets)
- MySQL

### Getting It Running
```bash
# Clone it
git clone https://github.com/dmoehser/daniel-moehser-portfolio.git
cd daniel-moehser-portfolio

# Install dependencies
npm install

# Build assets
npm run build

# Or watch for changes while developing
npm run watch
```

### Working with the Code

**SCSS Structure**: Everything is organized in `assets/src/scss/` with a design system. Each component has its own constants section, with shared tokens in `utils/_tokens.scss`.

**Adding Projects**: Use the WordPress admin - there's a custom "Projects" post type with drag & drop reordering.

**JavaScript**: Mix of React/JSX components and ES6+ modules in `assets/src/js/` that gets compiled with Vite.

## Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions.

## License

MIT License - use it however you want.

---

Created with ❤️ by [danielmoehser.dev](https://danielmoehser.dev)
