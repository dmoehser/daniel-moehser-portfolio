# Daniel Moehser | Portfolio Website

A modern, responsive portfolio website built with WordPress, featuring a custom theme, dynamic project management, and interactive UI components. Showcases my web development projects and skills with a clean, professional design.

## Live Demo

Visit the live website: [https://danielmoehser.dev](https://danielmoehser.dev) *(Coming Soon)*

*Note: This will be my actual portfolio website showcasing all my projects and skills.*

## GitHub Repository

View source code: [https://github.com/dmoehser/daniel-moehser-portfolio](https://github.com/dmoehser/daniel-moehser-portfolio)

## Features

- **Custom WordPress Theme**: Built from scratch with modern PHP and SCSS
- **Dynamic Project Management**: Custom Post Types with drag & drop reordering
- **Interactive UI**: Smooth animations, hover effects, and responsive design
- **Dark/Light Mode**: Toggle between themes with persistent user preference
- **Project Showcase**: Grid and list views with detailed project information
- **Skills Section**: Animated skill bars and technology tags
- **Contact Integration**: Working contact forms and social media links
- **Mobile Responsive**: Optimized for all device sizes
- **SEO Optimized**: Clean URLs, meta tags, and structured data
- **Terminal Interface**: Interactive terminal for website control
- **Performance Metrics**: Real-time performance monitoring with Google Core Web Vitals

## Technologies Used

- **WordPress**: Content Management System
- **PHP**: Backend development and theme customization
- **JavaScript (ES6+)**: Interactive features and animations
- **SCSS**: Advanced CSS preprocessing and organization
- **Custom Post Types**: Dynamic content management
- **REST API**: Custom endpoints for project data
- **Responsive Design**: Mobile-first approach

## Project Structure

```
moehser-portfolio/
├── assets/
│   ├── src/
│   │   ├── js/                 # JavaScript modules
│   │   ├── scss/              # SCSS stylesheets
│   │   └── images/            # Theme images
│   └── dist/                  # Compiled assets
├── inc/
│   ├── customizer.php         # WordPress Customizer
│   ├── cpt-project.php        # Custom Post Type
│   ├── api.php               # REST API endpoints
│   ├── projects-reorder.php  # Drag & drop reordering
│   └── setup-projects.php    # Project setup
├── wp-content/
│   └── uploads/
│       └── projects/          # Project demos
├── functions.php              # Theme functions
├── style.css                 # Theme stylesheet
└── index.php                 # Main template
```

## Key Features Implemented

### Custom WordPress Theme
- **Modern PHP Architecture**: Clean, maintainable code structure
- **SCSS Organization**: Modular stylesheets with variables and mixins
- **JavaScript Modules**: ES6+ modules for interactive features
- **WordPress Hooks**: Proper integration with WordPress core

### Dynamic Project Management
- **Custom Post Types**: Easy project addition and editing
- **Drag & Drop Reordering**: Visual project reordering with AJAX saving
- **Custom Fields**: Project metadata and configuration
- **REST API**: Custom endpoints for frontend data
- **Admin Interface**: User-friendly project management

### Interactive UI Components
- **Project Grid/List Views**: Toggle between different layouts
- **Modal Windows**: Fullscreen project previews
- **Smooth Animations**: CSS transitions and JavaScript effects
- **Dark/Light Mode**: Theme switching with localStorage

### Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Flexible Grid**: CSS Grid and Flexbox layouts
- **Touch-Friendly**: Mobile-optimized interactions
- **Performance**: Optimized images and assets

### Advanced Features
- **Terminal Interface**: Interactive command-line interface for website control
- **Performance Metrics**: Real-time performance monitoring with Google Core Web Vitals

## What I Learned

- **WordPress Development**: Custom themes, plugins, and APIs
- **PHP Programming**: Object-oriented PHP and WordPress functions
- **Advanced CSS**: SCSS, animations, and responsive design
- **JavaScript ES6+**: Modules, async/await, and DOM manipulation
- **REST API Development**: Custom endpoints and data management
- **Drag & Drop Interfaces**: Native HTML5 drag & drop with AJAX integration
- **Performance Optimization**: Asset optimization and caching
- **SEO Best Practices**: Meta tags, structured data, and clean URLs
- **User Experience**: Intuitive navigation and interactive design
- **Terminal Integration**: Interactive terminal interface
- **Performance Metrics**: Google Core Web Vitals monitoring

## Why I Built This

I wanted to create a professional portfolio website that showcases my development skills while being easy to maintain and update. This project demonstrates my ability to work with WordPress, create custom themes, and build interactive user interfaces.

## Getting Started

### Prerequisites
- **WordPress** (5.0 or higher)
- **PHP** (7.4 or higher)
- **MySQL** (5.6 or higher)
- **Node.js** (for asset compilation)

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/dmoehser/daniel-moehser-portfolio.git
   cd daniel-moehser-portfolio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Compile assets**:
   ```bash
   npm run build
   ```

4. **Upload to WordPress**:
   - Upload the theme to `/wp-content/themes/`
   - Activate the theme in WordPress admin
   - Configure customizer settings

### Development
```bash
# Watch for changes
npm run watch

# Build for production
npm run build
```

## Customization

### Adding Projects
1. **WordPress Admin** → **Projects** → **Add New**
2. **Fill in project details**:
   - Title and description
   - Technologies used
   - GitHub repository URL
   - Demo URL (if available)
   - Featured image
3. **Publish** the project

### Styling
- **SCSS files** in `assets/src/scss/`
- **Variables** in `_variables.scss`
- **Components** in `components/` folder
- **Compile** with `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **WordPress Community** for documentation and best practices
- **Modern Web Development** techniques and patterns
- **Open Source** libraries and tools

---

**Created with ❤️ by [danielmoehser.dev](https://danielmoehser.dev)**
