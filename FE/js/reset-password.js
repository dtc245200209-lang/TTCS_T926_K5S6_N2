const API_BASE_URL = 'http://localhost:8080/api';
const token = new URLSearchParams(window.location.search).get('token');
const statusText = document.getElementById('token-status');
const resetForm = document.getElementById('reset-password-form');

async function validateToken() {
  if (!token) {
    statusText.textContent = 'Link đặt lại mật khẩu không hợp lệ.';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/reset-password/validate?token=${encodeURIComponent(token)}`);
    const data = await response.json();
    if (!response.ok || !data.valid) {
      throw new Error(data.message || 'Token không hợp lệ hoặc đã hết hạn');
    }
    statusText.textContent = 'Nhập mật khẩu mới của bạn.';
    resetForm.hidden = false;
  } catch (error) {
    statusText.textContent = error.message;
  }
}

resetForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const newPassword = document.getElementById('new-password').value;
  const submitButton = resetForm.querySelector('button');
  submitButton.disabled = true;

  try {
    const response = await fetch(`${API_BASE_URL}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Không thể đặt lại mật khẩu');
    }
    alert(data.message);
    resetForm.reset();
    resetForm.hidden = true;
    statusText.textContent = 'Token đã được sử dụng.';
  } catch (error) {
    alert(error.message);
  } finally {
    submitButton.disabled = false;
  }
});

validateToken();
