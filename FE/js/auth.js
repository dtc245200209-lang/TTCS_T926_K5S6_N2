const API_BASE_URL = 'http://localhost:8080/api';

const forgotForm = document.getElementById('forgot-password-form');

if (forgotForm) {
  forgotForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const submitButton = forgotForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xử lý yêu cầu');
      }

      alert(data.message);
      if (data.resetLink) {
        console.log('Link reset dùng để test local:', data.resetLink);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      submitButton.disabled = false;
    }
  });
}
