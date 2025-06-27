let allReports = [];

// フィルタUIの追加
function addReportFilters() {
    const container = document.getElementById("reports");
    if (!container) return;
    // 既にフィルタがあればスキップ
    if (document.getElementById("report-filter-row")) return;
    const filterRow = document.createElement("div");
    filterRow.id = "report-filter-row";
    filterRow.className = "flex gap-2 mb-4";
    filterRow.innerHTML = `
        <input id="filter-name" type="text" placeholder="投稿者名で絞り込み" class="form-input w-40" />
        <input id="filter-keyword" type="text" placeholder="キーワードで絞り込み" class="form-input w-60" />
    `;
    container.parentNode.insertBefore(filterRow, container);
    document.getElementById("filter-name").addEventListener("input", renderReportsForRange);
    document.getElementById("filter-keyword").addEventListener("input", renderReportsForRange);
}

function renderReportsForRange() {
    const container = document.getElementById("reports");
    container.innerHTML = "";
    const startStr = document.getElementById("report-start").value;
    const endStr = document.getElementById("report-end").value;
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;
    if (end) {
        end.setDate(end.getDate() + 1);
    }
    // フィルタ値取得
    const nameFilter = (document.getElementById("filter-name")?.value || "").toLowerCase();
    const keywordFilter = (document.getElementById("filter-keyword")?.value || "").toLowerCase();
    if (!Array.isArray(allReports)) return;
    allReports.forEach((r) => {
        const ts = new Date(r.timestamp);
        if ((!start || ts >= start) && (!end || ts < end)) {
            // 名前・キーワードフィルタ
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
                `<strong>${name}</strong> <span class="text-sm text-[#637588]">${time}</span><div>` +
                marked.parse(content) +
                "</div>";
            container.appendChild(div);
        }
    });
}

async function loadReports() {
    allReports = await apiRequest("/reports");
    addReportFilters();
    renderReportsForRange();
}