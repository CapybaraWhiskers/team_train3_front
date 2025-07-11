async function apiRequest(path, options = {}) {
    options.headers = options.headers || {};
    options.headers['Accept-Language'] = localStorage.getItem('lang') || 'ja';
    const res = await fetch(path, options);
    if (res.status === 401) {
        location.href = "login.html";
        return {};
    }
    return res.json();
}

function showAttendance(msg) {
    document.getElementById("attendance-msg").textContent = msg;
}

let lastClockIn = null;
let lastClockOut = null;

function renderAttendance() {
    if (lastClockIn) {
        document.getElementById("attendance-msg").textContent = formatTime(lastClockIn);
    } else {
        document.getElementById("attendance-msg").textContent = "Not Recorded";
    }
    if (lastClockOut) {
        document.getElementById("monthly-hours").textContent = formatTime(lastClockOut);
    } else {
        document.getElementById("monthly-hours").textContent = "Not Recorded";
    }
}

async function loadTodayAttendance() {
    const data = await apiRequest("/attendance/today");
    lastClockIn = data.clock_in || null;
    lastClockOut = data.clock_out || null;
    renderAttendance();
}

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        timeZone: "Asia/Tokyo",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    });
}

let currentName = "";

async function loadUserRole() {
    const info = await apiRequest("/me");
    if (info.role) {
        currentName = info.name || "";
        document.getElementById("user-name").textContent = currentName;
        const roleLabel = info.role === "admin" ? "Admin" : "";
        document.getElementById("user-role").textContent = roleLabel;
        const link = document.getElementById("dashboard-link");
        if (link) {
            link.href =
                info.role === "admin"
                    ? "dashboard_admin.html"
                    : "dashboard_user.html";
        }
    }
}

async function loadMonthlySummary() {
    const data = await apiRequest("/dashboard");
    if (!data.totals || !currentName) return;
    const hours = data.totals[currentName];
    if (hours === undefined) return;
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    // 月集計は別ID（例: monthly-summary）に表示する
    const summaryElem = document.getElementById("monthly-summary");
    if (summaryElem) {
        summaryElem.textContent = `${h}h ${m}m`;
    }
}

async function clockIn() {
    const data = await apiRequest("/attendance/clock-in", { method: "POST" });
    if (data.timestamp) {
        lastClockIn = data.timestamp;
        lastClockOut = null;
        renderAttendance();
        await loadMonthlySummary();
    }
}

async function clockOut() {
    const data = await apiRequest("/attendance/clock-out", { method: "POST" });
    if (data.timestamp) {
        lastClockOut = data.timestamp;
        renderAttendance();
        await loadMonthlySummary();
    }
}

document.getElementById("clock-in").addEventListener("click", clockIn);
document.getElementById("clock-out").addEventListener("click", clockOut);
document.getElementById("logout").addEventListener("click", async () => {
    await apiRequest("/logout", { method: "POST" });
    location.href = "login.html";
});

loadUserRole().then(() => {
    loadMonthlySummary();
    loadTodayAttendance();
});
