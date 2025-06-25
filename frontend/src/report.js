async function apiRequest(path, options) {
    const res = await fetch(path, options);
    if (res.status === 401) {
        location.href = 'login.html';
        return {};
    }
    return res.json();
}

// Ensure line breaks are rendered in markdown output
if (window.marked) {
    marked.setOptions({ gfm: true, breaks: true });
}

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        const roleLabel = info.role === 'admin' ? 'Admin' : 'User';
        document.getElementById('user-role').textContent = roleLabel;
        const link = document.getElementById('dashboard-link');
        if (link) {
            link.href = info.role === 'admin' ? 'dashboard_admin.html' : 'dashboard_user.html';
        }
    }
}

async function submitReport() {
    const content = document.getElementById('report-text').value.trim();
    if (!content) {
        alert('Please enter your daily report.');
        return;
    }
    const res = await apiRequest('/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });
    if (res.status === 'success') {
        document.getElementById('report-text').value = '';
        loadReports();
    } else {
        alert(res.error || 'Failed to submit.');
    }
}

let allReports = [];

function renderReportsForRange() {
    const container = document.getElementById('reports');
    container.innerHTML = '';
    const startStr = document.getElementById('report-start').value;
    const endStr = document.getElementById('report-end').value;
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;
    if (end) {
        end.setDate(end.getDate() + 1);
    }
    if (!Array.isArray(allReports)) return;
    allReports.forEach(r => {
        const ts = new Date(r.timestamp);
        if ((!start || ts >= start) && (!end || ts < end)) {
            const div = document.createElement('div');
            const time = formatTime(r.timestamp);
            const name = r.name || '';
            div.innerHTML = `<strong>${name}</strong> <span class="text-sm text-[#637588]">${time}</span><div>` +
                marked.parse(r.content) + '</div>';
            container.appendChild(div);
        }
    });
}

async function loadReports() {
    allReports = await apiRequest('/reports');
    renderReportsForRange();
}

document.getElementById('submit-report').addEventListener('click', submitReport);
document.getElementById('report-text').addEventListener('input', (e) => {
    document.getElementById('submit-report').disabled = e.target.value.trim() === '';
});
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

const startInput = document.getElementById('report-start');
const endInput = document.getElementById('report-end');
if (startInput && endInput) {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    startInput.value = weekAgo.toISOString().slice(0, 10);
    endInput.value = today.toISOString().slice(0, 10);
    startInput.addEventListener('change', renderReportsForRange);
    endInput.addEventListener('change', renderReportsForRange);
}

loadReports();
loadUserRole();
document.getElementById('submit-report').disabled = true;
