
"use strict";

// DEMO ONLY: Fictional sample records.
// Hindi pa ito konektado sa Supabase.

const demoMembers = [
  {
    fullName: "Sample Member One",
    memberId: "PDC-DEMO-001",
    category: "Smallholder Dairy Farmer",
    status: "active"
  },
  {
    fullName: "Sample Member Two",
    memberId: "PDC-DEMO-002",
    category: "Associate",
    status: "inactive"
  },
  {
    fullName: "Sample Member Three",
    memberId: "PDC-DEMO-003",
    category: "Youth Agri-Fellow",
    status: "pending_verification"
  }
];

const membersTable = document.getElementById("membersTable");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const totalCount = document.getElementById("totalCount");
const activeCount = document.getElementById("activeCount");
const pendingCount = document.getElementById("pendingCount");

const adminView = document.getElementById("adminView");
const memberView = document.getElementById("memberView");
const modeButtons = document.querySelectorAll(".mode-btn");
const addMemberBtn = document.getElementById("addMemberBtn");

function formatStatus(status) {
  if (status === "pending_verification") {
    return "Pending verification";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function renderMembers() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;

  const filteredMembers = demoMembers.filter((member) => {
    const matchesSearch =
      member.fullName.toLowerCase().includes(searchTerm) ||
      member.memberId.toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" ||
      member.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  totalCount.textContent = demoMembers.length;
  activeCount.textContent = demoMembers.filter(
    (member) => member.status === "active"
  ).length;
  pendingCount.textContent = demoMembers.filter(
    (member) => member.status === "pending_verification"
  ).length;

  membersTable.replaceChildren();

  if (filteredMembers.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 5;
    cell.textContent = "No matching sample members found.";
    row.appendChild(cell);
    membersTable.appendChild(row);
    return;
  }

  filteredMembers.forEach((member) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = member.fullName;

    const idCell = document.createElement("td");
    idCell.textContent = member.memberId;

    const categoryCell = document.createElement("td");
    categoryCell.textContent = member.category;

    const statusCell = document.createElement("td");
    const statusBadge = document.createElement("span");
    statusBadge.className = `status ${member.status}`;
    statusBadge.textContent = formatStatus(member.status);
    statusCell.appendChild(statusBadge);

    const actionCell = document.createElement("td");
    const viewButton = document.createElement("button");

    viewButton.type = "button";
    viewButton.className = "view-btn";
    viewButton.textContent = "View profile";

    viewButton.addEventListener("click", () => {
      showMemberProfile(member);
    });

    actionCell.appendChild(viewButton);

    row.append(
      nameCell,
      idCell,
      categoryCell,
      statusCell,
      actionCell
    );

    membersTable.appendChild(row);
  });
}

function showMemberProfile(member) {
  const profileBody = memberView.querySelector(".profile-body");
  const details = memberView.querySelectorAll(".detail strong");

  profileBody.querySelector("h3").textContent = member.fullName;
  profileBody.querySelector("p").textContent =
    "Fictional sample profile only";

  details[0].textContent = member.memberId;
  details[1].textContent = member.category;
  details[2].textContent = formatStatus(member.status);
  details[3].textContent = "Not added in demo";

  switchView("member");
}

function switchView(view) {
  const isAdmin = view === "admin";

  adminView.classList.toggle("hidden", !isAdmin);
  memberView.classList.toggle("hidden", isAdmin);

  modeButtons.forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.view === view
    );
  });
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchView(button.dataset.view);
  });
});

searchInput.addEventListener("input", renderMembers);
statusFilter.addEventListener("change", renderMembers);

addMemberBtn.addEventListener("click", () => {
  alert(
    "Demo only: Hindi pa aktibo ang Add Member. " +
    "Idadagdag natin ito kapag naihanda na ang secure database connection."
  );
});

renderMembers();
