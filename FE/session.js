/**
 * FE/session.js - Quản lý trạng thái phiên đăng nhập & Tự động gia hạn / Tự động lưu nháp
 * Ticket KN-16: [FE] Quản lý trạng thái phiên đăng nhập
 */
const SessionManager = (function () {
    const API_BASE = 'http://localhost:8080/api/auth';
    const KEY_TOKEN = 'ats_jwt_token';
    const KEY_USER = 'ats_user_info';
    const KEY_LAST_ACTIVE = 'ats_last_active';
    
    // Đơn vị thời gian (ms)
    const HEARTBEAT_INTERVAL = 30 * 1000; // Tự động gia hạn phiên mỗi 30s khi có hoạt động
    const IDLE_TIMEOUT = 15 * 60 * 1000;   // Hết hạn phiên nếu không có thao tác trong 15 phút
    
    let heartbeatTimer = null;
    let isUserActive = false;
    let onStatusCallback = null;

    /**
     * Lưu thông tin phiên đăng nhập
     */
    function saveSession(token, user) {
        localStorage.setItem(KEY_TOKEN, token);
        localStorage.setItem(KEY_USER, JSON.stringify(user));
        localStorage.setItem(KEY_LAST_ACTIVE, Date.now().toString());
    }

    function getToken() {
        return localStorage.getItem(KEY_TOKEN);
    }

    function getUser() {
        const raw = localStorage.getItem(KEY_USER);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function clearSession() {
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_USER);
        localStorage.removeItem(KEY_LAST_ACTIVE);
        stopSessionMonitoring();
    }

    function isLoggedIn() {
        return !!getToken();
    }

    /**
     * Chuyển hướng về trang đăng nhập kèm thông báo rõ ràng
     */
    function handleUnauthorized(reason = 'expired') {
        clearSession();
        window.location.href = `index.html?reason=${reason}`;
    }

    /**
     * Interceptor Fetch đính kèm Token và xử lý 401 Unauthorized từ Server
     */
    async function fetchWithAuth(url, options = {}) {
        const token = getToken();
        if (!token) {
            handleUnauthorized('expired');
            throw new Error('Chưa đăng nhập');
        }

        const headers = options.headers || {};
        headers['Authorization'] = `Bearer ${token}`;
        if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                console.warn('[SessionManager] Server trả về 401. Phiên đã bị thu hồi hoặc hết hạn.');
                handleUnauthorized('revoked');
                throw new Error('Phiên đã hết hạn hoặc bị thu hồi');
            }

            return response;
        } catch (error) {
            if (error.message.includes('Phiên đã hết hạn')) throw error;
            throw error;
        }
    }

    /**
     * Gọi API gia hạn & xác thực phiên với Server
     */
    async function verifyAndRenewSession() {
        const token = getToken();
        if (!token) return false;

        try {
            const res = await fetchWithAuth(`${API_BASE}/me`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    const currentUser = getUser() || {};
                    const updatedUser = { ...currentUser, ...data.data };
                    localStorage.setItem(KEY_USER, JSON.stringify(updatedUser));
                    localStorage.setItem(KEY_LAST_ACTIVE, Date.now().toString());

                    if (onStatusCallback) {
                        onStatusCallback({
                            status: 'active',
                            message: 'Phiên đang hoạt động – Tự động gia hạn',
                            lastRenewed: new Date().toLocaleTimeString('vi-VN')
                        });
                    }
                    return true;
                }
            }
            return false;
        } catch (err) {
            return false;
        }
    }

    /**
     * Đăng ký lắng nghe các sự kiện thao tác của người dùng (chuột, bàn phím, cuộn trang)
     */
    function registerActivityListeners() {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        const onActivity = () => {
            isUserActive = true;
            localStorage.setItem(KEY_LAST_ACTIVE, Date.now().toString());
        };

        events.forEach(evt => {
            window.addEventListener(evt, onActivity, { passive: true });
        });
    }

    /**
     * Bắt đầu trình giám sát & gia hạn tự động khi còn hoạt động
     */
    function startSessionMonitoring(statusCallback) {
        onStatusCallback = statusCallback;
        registerActivityListeners();

        // 1. Kiểm tra xác thực ban đầu
        verifyAndRenewSession();

        // 2. Heartbeat định kỳ
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(async () => {
            if (isUserActive) {
                isUserActive = false;
                await verifyAndRenewSession();
            } else {
                const lastActive = parseInt(localStorage.getItem(KEY_LAST_ACTIVE) || '0');
                const idleTime = Date.now() - lastActive;
                if (idleTime >= IDLE_TIMEOUT) {
                    console.warn('[SessionManager] Quá 15 phút không thao tác. Hết hạn phiên.');
                    handleUnauthorized('expired');
                } else if (onStatusCallback) {
                    const remainingMins = Math.ceil((IDLE_TIMEOUT - idleTime) / 60000);
                    onStatusCallback({
                        status: 'idle',
                        message: `Không có thao tác. Phiên sẽ hết hạn sau ${remainingMins} phút.`,
                        lastRenewed: null
                    });
                }
            }
        }, HEARTBEAT_INTERVAL);
    }

    function stopSessionMonitoring() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }

    /**
     * Đăng xuất & làm mất hiệu lực phiên ngay lập tức phía server
     */
    async function logout(revokeAll = false) {
        try {
            const token = getToken();
            if (token) {
                await fetch(`${API_BASE}/revoke-sessions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (e) {
            console.warn('Lỗi gọi API revoke-sessions:', e);
        } finally {
            clearSession();
            handleUnauthorized(revokeAll ? 'revoked_all' : 'logout');
        }
    }

    /**
     * Tự động lưu nháp dữ liệu đang nhập dở (Draft Auto-save)
     */
    function saveDraft(key, data) {
        try {
            localStorage.setItem(`draft_${key}`, JSON.stringify({
                timestamp: Date.now(),
                data: data
            }));
        } catch (e) {}
    }

    function getDraft(key) {
        try {
            const raw = localStorage.getItem(`draft_${key}`);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function clearDraft(key) {
        localStorage.removeItem(`draft_${key}`);
    }

    return {
        saveSession,
        getToken,
        getUser,
        clearSession,
        isLoggedIn,
        handleUnauthorized,
        fetchWithAuth,
        verifyAndRenewSession,
        startSessionMonitoring,
        stopSessionMonitoring,
        logout,
        saveDraft,
        getDraft,
        clearDraft
    };
})();
