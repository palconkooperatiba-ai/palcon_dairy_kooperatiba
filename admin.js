
"use strict";

// =============================================
// PALCON DAIRY ADMIN DASHBOARD
// =============================================

// SUPABASE CONFIGURATION
const PALCON_SUPABASE_URL =
  "https://qekgglkivbnqvwzreeiq.supabase.co";

const PALCON_SUPABASE_KEY =
  "sb_publishable_V-mr3bKBBVeddJYyuHIsaw_DQ7d2gk0";

const PALCON_ADMIN_UID =
  "678740cf-1282-422c-9c08-79be797988cc";

const supabaseClient = window.supabase.createClient(
  PALCON_SUPABASE_URL,
  PALCON_SUPABASE_KEY
);

// =============================================
// DASHBOARD NAVIGATION
// =============================================

const navButtons = document.querySelectorAll(".nav-item");
const sections = document.querySelectorAll(".admin-section");

function showSection(sectionName) {
  sections.forEach(function (section) {
    section.classList.add("hidden");
  });

  const selectedSection = document.getElementById(
    sectionName + "Section"
  );

  if (selectedSection) {
    selectedSection.classList.remove("hidden");
  }

  navButtons.forEach(function (button) {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionName
    );
  });
}

navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showSection(button.dataset.section);
  });
});

document.querySelectorAll("[data-go]").forEach(function (button) {
  button.addEventListener("click", function () {
    showSection(button.dataset.go);
  });
});

// =============================================
// ADMIN LOGIN ELEMENTS
// =============================================

const loginSection = document.getElementById("adminLoginSection");
const adminLayout = document.getElementById("adminLayout");
const adminFooter = document.getElementById("adminFooter");

const loginForm = document.getElementById("adminLoginForm");
const loginStatus = document.getElementById("adminLoginStatus");
const loginButton = document.getElementById("adminLoginBtn");
const logoutButton = document.getElementById("adminLogoutBtn");

// =============================================
// SHOW AND HIDE DASHBOARD
// =============================================

function showAdminDashboard() {
  loginSection.classList.add("hidden");
  adminLayout.classList.remove("hidden");
  adminFooter.classList.remove("hidden");

  showSection("dashboard");
}

function showAdminLogin() {
  loginSection.classList.remove("hidden");
  adminLayout.classList.add("hidden");
  adminFooter.classList.add("hidden");
}

// =============================================
// VERIFY EXISTING ADMIN SESSION
// =============================================

async function verifyAdminSession() {
  showAdminLogin();

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {
    return;
  }

  if (data.session.user.id !== PALCON_ADMIN_UID) {
    await supabaseClient.auth.signOut();
    return;
  }

  showAdminDashboard();
}
logoutButton.classList.remove("hidden");
// =============================================
// ADMIN SIGN IN
// =============================================

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email =
    document.getElementById("adminEmail").value.trim();

  const password =
    document.getElementById("adminPassword").value;

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";
  loginStatus.textContent = "";

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      throw error;
    }

    if (!data.user || data.user.id !== PALCON_ADMIN_UID) {
      await supabaseClient.auth.signOut();

      throw new Error(
        "This account is not authorized as PALCON Administrator."
      );
    }

    loginStatus.textContent = "Login successful!";

    loginForm.reset();

    showAdminDashboard();

  } catch (error) {
    loginStatus.textContent =
      error.message || "Unable to sign in. Please try again.";

  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

// =============================================
// ADMIN LOGOUT
// =============================================

logoutButton.addEventListener("click", async function () {
  logoutButton.disabled = true;

  const { error } =
    await supabaseClient.auth.signOut();

  logoutButton.disabled = false;

  if (error) {
    alert("Unable to log out. Please try again.");
    return;
  }

  showAdminLogin();
  loginStatus.textContent = "You have signed out.";
});
logoutButton.classList.add("hidden");
// =============================================
// GALLERY IMAGE PREVIEW
// =============================================

const galleryImage =
  document.getElementById("galleryImage");

const imagePreview =
  document.getElementById("imagePreview");

const previewImage =
  document.getElementById("previewImage");

const previewFileName =
  document.getElementById("previewFileName");

let previewUrl = null;

galleryImage.addEventListener("change", function () {
  const file = galleryImage.files[0];

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  if (!file) {
    imagePreview.classList.add("hidden");
    previewImage.removeAttribute("src");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Please select a JPG, PNG, or WEBP image.");

    galleryImage.value = "";
    imagePreview.classList.add("hidden");
    return;
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    alert("Image is too large. Maximum file size is 5 MB.");

    galleryImage.value = "";
    imagePreview.classList.add("hidden");
    return;
  }

  previewUrl = URL.createObjectURL(file);

  previewImage.src = previewUrl;
  previewFileName.textContent = file.name;

  imagePreview.classList.remove("hidden");
});

// =============================================
// GALLERY UPLOAD PLACEHOLDER
// =============================================

const galleryUploadForm =
  document.getElementById("galleryUploadForm");

const galleryUploadStatus =
  document.getElementById("galleryUploadStatus");

galleryUploadForm.addEventListener("submit", function (event) {
  event.preventDefault();

  galleryUploadStatus.textContent =
    "Upload is not connected yet. We will connect Supabase Storage next.";
});

// =============================================
// INITIALIZE ADMIN DASHBOARD
// =============================================

verifyAdminSession();
