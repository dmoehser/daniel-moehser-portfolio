<?php
// Admin Interface for Project Reordering
// =====================================

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Configuration constants
// ----------------------
const PROJECTS_PER_PAGE = -1;
const CAPABILITY_REQUIRED = 'edit_posts';
const JQUERY_UI_VERSION = '1.13.2';
const JQUERY_UI_CDN_URL = 'https://code.jquery.com/ui/' . JQUERY_UI_VERSION . '/jquery-ui.min.js';
const JQUERY_UI_CSS_URL = 'https://code.jquery.com/ui/' . JQUERY_UI_VERSION . '/themes/ui-lightness/jquery-ui.css';
const MENU_PRIORITY = 11;

// Add reorder page to admin menu
// ------------------------------
add_action('admin_menu', function () {
    // Custom menu order: All Projects, then Reorder Projects
    remove_submenu_page('edit.php?post_type=project', 'edit.php?post_type=project');
    
    add_submenu_page(
        'edit.php?post_type=project',
        'All Projects',
        'All Projects',
        CAPABILITY_REQUIRED,
        'edit.php?post_type=project',
        '',
        1
    );
    
    add_submenu_page(
        'edit.php?post_type=project',
        'Reorder Projects',
        'Reorder Projects',
        CAPABILITY_REQUIRED,
        'reorder-projects',
        'moehser_reorder_projects_page',
        2
    );
}, MENU_PRIORITY);

// Enqueue scripts and styles for reorder page
// -------------------------------------------
add_action('admin_enqueue_scripts', function($hook) {
    if ($hook === 'project_page_reorder-projects') {
        wp_enqueue_script('jquery-ui-cdn', JQUERY_UI_CDN_URL, ['jquery'], JQUERY_UI_VERSION, true);
        wp_enqueue_style('jquery-ui-css', JQUERY_UI_CSS_URL, [], JQUERY_UI_VERSION);
        wp_enqueue_style('wp-admin');
    }
});

// Helper function to render reorder CSS
// -------------------------------------
function render_reorder_css() {
    ?>
    <style>
    .sortable-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .sortable-item {
        background: #fff;
        border: 1px solid #ccd0d4;
        border-radius: 4px;
        margin-bottom: 8px;
        padding: 12px;
        display: flex;
        align-items: center;
        cursor: move;
        transition: all 0.2s ease;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        position: relative;
    }
    
    .sortable-item:hover {
        border-color: #2271b1;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .sortable-item.dragging {
        background: #f0f6fc;
        border-color: #2271b1;
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: rotate(2deg);
        opacity: 0.8;
        z-index: 1000;
    }
    
    .sortable-item.drag-over-top {
        border-top: 3px solid #2271b1;
        background: #f0f6fc;
    }
    
    .sortable-item.drag-over-bottom {
        border-bottom: 3px solid #2271b1;
        background: #f0f6fc;
    }
    
    .drop-indicator {
        height: 3px;
        background: #2271b1;
        margin: 5px 0;
        border-radius: 2px;
        opacity: 0;
        transition: opacity 0.2s ease;
    }
    
    .drop-indicator.active {
        opacity: 1;
    }
    
    .sortable-placeholder {
        background: #f0f6fc;
        border: 2px dashed #2271b1;
        border-radius: 4px;
        margin-bottom: 8px;
        height: 60px;
        opacity: 0.5;
    }
    
    .sortable-handle {
        color: #8c8f94;
        font-size: 18px;
        margin-right: 12px;
        cursor: move;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }
    
    .sortable-handle:hover {
        background: #f0f0f1;
        color: #2271b1;
    }
    
    .sortable-content {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .project-status {
        color: #8c8f94;
        font-size: 12px;
        text-transform: uppercase;
    }
    
    #reorder-feedback {
        margin-top: 20px;
    }
    
    #reorder-feedback.notice-success {
        border-left-color: #00a32a;
    }
    
    #reorder-feedback.notice-error {
        border-left-color: #d63638;
    }
    </style>
    <?php
}

