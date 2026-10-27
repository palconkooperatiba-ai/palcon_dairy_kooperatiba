
"use strict";

// DEMO ONLY — hindi pa ito konektado sa Supabase.
// Mga fictional sample record lang ang ginagamit.

const sampleMembers = [
  {
    name: "Sample Member One",
    memberId: "PDC-DEMO-001",
    category: "Smallholder Dairy Farmer",
    status: "active"
  },
  {
    name: "Sample Member Two",
    memberId: "PDC-DEMO-002",
    category: "Associate",
    status: "active"
  },
  {
    name: "Sample Member Three",
    memberId: "PDC-DEMO-003",
    category: "Youth Agri-Fellow",
    status: "pending_verification"
  }
];

const membersTable = document.getElementById("membersTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const adminView = document.getElementById("adminView");
const memberView = document.getElementById("memberView");
const modeButtons = document.querySelectorAll(".mode-btn");
const addMemberBtn = document.getElementById("addMemberBtn");

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (char) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

function formatStatus(status) {
  if (status === "pending_verification") {
    return "Pending verification";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function renderMembers() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredMembers = sampleMembers.filter(function (member) {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm) ||
      member.memberId.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" ||
      member.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (filteredMembers.length === 0) {
    membersTable.innerHTML = `
      <tr>
        <td colspan="5">No matching sample members found.</td>
      </tr>
    `;
  } else {
    membersTable.innerHTML = filteredMembers.map(function (member) {
      return `
        <tr>
          <td>${escapeHTML(member.name)}</td>
          <td>${escapeHTML(member.memberId)}</td>
          <td>${escapeHTML(member.category)}</td>
          <td>
            <span class="status ${escapeHTML(member.status)}">
              ${escapeHTML(formatStatus(member.status))}
            </span>
          </td>
          <td>
            <button
              type="button"
              class="primary-btn view-profile-btn"
              data-member-id="${escapeHTML(member.memberId)}"
            >
              View
            </button>
          </td>
        </tr>
      `;
    }).join("");
  }

  document.getElementById("totalCount").textContent =
    sampleMembers.length;

  document.getElementById("activeCount").textContent =
    sampleMembers.filter(function (member) {
      return member.status === "active";
    }).length;

  document.getElementById("pendingCount").textContent =
    sampleMembers.filter(function (member) {
      return member.status === "pending_verification";
    }).length;
}

function switchView(view) {
  const showAdmin = view === "admin";

  adminView.classList.toggle("hidden", !showAdmin);
  memberView.classList.toggle("hidden", showAdmin);

  modeButtons.forEach(function (button) {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });
}

modeButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    switchView(button.dataset.view);
  });
});

searchInput.addEventListener("input", renderMembers);
statusFilter.addEventListener("change", renderMembers);

membersTable.addEventListener("click", function (event) {
  const button = event.target.closest(".view-profile-btn");

  if (!button) return;

  const member = sampleMembers.find(function (item) {
    return item.memberId === button.dataset.memberId;
  });

  if (!member) return;

  alert(
    "DEMO ONLY\n\n" +
    "Name: " + member.name + "\n" +
    "Member ID: " + member.memberId + "\n" +
    "Category: " + member.category + "\n" +
    "Status: " + formatStatus(member.status)
  );
});

addMemberBtn.addEventListener("click", function () {
  alert(
    "Add Member is a layout placeholder for now.\n\n" +
    "We will connect this to a secure admin workflow later."
  );
});

renderMembers();
