// Password strength indicator
const passwordInput = document.getElementById("password");
const strengthBar = document.getElementById("passwordStrengthBar");
const strengthContainer = document.getElementById("passwordStrength");

passwordInput.addEventListener("input", function () {
  const password = this.value;
  strengthContainer.classList.add("show");

  let strength = 0;
  if (password.length >= 6) strength += 25;
  if (password.length >= 10) strength += 25;
  if (/[A-Z]/.test(password)) strength += 25;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;

  strengthBar.style.width = strength + "%";

  if (strength <= 25) {
    strengthBar.style.background = "#dc3545";
  } else if (strength <= 50) {
    strengthBar.style.background = "#ffc107";
  } else if (strength <= 75) {
    strengthBar.style.background = "#17a2b8";
  } else {
    strengthBar.style.background = "#28a745";
  }
});

// Confirm password validation
const confirmPassword = document.getElementById("confirmPassword");
const confirmError = document.getElementById("confirmError");

confirmPassword.addEventListener("input", function () {
  if (this.value !== passwordInput.value) {
    confirmError.textContent = "Passwords do not match";
    confirmError.classList.add("show");
    this.style.borderColor = "#dc3545";
  } else {
    confirmError.classList.remove("show");
    this.style.borderColor = "#28a745";
  }
});

// Form submission
function handleSignup(event) {
  event.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirmPassword").value;

  // Validate passwords match
  if (password !== confirm) {
    confirmError.textContent = "Passwords do not match";
    confirmError.classList.add("show");
    return;
  }

  // Show loading state
  submitBtn.classList.add("loading");
  submitBtn.textContent = "Creating Account...";

  // Simulate API call
  setTimeout(() => {
    submitBtn.classList.remove("loading");
    submitBtn.textContent = "Sign Up";
    alert("Account created successfully! Welcome aboard!");
    document.getElementById("signupForm").reset();
    strengthContainer.classList.remove("show");
  }, 2000);
}

// Close mobile menu when clicking a link
document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    const navbarCollapse = document.querySelector(".navbar-collapse");
    if (navbarCollapse.classList.contains("show")) {
      bootstrap.Collapse.getInstance(navbarCollapse).hide();
    }
  });
});

// Input focus animations
document.querySelectorAll(".form-control").forEach((input) => {
  input.addEventListener("focus", function () {
    this.parentElement.style.transform = "scale(1.01)";
  });

  input.addEventListener("blur", function () {
    this.parentElement.style.transform = "scale(1)";
  });
});

// Email validation
const emailInput = document.getElementById("email");
const emailError = document.getElementById("emailError");

emailInput.addEventListener("blur", function () {
  const email = this.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    emailError.textContent = "Please enter a valid email address";
    emailError.classList.add("show");
    this.style.borderColor = "#dc3545";
  } else {
    emailError.classList.remove("show");
    this.style.borderColor = "#28a745";
  }
});
