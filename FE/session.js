/**
 * SessionManager - Quản lý trạng thái phiên đăng nhập, tự động gia hạn & xử lý hết hạn
 * Ticket: [FE] Quản lý trạng thái phiên đăng nhập (KN-16 / KN-2)
 */
const SessionManager = (function () {
    const API_BASE = 'http://localhost:8080/api/auth';
    const KEY_TOKEN = 'ats_jwt_token';
    const KEY_USER = 'ats_user_info';
    const KEY_LAST_ACTIVE = 'ats_last_active';
    
    // Cấu hình thời gian (ms)
    const HEARTBEAT_INTERVAL = 30 * 1000; // Kiểm tra/gia hạn phiên mỗi 30 giây khi có hoạt động
    const IDLE_TIMEOUT = 15 * 60 * 1000;   // Hết hạn phiên nếu không thao tác trong 15 phút
    
    let heartbeatTimer = null;
    let idleCheckTimer = null;
    let isUserActiveSinceLastHeartbeat = false;
    let onStatusCallback = null;

    /**
     * Lưu thông tin phiên đăng nhập vào Storage
     */
    function saveSession(token, user) {
        localStorage.setItem(KEY_TOKEN, token);
        localStorage.setItem(KEY_USER, JSON.stringify(user));
        localStorage.setItem(KEY_LAST_ACTIVE, Date.now().toString());
    }

    /**
     * Lấy JWT token hiện tại
     */
    function getToken() {
        return localStorage.getItem(KEY_TOKEN);
    }

    /**
     * Lấy thông tin người dùng đang đăng nhập
     */
    function getUser() {
        const raw = localStorage.getItem(KEY_USER);
        try {
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Xóa sạch thông tin phiên ở client
     */
    function clearSession() {
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_USER);
        localStorage.removeItem(KEY_LAST_ACTIVE);
        stopSessionMonitoring();
    }

    /**
     * Kiểm tra trạng thái đã đăng nhập chưa
     */
    function isLoggedIn() {
        return !!getToken();
    }

    /**
     * Xử lý khi phiên hết hạn hoặc bị thu hồi -> Chuyển về trang đăng nhập kèm thông báo
     */
    function handleUnauthorized(reason = 'expired') {
        clearSession();
        let redirectReason = 'expired';
        if (reason === 'revoked') redirectReason = 'revoked';
        if (reason === 'logout') redirectReason = 'logout';
        if (reason === 'revoked_all') redirectReason = 'revoked_all';

        window.location.href = `index.html?reason=${redirectReason}`;
    }

    /**
     * Wrapper Fetch đính kèm Bearer token và bắt lỗi 401 Unauthorized (Phiên bị hủy phía server)
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
            
            // Nếu server trả về 401 Unauthorized -> Token hết hạn hoặc tokenVersion không khớp (đã bị thu hồi)
            if (response.status === 401) {
                console.warn('[SessionManager] Server trả về 401. Phiên đã hết hạn hoặc bị thu hồi phía server.');
                handleUnauthorized('revoked');
                throw new Error('Phiên làm việc hết hạn hoặc bị thu hồi.');
            }

            return response;
        } catch (error) {
            if (error.message.includes('Phiên làm việc')) throw error;
            throw error;
        }
    }

    /**
     * Chủ động gọi API kiểm tra / gia hạn phiên với Backend
     */
    async function verifyAndRenewSession() {
        const token = getToken();
        if (!token) return false;

        try {
            const res = await fetchWithAuth(`${API_BASE}/me`);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.data) {
                    // Cập nhật thông tin user mới nhất
                    const currentUser = getUser() || {};
                    const updatedUser = { ...currentUser, ...data.data };
                    localStorage.setItem(KEY_USER, JSON.stringify(updatedUser));
                    localStorage.setItem(KEY_LAST_ACTIVE, Date.now().toString());

                    if (onStatusCallback) {
                        onStatusCallback({
                            status: 'active',
                            message: 'Phiên hoạt động - Đã gia hạn tự động',
                            lastRenewed: new Date().toLocaleTimeString('vi-VN')
                        });
                    }
                    return true;
                }
            }
            return false;
        } catch (err) {
            console.error('[SessionManager] Lỗi kiểm tra/gia hạn phiên:', err);
            return false;
        }
    }

    /**
     * Bắt sự kiện tương tác người dùng (mouse, key, scroll) để đánh dấu active
     */
    function registerActivityListeners() {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        const onUserActivity = () => {
            isUserActiveSinceLastHeartbeat = true;
            localStorage.setItem(KEY_LAST_ACTIVE, Date.now().toString());
        };

        events.forEach(evt => {
            window.addEventListener(evt, onUserActivity, { passive: true });
        });
    }

    /**
     * Khởi chạy trình giám sát phiên và gia hạn tự động
     */
    function startSessionMonitoring(statusCallback) {
        onStatusCallback = statusCallback;
        registerActivityListeners();

        // 1. Kiểm tra xác thực ban đầu
        verifyAndRenewSession();

        // 2. Heartbeat định kỳ: Nếu người dùng có hoạt động, tự động gia hạn với backend
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(async () => {
            if (isUserActiveSinceLastHeartbeat) {
                isUserActiveSinceLastHeartbeat = false;
                await verifyAndRenewSession();
            } else {
                // Kiểm tra idle timeout
                const lastActive = parseInt(localStorage.getItem(KEY_LAST_ACTIVE) || '0');
                const idleTime = Date.now() - lastActive;
                if (idleTime >= IDLE_TIMEOUT) {
                    console.warn('[SessionManager] Người dùng không hoạt động trong 15 phút. Hết hạn phiên.');
                    handleUnauthorized('expired');
                } else if (onStatusCallback) {
                    const remainingMins = Math.ceil((IDLE_TIMEOUT - idleTime) / 60000);
                    onStatusCallback({
                        status: 'idle',
                        message: `Không có thao tác. Phiên sẽ hết hạn sau ${remainingMins} phút nếu không hoạt động.`,
                        lastRenewed: null
                    });
                }
            }
        }, HEARTBEAT_INTERVAL);
    }

    /**
     * Dừng giám sát phiên
     */
    function stopSessionMonitoring() {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (idleCheckTimer) clearInterval(idleCheckTimer);
        heartbeatTimer = null;
        idleCheckTimer = null;
    }

    /**
     * Thực hiện Đăng xuất (Thu hồi phiên ngay phía server + xóa local state)
     */
    async function logout(revokeAllDevices = false) {
        try {
            const token = getToken();
            if (token) {
                // Gọi API backend thu hồi phiên
                await fetch(`${API_BASE}/revoke-sessions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (e) {
            console.warn('[SessionManager] Không thể gọi API revoke-sessions, vẫn tiến hành xóa phiên local:', e);
        } finally {
            clearSession();
            handleUnauthorized(revokeAllDevices ? 'revoked_all' : 'logout');
        }
    }

    /**
     * Quản lý tự động lưu nháp dữ liệu đang nhập (Draft Auto-save)
     */
    function saveDraft(key, data) {
        try {
            const payload = {
                timestamp: Date.now(),
                data: data
            };
            localStorage.setItem(`draft_${key}`, JSON.stringify(payload));
        } catch (e) {
            console.error('Lỗi khi lưu bản nháp:', e);
        }
    }

    function getDraft(key) {
        try {
            const raw = localStorage.getItem(`draft_${key}`);
            if (!raw) return null;
            return JSON.parse(raw);
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
