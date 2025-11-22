const API_BASE = "http://localhost:3000/api";

// Form validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showAlert(message, type = "error") {
  const alertDiv =
    type === "success"
      ? document.getElementById("successAlert")
      : document.getElementById("errorAlert");

  alertDiv.textContent = message;
  alertDiv.style.display = "block";

  if (type === "error") {
    alertDiv.className = "alert alert-danger";
  } else {
    alertDiv.className = "alert alert-success";
  }
}

function hideAlerts() {
  document.getElementById("errorAlert").style.display = "none";
  document.getElementById("successAlert").style.display = "none";
}

// Login function
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token and user data
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      showAlert("Login successful! Redirecting...", "success");

      // Redirect based on role
      setTimeout(() => {
        if (data.data.user.role === "admin") {
          window.location.href = "admin_dashboard.html";
        } else {
          window.location.href = "user_dashboard.html";
        }
      }, 1500);
    } else {
      showAlert(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    showAlert("Network error. Please try again.");
  }
}

// Form submission handler
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  hideAlerts();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Basic validation
  let isValid = true;

  if (!email) {
    document.getElementById("emailError").textContent = "Email is required";
    document.getElementById("email").classList.add("is-invalid");
    isValid = false;
  } else if (!validateEmail(email)) {
    document.getElementById("emailError").textContent =
      "Please enter a valid email";
    document.getElementById("email").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("email").classList.remove("is-invalid");
  }

  if (!password) {
    document.getElementById("passwordError").textContent =
      "Password is required";
    document.getElementById("password").classList.add("is-invalid");
    isValid = false;
  } else {
    document.getElementById("password").classList.remove("is-invalid");
  }

  if (isValid) {
    await login(email, password);
  }
});

// Real-time validation
document.getElementById("email").addEventListener("input", function () {
  if (this.value.trim()) {
    this.classList.remove("is-invalid");
  }
});

document.getElementById("password").addEventListener("input", function () {
  if (this.value.trim()) {
    this.classList.remove("is-invalid");
  }
});
