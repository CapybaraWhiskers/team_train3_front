async function apiRequest(path, options) {
    const res = await fetch(path, options);
    return res.json();
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await apiRequest('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (res.status === 'logged_in') {
        location.href = 'attendance.html';
    } else {
        alert(res.error || 'Login failed.');
    }
});
