const API_BASE = "https://canvas-color-backend.onrender.com/api";
let currentUser = null;

// Check authentication and load user data
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

    // Check if user has user role
    if (currentUser.role !== "user") {
      alert("Access denied. User role required.");
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
  ).textContent = `Welcome back, ${currentUser.name}!`;
  document.getElementById("userName").textContent = currentUser.name;
  document.getElementById("userRole").textContent =
    currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

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
  document.getElementById("assignmentsDue").textContent = "2";
  document.getElementById("certificatesEarned").textContent = "1";

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
  console.log("Using demo data for user dashboard");

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

// Initialize dashboard when page loads
document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
});
