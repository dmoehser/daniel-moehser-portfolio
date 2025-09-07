// Projects Component
// ================

// Projects with slider & customizer
// ---------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import githubIcon from '../../img/github.svg';
import viewGridIcon from '../../img/view-grid.svg';
import viewListIcon from '../../img/view-list.svg';

// Utilities
// ---------
const waitForPrintStability = async (extraDelayMs = 250) => {
  try {
    if (typeof window !== 'undefined' && document && document.readyState !== 'complete') {
      await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));
    }
    if (typeof document !== 'undefined' && document.fonts && typeof document.fonts.ready?.then === 'function') {
      await document.fonts.ready;
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    if (extraDelayMs > 0) {
      await new Promise((r) => setTimeout(r, extraDelayMs));
    }
  } catch (e) {
    // noop
  }
};

// Animation constants
// -------------------
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

// Touch/Swipe constants
// --------------------
const TOUCH = {
  MIN_DISTANCE: 40,
  MAX_TIME: 600,
  SCROLL_THRESHOLD: 12,
  INTENT_RATIO: 1.5
};

// Print constants
// ---------------
const PRINT = {
  STABILITY_DELAY: 4000,
  DEFAULT_DELAY: 250
};

// LocalStorage constants
// ---------------------
const STORAGE = {
  VIEW_MODE_KEY: 'projects_view_mode',
  DEFAULT_VIEW: false // false = grid, true = list
};

// LocalStorage helpers
// -------------------
const saveViewMode = (isListView) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE.VIEW_MODE_KEY, JSON.stringify(isListView));
    }
  } catch (error) {
    // Silent fail for privacy/incognito mode
  }
};

const loadViewMode = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(STORAGE.VIEW_MODE_KEY);
      return saved !== null ? JSON.parse(saved) : STORAGE.DEFAULT_VIEW;
    }
  } catch (error) {
    // Silent fail, return default
  }
  return STORAGE.DEFAULT_VIEW;
};

// Render project excerpt
// ----------------------
const renderProjectExcerpt = (project) => {
  if (project.excerpt && project.excerpt.trim() !== '') {
    return project.excerpt;
  }
  if (project.content && project.content.trim() !== '') {
    return project.content.replace(/<[^>]*>/g, '');
  }
  return null;
};

// Render project screenshot
// -------------------------
const renderProjectScreenshot = (project, opts = {}) => {
  const isPriority = Boolean(opts.isPriority);
  const onLoad = typeof opts.onLoad === 'function' ? opts.onLoad : undefined;
  const isPrintImg = Boolean(opts.isPrint);
  if (project.project_screenshot) {
    return (
      <img 
        src={project.project_screenshot} 
        alt={project.title}
        loading={isPrintImg ? undefined : (isPriority ? undefined : 'lazy')}
        decoding={isPrintImg ? 'sync' : (isPriority ? 'async' : undefined)}
        fetchPriority={isPrintImg ? 'high' : (isPriority ? 'high' : undefined)}
        onError={(e) => {
          try {
            const img = e.currentTarget;
            img.onerror = null;
            img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="100%" height="100%" fill="%23f1f5f9"/><g fill="%2394a3b8" font-family="Arial,Helvetica,sans-serif" font-size="24" text-anchor="middle"><text x="50%" y="50%">Image not available</text></g></svg>';
          } catch {}
        }}
        onLoad={onLoad}
      />
    );
  }
  
  if (project.featured_image_wide || project.featured_image) {
    const srcPrint = project.featured_image_wide_2x || project.featured_image_wide || project.featured_image;
    return (
      <img 
        src={isPrintImg ? srcPrint : (project.featured_image_wide || project.featured_image)}
        srcSet={project.featured_image_srcset || undefined}
        sizes={isPrintImg ? "100vw" : "(max-width: 1024px) 100vw, 60vw"}
        width={project.featured_image_wide_w || undefined}
        height={project.featured_image_wide_h || undefined}
        alt={project.title}
        loading={isPrintImg ? undefined : (isPriority ? undefined : 'lazy')}
        decoding={isPrintImg ? 'sync' : (isPriority ? 'async' : undefined)}
        fetchPriority={isPrintImg ? 'high' : (isPriority ? 'high' : undefined)}
        onError={(e) => {
          try {
            const img = e.currentTarget;
            img.onerror = null;
            img.removeAttribute('srcset');
            img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360"><rect width="100%" height="100%" fill="%23f1f5f9"/><g fill="%2394a3b8" font-family="Arial,Helvetica,sans-serif" font-size="24" text-anchor="middle"><text x="50%" y="50%">Image not available</text></g></svg>';
          } catch {}
        }}
        onLoad={onLoad}
      />
    );
  }
  
  return (
    <div className="project-card__placeholder">
      <span>{project.title}</span>
    </div>
  );
};