// Helper function to render reorder JavaScript
// -------------------------------------------
function render_reorder_javascript() {
    ?>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        var items = document.querySelectorAll('.sortable-item');
        
        if (items.length === 0) {
            return;
        }
        
        var draggedElement = null;
        var draggedIndex = -1;
        
        // Enhanced drag and drop
        items.forEach(function(item, index) {
            item.draggable = true;
            
            // Add visual feedback on drag start
            item.addEventListener('dragstart', function(e) {
                draggedElement = this;
                draggedIndex = index;
                this.classList.add('dragging');
            });
            
            // Reset visual feedback on drag end
            item.addEventListener('dragend', function(e) {
                this.classList.remove('dragging');
                draggedElement = null;
                draggedIndex = -1;
                
                // Remove all drag-over classes
                items.forEach(function(item) {
                    item.classList.remove('drag-over-top', 'drag-over-bottom');
                });
            });
            
            // Add hover effects with position indication
            item.addEventListener('dragenter', function(e) {
                if (this !== draggedElement) {
                    var rect = this.getBoundingClientRect();
                    var mouseY = e.clientY;
                    var itemCenter = rect.top + rect.height / 2;
                    
                    if (mouseY < itemCenter) {
                        this.classList.add('drag-over-top');
                        this.classList.remove('drag-over-bottom');
                    } else {
                        this.classList.add('drag-over-bottom');
                        this.classList.remove('drag-over-top');
                    }
                }
            });
            
            item.addEventListener('dragleave', function(e) {
                if (this !== draggedElement) {
                    this.classList.remove('drag-over-top', 'drag-over-bottom');
                }
            });
        });
        
        var container = document.getElementById('sortable-projects');
        if (container) {
            container.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            
            container.addEventListener('drop', function(e) {
                e.preventDefault();
                var target = e.target.closest('.sortable-item');
                
                if (target && draggedElement && draggedElement !== target) {
                    var targetIndex = Array.from(items).indexOf(target);
                    var rect = target.getBoundingClientRect();
                    var mouseY = e.clientY;
                    var itemCenter = rect.top + rect.height / 2;
                    
                    // Enhanced reorder logic based on drop position
                    if (mouseY < itemCenter) {
                        // Drop above target
                        target.parentNode.insertBefore(draggedElement, target);
                    } else {
                        // Drop below target
                        target.parentNode.insertBefore(draggedElement, target.nextSibling);
                    }
                    
                    // Reset all visual feedback
                    items.forEach(function(item) {
                        item.classList.remove('drag-over-top', 'drag-over-bottom');
                    });
                    
                    // Save new order via AJAX
                    saveNewOrder();
                }
            });
        }
        
        function saveNewOrder() {
            var newOrder = [];
            var currentItems = document.querySelectorAll('.sortable-item');
            
            currentItems.forEach(function(item) {
                var projectId = item.getAttribute('data-project-id');
                if (projectId) {
                    newOrder.push(parseInt(projectId));
                }
            });
            
            // Create form data
            var formData = new FormData();
            formData.append('action', 'reorder_projects');
            formData.append('project_ids', JSON.stringify(newOrder));
            formData.append('nonce', '<?php echo wp_create_nonce('reorder_projects_nonce'); ?>');
            
            // AJAX call to save order
            fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showFeedback('Order saved successfully!', 'success');
                } else {
                    showFeedback('Error saving order: ' + (data.data || 'Unknown error'), 'error');
                }
            })
            .catch(error => {
                showFeedback('Error saving order: ' + error.message, 'error');
            });
        }
        
        function showFeedback(message, type) {
            var feedback = document.getElementById('reorder-feedback');
            if (feedback) {
                var className = type === 'success' ? 'notice-success' : 'notice-error';
                feedback.innerHTML = '<div class="notice ' + className + ' is-dismissible"><p>' + message + '</p></div>';
                feedback.style.display = 'block';
                
                // Auto-hide after 3 seconds
                setTimeout(function() {
                    feedback.style.display = 'none';
                }, 3000);
            }
        }
    });
    </script>
    <?php
}

// Reorder projects admin page
// ---------------------------
function moehser_reorder_projects_page() {
    $projects = get_posts([
        'post_type' => 'project',
        'post_status' => 'publish',
        'posts_per_page' => PROJECTS_PER_PAGE,
        'orderby' => 'menu_order',
        'order' => 'ASC'
    ]);
    
    if (empty($projects)) {
        echo '<div class="wrap"><h1>Reorder Projects</h1><p>No projects found.</p></div>';
        return;
    }
    ?>
    <div class="wrap">
        <h1>Reorder Projects</h1>
        <p>Drag and drop projects to reorder them. The order will be saved automatically.</p>
        
        <div id="reorder-projects-container">
            <ul id="sortable-projects" class="sortable-list">
                <?php foreach ($projects as $project): ?>
                    <li class="sortable-item" data-project-id="<?php echo esc_attr($project->ID); ?>">
                        <div class="sortable-handle">⋮⋮</div>
                        <div class="sortable-content">
                            <strong><?php echo esc_html($project->post_title); ?></strong>
                            <span class="project-status"><?php echo esc_html($project->post_status); ?></span>
                        </div>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
        
        <div id="reorder-feedback" class="notice" style="display: none;"></div>
    </div>
    
    <?php
    // Render CSS and JavaScript using helper functions
    render_reorder_css();
    render_reorder_javascript();
}
