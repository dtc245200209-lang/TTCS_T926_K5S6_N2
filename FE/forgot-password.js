document.addEventListener('DOMContentLoaded', () => {
    const apiBaseUrl = 'http://localhost:8080/api/auth';
    const requestForm = document.getElementById('requestForm');
    const confirmForm = document.getElementById('confirmForm');
    const statusBox = document.getElementById('statusMessage');
    const requestButton = document.getElementById('requestButton');
    const confirmButton = document.getElementById('confirmButton');
    const tokenInput = document.getElementById('token');
    const devNote = document.getElementById('devNote');

    function showStatus(message, kind) {
        statusBox.textContent = message;
        statusBox.className = `status visible ${kind}`;
    }

    function setLoading(button, loading, text) {
        button.disabled = loading;
        button.textContent = loading ? 'Đang xử lý…' : text;
    }

    async function readResponse(response) {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || payload.success === false) {
            throw new Error(payload.message || 'Không thể kết nối đến API. Hãy kiểm tra backend đang chạy ở cổng 3000.');
        }
        return payload;
    }

    requestForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        setLoading(requestButton, true, 'Gửi yêu cầu đặt lại');
        showStatus('Đang gửi yêu cầu…', 'info');

        try {
            const response = await fetch(`${apiBaseUrl}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: document.getElementById('email').value.trim() }),
            });
            const payload = await readResponse(response);
            const resetToken = payload.data?.resetToken;

            if (resetToken) {
                tokenInput.value = resetToken;
                requestForm.hidden = true;
                confirmForm.hidden = false;
                devNote.hidden = false;
                document.getElementById('pageTitle').textContent = 'Tạo mật khẩu mới';
                document.getElementById('pageIntro').textContent = 'Nhập mật khẩu mới để hoàn tất việc đặt lại.';
                showStatus('Đã tạo mã xác nhận. Mã đã được điền sẵn bên dưới.', 'success');
                document.getElementById('newPassword').focus();
            } else {
                showStatus(payload.message || 'Nếu email đã đăng ký, hướng dẫn đặt lại sẽ được gửi.', 'info');
            }
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            setLoading(requestButton, false, 'Gửi yêu cầu đặt lại');
        }
    });

    confirmForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (newPassword !== confirmPassword) {
            showStatus('Mật khẩu xác nhận không khớp.', 'error');
            return;
        }

        setLoading(confirmButton, true, 'Xác nhận mật khẩu mới');
        showStatus('Đang cập nhật mật khẩu…', 'info');
        try {
            const response = await fetch(`${apiBaseUrl}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: tokenInput.value.trim(),
                    newPassword,
                    confirmPassword,
                }),
            });
            const payload = await readResponse(response);
            confirmForm.hidden = true;
            document.getElementById('pageTitle').textContent = 'Đã đổi mật khẩu';
            document.getElementById('pageIntro').textContent = 'Bạn có thể đăng nhập bằng mật khẩu mới.';
            showStatus(payload.message || 'Đặt lại mật khẩu thành công.', 'success');
        } catch (error) {
            showStatus(error.message, 'error');
        } finally {
            setLoading(confirmButton, false, 'Xác nhận mật khẩu mới');
        }
    });
});
