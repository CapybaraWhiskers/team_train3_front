async function apiRequest(path, options) {
    const res = await fetch(path, options);
    return res.json();
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
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
