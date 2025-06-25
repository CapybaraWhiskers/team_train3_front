let currentRole = 'admin';

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
    const tbody = document.getElementById('attendance-body');
    tbody.innerHTML = '';

    const target = getMonthlyTargetHours();

    Object.keys(data.totals).sort().forEach(name => {
        const hours = data.totals[name];
        const utilization = Math.round((hours / target) * 100);
        const row = document.createElement('tr');
        row.className = 'border-t border-t-[#dce0e5]';
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        row.innerHTML = `
            <td class="table-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">${name}</td>
            <td class="table-column-360 h-[72px] px-4 py-2 w-[400px] text-[#637588] text-sm font-normal leading-normal">${h}h ${m}m</td>
            <td class="table-column-480 h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal">
              <div class="flex items-center gap-3">
                <div class="w-[88px] overflow-hidden rounded-sm bg-[#dce0e5]">
                  <div class="h-1 rounded-full bg-[#111418]" style="width: ${Math.min(utilization,100)}%;"></div>
                </div>
                <p class="text-[#111418] text-sm font-medium leading-normal">${utilization}</p>
              </div>
            </td>`;
        tbody.appendChild(row);
    });
}

function getMonthlyTargetHours() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let weekdays = 0;
    for (let d = new Date(year, month, 1); d.getMonth() === month; d.setDate(d.getDate() + 1)) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) weekdays++;
    }
    return weekdays * 8;
}

/* Legacy dashboard widgets were removed. */

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        if (info.role !== 'admin') {
            location.href = 'dashboard_user.html';
            return;
        }
        document.getElementById('user-role').textContent = 'Admin';
    }
}

document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadDashboard();
loadUserRole();

async function exportCsv() {
    const data = await apiRequest('/dashboard');
    let csv = '\ufeffEmployee Name,Total Hours,Utilization Rate\n';
    Object.keys(data.totals).sort().forEach(name => {
        const hours = data.totals[name];
        const utilization = Math.round((hours / getMonthlyTargetHours()) * 100);
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        csv += `${name},${h}h ${m}m,${utilization}%\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance.csv';
    a.click();
    URL.revokeObjectURL(url);
}

document.getElementById('export-csv').addEventListener('click', exportCsv);
