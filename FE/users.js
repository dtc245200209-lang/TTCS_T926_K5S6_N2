// KN-46 - Xây dựng chức năng tìm kiếm, lọc và phân trang tài khoản

const USERS_PER_PAGE = 20;

const users = [
  {
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    department: "Nhân sự",
    role: "Admin",
    status: "Đang hoạt động",
  },
  {
    name: "Trần Thị Bình",
    email: "tranthibinh@example.com",
    department: "Tuyển dụng",
    role: "HR",
    status: "Đang hoạt động",
  },
  {
    name: "Lê Văn Cường",
    email: "levancuong@example.com",
    department: "Kỹ thuật",
    role: "Manager",
    status: "Đang hoạt động",
  },
  {
    name: "Phạm Thị Dung",
    email: "phamthidung@example.com",
    department: "Kế toán",
    role: "Employee",
    status: "Không hoạt động",
  },
  {
    name: "Hoàng Văn Đức",
    email: "hoangvanduc@example.com",
    department: "Kinh doanh",
    role: "Employee",
    status: "Đang hoạt động",
  },
  {
    name: "Vũ Thị Hà",
    email: "vuthiha@example.com",
    department: "Nhân sự",
    role: "HR",
    status: "Đang hoạt động",
  },
  {
    name: "Đỗ Văn Hùng",
    email: "dovanhung@example.com",
    department: "Kỹ thuật",
    role: "Manager",
    status: "Đang hoạt động",
  },
  {
    name: "Bùi Thị Lan",
    email: "buithilan@example.com",
    department: "Marketing",
    role: "Employee",
    status: "Không hoạt động",
  },
  {
    name: "Ngô Văn Minh",
    email: "ngovanminh@example.com",
    department: "Tuyển dụng",
    role: "HR",
    status: "Đang hoạt động",
  },
  {
    name: "Đặng Thị Ngọc",
    email: "dangthingoc@example.com",
    department: "Kế toán",
    role: "Employee",
    status: "Đang hoạt động",
  },
  {
    name: "Phan Văn Phúc",
    email: "phanvanphuc@example.com",
    department: "Kỹ thuật",
    role: "Employee",
    status: "Đang hoạt động",
  },
  {
    name: "Đinh Thị Quỳnh",
    email: "dinhthiquynh@example.com",
    department: "Nhân sự",
    role: "Manager",
    status: "Không hoạt động",
  },
  {
    name: "Mai Văn Sơn",
    email: "maivanson@example.com",
    department: "Kinh doanh",
    role: "Employee",
    status: "Đang hoạt động",
  },
  {
    name: "Nguyễn Thị Thảo",
    email: "nguyenthithao@example.com",
    department: "Marketing",
    role: "Employee",
    status: "Đang hoạt động",
  },
  {
    name: "Trương Văn Tuấn",
    email: "truongvatuan@example.com",
    department: "Tuyển dụng",
    role: "HR",
    status: "Đang hoạt động",
  },
  {
    name: "Lý Thị Vân",
    email: "lythivan@example.com",
    department: "Nhân sự",
    role: "Employee",
    status: "Không hoạt động",
  },
];

let currentPage = 1;
let filteredUsers = [...users];

const searchInput = document.getElementById("searchInput");
const roleFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("statusFilter");

const searchButton = document.getElementById("searchButton");
const resetButton = document.getElementById("resetButton");

const tableBody = document.getElementById("userTableBody");
const emptyState = document.getElementById("emptyState");

const resultInfo = document.getElementById("resultInfo");
const paginationInfo = document.getElementById("paginationInfo");
const pagination = document.getElementById("pagination");

/**
 * Chuẩn hóa chuỗi để tìm kiếm
 * không phân biệt chữ hoa/chữ thường và dấu tiếng Việt.
 */
function normalizeText(value) {
  return value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Lọc danh sách tài khoản.
 */
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

    const matchesRole = !selectedRole || user.role === selectedRole;

    const matchesStatus = !selectedStatus || user.status === selectedStatus;

    return matchesKeyword && matchesRole && matchesStatus;
  });

  currentPage = 1;

  renderUsers();
}

/**
 * Hiển thị danh sách tài khoản của trang hiện tại.
 */
function renderUsers() {
  tableBody.innerHTML = "";

  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  const endIndex = startIndex + USERS_PER_PAGE;

  const pageUsers = filteredUsers.slice(startIndex, endIndex);

  if (pageUsers.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;

    pageUsers.forEach((user) => {
      const row = document.createElement("tr");

      const statusClass =
        user.status === "Đang hoạt động" ? "active" : "inactive";

      row.innerHTML = `
                <td>
                    <strong>${escapeHtml(user.name)}</strong>
                </td>

                <td>
                    ${escapeHtml(user.email)}
                </td>

                <td>
                    ${escapeHtml(user.department)}
                </td>

                <td>
                    <span class="role-badge">
                        ${escapeHtml(user.role)}
                    </span>
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHtml(user.status)}
                    </span>
                </td>
            `;

      tableBody.appendChild(row);
    });
  }

  updateResultInfo(totalUsers, startIndex, pageUsers.length);
  renderPagination(totalPages);
}

/**
 * Cập nhật thông tin số lượng kết quả.
 */
function updateResultInfo(totalUsers, startIndex, currentCount) {
  if (totalUsers === 0) {
    resultInfo.textContent = "Không tìm thấy tài khoản phù hợp.";

    paginationInfo.textContent = "Trang 0";
    return;
  }

  const firstRecord = startIndex + 1;
  const lastRecord = startIndex + currentCount;

  resultInfo.textContent = `Hiển thị ${firstRecord}–${lastRecord} trong tổng số ${totalUsers} tài khoản`;

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  paginationInfo.textContent = `Trang ${currentPage} / ${totalPages}`;
}

/**
 * Render các nút phân trang.
 */
function renderPagination(totalPages) {
  pagination.innerHTML = "";

  const previousButton = createPageButton("‹", currentPage - 1);

  previousButton.disabled = currentPage === 1;

  pagination.appendChild(previousButton);

  for (let page = 1; page <= totalPages; page++) {
    const pageButton = createPageButton(page, page);

    if (page === currentPage) {
      pageButton.classList.add("active");
    }

    pagination.appendChild(pageButton);
  }

  const nextButton = createPageButton("›", currentPage + 1);

  nextButton.disabled = currentPage === totalPages;

  pagination.appendChild(nextButton);
}

/**
 * Tạo nút phân trang.
 */
function createPageButton(label, page) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = "page-button";
  button.textContent = label;

  button.addEventListener("click", () => {
    if (page < 1) {
      return;
    }

    const totalPages = Math.max(
      1,
      Math.ceil(filteredUsers.length / USERS_PER_PAGE),
    );

    if (page > totalPages) {
      return;
    }

    currentPage = page;
    renderUsers();
  });

  return button;
}

/**
 * Xóa bộ lọc.
 */
function resetFilters() {
  searchInput.value = "";
  roleFilter.value = "";
  statusFilter.value = "";

  filteredUsers = [...users];
  currentPage = 1;

  renderUsers();
}

/**
 * Tránh đưa nội dung dữ liệu trực tiếp vào HTML.
 */
function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* Sự kiện */

searchButton.addEventListener("click", applyFilters);

resetButton.addEventListener("click", resetFilters);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    applyFilters();
  }
});

roleFilter.addEventListener("change", applyFilters);

statusFilter.addEventListener("change", applyFilters);

/* Khởi tạo */
renderUsers();
