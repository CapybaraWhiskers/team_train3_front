const translations = {
  en: {
    login_welcome: "Welcome to WorkFlow",
    login_prompt: "Sign in with your company account to continue",
    login_ms_btn: "Sign in with Microsoft",
    login_signin_btn: "Sign In",
    login_signup_link: "Don't have an account? Sign up",

    register_welcome: "Welcome to WorkWise",
    register_create_btn: "Create",
    register_back_login: "Back to Login",

    nav_attendance: "Attendance",
    nav_dashboard: "Dashboard",
    nav_reports: "Reports",
    nav_logout: "Logout",

    attendance_heading: "Attendance",
    clock_in: "Clock In",
    clock_out: "Clock Out",
    monthly_summary: "Monthly Summary",
    monthly_report: "Monthly Report",
    total_working_hours: "Total Working Hours",
    utilization_rate: "Utilization Rate",
    monthly_working_hours: "Monthly Working Hours",
    this_month: "This Month",

    report_heading: "Daily Report Submission",
    report_prompt: "Please submit your daily report below. Ensure you have clocked in for the day before submitting.",
    report_placeholder: "Write your daily report here using Markdown",
    preview_btn: "Preview",
    submit_report_btn: "Submit Report",
    submitted_reports: "Submitted Reports",
    date_to: "to",
    attendance_warning: "Cannot submit a report because today's attendance is not recorded.",

    admin_overview_title: "Attendance Overview",
    admin_overview_desc: "Current month's attendance records for all employees.",
    employee_name: "Employee Name",
    total_hours: "Total Hours",
    export_csv: "Export to CSV"
  },
  ja: {
    login_welcome: "WorkFlow\u3078\u3088\u3046\u3053\u305d",
    login_prompt: "\u7d9a\u884c\u3059\u308b\u306b\u306f\u4f1a\u793e\u30a2\u30ab\u30a6\u30f3\u30c8\u3067\u30b5\u30a4\u30f3\u30a4\u30f3\u3057\u3066\u304f\u3060\u3055\u3044",
    login_ms_btn: "Microsoft\u3067\u30b5\u30a4\u30f3\u30a4\u30f3",
    login_signin_btn: "\u30b5\u30a4\u30f3\u30a4\u30f3",
    login_signup_link: "\u30a2\u30ab\u30a6\u30f3\u30c8\u3092\u304a\u6301\u3061\u3067\u306f\u306a\u3044\u3067\u3059\u304b? \u767b\u9332\u3059\u308b",

    register_welcome: "WorkWise\u3078\u3088\u3046\u3053\u305d",
    register_create_btn: "\u4f5c\u6210",
    register_back_login: "\u30ed\u30b0\u30a4\u30f3\u306b\u623b\u308b",

    nav_attendance: "\u52e4\u6020",
    nav_dashboard: "\u30c0\u30c3\u30b7\u30e5\u30dc\u30fc\u30c9",
    nav_reports: "\u30ec\u30dd\u30fc\u30c8",
    nav_logout: "\u30ed\u30b0\u30a2\u30a6\u30c8",

    attendance_heading: "\u52e4\u6020",
    clock_in: "\u51fa\u52e4",
    clock_out: "\u9000\u52e4",
    monthly_summary: "\u6708\u6b21\u30b5\u30de\u30ea\u30fc",
    monthly_report: "\u6708\u6b21\u30ec\u30dd\u30fc\u30c8",
    total_working_hours: "\u7dcf\u52e4\u52d9\u6642\u9593",
    utilization_rate: "\u52e4\u52d9\u7387",
    monthly_working_hours: "\u6708\u9593\u52e4\u52d9\u6642\u9593",
    this_month: "\u4eca\u6708",

    report_heading: "\u65e5\u5831\u306e\u63d0\u51fa",
    report_prompt: "\u4ee5\u4e0b\u306b\u65e5\u5831\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u63d0\u51fa\u524d\u306b\u51fa\u52e4\u3057\u3066\u3044\u308b\u304b\u78ba\u8a8d\u3057\u3066\u304f\u3060\u3055\u3044\u3002",
    report_placeholder: "Markdown\u5f62\u5f0f\u3067\u65e5\u5831\u3092\u8a18\u5165\u3057\u3066\u304f\u3060\u3055\u3044",
    preview_btn: "\u30d7\u30ec\u30d3\u30e5\u30fc",
    submit_report_btn: "\u9001\u4fe1",
    submitted_reports: "\u63d0\u51fa\u6e08\u307f\u30ec\u30dd\u30fc\u30c8",
    date_to: "\u304b\u3089",
    attendance_warning: "\u672c\u65e5\u306e\u51fa\u52e4\u304c\u8a18\u9332\u3055\u308c\u3066\u3044\u306a\u3044\u305f\u3081\u3001\u65e5\u5831\u3092\u63d0\u51fa\u3067\u304d\u307e\u305b\u3093。",

    admin_overview_title: "\u52e4\u6020\u6982\u8981",
    admin_overview_desc: "\u4eca\u6708\u306e\u5168\u5de5\u54e1\u306e\u52e4\u6020\u8a18\u9332\u3067\u3059\u3002",
    employee_name: "\u5f93\u696d\u54e1\u540d",
    total_hours: "\u5408\u8a08\u6642\u9593",
    export_csv: "CSV\u51fa\u529b"
  }
};

function t(key) {
  const lang = localStorage.getItem('lang') || 'ja';
  return translations[lang][key] || key;
}

function applyTranslations() {
  const lang = localStorage.getItem('lang') || 'ja';
  document.documentElement.lang = lang;
  const checkbox = document.getElementById('lang-toggle-checkbox');
  const label = document.getElementById('lang-toggle-label');
  if (checkbox) {
    checkbox.checked = lang === 'en';
  }
  if (label) {
    label.textContent = 'EN';
  }
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = translations[lang][key];
    if (!text) return;
    if (el.placeholder !== undefined && el.tagName !== 'SELECT') {
      el.placeholder = text;
    } else {
      el.textContent = text;
    }
  });
}

function initLangSwitch() {
  const checkbox = document.getElementById('lang-toggle-checkbox');
  if (checkbox) {
    checkbox.addEventListener('change', () => {
      const lang = checkbox.checked ? 'en' : 'ja';
      localStorage.setItem('lang', lang);
      applyTranslations();
      if (typeof checkAttendanceAndToggleReport === 'function') {
        checkAttendanceAndToggleReport();
      }
    });
  }
  applyTranslations();
}

document.addEventListener('DOMContentLoaded', initLangSwitch);

