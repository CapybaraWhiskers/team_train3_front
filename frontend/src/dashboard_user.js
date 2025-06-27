let currentRole = "user";

function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

async function apiRequest(path, options = {}) {
    options.headers = options.headers || {};
    options.headers["Accept-Language"] = localStorage.getItem("lang") || "ja";
    const res = await fetch(path, options);
    if (res.status === 401) {
        location.href = "login.html";
        return {};
    }
    return res.json();
}

function renderWeeklyChart(weeks) {
    const chart = document.getElementById("weekly-chart");
    chart.innerHTML = "";
    const max = Math.max(...weeks, 1);
    weeks.forEach((h, i) => {
        const bar = document.createElement("div");
        bar.className = "border-neutral-500 bg-[#ededed] border-t-2 w-full";
        bar.style.height = `${(h / max) * 100}%`;
        chart.appendChild(bar);
        const label = document.createElement("p");
        label.className =
            "text-neutral-500 text-[13px] font-bold leading-normal tracking-[0.015em]";
        label.textContent = `Week ${i + 1}`;
        chart.appendChild(label);
    });
}

function getMonthlyTargetHours() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    let weekdays = 0;
    for (
        let d = new Date(year, month, 1);
        d.getMonth() === month;
        d.setDate(d.getDate() + 1)
    ) {
        const day = d.getDay();
        if (day !== 0 && day !== 6) weekdays++;
    }
    return weekdays * 8;
}

async function loadDashboard() {
    const data = await apiRequest("/dashboard");
    const container = document.getElementById("dashboard-data");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.className = "min-w-full text-sm";

    let header = "<tr>";
    if (currentRole === "admin") {
        header +=
            '<th class="px-4 py-3 text-left text-[#111418] font-medium" data-i18n="employee_name">Employee Name</th>';
    }
    header +=
        '<th class="px-4 py-3 text-left text-[#111418] font-medium" data-i18n="clock_in">Clock In</th>';
    header +=
        '<th class="px-4 py-3 text-left text-[#111418] font-medium" data-i18n="clock_out">Clock Out</th>';
    header +=
        '<th class="px-4 py-3 text-left text-[#111418] font-medium" data-i18n="hours_worked">Hours Worked</th>';
    if (currentRole === "admin") {
        header +=
            '<th class="px-4 py-3 text-left text-[#111418] font-medium">Monthly Total</th>';
    }
    header += "</tr>";

    table.innerHTML = "<thead>" + header + "</thead>";

    const tbody = document.createElement("tbody");
    data.records.forEach((rec) => {
        let row = '<tr class="border-t border-[#dce0e5]">';
        if (currentRole === "admin") {
            row += `<td class="px-4 py-2 text-[#111418]">${rec.name}</td>`;
        }
        row += `<td class="px-4 py-2 text-[#637588]">${formatDateTime(
            rec.clock_in
        )}</td>`;
        row += `<td class="px-4 py-2 text-[#637588]">${formatDateTime(
            rec.clock_out
        )}</td>`;
        const h = Math.floor(rec.hours);
        const m = Math.round((rec.hours - h) * 60);
        row += `<td class="px-4 py-2 text-[#637588]">${h}h ${m}m</td>`;
        if (currentRole === "admin") {
            const total = data.totals[rec.name];
            const th = Math.floor(total);
            const tm = Math.round((total - th) * 60);
            row += `<td class="px-4 py-2 text-[#111418]">${th}h ${tm}m</td>`;
        }
        row += "</tr>";
        tbody.innerHTML += row;
    });
    table.appendChild(tbody);
    container.appendChild(table);
    if (typeof applyTranslations === "function") {
        applyTranslations();
    }

    // calculate metrics
    const totalHours = Object.values(data.totals).reduce((a, b) => a + b, 0);
    const th = Math.floor(totalHours);
    const tm = Math.round((totalHours - th) * 60);
    document.getElementById("total-hours-value").textContent = `${th}h ${tm}m`;
    document.getElementById("monthly-hours").textContent = `${th}h ${tm}m`;

    const target = getMonthlyTargetHours();
    const utilization = Math.round((totalHours / target) * 100);
    document.getElementById("utilization-rate-value").textContent =
        utilization + "%";

    // weekly chart
    const weeks = [0, 0, 0, 0, 0];
    data.records.forEach((r) => {
        const d = new Date(r.clock_in);
        const week = Math.min(4, Math.floor((d.getDate() - 1) / 7));
        weeks[week] += r.hours;
    });
    renderWeeklyChart(weeks);
}

async function loadUserRole() {
    const info = await apiRequest("/me");
    if (info.role) {
        if (info.role !== "user") {
            location.href = "dashboard_admin.html";
            return;
        }
        document.getElementById("user-name").textContent = info.name || "";
        document.getElementById("user-role").textContent = "";
    }
}

document.getElementById("logout").addEventListener("click", async () => {
    await apiRequest("/logout", { method: "POST" });
    location.href = "login.html";
});

loadDashboard();
loadUserRole();
