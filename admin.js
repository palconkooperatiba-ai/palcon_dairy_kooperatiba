
"use strict";

// =============================================
// PALCON DAIRY ADMIN DASHBOARD
// =============================================

const PALCON_SUPABASE_URL =
  "https://qekgglkivbnqvwzreeiq.supabase.co";

const PALCON_SUPABASE_KEY =
  "sb_publishable_V-mr3bKBBVeddJYyuHIsaw_DQ7d2gk0";

const PALCON_ADMIN_UID =
  "678740cf-1282-422c-9c08-79be797988cc";

const GALLERY_BUCKET = "palcon-gallery";

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
// ADMIN LOGIN
// =============================================

const loginSection = document.getElementById("adminLoginSection");
const adminLayout = document.getElementById("adminLayout");
const adminFooter = document.getElementById("adminFooter");

const loginForm = document.getElementById("adminLoginForm");
const loginStatus = document.getElementById("adminLoginStatus");
const loginButton = document.getElementById("adminLoginBtn");
const logoutButton = document.getElementById("adminLogoutBtn");

function showAdminDashboard() {
  loginSection.classList.add("hidden");
  adminLayout.classList.remove("hidden");
  adminFooter.classList.remove("hidden");
  logoutButton.classList.remove("hidden");

  showSection("dashboard");
  loadGalleryImages();
}

function showAdminLogin() {
  loginSection.classList.remove("hidden");
  adminLayout.classList.add("hidden");
  adminFooter.classList.add("hidden");
  logoutButton.classList.add("hidden");
}

async function verifyAdminSession() {
  showAdminLogin();

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) return;

  if (data.session.user.id !== PALCON_ADMIN_UID) {
    await supabaseClient.auth.signOut();
    return;
  }

  showAdminDashboard();
}

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

    if (error) throw error;

    if (!data.user || data.user.id !== PALCON_ADMIN_UID) {
      await supabaseClient.auth.signOut();

      throw new Error(
        "This account is not authorized as PALCON Administrator."
      );
    }

    loginForm.reset();
    loginStatus.textContent = "Login successful!";

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

const galleryUploadForm =
  document.getElementById("galleryUploadForm");

const galleryUploadStatus =
  document.getElementById("galleryUploadStatus");

const uploadImageBtn =
  document.getElementById("uploadImageBtn");

const galleryImageList =
  document.getElementById("galleryImageList");

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

  if (file.size > 5 * 1024 * 1024) {
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
// LOAD GALLERY IMAGES FROM SUPABASE
// =============================================

async function loadGalleryImages() {
  galleryImageList.innerHTML =
    '<div class="empty-state"><p>Loading gallery images...</p></div>';

  const { data, error } = await supabaseClient
    .storage
    .from(GALLERY_BUCKET)
    .list("", {
      limit: 100,
      sortBy: {
        column: "created_at",
        order: "desc"
      }
    });

  if (error) {
    galleryImageList.innerHTML =
      '<div class="empty-state"><p>Unable to load gallery images: ' +
      escapeHTML(error.message) +
      '</p></div>';
    return;
  }

  const imageFiles = (data || []).filter(function (file) {
    return file.name && !file.name.startsWith(".");
  });

  if (imageFiles.length === 0) {
    galleryImageList.innerHTML =
      '<div class="empty-state">' +
      '<span>▧</span>' +
      '<p>No gallery images uploaded yet.</p>' +
      '</div>';
    return;
  }

  galleryImageList.replaceChildren();

  imageFiles.forEach(function (file) {
    const result = supabaseClient
      .storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(file.name);

    const card = document.createElement("article");
    card.className = "gallery-card";

    const image = document.createElement("img");
    image.src = result.data.publicUrl;
    image.alt = file.name;
    image.loading = "lazy";

    const caption = document.createElement("p");
    caption.textContent = file.name;

    card.appendChild(image);
    card.appendChild(caption);

    galleryImageList.appendChild(card);
  });
}

// =============================================
// UPLOAD IMAGE TO SUPABASE STORAGE
// =============================================

galleryUploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title =
    document.getElementById("galleryTitle").value.trim();

  const file = galleryImage.files[0];

  if (!title || !file) {
    galleryUploadStatus.textContent =
      "Please enter an image title and select a photo.";
    return;
  }

  const { data: sessionData } =
    await supabaseClient.auth.getSession();

  if (
    !sessionData.session ||
    sessionData.session.user.id !== PALCON_ADMIN_UID
  ) {
    galleryUploadStatus.textContent =
      "Your administrator session has expired. Please log in again.";
    showAdminLogin();
    return;
  }

  uploadImageBtn.disabled = true;
  uploadImageBtn.textContent = "Uploading...";
  galleryUploadStatus.textContent = "";

  try {
    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const extension = file.name.split(".").pop().toLowerCase();

    const filePath =
      Date.now() + "-" + safeTitle + "." + extension;

    const { error } = await supabaseClient
      .storage
      .from(GALLERY_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) throw error;

    galleryUploadStatus.textContent =
      "Image uploaded successfully!";

    galleryUploadForm.reset();
    imagePreview.classList.add("hidden");
    previewImage.removeAttribute("src");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    await loadGalleryImages();

  } catch (error) {
    galleryUploadStatus.textContent =
      "Upload failed: " + error.message;

  } finally {
    uploadImageBtn.disabled = false;
    uploadImageBtn.textContent = "Upload Image";
  }
});

// =============================================
// SAFE TEXT DISPLAY
// =============================================

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[character];
  });
}

// =============================================
// INITIALIZE
// =============================================

verifyAdminSession();
