document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('loginForm');
    const emailEl    = document.getElementById('email');
    const pwdEl      = document.getElementById('password');
    const toggleBtn  = document.getElementById('togglePwd');
    const eyeIco     = document.getElementById('eyeIco');
    const btnSubmit  = document.getElementById('btnSubmit');
    const btnLabel   = document.getElementById('btnLabel');
    const btnDots    = document.getElementById('btnDots');
    
    const statusBox  = document.getElementById('statusBox');
    const statusMsg  = document.getElementById('statusMsg');
    const errBox     = document.getElementById('errBox');
    const errMsg     = document.getElementById('errMsg');
    const lockBox    = document.getElementById('lockBox');
    const lockMsg    = document.getElementById('lockMsg');

    // ── Config ──────────────────────────────────────────
    const MAX_FAIL    = 5;
    const LOCK_MS     = 15 * 60 * 1000;
    const K_FAIL      = 'hr_fails';
    const K_LOCK      = 'hr_lock_at';

    // ── Toggle password visibility ──────────────────────
    const EYE_OPEN = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const EYE_OFF  = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    if (toggleBtn && pwdEl) {
        toggleBtn.addEventListener('click', () => {
            const show = pwdEl.type === 'password';
            pwdEl.type = show ? 'text' : 'password';
            toggleBtn.innerHTML = show ? EYE_OPEN : EYE_OFF;
        });
    }

    // ── Helpers ─────────────────────────────────────────
    const getFails    = () => parseInt(localStorage.getItem(K_FAIL) || '0');
    const getLockAt   = () => parseInt(localStorage.getItem(K_LOCK) || '0');
    const addFail     = () => { const n = getFails() + 1; localStorage.setItem(K_FAIL, n); return n; };
    const clearFails  = () => { localStorage.removeItem(K_FAIL); localStorage.removeItem(K_LOCK); };

    function setLoading(on) {
        if (btnLabel) btnLabel.style.display = on ? 'none' : '';
        if (btnDots) btnDots.style.display  = on ? 'flex' : 'none';
        if (btnSubmit) btnSubmit.disabled  = on;
        if (emailEl) emailEl.disabled      = on;
        if (pwdEl) pwdEl.disabled          = on;
    }

    function showStatusNotice(msg, type = 'info') {
        hideAlerts();
        if (statusBox && statusMsg) {
            statusMsg.textContent = msg;
            statusBox.className = `alert alert-${type}`;
            statusBox.style.display = 'flex';
        }
    }

    function showErr(msg) {
        hideAlerts();
        if (errBox && errMsg) {
            errMsg.textContent = msg;
            errBox.style.display = 'flex';
        }
        shake();
    }

    function showLock(msg) {
        hideAlerts();
        if (lockBox && lockMsg) {
            lockMsg.textContent = msg;
            lockBox.style.display = 'flex';
        }
        setFormLocked(true);
    }

    function hideAlerts() {
        if (statusBox) statusBox.style.display = 'none';
        if (errBox) errBox.style.display       = 'none';
        if (lockBox) lockBox.style.display     = 'none';
    }

    function setFormLocked(on) {
        if (emailEl) emailEl.disabled   = on;
        if (pwdEl) pwdEl.disabled     = on;
        if (btnSubmit) btnSubmit.disabled = on;
    }

    function shake() {
        const box = document.querySelector('.login-form');
        if (!box) return;
        box.classList.remove('shake');
        void box.offsetWidth;
        box.classList.add('shake');
        box.addEventListener('animationend', () => box.classList.remove('shake'), { once: true });
    }

    function isLocked() {
        const at = getLockAt();
        if (!at) return false;
        const elapsed = Date.now() - at;
        if (elapsed >= LOCK_MS) { clearFails(); return false; }
        const mins = Math.ceil((LOCK_MS - elapsed) / 60000);
        showLock(`Bạn đã nhập sai ${MAX_FAIL} lần. Vui lòng thử lại sau ${mins} phút.`);
        return true;
    }

    // ── Xử lý URL Parameters (Thông báo lý do hết hạn / đăng xuất) ────
    function checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const reason = urlParams.get('reason');

        if (reason === 'expired') {
            showStatusNotice('⚠️ Phiên đăng nhập của bạn đã hết hạn do không có hoạt động. Vui lòng đăng nhập lại.', 'warning');
        } else if (reason === 'revoked') {
            showStatusNotice('🚫 Phiên đăng nhập đã bị thu hồi phía server (hoặc trên thiết bị khác). Vui lòng đăng nhập lại.', 'error');
        } else if (reason === 'logout') {
            showStatusNotice('ℹ️ Bạn đã đăng xuất khỏi hệ thống thành công.', 'info');
        } else if (reason === 'revoked_all') {
            showStatusNotice('ℹ️ Đã thu hồi tất cả phiên đăng nhập trên mọi thiết bị.', 'info');
        } else if (typeof SessionManager !== 'undefined' && SessionManager.isLoggedIn()) {
            // Nếu không có lý do đăng xuất và đã đăng nhập trước đó -> Chuyển đến Dashboard
            window.location.href = 'dashboard.html';
        }
    }

    // Initial checks
    isLocked();
    checkUrlParams();

    // ── Submit Đăng nhập ──────────────────────────────────
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (isLocked()) return;
            hideAlerts();

            const email = emailEl.value.trim();
            const pwd   = pwdEl.value;
            if (!email || !pwd) return;

            setLoading(true);

            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: email, password: pwd })
                });

                const result = await response.json();

                if (response.ok && result.success && result.data) {
                    clearFails();
                    
                    // Lưu phiên đăng nhập vào SessionManager
                    const userData = {
                        username: result.data.username || email,
                        email: email,
                        tokenVersion: result.data.tokenVersion || 1,
                        role: 'Nhân viên tuyển dụng (Recruiter)'
                    };

                    if (typeof SessionManager !== 'undefined') {
                        SessionManager.saveSession(result.data.token, userData);
                    }

                    // Chuyển hướng tới trang Dashboard làm việc
                    window.location.href = 'dashboard.html';
                } else {
                    setLoading(false);
                    pwdEl.value = '';
                    const fails = addFail();
                    const left  = MAX_FAIL - fails;

                    if (fails >= MAX_FAIL) {
                        localStorage.setItem(K_LOCK, Date.now().toString());
                        isLocked();
                    } else {
                        showErr(result.message || `Thông tin không chính xác. Còn ${left} lần thử trước khi tài khoản bị khóa.`);
                    }
                }
            } catch (error) {
                setLoading(false);
                showErr('Không thể kết nối đến máy chủ Backend. Vui lòng đảm bảo Backend đang chạy.');
            }
        });
    }
});
