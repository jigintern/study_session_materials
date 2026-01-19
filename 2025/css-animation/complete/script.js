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
    document.body.setAttribute('data-theme', this.currentTheme);
    this.themeToggle?.addEventListener('click', () => this.toggleTheme());
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
class MobileNavigation {
  constructor() {
    this.navToggle = document.getElementById('navToggle');
    this.navMenu = document.getElementById('navMenu');
    this.init();
  }
  init() {
    if (!this.navToggle || !this.navMenu) return;
    this.navToggle.addEventListener('click', () => this.toggleMenu());
    this.navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
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
class ArticleLoader {
  constructor() {
    this.articlesGrid = document.getElementById('articlesGrid');
    this.loadDelay = 5000; 
    this.init();
  }
  async init() {
    if (!this.articlesGrid) return;
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
    }
  }
  renderArticles(articles) {
    this.articlesGrid.innerHTML = '';
    articles.forEach(article => {
      const articleCard = this.createArticleCard(article);
      this.articlesGrid.appendChild(articleCard);
    });
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
    setTimeout(() => {
      articleElement.classList.add('is-visible');
    }, 50);
    return articleElement;
  }
}
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
    this.articles = document.querySelectorAll('.article-card:not(.skeleton-card)');
  }
  filterArticles(button) {
    const category = button.getAttribute('data-category');
    this.filterButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
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
class ScrollProgress {
  constructor() {
    this.progressBar = document.querySelector('.scroll-progress, .reading-progress');
    this.init();
  }
  init() {
    if (!this.progressBar) return;
    window.addEventListener('scroll', () => this.updateProgress(), { passive: true });
  }
  updateProgress() {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    this.progressBar.style.width = `${scrolled}%`;
  }
}
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
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    document.body.classList.remove('no-transition');
  }, 100);
  new ThemeManager();
  new MobileNavigation();
  window.categoryFilter = new CategoryFilter();
  new ScrollAnimationObserver();
  new ScrollProgress();
  new NavigationScroll();
  new SkillProgressAnimation();
  new ArticleLoader();
});
