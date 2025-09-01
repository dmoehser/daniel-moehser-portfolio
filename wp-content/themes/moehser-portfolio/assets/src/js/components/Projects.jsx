// Projects Component
// ================

// Projects section with slider and customizer integration
// ------------------------------

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation constants for consistent motion
// ------------------------------
const ANIMATION = {
  FADE_IN: {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  },
  SLIDE: {
    hidden: { opacity: 0, x: 100, scale: 0.95 },
    show: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -100, scale: 0.95 }
  },
  SPRING: {
    type: "spring",
    stiffness: 300,
    damping: 30,
    duration: 0.6
  },
  TIMING: {
    BASE: 0.6,
    DELAY: 0.2
  }
};

// Helper function to render project excerpt
// ------------------------------
const renderProjectExcerpt = (project) => {
  if (project.excerpt && project.excerpt.trim() !== '') {
    return project.excerpt;
  }
  if (project.content && project.content.trim() !== '') {
    return project.content.replace(/<[^>]*>/g, '');
  }
  return null;
};

// Helper function to render project screenshot
// ------------------------------
const renderProjectScreenshot = (project) => {
  if (project.project_screenshot) {
    return (
      <img 
        src={project.project_screenshot} 
        alt={project.title}
        loading="lazy"
      />
    );
  }
  
  if (project.featured_image_wide || project.featured_image) {
    return (
      <img 
        src={project.featured_image_wide || project.featured_image}
        srcSet={project.featured_image_srcset || undefined}
        sizes="(max-width: 768px) 100vw, 65vw"
        alt={project.title}
        loading="lazy"
      />
    );
  }
  
  return (
    <div className="project-card__placeholder">
      <span>{project.title}</span>
    </div>
  );
};

// Helper function to render project technologies
// ------------------------------
const renderProjectTechnologies = (project) => {
  if (!project.project_technologies || 
      typeof project.project_technologies !== 'string' || 
      project.project_technologies.trim() === '') {
    return null;
  }
  
  return (
    <div className="project-card__technologies">
      {project.project_technologies.split(',').map((tech, index) => (
        <span key={index} className="project-card__tech-tag">
          {tech.trim()}
        </span>
      ))}
    </div>
  );
};

// Helper function to render project actions
// ------------------------------
const renderProjectActions = (project, handleProjectClick) => {
  if (!project.project_url_external) {
    return (
      <button 
        onClick={() => handleProjectClick(project)}
        className="project-card__demo-btn"
      >
        Live Preview
      </button>
    );
  }
  
  if (project.project_demo_mode === 'iframe') {
    return (
      <button 
        onClick={() => handleProjectClick(project)}
        className="project-card__demo-btn"
      >
        Live Preview
      </button>
    );
  }
  
  return (
    <a 
      href={project.project_url_external}
      target="_blank"
      rel="noopener noreferrer"
      className="project-card__demo-btn"
    >
      Live Demo
    </a>
  );
};

// Reusable section wrapper component
// ------------------------------
const ProjectsSectionWrapper = ({ children, className = "" }) => (
  <section className={`projects section-base ${className}`.trim()} id="projects">
    <div className="projects__inner section-inner">
      <div className="projects__content section-content">
        <div className="projects__card section-card">
          {children}
        </div>
      </div>
    </div>
  </section>
);

// Loading state component
// ------------------------------
const ProjectsLoading = ({ projectsTitle, projectsSubtitle }) => (
  <ProjectsSectionWrapper>
    <div className="projects__header section-header">
      <h2 className="projects__title section-title">{projectsTitle}</h2>
      <p 
        className="projects__subtitle section-subtitle" 
        dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
      />
    </div>
    <div className="projects__body section-body">
      <div className="projects__loading section-loading">
        <div className="loading-spinner"></div>
        <p>Lade Projekte...</p>
      </div>
    </div>
  </ProjectsSectionWrapper>
);

// Error state component
// ------------------------------
const ProjectsError = ({ projectsTitle, projectsSubtitle, error }) => (
  <ProjectsSectionWrapper>
    <div className="projects__header section-header">
      <h2 className="projects__title section-title">{projectsTitle}</h2>
      <p 
        className="projects__subtitle section-subtitle" 
        dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
      />
    </div>
    <div className="projects__body section-body">
      <div className="projects__error section-error">
        <p>Fehler beim Laden der Projekte: {error}</p>
      </div>
    </div>
  </ProjectsSectionWrapper>
);

