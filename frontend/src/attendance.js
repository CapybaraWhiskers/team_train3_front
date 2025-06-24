async function apiRequest(path, options) {
    const res = await fetch(path, options);
    if (res.status === 401) {
        location.href = 'login.html';
        return {};
    }
    return res.json();
}

function showAttendance(msg) {
    document.getElementById('attendance-msg').textContent = msg;
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

async function clockIn() {
    const data = await apiRequest('/attendance/clock-in', { method: 'POST' });
    if (data.timestamp) {
        showAttendance(`出勤: ${formatTime(data.timestamp)}`);
    }
}

async function clockOut() {
    const data = await apiRequest('/attendance/clock-out', { method: 'POST' });
    if (data.timestamp) {
        showAttendance(`退勤: ${formatTime(data.timestamp)}`);
    }
}

document.getElementById('clock-in').addEventListener('click', clockIn);
document.getElementById('clock-out').addEventListener('click', clockOut);
document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadUserRole();
