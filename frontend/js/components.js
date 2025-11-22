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
        })
        .catch(error => {
            console.error('Error loading component:', error);
            document.querySelector(selector).innerHTML = 
                `<div style="color: red; padding: 20px; text-align: center;">
                    Navigation temporarily unavailable
                </div>`;
        });
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Loading components...');
    
    // For Vercel deployment 
    const isVercel = window.location.hostname.includes('vercel.app');
    
    if (isVercel) {
        // Vercel deployment
        includeComponent('#header-container', '/components/header.html');
        includeComponent('#footer-container', '/components/footer.html');
    } else {
        // Local development
        const basePath = window.location.pathname.includes('/pages/') ? '..' : '.';
        includeComponent('#header-container', `${basePath}/components/header.html`);
        includeComponent('#footer-container', `${basePath}/components/footer.html`);
    }
});