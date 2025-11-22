const API_BASE = "https://canvas-color-backend.onrender.com/api";
let currentUser = null;

// Mobile sidebar functionality
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    // Toggle sidebar on hover (desktop)
    sidebar.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.add('expanded');
            mainContent.classList.add('expanded');
        }
    });
    
    sidebar.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('expanded');
            mainContent.classList.remove('expanded');
        }
    });
    
    // Toggle sidebar on click (mobile)
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('expanded');
        sidebarOverlay.classList.toggle('active');
    });
    
    // Close sidebar when clicking overlay
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('expanded');
        sidebarOverlay.classList.remove('active');
    });
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Check authentication
async function checkAuth() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    window.location.href = "login.html";
    return;
  }

  try {
    currentUser = JSON.parse(user);

    // Verify token with server
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error("Invalid token");
    }

    // Check if user is admin
    if (currentUser.role !== "admin") {
      alert("Access denied. Admin role required.");
      window.location.href = "login.html";
      return;
    }

    displayUserInfo();
    loadDashboardData();
    initSidebar();
  } catch (error) {
    console.error("Auth check failed:", error);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
  }
}

// Logout function
async function logout() {
  try {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }
}

// Event listeners
document.getElementById("logoutBtn").addEventListener("click", logout);

// Initialize dashboard
checkAuth();