// Render project technologies
// ---------------------------
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

// Render project actions
// ----------------------
const renderProjectActions = (project, handleProjectClick, opts = {}) => {
  const primaryLabel = opts.primaryLabel || 'Demo';
  if (!project.project_url_external) {
    const hasGithub = Boolean(project.project_github_url);
    return (
      <div className={`project-card__cta-row ${hasGithub ? 'project-card__cta-row--two' : 'project-card__cta-row--one'}`}>
        {hasGithub ? (
          <a 
            href={project.project_github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__demo-btn project-card__demo-btn--secondary"
            aria-label={`GitHub Repository: ${project.title}`}
          >
            <img src={githubIcon} alt="" aria-hidden="true" className="project-card__cta-ico" />
            GitHub
          </a>
        ) : null}
        <button 
          onClick={() => handleProjectClick(project)}
          className="project-card__demo-btn"
        >
          {primaryLabel}
        </button>
      </div>
    );
  }
  
  if (project.project_demo_mode === 'iframe') {
    const hasGithub = Boolean(project.project_github_url);
    return (
      <div className={`project-card__cta-row ${hasGithub ? 'project-card__cta-row--two' : 'project-card__cta-row--one'}`}>
        {hasGithub ? (
          <a 
            href={project.project_github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="project-card__demo-btn project-card__demo-btn--secondary"
            aria-label={`GitHub Repository: ${project.title}`}
          >
            <img src={githubIcon} alt="" aria-hidden="true" className="project-card__cta-ico" />
            GitHub
          </a>
        ) : null}
        <button 
          onClick={() => handleProjectClick(project)}
          className="project-card__demo-btn"
        >
          {primaryLabel}
        </button>
      </div>
    );
  }
  
  const hasGithub = Boolean(project.project_github_url);
  return (
    <div className={`project-card__cta-row ${hasGithub ? 'project-card__cta-row--two' : 'project-card__cta-row--one'}`}>
      {hasGithub ? (
        <a 
          href={project.project_github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="project-card__demo-btn project-card__demo-btn--secondary"
          aria-label={`GitHub Repository: ${project.title}`}
        >
          <img src={githubIcon} alt="" aria-hidden="true" className="project-card__cta-ico" />
          GitHub
        </a>
      ) : null}
      <button 
        className="project-card__demo-btn"
        onClick={() => handleProjectClick(project)}
      >
        {primaryLabel}
      </button>
    </div>
  );
};

// Render compact grid actions
// ---------------------------
const renderGridActions = (project, handleProjectClick) => {
  const hasGithub = Boolean(project.project_github_url);
  const hasExternal = Boolean(project.project_url_external);
  const two = hasGithub && true; // Live is always present (either external or overlay)
  return (
    <div className={`projects__grid-cta-row ${two ? 'projects__grid-cta-row--two' : 'projects__grid-cta-row--one'}`}>
      {hasGithub ? (
        <a 
          href={project.project_github_url}
          target="_blank"
          rel="noopener noreferrer"
          className="projects__grid-cta-btn projects__grid-cta-btn--secondary"
          aria-label={`GitHub Repository: ${project.title}`}
        >
          <img src={githubIcon} alt="" aria-hidden="true" className="projects__grid-cta-ico" />
          GitHub
        </a>
      ) : null}
      {hasExternal ? (
        <button 
          onClick={() => handleProjectClick(project)}
          className="projects__grid-cta-btn"
        >
          Demo
        </button>
      ) : (
        <button 
          onClick={() => handleProjectClick(project)}
          className="projects__grid-cta-btn"
        >
          Demo
        </button>
      )}
    </div>
  );
};

// Reusable section wrapper
// ------------------------
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
// -----------------------
const ProjectsLoading = ({ projectsTitle, projectsSubtitle, hasSubtitle }) => (
  <ProjectsSectionWrapper>
    <div className="projects__header section-header">
      <h2 className="projects__title section-title">{projectsTitle}</h2>
      {hasSubtitle && (
        <p 
          className="projects__subtitle section-subtitle" 
          dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
        />
      )}
    </div>
    <div className="projects__body section-body">
      <div className="projects__loading section-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    </div>
  </ProjectsSectionWrapper>
);

// Error state component
// ---------------------
const ProjectsError = ({ projectsTitle, projectsSubtitle, error, hasSubtitle }) => (
  <ProjectsSectionWrapper>
    <div className="projects__header section-header">
      <h2 className="projects__title section-title">{projectsTitle}</h2>
      {hasSubtitle && (
        <p 
          className="projects__subtitle section-subtitle" 
          dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
        />
      )}
    </div>
    <div className="projects__body section-body">
      <div className="projects__error section-error">
        <p>Error loading projects: {error}</p>
      </div>
    </div>
  </ProjectsSectionWrapper>
);

// Empty state component
// ---------------------
const ProjectsEmpty = ({ projectsTitle, projectsSubtitle, hasSubtitle }) => (
  <ProjectsSectionWrapper>
    <div className="projects__header section-header">
      <h2 className="projects__title section-title">{projectsTitle}</h2>
      {hasSubtitle && (
        <p 
          className="projects__subtitle section-subtitle" 
          dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
        />
      )}
    </div>
    <div className="projects__body section-body">
      <div className="projects__empty section-empty">
        <p>No projects found.</p>
      </div>
    </div>
  </ProjectsSectionWrapper>
);

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [listView, setListView] = useState(() => {
    // For side_by_side mode, view toggle doesn't apply
    if (typeof window !== 'undefined') {
      const mode = window.__PROJECTS_LAYOUT_MODE__ || 'side_by_side';
      if (mode === 'side_by_side') return false;
      
      // For grid/list modes, check saved preference or use mode default
      const savedView = loadViewMode();
      if (savedView !== null) return savedView;
      
      return mode === 'list'; // list mode defaults to true, grid mode defaults to false
    }
    return false;
  });
  const [isPrint, setIsPrint] = useState(false);
  const [printReady, setPrintReady] = useState(false);
  const pendingPrintRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [shouldFocusOnSlide, setShouldFocusOnSlide] = useState(false);
  const currentSlideTitleRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchActiveRef = useRef(false);
  const [imageLoaded, setImageLoaded] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const markImageLoaded = (projectId) => {
    if (!projectId) return;
    setImageLoaded((prev) => ({ ...prev, [projectId]: true }));
  };

  // Enhanced setListView that persists to localStorage
  const updateListView = (newListView) => {
    setListView(newListView);
    saveViewMode(newListView);
  };

  // Get customizer values
  const projectsTitle = typeof window !== 'undefined' 
    ? window.__PROJECTS_TITLE__ || 'Projekte' 
    : 'Projekte';
  const projectsSubtitle = typeof window !== 'undefined' 
    ? window.__PROJECTS_SUBTITLE__ || '' 
    : '';

  // Check if subtitle should be displayed
  const hasSubtitle = projectsSubtitle && 
    projectsSubtitle.trim() !== '' && 
    projectsSubtitle !== 'Subtitle below the main title';
  const layoutMode = typeof window !== 'undefined'
    ? window.__PROJECTS_LAYOUT_MODE__ || 'side_by_side'
    : 'side_by_side';
  const showViewToggle = typeof window !== 'undefined'
    ? (typeof window.__PROJECTS_SHOW_VIEW_TOGGLE__ !== 'undefined' 
        ? window.__PROJECTS_SHOW_VIEW_TOGGLE__ 
        : true)
    : true;
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

  // Determine default view based on layout mode
  const getDefaultView = () => {
    if (layoutMode === 'list') return true; // list mode defaults to list view
    if (layoutMode === 'grid') return false; // grid mode defaults to grid view
    return false; // side_by_side mode doesn't use view toggle
  };

  useEffect(() => {
    // Detect print mode via events and media query
    const mq = window.matchMedia ? window.matchMedia('print') : null;
    const rmq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const mobileMq = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
    
    const handleBeforePrint = () => {
      pendingPrintRef.current = true;
      setIsPrint(true);
    };
    const handleAfterPrint = () => {
      pendingPrintRef.current = false;
      setIsPrint(false);
    };
    const handleMobileChange = (e) => {
      setIsMobile(e.matches);
    };
    
    if (typeof window !== 'undefined') {
      // If print dialog already open at mount
      const mq = window.matchMedia && window.matchMedia('print');
      if (mq && typeof mq.matches === 'boolean' && mq.matches) {
        pendingPrintRef.current = true;
        setIsPrint(true);
      }
      
      // Set initial mobile state
      if (mobileMq) {
        setIsMobile(mobileMq.matches);
      }
      
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
      if (mq && typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', (e) => setIsPrint(e.matches));
      }
      if (rmq) {
        setReducedMotion(Boolean(rmq.matches));
        if (typeof rmq.addEventListener === 'function') {
          rmq.addEventListener('change', (e) => setReducedMotion(Boolean(e.matches)));
        }
      }
      if (mobileMq && typeof mobileMq.addEventListener === 'function') {
        mobileMq.addEventListener('change', handleMobileChange);
      }
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeprint', handleBeforePrint);
        window.removeEventListener('afterprint', handleAfterPrint);
        if (mq && typeof mq.removeEventListener === 'function') {
          mq.removeEventListener('change', (e) => setIsPrint(e.matches));
        }
        if (rmq && typeof rmq.removeEventListener === 'function') {
          rmq.removeEventListener('change', (e) => setReducedMotion(Boolean(e.matches)));
        }
        if (mobileMq && typeof mobileMq.removeEventListener === 'function') {
          mobileMq.removeEventListener('change', handleMobileChange);
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
        
        // Always show only active projects (including print mode)
        const filteredProjects = data.filter(project => project.project_status === 'active');
        
        // Keep API order (date DESC)
        setProjects(filteredProjects);

        // Preload main images early so Print has them ready
        try {
          const urls = filteredProjects
            .map(p => p.featured_image_wide_2x || p.featured_image_wide || p.project_screenshot || p.featured_image)
            .filter(Boolean);
          if (urls.length === 0) {
            setPrintReady(true);
          } else {
            let remaining = urls.length;
            urls.forEach((u) => {
              const img = new Image();
              const done = () => {
                remaining -= 1;
                if (remaining <= 0) {
                  setPrintReady(true);
                }
              };
              img.onload = done;
              img.onerror = done;
              img.src = u;
            });
          }
        } catch {
          setPrintReady(true);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isPrint]);

  // When print is requested and data/images are ready, ensure DOM is painted, then trigger print
  useEffect(() => {
    let cancelled = false;
    const triggerPrint = async () => {
      if (!(isPrint && printReady && projects.length > 0 && pendingPrintRef.current)) return;
      await waitForPrintStability(PRINT.STABILITY_DELAY);
      if (cancelled) return;
      try { window.print(); } catch {}
    };
    triggerPrint();
    return () => { cancelled = true; };
  }, [isPrint, printReady, projects.length]);

  // Auto-play functionality
  useEffect(() => {
    if (!autoplay || projects.length <= 1 || isPaused || reducedMotion || isPrint) {
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
    }, Math.max(1, autoplayDelay) * 1000);

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(autoplayTimer);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(autoplayTimer);
    };
  }, [autoplay, autoplayDelay, projects.length, currentSlide, isPaused, reducedMotion, isPrint]);

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
    setShouldFocusOnSlide(true);
  };

  const goToNextSlide = () => {
    setCurrentSlide(Math.min(projects.length - 1, currentSlide + 1));
    setShouldFocusOnSlide(true);
  };

  // Focus newly active slide title for accessibility
  useEffect(() => {
    if (shouldFocusOnSlide && currentSlideTitleRef.current) {
      currentSlideTitleRef.current.focus();
      setShouldFocusOnSlide(false);
    }
  }, [shouldFocusOnSlide, currentSlide]);

  // Touch swipe handlers (horizontal)
  const onTouchStart = (e) => {
    if (isPrint || projects.length <= 1) return;
    const t = e.touches && e.touches[0] ? e.touches[0] : null;
    if (!t) return;
    touchActiveRef.current = true;
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };

  const onTouchMove = (e) => {
    if (!touchActiveRef.current) return;
    const t = e.touches && e.touches[0] ? e.touches[0] : null;
    if (!t) return;
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    // If horizontal intent is clear, prevent vertical scroll jank
    if (Math.abs(dx) > TOUCH.SCROLL_THRESHOLD && Math.abs(dx) > Math.abs(dy) * TOUCH.INTENT_RATIO) {
      e.preventDefault();
    }
  };

  const onTouchEnd = (e) => {
    if (!touchActiveRef.current) return;
    touchActiveRef.current = false;
    const t = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : null;
    if (!t) return;
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;
    const horizontal = Math.abs(dx) > Math.abs(dy) * TOUCH.INTENT_RATIO;
    const fastEnough = dt < TOUCH.MAX_TIME; // Swipe should be reasonably quick
    const farEnough = Math.abs(dx) > TOUCH.MIN_DISTANCE; // Minimum distance
    if (horizontal && fastEnough && farEnough) {
      if (dx < 0 && currentSlide < projects.length - 1) {
        goToNextSlide();
      } else if (dx > 0 && currentSlide > 0) {
        goToPreviousSlide();
      }
    }
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
  if ((loading && !isPrint) || (isPrint && (!printReady || loading))) {
    return (
      <ProjectsLoading 
        projectsTitle={projectsTitle}
        projectsSubtitle={projectsSubtitle}
        hasSubtitle={hasSubtitle}
      />
    );
  }

  if (error && !isPrint) {
    return (
      <ProjectsError 
        projectsTitle={projectsTitle}
        projectsSubtitle={projectsSubtitle}
        error={error}
        hasSubtitle={hasSubtitle}
      />
    );
  }

  if (projects.length === 0 && !isPrint) {
    return (
      <ProjectsEmpty 
        projectsTitle={projectsTitle}
        projectsSubtitle={projectsSubtitle}
        hasSubtitle={hasSubtitle}
      />
    );
  }

  // Grid mode render (simple): image + title + excerpt, no tags/CTAs
  const renderGrid = () => (
    <div className="projects__grid">
      {projects.map((p) => (
        <article key={p.id} className="projects__grid-card" aria-label={`Projekt: ${p.title}`}>
          <div className="projects__grid-thumb">
            {renderProjectScreenshot(p, { isPriority: false })}
          </div>
          <h3 className="projects__grid-title">{p.title}</h3>
          {renderGridActions(p, handleProjectClick)}
        </article>
      ))}
    </div>
  );

  return (
    <section className={`projects section-base ${(layoutMode === 'grid' || layoutMode === 'list') ? 'projects--flow' : ''}`.trim()} id="projects">
      <div className="projects__inner section-inner">
        <div className="projects__content section-content">
          <div className="projects__card section-card">
            {/* Toggle buttons positioned in top-right of card */}
            <div className="projects__view-toggle">
              {(layoutMode === 'grid' || layoutMode === 'list') && showViewToggle && (
                listView ? (
                  <button
                    className="projects__toggle-btn"
                    aria-pressed="false"
                    onClick={() => updateListView(false)}
                    data-tooltip="Grid View"
                    aria-label="Switch to grid view"
                  >
                    <img src={viewGridIcon} alt="" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    className="projects__toggle-btn"
                    aria-pressed="false"
                    onClick={() => updateListView(true)}
                    data-tooltip="List View"
                    aria-label="Switch to list view"
                  >
                    <img src={viewListIcon} alt="" aria-hidden="true" />
                  </button>
                )
              )}
            </div>
            
            {isPrint ? (
              <div className="projects__header section-header">
                <h2 className="projects__title section-title">{projectsTitle}</h2>
                {hasSubtitle && (
                  <p 
                    className="projects__subtitle section-subtitle" 
                    dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
                  />
                )}
              </div>
            ) : (
              <motion.div
                initial={ANIMATION.FADE_IN.hidden}
                whileInView={ANIMATION.FADE_IN.show}
                transition={{ duration: ANIMATION.TIMING.BASE }}
                viewport={{ once: true }}
                className="projects__header section-header"
              >
                <h2 className="projects__title section-title">{projectsTitle}</h2>
                {hasSubtitle && (
                  <p 
                    className="projects__subtitle section-subtitle" 
                    dangerouslySetInnerHTML={{ __html: projectsSubtitle }} 
                  />
                )}
              </motion.div>
            )}

            {
              /* Always render print stack hidden; print CSS will show it */
            }
            <div className={`projects__body section-body projects__body--layout-${layoutMode}`}>
              <div className="projects__print-stack" style={{ display: 'none' }}>
                {projects.map((proj, idx) => (
                  <div
                    key={proj.id || idx}
                    className="projects__slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Slide ${idx + 1} of ${projects.length}`}
                  >
                    <div className="project-card project-card--side-by-side">
                      <h1 className="print-project-heading">{projectsTitle}</h1>
                      <div className="project-card__screenshot">
                        {renderProjectScreenshot(proj, { isPriority: true, isPrint: true })}
                      </div>
                      <div className="project-card__info">
                        <h3 className="project-card__title">{proj.title}</h3>
                        {(proj.excerpt && proj.excerpt.trim() !== '') || (proj.content && proj.content.trim() !== '') ? (
                          <div className="project-card__excerpt" dangerouslySetInnerHTML={{ __html: (proj.excerpt && proj.excerpt.trim() !== '' ? proj.excerpt : proj.content) }} />
                        ) : (
                          <div aria-hidden="true">
                            <div className="skeleton skeleton--text-line" style={{ width: '85%' }}></div>
                            <div className="skeleton skeleton--text-line" style={{ width: '70%' }}></div>
                            <div className="skeleton skeleton--text-line" style={{ width: '60%' }}></div>
                          </div>
                        )}
                        {renderProjectTechnologies(proj)}
                        <div className="project-card__actions">
                          {renderProjectActions(proj, handleProjectClick, { primaryLabel: 'Demo' })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {(layoutMode === 'grid' || layoutMode === 'list') ? (
              (listView || isMobile) ? (
                <div className="projects__list">
                  {projects.map((proj) => (
                    <div key={proj.id} className="project-card project-card--side-by-side project-card--list" style={{ marginBottom: '16px' }}>
                      <div className="project-card__screenshot">
                        {renderProjectScreenshot(proj, { isPriority: false })}
                      </div>
                      <div className="project-card__info">
                        <h3 className="project-card__title">{proj.title}</h3>
                        {(proj.excerpt && proj.excerpt.trim() !== '') || (proj.content && proj.content.trim() !== '') ? (
                          <div className="project-card__excerpt" dangerouslySetInnerHTML={{ __html: (proj.excerpt && proj.excerpt.trim() !== '' ? proj.excerpt : proj.content) }} />
                        ) : (
                          <div aria-hidden="true">
                            <div className="skeleton skeleton--text-line" style={{ width: '85%' }}></div>
                            <div className="skeleton skeleton--text-line" style={{ width: '70%' }}></div>
                            <div className="skeleton skeleton--text-line" style={{ width: '60%' }}></div>
                          </div>
                        )}
                        {renderProjectTechnologies(proj)}
                        <div className="project-card__actions">
                          {renderProjectActions(proj, handleProjectClick, { primaryLabel: 'Demo' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                renderGrid()
              )
            ) : (
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
                    aria-controls="projects-slider"
                    aria-disabled={currentSlide === 0 ? 'true' : 'false'}
                  >
                    ←
                  </button>
                )}

                <div
                  className="projects__slider projects__slider--side-by-side"
                  id="projects-slider"
                  role="region"
                  aria-roledescription="carousel"
                  aria-labelledby="projects-heading"
                  aria-live="off"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                >
                  <div className="projects__slider-container">
                    {/* Live region for announcing slide changes */}
                    {!isPrint && projects.length > 0 && (
                      <div
                        aria-live="polite"
                        style={{
                          position: 'absolute',
                          width: '1px',
                          height: '1px',
                          margin: '-1px',
                          padding: 0,
                          border: 0,
                          overflow: 'hidden',
                          clip: 'rect(0 0 0 0)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {`Showing project ${currentSlide + 1} of ${projects.length}: ${projects[currentSlide].title}`}
                      </div>
                    )}
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={currentSlide}
                          className="projects__slide"
                          role="group"
                          aria-roledescription="slide"
                          aria-label={`Slide ${currentSlide + 1} of ${projects.length}`}
                          initial={ANIMATION.SLIDE.hidden}
                          animate={ANIMATION.SLIDE.show}
                          exit={ANIMATION.SLIDE.exit}
                          transition={ANIMATION.SPRING}
                        >
                          {(() => {
                            const current = projects[currentSlide];
                            const isImgLoaded = Boolean(imageLoaded[current?.id]);
                            const isFirstSlide = currentSlide === 0;
                            return (
                              <div className="project-card project-card--side-by-side">
                                <div className="project-card__screenshot">
                                  {renderProjectScreenshot(current, { isPriority: true, onLoad: () => markImageLoaded(current?.id) })}
                                  {!isImgLoaded && !isFirstSlide && (
                                    <div className="skeleton skeleton--image" aria-hidden="true"></div>
                                  )}
                                </div>
                                <div className="project-card__info">
                                  <h3
                                    className="project-card__title"
                                    ref={currentSlideTitleRef}
                                    tabIndex={-1}
                                  >
                                    {current.title}
                                  </h3>
                                  {(current.excerpt && current.excerpt.trim() !== '') || (current.content && current.content.trim() !== '') ? (
                                    <div className="project-card__excerpt" dangerouslySetInnerHTML={{ __html: (current.excerpt && current.excerpt.trim() !== '' ? current.excerpt : current.content) }} />
                                  ) : (
                                    <div aria-hidden="true">
                                      <div className="skeleton skeleton--text-line" style={{ width: '85%' }}></div>
                                      <div className="skeleton skeleton--text-line" style={{ width: '70%' }}></div>
                                      <div className="skeleton skeleton--text-line" style={{ width: '60%' }}></div>
                                    </div>
                                  )}
                                  {renderProjectTechnologies(current)}
                                  <div className="project-card__actions">
                                    {renderProjectActions(current, handleProjectClick, { primaryLabel: 'Demo' })}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      </AnimatePresence>
                  </div>
                </div>

                {/* Right Navigation Arrow */}
                {projects.length > 1 && (
                  <button 
                    className="projects__nav-btn projects__nav-btn--next"
                    onClick={goToNextSlide}
                    disabled={currentSlide === projects.length - 1}
                    aria-label="Next project"
                    aria-controls="projects-slider"
                    aria-disabled={currentSlide === projects.length - 1 ? 'true' : 'false'}
                  >
                    →
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


