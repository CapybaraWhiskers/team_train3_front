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
    return d.toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        const roleLabel = info.role === 'admin' ? '管理者' : '一般';
        document.getElementById('user-role').textContent = roleLabel;
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
        alert(res.error || '送信に失敗しました');
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
    document.getElementById('modal-body').innerHTML = marked.parse(content);
    document.getElementById('preview-modal').style.display = 'flex';
});
document.getElementById('close-preview').addEventListener('click', () => {
    document.getElementById('preview-modal').style.display = 'none';
});
document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadReports();
loadUserRole();
