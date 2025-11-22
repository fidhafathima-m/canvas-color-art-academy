// Component loader function
function includeComponent(selector, url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.querySelector(selector).innerHTML = data;
            console.log(`✅ Component loaded: ${url}`);
            initMobileMenu();
        })
        .catch(error => {
            console.error('❌ Error loading component:', error);
            document.querySelector(selector).innerHTML = 
                `<div style="color: red; padding: 20px; text-align: center; background: #fee;">
                    Navigation temporarily unavailable
                </div>`;
        });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (mobileMenuToggle && navbarCollapse) {
        console.log('🚀 Initializing mobile menu...');
        
        // Toggle mobile menu
        mobileMenuToggle.addEventListener('click', () => {
            const isShowing = navbarCollapse.classList.contains('show');
            navbarCollapse.classList.toggle('show');
            sidebarOverlay.classList.toggle('active');
            console.log(`📱 Mobile menu ${isShowing ? 'closed' : 'opened'}`);
        });
        
        // Close menu when clicking overlay
        sidebarOverlay.addEventListener('click', () => {
            navbarCollapse.classList.remove('show');
            sidebarOverlay.classList.remove('active');
            console.log('📱 Mobile menu closed via overlay');
        });
        
        // Close menu when clicking nav links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbarCollapse.classList.remove('show');
                sidebarOverlay.classList.remove('active');
                console.log('📱 Mobile menu closed via nav link');
            });
        });
        
        // Close menu on window resize (if resizing to desktop)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                navbarCollapse.classList.remove('show');
                sidebarOverlay.classList.remove('active');
            }
        });
    } else {
        console.warn('⚠️ Mobile menu elements not found');
    }
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Loading components...');
    
    // Use absolute paths for all environments
    const basePath = window.location.origin.includes('vercel.app') ? '' : '.';
    
    // Load header
    includeComponent('#header-container', `${basePath}/components/header.html`);
    
    // Load footer
    includeComponent('#footer-container', `${basePath}/components/footer.html`);
});