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

    // Basic validation
    if (!token || !user) {
      throw new Error("No authentication data found");
    }

    currentUser = JSON.parse(user);

    // Immediate role check
    if (currentUser.role !== "admin") {
      throw new Error("Admin access required");
    }

    // Verify token with server
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(
        "Server authentication failed: " + (data.message || "Unknown error")
      );
    }

    // Final role verification from server
    if (data.data.user.role !== "admin") {
      throw new Error("Server role verification failed");
    }

    hideLoadingOverlay();

    // Only now initialize the dashboard
    displayUserInfo();
    loadDashboardData();
    initSidebar();
  } catch (error) {
    console.error("Authentication failed:", error);
    hideLoadingOverlay();

    // Clear invalid credentials
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Show error message to user
    alert("Authentication failed. Please login again.");

    // Redirect to login
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
    // Don't redirect here, just show error
    document.getElementById("dashboardMessage").textContent =
      "Error loading dashboard data. Please refresh the page.";
  }
}

// Logout function
async function logout() {
  if (confirm("Are you sure you want to logout?")) {
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
}

// Event listeners
document.addEventListener("DOMContentLoaded", function () {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Start authentication check
  checkAuth();
});
