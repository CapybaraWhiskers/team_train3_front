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

// Ensure line breaks are rendered in markdown output
if (window.marked) {
    marked.setOptions({ gfm: true, breaks: true });
}

function formatTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
    });
}

async function loadUserRole() {
    const info = await apiRequest("/me");
    if (info.role) {
        document.getElementById("user-name").textContent = info.name || "";
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

async function submitReport() {
    const content = document.getElementById("report-text").value.trim();
    if (!content) {
        alert("Please enter your daily report.");
        return;
    }
    const res = await apiRequest("/report/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
    });
    if (res.status === "success") {
        document.getElementById("report-text").value = "";
        loadReports();
    } else {
        alert(res.error || "Failed to submit.");
    }
}

let allReports = [];
let filterState = { name: '', keyword: '', start: '', end: '' };

function renderReportsForRange() {
    const container = document.getElementById("reports");
    container.innerHTML = "";
    // 日付範囲はfilterStateから取得
    const startStr = filterState.start || document.getElementById("report-start").value;
    const endStr = filterState.end || document.getElementById("report-end").value;
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;
    if (end) {
        end.setDate(end.getDate() + 1);
    }
    // フィルタ値もfilterStateから取得
    const nameFilter = (filterState.name || "").toLowerCase();
    const keywordFilter = (filterState.keyword || "").toLowerCase();
    if (!Array.isArray(allReports)) return;
    let count = 0;
    allReports.forEach((r) => {
        const ts = new Date(r.timestamp);
        if ((!start || ts >= start) && (!end || ts < end)) {
            const name = r.name || "";
            const content = r.content || "";
            if (
                (nameFilter && !name.toLowerCase().includes(nameFilter)) ||
                (keywordFilter && !content.toLowerCase().includes(keywordFilter))
            ) {
                return;
            }
            const div = document.createElement("div");
            const time = formatTime(r.timestamp);
            div.innerHTML =
                `<strong>${name}</strong> <span class=\"text-sm text-[#637588]\">${time}</span><div>` +
                marked.parse(content) +
                "</div>";
            container.appendChild(div);
            count++;
        }
    });
    if (count === 0) {
        container.innerHTML = '<div class="text-[#637588]">該当するレポートはありません</div>';
    }
}

async function loadReports() {
    allReports = await apiRequest("/reports");
    // 初期表示時は全件表示
    filterState = { name: '', keyword: '', start: '', end: '' };
    renderReportsForRange();
}

// 検索ボタンでフィルタ反映
function setupFilterEvents() {
    document.getElementById("filter-search").addEventListener("click", () => {
        filterState.name = document.getElementById("filter-name").value;
        filterState.keyword = document.getElementById("filter-keyword").value;
        filterState.start = document.getElementById("report-start").value;
        filterState.end = document.getElementById("report-end").value;
        renderReportsForRange();
    });
}

async function checkAttendanceAndToggleReport() {
    const data = await apiRequest("/attendance/today");
    const clockIn = data.clock_in;
    const reportText = document.getElementById("report-text");
    const submitBtn = document.getElementById("submit-report");
    if (!clockIn) {
        reportText.disabled = true;
        submitBtn.disabled = true;
        // 既にメッセージがある場合は更新、無い場合は作成
        let warn = document.getElementById("attendance-warning");
        if (!warn) {
            warn = document.createElement("div");
            warn.id = "attendance-warning";
            warn.className = "text-red-600 px-4 pb-2";
            reportText.parentNode.insertBefore(warn, reportText);
        }
        warn.textContent = t('attendance_warning');
    } else {
        reportText.disabled = false;
        // 入力が空の場合は送信ボタンを無効化
        submitBtn.disabled = reportText.value.trim() === "";
        const warn = document.getElementById("attendance-warning");
        if (warn) warn.remove();
    }
}

document
    .getElementById("submit-report")
    .addEventListener("click", submitReport);
document.getElementById("report-text").addEventListener("input", (e) => {
    document.getElementById("submit-report").disabled =
        e.target.value.trim() === "";
});
document.getElementById("preview").addEventListener("click", () => {
    const content = document.getElementById("report-text").value;
    document.getElementById("modal-body").innerHTML = marked.parse(content);
    document.getElementById("preview-modal").style.display = "flex";
});
document.getElementById("close-preview").addEventListener("click", () => {
    document.getElementById("preview-modal").style.display = "none";
});
document.getElementById("logout").addEventListener("click", async () => {
    await apiRequest("/logout", { method: "POST" });
    location.href = "login.html";
});

// 日付初期値セットとイベント
const startInput = document.getElementById("report-start");
const endInput = document.getElementById("report-end");
if (startInput && endInput) {
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    startInput.value = weekAgo.toISOString().slice(0, 10);
    endInput.value = today.toISOString().slice(0, 10);
    startInput.addEventListener("change", renderReportsForRange);
    endInput.addEventListener("change", renderReportsForRange);
}

loadReports();
setupFilterEvents();
loadUserRole();
checkAttendanceAndToggleReport();
document.getElementById("submit-report").disabled = true;
// テキストエリアの入力時にも再チェック
const reportText = document.getElementById("report-text");
if (reportText) {
    reportText.addEventListener("input", checkAttendanceAndToggleReport);
}
