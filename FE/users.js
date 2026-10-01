const USERS_PER_PAGE = 20;

const users = [
  {
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    department: "Nhân sự",
    roles: ["Admin"],
    status: "Đang hoạt động",
  },
  {
    name: "Trần Thị Bình",
    email: "tranthibinh@example.com",
    department: "Tuyển dụng",
    roles: ["HR"],
    status: "Đang hoạt động",
  },
  {
    name: "Lê Văn Cường",
    email: "levancuong@example.com",
    department: "Kinh doanh",
    roles: ["Manager"],
    status: "Đang hoạt động",
  },
  {
    name: "Phạm Thị Dung",
    email: "phamthidung@example.com",
    department: "Kế toán",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Hoàng Văn Đức",
    email: "hoangvanduc@example.com",
    department: "Công nghệ thông tin",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Vũ Thị Hà",
    email: "vuthiha@example.com",
    department: "Nhân sự",
    roles: ["HR", "Manager"],
    status: "Đang hoạt động",
  },
  {
    name: "Đặng Văn Giang",
    email: "dangvangiang@example.com",
    department: "Tuyển dụng",
    roles: ["HR"],
    status: "Không hoạt động",
  },
  {
    name: "Bùi Thị Hạnh",
    email: "buithihanh@example.com",
    department: "Marketing",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Đỗ Văn Khánh",
    email: "dovankhanh@example.com",
    department: "Kinh doanh",
    roles: ["Manager", "Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Ngô Thị Lan",
    email: "ngothilan@example.com",
    department: "Nhân sự",
    roles: ["HR"],
    status: "Đang hoạt động",
  },
  {
    name: "Phan Văn Minh",
    email: "phanvanminh@example.com",
    department: "Công nghệ thông tin",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Nguyễn Thị Ngọc",
    email: "nguyenthingoc@example.com",
    department: "Tuyển dụng",
    roles: ["HR", "Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Trần Văn Phúc",
    email: "tranvanphuc@example.com",
    department: "Kinh doanh",
    roles: ["Manager"],
    status: "Đang hoạt động",
  },
  {
    name: "Lê Thị Quỳnh",
    email: "lethiquynh@example.com",
    department: "Marketing",
    roles: ["Employee"],
    status: "Không hoạt động",
  },
  {
    name: "Phạm Văn Sơn",
    email: "phamvanson@example.com",
    department: "Kế toán",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Hoàng Thị Thủy",
    email: "hoangthithuy@example.com",
    department: "Nhân sự",
    roles: ["HR", "Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Vũ Văn Tùng",
    email: "vuvantung@example.com",
    department: "Công nghệ thông tin",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
  {
    name: "Đặng Thị Uyên",
    email: "dangthiuyen@example.com",
    department: "Tuyển dụng",
    roles: ["HR"],
    status: "Đang hoạt động",
  },
  {
    name: "Bùi Văn Việt",
    email: "buivanviet@example.com",
    department: "Kinh doanh",
    roles: ["Manager"],
    status: "Đang hoạt động",
  },
  {
    name: "Đỗ Thị Yến",
    email: "dothiyen@example.com",
    department: "Marketing",
    roles: ["Employee"],
    status: "Đang hoạt động",
  },
];

let currentPage = 1;
let filteredUsers = [...users];
let selectedUser = null;

/* =========================
   DOM
========================= */

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");

const searchButton = document.getElementById("searchButton");
const resetButton = document.getElementById("resetButton");

const userTableBody = document.getElementById("userTableBody");
const emptyState = document.getElementById("emptyState");

const resultInfo = document.getElementById("resultInfo");
const paginationInfo = document.getElementById("paginationInfo");
const pagination = document.getElementById("pagination");

/* Modal */

const roleModal = document.getElementById("roleModal");
const roleModalOverlay = document.getElementById("roleModalOverlay");

const closeRoleModal = document.getElementById("closeRoleModal");

const cancelRoleButton = document.getElementById("cancelRoleButton");

const saveRoleButton = document.getElementById("saveRoleButton");

const roleModalUser = document.getElementById("roleModalUser");

const roleWarning = document.getElementById("roleWarning");

const roleCheckboxes = document.querySelectorAll(
  '.role-option input[type="checkbox"]',
);

/* =========================
   Utility
========================= */

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================
   Session
========================= */

function getCurrentUser() {
  if (
    typeof SessionManager === "undefined" ||
    typeof SessionManager.getUser !== "function"
  ) {
    return null;
  }

  return SessionManager.getUser();
}

function isCurrentUser(user) {
  const currentUser = getCurrentUser();

  if (!currentUser || !user) {
    return false;
  }

  const currentEmail = normalizeText(
    currentUser.email || currentUser.username || "",
  );

  const userEmail = normalizeText(user.email || "");

  return currentEmail !== "" && userEmail !== "" && currentEmail === userEmail;
}

function hasAdminRole(user) {
  return Array.isArray(user.roles) && user.roles.includes("Admin");
}

/* =========================
   Search / Filter
========================= */

function applyFilters() {
  const keyword = normalizeText(searchInput.value);

  const selectedRole = roleFilter.value;
  const selectedStatus = statusFilter.value;

  filteredUsers = users.filter((user) => {
    const matchesKeyword =
      !keyword ||
      normalizeText(user.name).includes(keyword) ||
      normalizeText(user.email).includes(keyword) ||
      normalizeText(user.department).includes(keyword);

    const matchesRole =
      !selectedRole ||
      (Array.isArray(user.roles) && user.roles.includes(selectedRole));

    const matchesStatus = !selectedStatus || user.status === selectedStatus;

    return matchesKeyword && matchesRole && matchesStatus;
  });

  currentPage = 1;

  renderUsers();
}

/* =========================
   Render users
========================= */

function renderUsers() {
  const totalUsers = filteredUsers.length;

  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  const endIndex = startIndex + USERS_PER_PAGE;

  const pageUsers = filteredUsers.slice(startIndex, endIndex);

  userTableBody.innerHTML = "";

  if (pageUsers.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;

    pageUsers.forEach((user) => {
      const row = document.createElement("tr");

      const rolesHtml = user.roles
        .map(
          (role) => `
            <span class="role-badge">
              ${escapeHtml(role)}
            </span>
          `,
        )
        .join("");

      row.innerHTML = `
        <td>
          <strong>
            ${escapeHtml(user.name)}
          </strong>
        </td>

        <td>
          ${escapeHtml(user.email)}
        </td>

        <td>
          ${escapeHtml(user.department)}
        </td>

        <td>
          <div class="roles-list">
            ${rolesHtml}
          </div>
        </td>

        <td>
          <span
            class="status-badge ${
              user.status === "Đang hoạt động" ? "active" : "inactive"
            }"
          >
            ${escapeHtml(user.status)}
          </span>
        </td>

        <td>
          <button
            type="button"
            class="manage-role-button"
            data-email="${escapeHtml(user.email)}"
          >
            Quản lý vai trò
          </button>
        </td>
      `;

      userTableBody.appendChild(row);
    });
  }

  resultInfo.textContent = `Đang hiển thị ${totalUsers} tài khoản`;

  renderPagination(totalPages);

  const startDisplay = totalUsers === 0 ? 0 : startIndex + 1;

  const endDisplay = Math.min(endIndex, totalUsers);

  if (totalUsers === 0) {
    paginationInfo.textContent = "Trang 1";
  } else {
    paginationInfo.textContent = `Trang ${currentPage} · ${startDisplay}-${endDisplay}`;
  }

  bindRoleButtons();
}

/* =========================
   Pagination
========================= */

function renderPagination(totalPages) {
  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const previousButton = document.createElement("button");

  previousButton.type = "button";
  previousButton.textContent = "‹";
  previousButton.disabled = currentPage === 1;

  previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage -= 1;
      renderUsers();
    }
  });

  pagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const pageButton = document.createElement("button");

    pageButton.type = "button";
    pageButton.textContent = page;

    if (page === currentPage) {
      pageButton.classList.add("active");
    }

    pageButton.addEventListener("click", () => {
      currentPage = page;
      renderUsers();
    });

    pagination.appendChild(pageButton);
  }

  const nextButton = document.createElement("button");

  nextButton.type = "button";
  nextButton.textContent = "›";
  nextButton.disabled = currentPage === totalPages;

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage += 1;
      renderUsers();
    }
  });

  pagination.appendChild(nextButton);
}

