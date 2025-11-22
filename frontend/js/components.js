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
        })
        .catch(error => {
            console.error('❌ Error loading component:', error);
            document.querySelector(selector).innerHTML = 
                `<div style="color: red; padding: 10px; text-align: center; background: #fee;">
                    Navigation temporarily unavailable
                </div>`;
        });
}

// Load all components when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Loading components...');
    
    // Use absolute paths from the root of your frontend folder
    const basePath = window.location.origin + '/frontend';
    
    // Load header
    includeComponent('#header-container', `${basePath}/components/header.html`);
    
    // Load footer
    includeComponent('#footer-container', `${basePath}/components/footer.html`);
});