// Empty state component
// ------------------------------
const ProjectsEmpty = ({ projectsTitle, projectsSubtitle }) => (
  <ProjectsSectionWrapper>
    <div className="projects__header section-header">
      <h2 className="projects__title section-title">{projectsTitle}</h2>
      <p 
        className="projects__subtitle section-subtitle" 
        dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
      />
    </div>
    <div className="projects__body section-body">
      <div className="projects__empty section-empty">
        <p>Keine Projekte gefunden.</p>
      </div>
    </div>
  </ProjectsSectionWrapper>
);

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPrint, setIsPrint] = useState(false);

  // Get customizer values
  const projectsTitle = typeof window !== 'undefined' 
    ? window.__PROJECTS_TITLE__ || 'Projekte' 
    : 'Projekte';
  const projectsSubtitle = typeof window !== 'undefined' 
    ? window.__PROJECTS_SUBTITLE__ || 'Subtitle below the main title' 
    : 'Subtitle below the main title';
  const navPosition = typeof window !== 'undefined' 
    ? window.__PROJECTS_NAV_POSITION__ || 'outside' 
    : 'outside';
  const layoutMode = typeof window !== 'undefined'
    ? window.__PROJECTS_LAYOUT_MODE__ || 'side_by_side'
    : 'side_by_side';
  const autoplay = typeof window !== 'undefined' 
    ? window.__PROJECTS_AUTOPLAY__ || false 
    : false;
  const autoplayDelay = typeof window !== 'undefined' 
    ? window.__PROJECTS_AUTOPLAY_DELAY__ || 5 
    : 5;
  const showOnlyActiveProjects = typeof window !== 'undefined'
    ? (typeof window.__SHOW_ONLY_ACTIVE_PROJECTS__ !== 'undefined' 
        ? window.__SHOW_ONLY_ACTIVE_PROJECTS__ 
        : true)
    : true;

  useEffect(() => {
    // Detect print mode via events and media query
    const mq = window.matchMedia ? window.matchMedia('print') : null;
    const handleBeforePrint = () => setIsPrint(true);
    const handleAfterPrint = () => setIsPrint(false);
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      if (mq && typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', (e) => setIsPrint(e.matches));
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
        if (mq && typeof mq.removeEventListener === 'function') {
          mq.removeEventListener('change', (e) => setIsPrint(e.matches));
        }
      }
    };
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/wp-json/moehser/v1/projects');
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        const data = await response.json();
        
        // Filter projects based on status if showOnlyActiveProjects is enabled
        let filteredProjects = data;
        
        if (showOnlyActiveProjects) {
          filteredProjects = data.filter(project => 
            project.project_status === 'active'
          );
        }
        
        // Keep API order (date DESC)
        setProjects(filteredProjects);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [showOnlyActiveProjects]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoplay || projects.length <= 1) {
      return;
    }

    const autoplayTimer = setInterval(() => {
      setCurrentSlide((prevSlide) => {
        if (prevSlide >= projects.length - 1) {
          return 0; // Go back to first project
        } else {
          return prevSlide + 1; // Go to next project
        }
      });
    }, autoplayDelay * 1000);

    return () => {
      clearInterval(autoplayTimer);
    };
  }, [autoplay, autoplayDelay, projects.length, currentSlide]);

  // Keyboard navigation for projects
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle arrow keys when projects are loaded and there are multiple projects
      if (projects.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSlide();
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [projects.length, currentSlide]);

  const goToPreviousSlide = () => {
    setCurrentSlide(Math.max(0, currentSlide - 1));
  };

  const goToNextSlide = () => {
    setCurrentSlide(Math.min(projects.length - 1, currentSlide + 1));
  };

  const handleProjectClick = (project) => {
    if (project.project_url_external) {
      if (project.project_demo_mode === 'iframe') {
        try {
          const event = new CustomEvent('project:fullscreen:open', {
            detail: {
              url: project.project_url_external,
              id: project.id,
              title: project.title
            }
          });
          window.dispatchEvent(event);
        } catch (error) {
          // Fallback to new window if fullscreen fails
          window.open(project.project_url_external, '_blank');
        }
      } else {
        // Open in new window for external mode
        window.open(project.project_url_external, '_blank');
      }
    }
  };

  // Early returns for different states
  if (loading) {
    return (
      <ProjectsLoading 
        projectsTitle={projectsTitle}
        projectsSubtitle={projectsSubtitle}
      />
    );
  }

  if (error) {
    return (
      <ProjectsError 
        projectsTitle={projectsTitle}
        projectsSubtitle={projectsSubtitle}
        error={error}
      />
    );
  }

  if (projects.length === 0) {
    return (
      <ProjectsEmpty 
        projectsTitle={projectsTitle}
        projectsSubtitle={projectsSubtitle}
      />
    );
  }

  return (
    <section className="projects section-base" id="projects">
      <div className="projects__inner section-inner">
        <div className="projects__content section-content">
          <div className="projects__card section-card">
            <motion.div
              initial={ANIMATION.FADE_IN.hidden}
              whileInView={ANIMATION.FADE_IN.show}
              transition={{ duration: ANIMATION.TIMING.BASE }}
              viewport={{ once: true }}
              className="projects__header section-header"
            >
              <h2 className="projects__title section-title">{projectsTitle}</h2>
              <p 
                className="projects__subtitle section-subtitle" 
                dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
              />
            </motion.div>

            <motion.div
              initial={ANIMATION.FADE_IN.hidden}
              whileInView={ANIMATION.FADE_IN.show}
              transition={{ 
                duration: ANIMATION.TIMING.BASE, 
                delay: ANIMATION.TIMING.DELAY 
              }}
              viewport={{ once: true }}
              className={`projects__body section-body projects__body--layout-${layoutMode}`}
            >
              {/* Left Navigation Arrow */}
              {projects.length > 1 && (
                <button 
                  className="projects__nav-btn projects__nav-btn--prev"
                  onClick={goToPreviousSlide}
                  disabled={currentSlide === 0}
                  aria-label="Previous project"
                >
                  ←
                </button>
              )}

              <div className="projects__slider projects__slider--side-by-side">
                <div className="projects__slider-container">
                  {isPrint ? (
                    // Print: render all projects stacked
                    projects.map((proj, idx) => (
                      <div key={idx} className="projects__slide">
                        <div className="project-card project-card--side-by-side">
                          <div className="project-card__screenshot">
                            {renderProjectScreenshot(proj)}
                          </div>
                          <div className="project-card__info">
                            <h3 className="project-card__title">{proj.title}</h3>
                            {renderProjectExcerpt(proj) && (
                              <p className="project-card__excerpt">{renderProjectExcerpt(proj)}</p>
                            )}
                            {renderProjectTechnologies(proj)}
                            <div className="project-card__actions">
                              {renderProjectActions(proj, handleProjectClick)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentSlide}
                        className="projects__slide"
                        initial={ANIMATION.SLIDE.hidden}
                        animate={ANIMATION.SLIDE.show}
                        exit={ANIMATION.SLIDE.exit}
                        transition={ANIMATION.SPRING}
                      >
                        <div className="project-card project-card--side-by-side">
                          <div className="project-card__screenshot">
                            {renderProjectScreenshot(projects[currentSlide])}
                          </div>
                          <div className="project-card__info">
                            <h3 className="project-card__title">
                              {projects[currentSlide].title}
                            </h3>
                            {renderProjectExcerpt(projects[currentSlide]) && (
                              <p className="project-card__excerpt">
                                {renderProjectExcerpt(projects[currentSlide])}
                              </p>
                            )}
                            {renderProjectTechnologies(projects[currentSlide])}
                            <div className="project-card__actions">
                              {renderProjectActions(projects[currentSlide], handleProjectClick)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                </div>
              </div>

              {/* Right Navigation Arrow */}
              {projects.length > 1 && (
                <button 
                  className="projects__nav-btn projects__nav-btn--next"
                  onClick={goToNextSlide}
                  disabled={currentSlide === projects.length - 1}
                  aria-label="Next project"
                >
                  →
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}