/* =========================
   Role management
========================= */

function bindRoleButtons() {
  const buttons = document.querySelectorAll(".manage-role-button");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const email = button.dataset.email;

      const user = users.find((item) => item.email === email);

      if (user) {
        openRoleModal(user);
      }
    });
  });
}

function openRoleModal(user) {
  selectedUser = user;

  roleModalUser.textContent = `${user.name} · ${user.email}`;

  roleWarning.hidden = true;
  roleWarning.textContent = "";

  roleCheckboxes.forEach((checkbox) => {
    checkbox.checked = user.roles.includes(checkbox.value);

    checkbox.disabled = false;
  });

  /*
   * KN-52:
   * Không cho tự thu hồi vai trò Admin
   * của chính mình.
   */
  if (isCurrentUser(user) && hasAdminRole(user)) {
    const adminCheckbox = [...roleCheckboxes].find(
      (checkbox) => checkbox.value === "Admin",
    );

    if (adminCheckbox) {
      adminCheckbox.checked = true;
      adminCheckbox.disabled = true;
    }

    roleWarning.textContent =
      "Bạn không thể tự thu hồi vai trò Admin của chính mình.";

    roleWarning.hidden = false;
  }

  roleModal.hidden = false;

  document.body.classList.add("modal-open");
}

function closeRoleModalHandler() {
  selectedUser = null;

  roleModal.hidden = true;

  document.body.classList.remove("modal-open");
}

function saveRoleChanges() {
  if (!selectedUser) {
    return;
  }

  const selectedRoles = [...roleCheckboxes]
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  /*
   * Nếu tài khoản đang chỉnh sửa là
   * chính mình và đang có Admin,
   * bắt buộc giữ Admin.
   */
  if (
    isCurrentUser(selectedUser) &&
    hasAdminRole(selectedUser) &&
    !selectedRoles.includes("Admin")
  ) {
    roleWarning.textContent =
      "Bạn không thể tự thu hồi vai trò Admin của chính mình.";

    roleWarning.hidden = false;

    return;
  }

  /*
   * Cập nhật vai trò ngay lập tức.
   */
  selectedUser.roles = selectedRoles;

  closeRoleModalHandler();

  renderUsers();
}

/* =========================
   Modal events
========================= */

closeRoleModal.addEventListener("click", closeRoleModalHandler);

cancelRoleButton.addEventListener("click", closeRoleModalHandler);

roleModalOverlay.addEventListener("click", closeRoleModalHandler);

saveRoleButton.addEventListener("click", saveRoleChanges);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !roleModal.hidden) {
    closeRoleModalHandler();
  }
});

/* =========================
   Filter events
========================= */

searchButton.addEventListener("click", applyFilters);

roleFilter.addEventListener("change", applyFilters);

statusFilter.addEventListener("change", applyFilters);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

resetButton.addEventListener("click", () => {
  searchInput.value = "";
  roleFilter.value = "";
  statusFilter.value = "";

  filteredUsers = [...users];
  currentPage = 1;

  renderUsers();
});

/* =========================
   Initial render
========================= */

renderUsers();
