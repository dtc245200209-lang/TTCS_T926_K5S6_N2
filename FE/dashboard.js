document.addEventListener('DOMContentLoaded', () => {
    
    // ── 1. Kiểm tra xác thực ban đầu ──────────────────────────────────────
    if (typeof SessionManager === 'undefined' || !SessionManager.isLoggedIn()) {
        console.warn('Chưa đăng nhập. Chuyển về trang đăng nhập.');
        window.location.href = 'index.html?reason=expired';
        return;
    }

    const user = SessionManager.getUser();
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && user) {
        usernameDisplay.textContent = `${user.username} (${user.role || 'Recruiter'})`;
    }

    // ── 2. Đăng ký giám sát phiên & gia hạn tự động (Heartbeat & Activity) ──
    const sessionStatusText = document.getElementById('sessionStatusText');
    const sessionPulse      = document.getElementById('sessionPulse');

    SessionManager.startSessionMonitoring((info) => {
        if (sessionStatusText) {
            if (info.status === 'active') {
                sessionStatusText.textContent = `Phiên hoạt động – Đã gia hạn lúc ${info.lastRenewed}`;
                if (sessionPulse) {
                    sessionPulse.style.backgroundColor = '#10b981';
                    sessionPulse.style.display = 'block';
                }
            } else if (info.status === 'idle') {
                sessionStatusText.textContent = info.message;
                if (sessionPulse) {
                    sessionPulse.style.backgroundColor = '#f59e0b';
                }
            }
        }
    });

    // ── 3. Quản lý Tự động Lưu nháp Phiếu đánh giá (Draft Auto-save) ────────
    const DRAFT_KEY = 'candidate_eval_101';
    const commentsEl   = document.getElementById('evalComments');
    const salaryEl     = document.getElementById('salaryOffer');
    const decisionEl   = document.getElementById('finalDecision');
    const autoSaveText = document.getElementById('autoSaveText');
    const draftBanner  = document.getElementById('draftBanner');
    const btnClearDraft= document.getElementById('btnClearDraft');

    let evalRatings = {
        skill: 0,
        problem_solving: 0
    };

    // Thiết lập chọn số sao đánh giá
    document.querySelectorAll('.rating-group').forEach(group => {
        const criterion = group.getAttribute('data-criterion');
        group.querySelectorAll('.rating-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                group.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                evalRatings[criterion] = parseInt(btn.getAttribute('data-val'));
                triggerAutoSave();
            });
        });
    });

    function getFormData() {
        return {
            ratings: evalRatings,
            comments: commentsEl ? commentsEl.value : '',
            salary: salaryEl ? salaryEl.value : '',
            decision: decisionEl ? decisionEl.value : ''
        };
    }

    function triggerAutoSave() {
        const data = getFormData();
        SessionManager.saveDraft(DRAFT_KEY, data);
        if (autoSaveText) {
            const timeStr = new Date().toLocaleTimeString('vi-VN');
            autoSaveText.textContent = `Đã tự động lưu nháp lúc ${timeStr}`;
        }
    }

    // Lắng nghe thay đổi input để lưu nháp
    if (commentsEl) commentsEl.addEventListener('input', triggerAutoSave);
    if (salaryEl)   salaryEl.addEventListener('input', triggerAutoSave);
    if (decisionEl) decisionEl.addEventListener('change', triggerAutoSave);

    // Khôi phục bản nháp (nếu có)
    const existingDraft = SessionManager.getDraft(DRAFT_KEY);
    if (existingDraft && existingDraft.data) {
        const d = existingDraft.data;
        if (d.comments || d.salary || d.decision || (d.ratings && (d.ratings.skill || d.ratings.problem_solving))) {
            
            if (commentsEl && d.comments) commentsEl.value = d.comments;
            if (salaryEl && d.salary) salaryEl.value = d.salary;
            if (decisionEl && d.decision) decisionEl.value = d.decision;

            if (d.ratings) {
                evalRatings = d.ratings;
                Object.keys(d.ratings).forEach(criterion => {
                    const val = d.ratings[criterion];
                    if (val) {
                        const btn = document.querySelector(`.rating-group[data-criterion="${criterion}"] .rating-btn[data-val="${val}"]`);
                        if (btn) btn.classList.add('active');
                    }
                });
            }

            if (draftBanner) draftBanner.style.display = 'flex';
            if (autoSaveText) {
                const timeStr = new Date(existingDraft.timestamp).toLocaleTimeString('vi-VN');
                autoSaveText.textContent = `Đã khôi phục bản nháp từ lúc ${timeStr}`;
            }
        }
    }

    // Xóa bản nháp
    if (btnClearDraft) {
        btnClearDraft.addEventListener('click', () => {
            SessionManager.clearDraft(DRAFT_KEY);
            if (commentsEl) commentsEl.value = '';
            if (salaryEl) salaryEl.value = '';
            if (decisionEl) decisionEl.value = '';
            document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
            if (draftBanner) draftBanner.style.display = 'none';
            if (autoSaveText) autoSaveText.textContent = 'Bản nháp đã được xóa';
        });
    }

    // Nút lưu nháp thủ công
    const btnManualSave = document.getElementById('btnManualSave');
    if (btnManualSave) {
        btnManualSave.addEventListener('click', () => {
            triggerAutoSave();
            alert('✅ Đã lưu bản nháp đánh giá thành công!');
        });
    }

    // Nộp phiếu đánh giá
    const btnSubmitEval = document.getElementById('btnSubmitEval');
    if (btnSubmitEval) {
        btnSubmitEval.addEventListener('click', () => {
            const data = getFormData();
            if (!data.decision) {
                alert('Vui lòng chọn Quyết định tuyển dụng trước khi nộp phiếu.');
                return;
            }
            alert(`🎉 Nộp phiếu đánh giá thành công cho ứng viên Nguyễn Văn An!\nKết quả: ${data.decision}`);
            SessionManager.clearDraft(DRAFT_KEY);
            if (draftBanner) draftBanner.style.display = 'none';
        });
    }

    // ── 4. Xử lý các Nút Đăng xuất & Giả lập Hết hạn phiên ─────────────────
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async () => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                await SessionManager.logout(false);
            }
        });
    }

    const btnRevokeAll = document.getElementById('btnRevokeAll');
    if (btnRevokeAll) {
        btnRevokeAll.addEventListener('click', async () => {
            if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi TẤT CẢ các thiết bị đang hoạt động?')) {
                await SessionManager.logout(true);
            }
        });
    }

    const btnTestExpire = document.getElementById('btnTestExpire');
    if (btnTestExpire) {
        btnTestExpire.addEventListener('click', () => {
            alert('🧪 Mô phỏng tình huống: Server trả về 401 Unauthorized (Phiên bị thu hồi hoặc token hết hạn).');
            SessionManager.handleUnauthorized('revoked');
        });
    }
});
