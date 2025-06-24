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

async function clockIn() {
    const data = await apiRequest('/attendance/clock-in', { method: 'POST' });
    if (data.timestamp) {
        showAttendance(`Clocked in at ${data.timestamp}`);
    }
}

async function clockOut() {
    const data = await apiRequest('/attendance/clock-out', { method: 'POST' });
    if (data.timestamp) {
        showAttendance(`Clocked out at ${data.timestamp}`);
    }
}

document.getElementById('clock-in').addEventListener('click', clockIn);
document.getElementById('clock-out').addEventListener('click', clockOut);
document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});
