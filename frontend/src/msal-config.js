// Microsoft Entra ID (Azure AD) 認証用MSAL設定
// 必要に応じてclientId, tenantId, redirectUriを書き換えてください
export const msalConfig = {
  auth: {
    clientId: "55dee2e6-14ed-4381-9b58-b81e03a89893", // Azureポータルで取得
    authority: "https://login.microsoftonline.com/5d05d5a9-8aeb-4ac4-804c-99e30cbc84e2", // Azureポータルで取得
    redirectUri: "https://48.210.13.130", // 本番用にhttpsへ変更
  },
};

export const loginRequest = {
  scopes: ["User.Read"] // 必要に応じてスコープ追加
};
