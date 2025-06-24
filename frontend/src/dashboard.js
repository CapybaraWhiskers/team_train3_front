async function apiRequest(path, options) {
    const res = await fetch(path, options);
    if (res.status === 401) {
        location.href = 'login.html';
        return {};
    }
    return res.json();
}

async function loadDashboard() {
    const data = await apiRequest('/dashboard');
    const container = document.getElementById('dashboard-data');
    container.innerHTML = '';
    for (const [user, hours] of Object.entries(data)) {
        const div = document.createElement('div');
        div.textContent = `User ${user}: ${hours.toFixed(2)} hours`;
        container.appendChild(div);
    }
}

document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadDashboard();
