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
    document.body.setAttribute('data-theme', theme);
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
// Article Loader
// ============================================

class ArticleLoader {
  constructor() {
    this.articlesGrid = document.getElementById('articlesGrid');
    this.loadDelay = 5000; // 5秒
    this.init();
  }

  async init() {
    if (!this.articlesGrid) return;
    
    // 5秒後に記事を読み込む
    setTimeout(() => this.loadArticles(), this.loadDelay);
  }

  async loadArticles() {
    try {
      const response = await fetch('articles.json');
      if (!response.ok) {
        throw new Error('Failed to load articles');
      }
      const articles = await response.json();
      this.renderArticles(articles);
    } catch (error) {
      console.error('Error loading articles:', error);
      // エラー時はスケルトンを残す
    }
  }

  renderArticles(articles) {
    // スケルトンカードをクリア
    this.articlesGrid.innerHTML = '';

    // 記事カードを生成して追加
    articles.forEach(article => {
      const articleCard = this.createArticleCard(article);
      this.articlesGrid.appendChild(articleCard);
    });

    // カテゴリフィルターを再初期化
    if (window.categoryFilter) {
      window.categoryFilter.refreshArticles();
    }
  }

  createArticleCard(article) {
    const articleElement = document.createElement('article');
    articleElement.className = 'article-card fade-in-on-scroll';
    articleElement.setAttribute('data-category', article.category);

    articleElement.innerHTML = `
      <a href="${article.link}" class="card-link-wrapper">
        <div class="card-image">
          <div class="image-placeholder" style="background: ${article.gradient};" role="img" aria-label="記事のサムネイル"></div>
        </div>
        <div class="card-content">
          <div class="article-meta">
            <span class="category">${article.categoryLabel}</span>
            <time datetime="${article.date}">${article.dateLabel}</time>
          </div>
          <h3 class="card-title">${article.title}</h3>
          <p class="card-excerpt">
            ${article.excerpt}
          </p>
        </div>
      </a>
    `;

    // アニメーションをトリガー
    setTimeout(() => {
      articleElement.classList.add('is-visible');
    }, 50);

    return articleElement;
  }
}

// ============================================
// Category Filter
// ============================================

class CategoryFilter {
  constructor() {
    this.filterButtons = document.querySelectorAll('.filter-btn, .tab-btn');
    this.articles = [];
    this.timelineArticles = document.querySelectorAll('.timeline-article');
    this.init();
  }

  init() {
    if (this.filterButtons.length === 0) return;

    this.refreshArticles();

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

  refreshArticles() {
    // 記事リストを更新（動的読み込み後に呼ばれる）
    this.articles = document.querySelectorAll('.article-card:not(.skeleton-card)');
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
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };
    this.init();
  }

  init() {
    const animatedElements = document.querySelectorAll(
      '.fade-in-on-scroll, .slide-in-left-on-scroll, .slide-in-right-on-scroll, .scale-in-on-scroll, .timeline-item, .timeline-article'
    );

    if (animatedElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    animatedElements.forEach(element => {
      observer.observe(element);
    });
  }
}

// ============================================
// Navigation Hide/Show on Scroll
// ============================================

class NavigationScroll {
  constructor() {
    this.nav = document.getElementById('nav');
    this.lastScrollY = window.scrollY;
    this.init();
  }

  init() {
    if (!this.nav) return;

    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
  }

  handleScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
      this.nav.classList.add('hidden');
    } else {
      this.nav.classList.remove('hidden');
    }

    this.lastScrollY = currentScrollY;
  }
}

// ============================================
// Skill Progress Animation
// ============================================

class SkillProgressAnimation {
  constructor() {
    this.skillItems = document.querySelectorAll('.skill-item');
    this.init();
  }

  init() {
    if (this.skillItems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const progressBar = entry.target.querySelector('.skill-progress');
          const progress = progressBar?.getAttribute('data-progress');
          if (progressBar && progress) {
            progressBar.style.width = `${progress}%`;
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.skillItems.forEach(item => {
      observer.observe(item);
    });
  }
}

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.body.classList.remove('no-transition');
  }, 100);

  new ThemeManager();
  new MobileNavigation();
  
  // CategoryFilterをグローバルに保存して、ArticleLoaderから参照できるようにする
  window.categoryFilter = new CategoryFilter();
  
  new ScrollAnimationObserver();
  new NavigationScroll();
  new SkillProgressAnimation();
  
  // 記事の動的読み込み
  new ArticleLoader();
});
