async function apiRequest(path, options) {
    const res = await fetch(path, options);
    return res.json();
}

function showAttendance(msg) {
    document.getElementById('attendance-msg').textContent = msg;
}

async function clockIn() {
    const data = await apiRequest('/attendance/clock-in', {method: 'POST'});
    showAttendance(`Clocked in at ${data.timestamp}`);
}

async function clockOut() {
    const data = await apiRequest('/attendance/clock-out', {method: 'POST'});
    showAttendance(`Clocked out at ${data.timestamp}`);
}

async function submitReport() {
    const content = document.getElementById('report-text').value;
    await apiRequest('/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({content})
    });
    document.getElementById('report-text').value = '';
    loadReports();
}

async function loadReports() {
    const reports = await apiRequest('/reports');
    const container = document.getElementById('reports');
    container.innerHTML = '';
    reports.forEach(r => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${r.timestamp}</strong><div>` + marked.parse(r.content) + '</div>';
        container.appendChild(div);
    });
}

document.getElementById('clock-in').addEventListener('click', clockIn);
document.getElementById('clock-out').addEventListener('click', clockOut);
document.getElementById('submit-report').addEventListener('click', submitReport);

// Initial load
loadReports();
