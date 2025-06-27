const msalConfig = {
    auth: {
        clientId: "55dee2e6-14ed-4381-9b58-b81e03a89893",
        authority:
            "https://login.microsoftonline.com/5d05d5a9-8aeb-4ac4-804c-99e30cbc84e2",
        redirectUri: "https://48.210.13.130", // 本番用にhttpsへ変更
    },
};
const msalInstance = new msal.PublicClientApplication(msalConfig);
const loginRequest = { scopes: ["User.Read"] };

// Microsoftサインインボタン
const msBtn = document.querySelector("button span")?.closest("button");
if (msBtn) {
    msBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await msalInstance.loginPopup(loginRequest);
            const account = response.account;
            // 管理者判定: メールアドレスやドメイン、groups等で判定（例: admin@xxx.co.jp など）
            // ここでは例としてメールアドレスで判定
            let role = "user";
            if (account.username.endsWith("@admin-domain.com")) {
                role = "admin";
                localStorage.setItem("role", "admin");
            } else {
                localStorage.setItem("role", "user");
            }
            // サーバーにセッションセット要求
            const res = await fetch("/msal-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: account.username,
                    name: account.name || account.username,
                    role: role,
                }),
            });
            if (res.ok) {
                window.location.href = "attendance.html";
            } else {
                alert("サーバーログイン処理に失敗しました");
            }
        } catch (err) {
            alert("Microsoft認証に失敗しました: " + err.message);
        }
    });
}

// ...既存のフォームログイン処理...
async function apiRequest(path, options = {}) {
    options.headers = options.headers || {};
    options.headers["Accept-Language"] = localStorage.getItem("lang") || "ja";
    const res = await fetch(path, options);
    return res.json();
}

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const res = await apiRequest("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (res.status === "logged_in") {
        location.href = "attendance.html";
    } else {
        alert(res.error || "Login failed.");
    }
});
