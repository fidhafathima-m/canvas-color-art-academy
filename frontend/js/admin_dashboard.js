const API_BASE = "https://canvas-color-backend.onrender.com/api";
let currentUser = null;

// Mobile sidebar functionality
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  // Toggle sidebar on hover (desktop)
  sidebar.addEventListener("mouseenter", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.add("expanded");
      mainContent.classList.add("expanded");
    }
  });

  sidebar.addEventListener("mouseleave", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("expanded");
      mainContent.classList.remove("expanded");
    }
  });

  // Toggle sidebar on click (mobile)
  mobileMenuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("expanded");
    sidebarOverlay.classList.toggle("active");
  });

  // Close sidebar when clicking overlay
  sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("expanded");
    sidebarOverlay.classList.remove("active");
  });
}

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }
}

function showLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "flex";
  }
}

// Enhanced authentication check
async function checkAuth() {
  showLoadingOverlay();
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    console.log("🔐 Auth Check - Token:", token ? "Exists" : "Missing");
    console.log("🔐 Auth Check - User:", user ? "Exists" : "Missing");

    // Basic validation
    if (!token || !user) {
      throw new Error("No authentication data found");
    }

    currentUser = JSON.parse(user);
    console.log("🔐 Current User Role:", currentUser.role);

    // Immediate role check
    if (currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify token with server
    console.log("🔄 Verifying token with server...");
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("🔐 Server response status:", response.status);
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();
    console.log("🔐 Server response data:", data);

    if (!data.success) {
      throw new Error("Server authentication failed: " + (data.message || "Unknown error"));
    }

    // Final role verification from server
    if (data.data.user.role !== "admin") {
      throw new Error("Server role verification failed");
    }

    console.log("✅ Authentication successful");
    hideLoadingOverlay();

    // Only now initialize the dashboard
    displayUserInfo();
    loadDashboardData();
    initSidebar();
  } catch (error) {
    console.error("❌ Authentication failed:", error);
    hideLoadingOverlay();

    // Clear invalid credentials
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to login immediately without alert
    window.location.href = "login.html";
  }
}

function displayUserInfo() {
  document.getElementById(
    "welcomeMessage"
  ).textContent = `Welcome, ${currentUser.name} (${currentUser.role})`;
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      const stats = data.data.stats;
      document.getElementById("totalStudents").textContent = stats.totalUsers;
      document.getElementById("activeCourses").textContent =
        stats.activeCourses;
      document.getElementById("revenue").textContent = `₹${stats.revenue}`;
      document.getElementById("newEnrollments").textContent =
        stats.newEnrollments;
      document.getElementById("dashboardMessage").textContent =
        data.data.message;
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    document.getElementById("dashboardMessage").textContent =
      "Error loading dashboard data. Please refresh the page.";
  }
}

// Enhanced logout function
async function logout() {
  if (confirm("Are you sure you want to logout?")) {
    try {
      const token = localStorage.getItem("token");
      // Clear localStorage first for immediate logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Then call logout API
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Force redirect and prevent caching
      window.location.replace("login.html");
    }
  }
}

// Prevent page caching
function disableCaching() {
  // Set no-cache headers via meta tags
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Cache-Control';
  meta.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(meta);

  const meta2 = document.createElement('meta');
  meta2.httpEquiv = 'Pragma';
  meta2.content = 'no-cache';
  document.head.appendChild(meta2);

  const meta3 = document.createElement('meta');
  meta3.httpEquiv = 'Expires';
  meta3.content = '0';
  document.head.appendChild(meta3);
}

// Check authentication when page becomes visible
function setupVisibilityCheck() {
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      console.log('Page became visible, rechecking auth...');
      checkAuth();
    }
  });

  // Also check when window gains focus
  window.addEventListener('focus', function() {
    console.log('Window focused, rechecking auth...');
    checkAuth();
  });

  // Check on page load
  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      console.log('Page loaded from cache, rechecking auth...');
      checkAuth();
    }
  });
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  // Disable caching
  disableCaching();
  
  // Setup visibility and focus checks
  setupVisibilityCheck();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Start authentication check
  checkAuth();
});

// Prevent back navigation after logout
window.addEventListener('popstate', function(event) {
  console.log('Back button pressed, checking auth...');
  checkAuth();
});