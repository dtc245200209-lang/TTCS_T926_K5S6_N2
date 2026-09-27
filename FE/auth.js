const API_BASE_URL = "http://localhost:5000/api";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

let idleTimer = null;
let refreshInterval = null;
let lastActivityTime = Date.now();

function checkAuthStatus() {
  const token = localStorage.getItem("accessToken");
  const isLoginPage = window.location.pathname.endsWith("login.html");

  if (!token && !isLoginPage) {
    window.location.href = "login.html";
  } else if (token && isLoginPage) {
    window.location.href = "index.html";
  }
}

checkAuthStatus();
function resetIdleTimer() {
  lastActivityTime = Date.now();

  if (idleTimer) clearTimeout(idleTimer);

  const isLoginPage = window.location.pathname.endsWith("login.html");
  if (isLoginPage) return;

  idleTimer = setTimeout(() => {
    showSessionExpiredModal(
      "Bạn đã không hoạt động trong thời gian dài. Vui lòng đăng nhập lại!",
    );
  }, IDLE_TIMEOUT_MS);
}

let isThrottled = false;
function handleUserActivity() {
  if (isThrottled) return;
  isThrottled = true;
  resetIdleTimer();
  setTimeout(() => {
    isThrottled = false;
  }, 2000);
}

window.addEventListener("mousemove", handleUserActivity);
window.addEventListener("keydown", handleUserActivity);
window.addEventListener("click", handleUserActivity);

async function refreshSession() {
  const token = localStorage.getItem("accessToken");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
    } else {
      showSessionExpiredModal(
        "Phiên đăng nhập đã hết hạn trên Server. Vui lòng đăng nhập lại.",
      );
    }
  } catch (error) {
    console.error("Lỗi gia hạn phiên:", error);
  }
}

function startAutoRefresh() {
  const isLoginPage = window.location.pathname.endsWith("login.html");
  if (isLoginPage) return;

  if (refreshInterval) clearInterval(refreshInterval);

  refreshInterval = setInterval(() => {
    const isUserActive = Date.now() - lastActivityTime < IDLE_TIMEOUT_MS;
    if (isUserActive) {
      refreshSession();
    }
  }, REFRESH_INTERVAL_MS);
}

// Xử lý đăng xuất phía server và client
async function handleLogout() {
  const token = localStorage.getItem("accessToken");

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Lỗi khi đăng xuất server:", error);
  } finally {
    clearAuthAndRedirect();
  }
}

function showSessionExpiredModal(message) {
  if (idleTimer) clearTimeout(idleTimer);
  if (refreshInterval) clearInterval(refreshInterval);

  const modal = document.getElementById("sessionModal");
  const messageEl = document.getElementById("sessionMessage");

  if (modal) {
    if (messageEl) messageEl.innerText = message;
    modal.style.display = "flex";
  } else {
    alert(message);
    clearAuthAndRedirect();
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

function redirectToLogin() {
  clearAuthAndRedirect();
}

document.addEventListener("DOMContentLoaded", () => {
  const isLoginPage = window.location.pathname.endsWith("login.html");

  if (!isLoginPage) {
    resetIdleTimer();
    startAutoRefresh();
  }

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", handleLogout);
  }
});
