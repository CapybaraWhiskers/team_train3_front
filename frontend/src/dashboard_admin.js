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

    Object.keys(data.totals).sort().forEach(name => {
        const hours = data.totals[name];
        const utilization = Math.round((hours / 160) * 100);
        const row = document.createElement('tr');
        row.className = 'border-t border-t-[#dce0e5]';
        row.innerHTML = `
            <td class="table-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">${name}</td>
            <td class="table-column-240 h-[72px] px-4 py-2 w-[400px] text-[#637588] text-sm font-normal leading-normal">N/A</td>
            <td class="table-column-360 h-[72px] px-4 py-2 w-[400px] text-[#637588] text-sm font-normal leading-normal">${hours.toFixed(0)}</td>
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

/* Legacy dashboard widgets were removed. */

async function loadUserRole() {
    const info = await apiRequest('/me');
    if (info.role) {
        if (info.role !== 'admin') {
            location.href = 'dashboard_user.html';
            return;
        }
        document.getElementById('user-role').textContent = '管理者';
    }
}

document.getElementById('logout').addEventListener('click', async () => {
    await apiRequest('/logout', { method: 'POST' });
    location.href = 'login.html';
});

loadDashboard();
loadUserRole();
