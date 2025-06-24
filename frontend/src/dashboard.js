let currentRole = 'user';

function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

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
    const table = document.createElement('table');
    let header = '<tr>';
    if (currentRole === 'admin') {
        header += '<th>ユーザー名</th>';
    }
    header += '<th>出勤日時</th><th>退勤日時</th><th>勤務時間</th>';
    if (currentRole === 'admin') {
        header += '<th>当月総計</th>';
    }
    header += '</tr>';
    table.innerHTML = '<thead>' + header + '</thead>';
    const tbody = document.createElement('tbody');
    data.records.forEach(rec => {
        let row = '<tr>';
        if (currentRole === 'admin') {
            row += `<td>${rec.name}</td>`;
        }
        row += `<td>${formatDateTime(rec.clock_in)}</td>`;
        row += `<td>${formatDateTime(rec.clock_out)}</td>`;
        row += `<td>${rec.hours.toFixed(2)}</td>`;
        if (currentRole === 'admin') {
            row += `<td>${data.totals[rec.name].toFixed(2)}</td>`;
        }
        row += '</tr>';
        tbody.innerHTML += row;
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        currentRole = info.role;
        const label = info.role === 'admin' ? '管理者' : '一般';
        document.getElementById('user-role').textContent = label;
    }
}

document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadDashboard();
loadUserRole();
