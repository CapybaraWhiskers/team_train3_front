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

async function loadTodayAttendance() {
    const data = await apiRequest('/attendance/today');
    if (data.clock_in && data.clock_out) {
        showAttendance(`本日の出勤 ${formatTime(data.clock_in)} 退勤 ${formatTime(data.clock_out)}`);
    } else if (data.clock_in) {
        showAttendance(`本日の出勤 ${formatTime(data.clock_in)} 退勤 未打刻`);
    } else {
        showAttendance('本日の打刻はありません');
    }
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

let currentName = '';

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        currentName = info.name || '';
        const roleLabel = info.role === 'admin' ? '管理者' : '一般';
        document.getElementById('user-role').textContent = roleLabel;
        const link = document.getElementById('dashboard-link');
        if (link) {
            link.href = info.role === 'admin' ? 'dashboard_admin.html' : 'dashboard_user.html';
        }
    }
}

async function loadMonthlySummary() {
    const data = await apiRequest('/dashboard');
    if (!data.totals || !currentName) return;
    const hours = data.totals[currentName];
    if (hours === undefined) return;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    document.getElementById('monthly-hours').textContent = `${h}h ${m}m`;
}

async function clockIn() {
    const data = await apiRequest('/attendance/clock-in', { method: 'POST' });
    if (data.timestamp) {
        await loadTodayAttendance();
    }
}

async function clockOut() {
    const data = await apiRequest('/attendance/clock-out', { method: 'POST' });
    if (data.timestamp) {
        await loadTodayAttendance();
    }
}

document.getElementById('clock-in').addEventListener('click', clockIn);
document.getElementById('clock-out').addEventListener('click', clockOut);
document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadUserRole().then(() => {
    loadMonthlySummary();
    loadTodayAttendance();
});
