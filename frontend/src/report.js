async function apiRequest(path, options) {
    const res = await fetch(path, options);
    if (res.status === 401) {
        location.href = 'login.html';
        return {};
    }
    return res.json();
}

function formatTime(iso) {
    const d = new Date(iso);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
}

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        document.getElementById('user-role').textContent = info.role;
    }
}

async function submitReport() {
    const content = document.getElementById('report-text').value;
    const res = await apiRequest('/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    if (res.status === 'success') {
        document.getElementById('report-text').value = '';
        loadReports();
    } else {
        alert(res.error || 'Failed to submit');
    }
}

async function loadReports() {
    const reports = await apiRequest('/reports');
    const container = document.getElementById('reports');
    container.innerHTML = '';
    if (!Array.isArray(reports)) return;
    reports.forEach(r => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${formatTime(r.timestamp)}</strong><div>` + marked.parse(r.content) + '</div>';
        container.appendChild(div);
    });
}

document.getElementById('submit-report').addEventListener('click', submitReport);
document.getElementById('preview').addEventListener('click', () => {
    const content = document.getElementById('report-text').value;
    document.getElementById('preview-area').innerHTML = marked.parse(content);
});
document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadReports();
loadUserRole();
