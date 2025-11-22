const API_BASE = "https://canvas-color-backend.onrender.com/api";
let currentUser = null;

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

// Mobile menu toggle functionality
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function toggleMobileMenu() {
  sidebar.classList.toggle("active");
  sidebarOverlay.classList.toggle("active");
}

mobileMenuToggle.addEventListener("click", toggleMobileMenu);
sidebarOverlay.addEventListener("click", toggleMobileMenu);

// Close mobile menu when clicking nav links on mobile
const navLinks = document.querySelectorAll(".sidebar .nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    if (window.innerWidth <= 576) {
      toggleMobileMenu();
    }
  });
});

// Active link handling
navLinks.forEach((link) => {
  link.addEventListener("click", function (e) {
    if (this.id !== "logoutBtn") {
      e.preventDefault();
      navLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");
    }
  });
});

// Logout function
async function logout() {
  try {
    const token = localStorage.getItem("token");
    const confirm = confirm("Are you sure you want to logout?");
    if (confirm) {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
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
