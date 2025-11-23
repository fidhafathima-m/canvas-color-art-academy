const API_BASE = "https://canvas-color-backend.onrender.com/api";
let currentUser = null;

// Loading overlay functions
function showLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "flex";
  }
}

function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }
}

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

// Enhanced authentication check for student dashboard
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

    // Immediate role check - allow both 'user' and 'student' roles
    if (currentUser.role !== "user" && currentUser.role !== "student") {
      throw new Error("Student access required");
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
    const serverUserRole = data.data.user.role;
    if (serverUserRole !== "user" && serverUserRole !== "student") {
      throw new Error(
        "Server role verification failed - student role required"
      );
    }
    hideLoadingOverlay();

    // Only now initialize the dashboard
    displayUserInfo();
    loadDashboardData();
    initSidebar();
  } catch (error) {
    console.error("Student authentication failed:", error);
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
  ).textContent = `Welcome back, ${currentUser.name}!`;
  document.getElementById("userName").textContent = currentUser.name;

  // Format role for display
  let displayRole = currentUser.role;
  if (displayRole === "user") displayRole = "Student";
  else if (displayRole === "student") displayRole = "Student";

  document.getElementById("userRole").textContent = displayRole;

  // Create avatar from initials
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  document.getElementById("userAvatar").textContent = initials;

  // Set greeting based on time of day
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  document.getElementById("greetingMessage").textContent = `${greeting}, ${
    currentUser.name.split(" ")[0]
  }!`;
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/user/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      updateDashboardUI(data.data);
    } else {
      // Use demo data if API fails
      useDemoData();
    }
  } catch (error) {
    console.error("Failed to load dashboard data:", error);
    useDemoData();
  }
}

function updateDashboardUI(dashboardData) {
  // Update stats
  document.getElementById("enrolledCourses").textContent =
    dashboardData.enrolledCourses?.length || 3;
  document.getElementById("overallProgress").textContent =
    dashboardData.progress ? `${dashboardData.progress}%` : "65%";
  document.getElementById("assignmentsDue").textContent =
    dashboardData.assignmentsDue || "2";
  document.getElementById("certificatesEarned").textContent =
    dashboardData.certificatesEarned || "1";

  // Update courses list
  const coursesList = document.getElementById("coursesList");
  const courses = dashboardData.enrolledCourses || [
    "Basic Drawing",
    "Watercolor Painting",
    "Clay Modeling",
  ];

  coursesList.innerHTML = courses
    .map(
      (course, index) => `
                <div class="course-card">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-1">${course}</h6>
                            <p class="text-muted small mb-2">Learn fundamental techniques and creative expression</p>
                            <div class="d-flex align-items-center">
                                <div class="progress flex-grow-1 me-2" style="height: 6px;">
                                    <div class="progress-bar ${
                                      index === 0
                                        ? "bg-success"
                                        : index === 1
                                        ? "bg-info"
                                        : "bg-warning"
                                    }" 
                                         style="width: ${
                                           index === 0
                                             ? "80%"
                                             : index === 1
                                             ? "45%"
                                             : "30%"
                                         }">
                                    </div>
                                </div>
                                <small class="text-muted">${
                                  index === 0
                                    ? "80%"
                                    : index === 1
                                    ? "45%"
                                    : "30%"
                                }</small>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-outline-primary me-1">
                                <i class="fas fa-play"></i> Continue
                            </button>
                            <button class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-info"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

function useDemoData() {
  // Set demo stats
  document.getElementById("enrolledCourses").textContent = "3";
  document.getElementById("overallProgress").textContent = "65%";
  document.getElementById("assignmentsDue").textContent = "2";
  document.getElementById("certificatesEarned").textContent = "1";

  // Set demo courses
  const coursesList = document.getElementById("coursesList");
  coursesList.innerHTML = `
        <div class="course-card">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h6 class="mb-1">Basic Drawing</h6>
                    <p class="text-muted small mb-2">Learn fundamental drawing techniques and perspective</p>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                            <div class="progress-bar bg-success" style="width: 80%"></div>
                        </div>
                        <small class="text-muted">80%</small>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-outline-primary me-1">
                        <i class="fas fa-play"></i> Continue
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-info"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="course-card">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h6 class="mb-1">Watercolor Painting</h6>
                    <p class="text-muted small mb-2">Master watercolor techniques and color mixing</p>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                            <div class="progress-bar bg-info" style="width: 45%"></div>
                        </div>
                        <small class="text-muted">45%</small>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-outline-primary me-1">
                        <i class="fas fa-play"></i> Continue
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-info"></i>
                    </button>
                </div>
            </div>
        </div>
        <div class="course-card">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h6 class="mb-1">Clay Modeling</h6>
                    <p class="text-muted small mb-2">Create 3D sculptures with clay modeling techniques</p>
                    <div class="d-flex align-items-center">
                        <div class="progress flex-grow-1 me-2" style="height: 6px;">
                            <div class="progress-bar bg-warning" style="width: 30%"></div>
                        </div>
                        <small class="text-muted">30%</small>
                    </div>
                </div>
                <div class="col-md-4 text-end">
                    <button class="btn btn-sm btn-outline-primary me-1">
                        <i class="fas fa-play"></i> Continue
                    </button>
                    <button class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-info"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
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
  const meta = document.createElement("meta");
  meta.httpEquiv = "Cache-Control";
  meta.content = "no-cache, no-store, must-revalidate";
  document.head.appendChild(meta);

  const meta2 = document.createElement("meta");
  meta2.httpEquiv = "Pragma";
  meta2.content = "no-cache";
  document.head.appendChild(meta2);

  const meta3 = document.createElement("meta");
  meta3.httpEquiv = "Expires";
  meta3.content = "0";
  document.head.appendChild(meta3);
}

// Check authentication when page becomes visible
function setupVisibilityCheck() {
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      checkAuth();
    }
  });

  // check when window gains focus
  window.addEventListener("focus", function () {
    checkAuth();
  });

  // Check on page load
  window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
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
window.addEventListener("popstate", function (event) {
  checkAuth();
});
