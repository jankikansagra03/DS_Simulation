/**
 * DSM SIMULATION HUB - SHARED JAVASCRIPT (main.js)
 * Interactivity for theme toggling, responsive navigation,
 * filtering, live searching, and taxonomy tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initTaxonomyTabs();
    initHubFilters();
    initSearchFilter();
    initScrollSpy();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark mode)
   -------------------------------------------------------------------------- */
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggle');
    const mobileThemeToggleBtn = document.getElementById('mobileThemeToggle');
    const savedTheme = localStorage.getItem('dsm-theme') || localStorage.getItem('theme');
    
    // Check saved or system preference
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('dsm-theme', theme);
        localStorage.setItem('theme', theme);
        
        const label = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;
        if (themeToggleBtn) themeToggleBtn.setAttribute('aria-label', label);
        if (mobileThemeToggleBtn) mobileThemeToggleBtn.setAttribute('aria-label', label);

        // Also update legacy page theme button if present (like on queue_cheatsheet.html)
        const themeIcon = document.getElementById('theme-icon');
        const themeText = document.getElementById('theme-text');
        if (themeIcon) themeIcon.innerText = theme === 'dark' ? '☀️' : '🌙';
        if (themeText) themeText.innerText = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (mobileThemeToggleBtn) {
        mobileThemeToggleBtn.addEventListener('click', toggleTheme);
    }
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
    const mobileToggle = document.getElementById('mobileMenuBtn');
    const closeMobileBtn = document.getElementById('closeMobileBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    function openDrawer() {
        mobileDrawer?.classList.add('active');
        mobileOverlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        mobileDrawer?.classList.remove('active');
        mobileOverlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    mobileToggle?.addEventListener('click', openDrawer);
    closeMobileBtn?.addEventListener('click', closeDrawer);
    mobileOverlay?.addEventListener('click', closeDrawer);

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer?.classList.contains('active')) {
            closeDrawer();
        }
    });
}

/* --------------------------------------------------------------------------
   3. Taxonomy Interactive Tab Switcher
   -------------------------------------------------------------------------- */
function initTaxonomyTabs() {
    const tabButtons = document.querySelectorAll('.taxonomy-nav .tab-btn');
    const tabPanes = document.querySelectorAll('.taxonomy-tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            button.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

/* --------------------------------------------------------------------------
   4. Module Hub Filtering (All, Linear, Non-Linear, Algorithms)
   -------------------------------------------------------------------------- */
function initHubFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const moduleCards = document.querySelectorAll('.module-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            moduleCards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                if (filterValue === 'all' || cardType === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });

            // Re-check search term if present
            const searchInput = document.getElementById('hubSearch');
            if (searchInput && searchInput.value.trim() !== '') {
                filterBySearch(searchInput.value.toLowerCase());
            }
        });
    });
}

/* --------------------------------------------------------------------------
   5. Live Search Filter across Modules
   -------------------------------------------------------------------------- */
function initSearchFilter() {
    const searchInput = document.getElementById('hubSearch');
    const noResults = document.getElementById('noSearchResults');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filterBySearch(query);
    });
}

function filterBySearch(query) {
    const moduleCards = document.querySelectorAll('.module-card');
    const activeFilterBtn = document.querySelector('.filter-btn.active');
    const currentCategory = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
    const noResults = document.getElementById('noSearchResults');

    let matchCount = 0;

    moduleCards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        const matchesCategory = (currentCategory === 'all' || cardType === currentCategory);

        const title = card.querySelector('.module-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.module-desc')?.textContent.toLowerCase() || '';
        const specs = card.querySelector('.module-specs')?.textContent.toLowerCase() || '';
        const tags = card.getAttribute('data-keywords') || '';

        const textToSearch = `${title} ${desc} ${specs} ${tags}`.toLowerCase();
        const matchesSearch = query === '' || textToSearch.includes(query);

        if (matchesCategory && matchesSearch) {
            card.style.display = 'flex';
            matchCount++;
        } else {
            card.style.display = 'none';
        }
    });

    if (noResults) {
        noResults.style.display = (matchCount === 0) ? 'block' : 'none';
    }
}

/* --------------------------------------------------------------------------
   6. Scroll Spy & Active Nav Link Observer
   -------------------------------------------------------------------------- */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu .nav-link[href^="#"]');

    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    if (link.getAttribute('href') === `#${activeId}`) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -70% 0px'
    });

    sections.forEach(sec => observer.observe(sec));
}
