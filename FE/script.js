document.addEventListener('DOMContentLoaded', () => {
    const form       = document.getElementById('loginForm');
    const emailEl    = document.getElementById('email');
    const pwdEl      = document.getElementById('password');
    const toggleBtn  = document.getElementById('togglePwd');
    const eyeIco     = document.getElementById('eyeIco');
    const btnSubmit  = document.getElementById('btnSubmit');
    const btnLabel   = document.getElementById('btnLabel');
    const btnDots    = document.getElementById('btnDots');
    const errBox     = document.getElementById('errBox');
    const errMsg     = document.getElementById('errMsg');
    const lockBox    = document.getElementById('lockBox');
    const lockMsg    = document.getElementById('lockMsg');

    // ── Config ──────────────────────────────────────────
    const MAX_FAIL    = 5;
    const LOCK_MS     = 15 * 60 * 1000;
    const K_FAIL      = 'hr_fails';
    const K_LOCK      = 'hr_lock_at';

    // (Removed dummy USERS list as we use real API now)

    // ── Toggle password visibility ──────────────────────
    const EYE_OPEN = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const EYE_OFF  = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    toggleBtn.addEventListener('click', () => {
        const show = pwdEl.type === 'password';
        pwdEl.type = show ? 'text' : 'password';
        toggleBtn.innerHTML = show ? EYE_OPEN : EYE_OFF;
    });

    // ── Helpers ─────────────────────────────────────────
    const getFails    = () => parseInt(localStorage.getItem(K_FAIL) || '0');
    const getLockAt   = () => parseInt(localStorage.getItem(K_LOCK) || '0');
    const addFail     = () => { const n = getFails() + 1; localStorage.setItem(K_FAIL, n); return n; };
    const clearFails  = () => { localStorage.removeItem(K_FAIL); localStorage.removeItem(K_LOCK); };

    function setLoading(on) {
        btnLabel.style.display  = on ? 'none' : '';
        btnDots.style.display   = on ? 'flex' : 'none';
        btnSubmit.disabled = on;
        emailEl.disabled   = on;
        pwdEl.disabled     = on;
    }

    function showErr(msg) {
        hideAlerts();
        errMsg.textContent = msg;
        errBox.style.display = 'flex';
        shake();
    }

    function showLock(msg) {
        hideAlerts();
        lockMsg.textContent = msg;
        lockBox.style.display = 'flex';
        setFormLocked(true);
    }

    function hideAlerts() {
        errBox.style.display  = 'none';
        lockBox.style.display = 'none';
    }

    function setFormLocked(on) {
        emailEl.disabled   = on;
        pwdEl.disabled     = on;
        btnSubmit.disabled = on;
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

    // ── Init: check lock on load ─────────────────────────
    isLocked();

    // ── Submit ───────────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isLocked()) return;
        hideAlerts();

        const email = emailEl.value.trim().toLowerCase();
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

            if (response.ok && result.success) {
                clearFails();
                // We use result.data to render success UI
                renderSuccess({ email: email, role: 'Đã xác thực', token: result.data.accessToken });
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

    // ── Success redirect page ────────────────────────────
    function renderSuccess(user) {
        document.body.innerHTML = `
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: 'Inter', system-ui, sans-serif;
                background: #F8FAFC;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
            }
            .card {
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 20px;
                padding: 52px 44px;
                text-align: center;
                max-width: 380px;
                width: 100%;
                box-shadow: 0 20px 40px rgba(0,0,0,0.06);
                animation: up .5s cubic-bezier(.16,1,.3,1);
            }
            @keyframes up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
            .check {
                width: 72px; height: 72px;
                border-radius: 50%;
                background: #ECFDF5;
                border: 2px solid #A7F3D0;
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 24px;
                animation: pop .4s .15s cubic-bezier(.34,1.56,.64,1) both;
            }
            @keyframes pop { from { transform:scale(0); } to { transform:scale(1); } }
            h2 { font-size: 22px; font-weight: 800; color: #0F172A; margin-bottom: 8px; letter-spacing: -.5px; }
            .role { display: inline-block; margin: 0 auto 20px; padding: 4px 14px; border-radius: 999px; background: #EFF6FF; border: 1px solid #BFDBFE; color: #1D4ED8; font-size: 13px; font-weight: 600; }
            p { font-size: 14px; color: #64748B; line-height: 1.6; margin-bottom: 32px; }
            button {
                width: 100%; height: 46px;
                background: #2563EB; color: white;
                border: none; border-radius: 10px;
                font-size: 14px; font-weight: 700; cursor: pointer;
                transition: background .2s;
            }
            button:hover { background: #1D4ED8; }
        </style>
        <div class="card">
            <div class="check">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2>Đăng nhập thành công!</h2>
            <div class="role">👤 ${user.role}</div>
            <p>Chào mừng <strong>${user.email}</strong>.<br>Đang chuyển hướng đến bảng điều khiển...</p>
            <button onclick="location.reload()">← Quay lại trang đăng nhập</button>
        </div>`;
    }
});
