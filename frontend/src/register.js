async function apiRequest(path, options) {
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
            alert('管理者登録パスワードが違います');
            return;
        }
    }
    const res = await apiRequest('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
    });
    if (res.status === 'registered') {
        alert('登録完了！ログインしてください。');
        location.href = 'login.html';
    } else {
        alert(res.error || '登録に失敗しました');
    }
});
