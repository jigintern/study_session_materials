// ============================================
// Theme Management
// ============================================

class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('themeToggle');
    this.currentTheme = localStorage.getItem('theme') ?? this.getSystemTheme();
    this.init();
  }

  getSystemTheme() {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  init() {
    // Set initial theme
    document.body.setAttribute('data-theme', this.currentTheme);

    // Add event listener
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());

    // Listen for system theme changes
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    this.currentTheme = theme;

    // Use View Transitions API if available
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        document.body.setAttribute('data-theme', theme);
      });
    } else {
      document.body.setAttribute('data-theme', theme);
    }

    localStorage.setItem('theme', theme);
  }
}

// ============================================
// Mobile Navigation
// ============================================

class MobileNavigation {
  constructor() {
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.init();
  }

  init() {
    if (!this.navToggle || !this.navMenu) return;

    // Mobile menu toggle
    this.navToggle.addEventListener('click', () => this.toggleMenu());

    // Close menu when clicking on a link
    this.navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav') && this.navMenu.classList.contains('active')) {
        this.closeMenu();
      }
    });
  }

  toggleMenu() {
    const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
    this.navToggle.setAttribute('aria-expanded', !isExpanded);
    this.navMenu.classList.toggle('active');
  }

  closeMenu() {
    this.navToggle.setAttribute('aria-expanded', 'false');
    this.navMenu.classList.remove('active');
  }
}

// ============================================
// Category Filter
// ============================================

class CategoryFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn, .tab-btn');
    this.articles = document.querySelectorAll('.article-card');
    this.timelineArticles = document.querySelectorAll('.timeline-article');
    this.init();
  }

  init() {
    if (this.filterButtons.length === 0) return;

    this.filterButtons.forEach(button => {
      button.addEventListener('click', () => this.filterArticles(button));
    });

    // Check URL for category parameter
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
      const button = document.querySelector(`[data-category="${category}"]`);
      if (button) {
        this.filterArticles(button);
      }
    }
  }

  filterArticles(button) {
    const category = button.getAttribute('data-category');

    // Update active button
    this.filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Filter articles
    const articlesToFilter = this.articles.length > 0 ? this.articles : this.timelineArticles;

    articlesToFilter.forEach(article => {
      const articleCategory = article.getAttribute('data-category');
      const shouldShow = category === 'all' || articleCategory === category;

      if (shouldShow) {
        article.style.display = '';
        article.style.opacity = '1';
      } else {
        article.style.display = 'none';
      }
    });
  }
}

// ============================================
// Scroll Animation Observer
// ============================================

class ScrollAnimationObserver {
  constructor() {
    this.observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // 少し早めにアニメーション開始
      threshold: 0.1 // 10%表示されたら発火
    };
    this.init();
  }

  init() {
    // アニメーション対象の要素を取得
    const animatedElements = document.querySelectorAll(
      '.fade-in-on-scroll, .slide-in-left-on-scroll, .slide-in-right-on-scroll, .scale-in-on-scroll, .timeline-item, .timeline-article'
    );

    if (animatedElements.length === 0) return;

    // Intersection Observer を作成
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 一度だけアニメーション
        }
      });
    }, this.observerOptions);

    // 各要素を監視
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Remove no-transition class after page load
  setTimeout(() => {
    document.body.classList.remove('no-transition');
  }, 100);

  // Initialize essential features only
  new ThemeManager();
  new MobileNavigation();
  new CategoryFilter();
  new ScrollAnimationObserver();
});
