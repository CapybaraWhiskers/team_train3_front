async function apiRequest(path, options = {}) {
    options.headers = options.headers || {};
    options.headers['Accept-Language'] = localStorage.getItem('lang') || 'ja';
    const res = await fetch(path, options);
    return res.json();
}

const roleSelect = document.getElementById('role');
const adminPassContainer = document.getElementById('admin-pass-container');

roleSelect.addEventListener('change', () => {
    if (roleSelect.value === 'admin') {
        adminPassContainer.classList.remove('hidden');
    } else {
        adminPassContainer.classList.add('hidden');
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = roleSelect.value;
    if (role === 'admin') {
        const adminPass = document.getElementById('admin-pass').value;
        if (adminPass !== '1') {
            alert('Admin registration password is incorrect.');
            return;
        }
    }
    const res = await apiRequest('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    });
    if (res.status === 'registered') {
        alert('Registration successful! Please log in.');
        location.href = 'login.html';
    } else {
        alert(res.error || 'Registration failed.');
    }
});
