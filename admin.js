
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
// LOAD GALLERY IMAGES FROM SUPABASE DATABASE
// =============================================

async function loadGalleryImages() {
  galleryImageList.innerHTML =
    '<div class="empty-state"><p>Loading gallery images...</p></div>';

  const { data, error } = await supabaseClient
    .from("gallery_images")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    galleryImageList.innerHTML =
      '<div class="empty-state"><p>Unable to load images: ' +
      escapeHTML(error.message) +
      '</p></div>';
    return;
  }

  if (!data || data.length === 0) {
    galleryImageList.innerHTML =
      '<div class="empty-state"><span>▧</span><p>No gallery images uploaded yet.</p></div>';
    return;
  }

  galleryImageList.replaceChildren();

  data.forEach(function (item) {
    const result = supabaseClient
      .storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(item.file_path);

    const card = document.createElement("article");
    card.className = "gallery-card";

    const image = document.createElement("img");
    image.src = result.data.publicUrl;
    image.alt = item.title;
    image.loading = "lazy";

    const content = document.createElement("div");
    content.className = "gallery-card-content";

    const title = document.createElement("h3");
    title.textContent = item.title;

    const description = document.createElement("p");
    description.textContent = item.description || "No description";

    const status = document.createElement("span");
    status.className = item.is_published
      ? "gallery-status published"
      : "gallery-status unpublished";
    status.textContent = item.is_published
      ? "Published"
      : "Unpublished";

    const publishButton = document.createElement("button");
    publishButton.type = "button";
    publishButton.className = "gallery-action-btn";
    publishButton.textContent = item.is_published
      ? "Unpublish"
      : "Publish";

    publishButton.addEventListener("click", function () {
      updateGalleryStatus(item.id, !item.is_published);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "gallery-delete-btn";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
      deleteGalleryImage(item.id, item.file_path, item.title);
    });

    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(status);
    content.appendChild(publishButton);
    content.appendChild(deleteButton);

    card.appendChild(image);
    card.appendChild(content);

    galleryImageList.appendChild(card);
  });
}

// =============================================
// PUBLISH / UNPUBLISH IMAGE
// =============================================

async function updateGalleryStatus(imageId, publish) {
  const { data: sessionData } =
    await supabaseClient.auth.getSession();

  if (
    !sessionData.session ||
    sessionData.session.user.id !== PALCON_ADMIN_UID
  ) {
    alert("Administrator login required.");
    showAdminLogin();
    return;
  }

  const { error } = await supabaseClient
    .from("gallery_images")
    .update({ is_published: publish })
    .eq("id", imageId);

  if (error) {
    alert("Unable to update image status: " + error.message);
    return;
  }

  galleryUploadStatus.textContent = publish
    ? "Image published successfully!"
    : "Image unpublished successfully!";

  await loadGalleryImages();
}

// =============================================
// DELETE GALLERY IMAGE
// =============================================

async function deleteGalleryImage(imageId, filePath, title) {
  const confirmed = confirm(
    'Are you sure you want to permanently delete "' +
    title +
    '"? This cannot be undone.'
  );

  if (!confirmed) return;

  const { data: sessionData } =
    await supabaseClient.auth.getSession();

  if (
    !sessionData.session ||
    sessionData.session.user.id !== PALCON_ADMIN_UID
  ) {
    alert("Administrator login required.");
    showAdminLogin();
    return;
  }

  // Delete the database record first.
  const { error: databaseError } = await supabaseClient
    .from("gallery_images")
    .delete()
    .eq("id", imageId);

  if (databaseError) {
    alert("Unable to delete gallery record: " + databaseError.message);
    return;
  }

  // Delete the actual image file from Storage.
  const { error: storageError } = await supabaseClient
    .storage
    .from(GALLERY_BUCKET)
    .remove([filePath]);

  if (storageError) {
    alert(
      "Gallery record deleted, but the image file could not be removed. " +
      "Please check Storage: " + storageError.message
    );
    await loadGalleryImages();
    return;
  }

  galleryUploadStatus.textContent =
    "Gallery image permanently deleted.";

  await loadGalleryImages();
}

// =============================================
// UPLOAD IMAGE TO SUPABASE STORAGE + DATABASE
// =============================================

galleryUploadForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title =
    document.getElementById("galleryTitle").value.trim();

  const description =
    document.getElementById("galleryDescription").value.trim();

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
      "Please log in again as administrator.";
    showAdminLogin();
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type) ||
      file.size > 5 * 1024 * 1024) {
    galleryUploadStatus.textContent =
      "Use JPG, PNG, or WEBP images up to 5 MB.";
    return;
  }

  uploadImageBtn.disabled = true;
  uploadImageBtn.textContent = "Uploading...";
  galleryUploadStatus.textContent = "";

  let uploadedFilePath = null;

  try {
    const safeTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "gallery-image";

    const extension = file.name.split(".").pop().toLowerCase();

    uploadedFilePath =
      Date.now() + "-" + safeTitle + "." + extension;

    // Upload the actual image.
    const { error: uploadError } = await supabaseClient
      .storage
      .from(GALLERY_BUCKET)
      .upload(uploadedFilePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Save its information in the gallery database.
    const { error: insertError } = await supabaseClient
      .from("gallery_images")
      .insert({
        title: title,
        description: description,
        file_path: uploadedFilePath,
        is_published: false
      });

    if (insertError) {
      // Clean up the uploaded file if database saving fails.
      await supabaseClient
        .storage
        .from(GALLERY_BUCKET)
        .remove([uploadedFilePath]);

      throw insertError;
    }

    galleryUploadStatus.textContent =
      "Image uploaded successfully! It is currently unpublished.";

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
