# Nuxt3 Auth 第三方登入整合專案

這個專案是一個基於 Nuxt3 的認證系統，專門用於整合多種第三方登入方式，包括 Google、GitHub、Apple、Facebook 和 Line 等。透過這個專案，開發者可以輕鬆地在自己的應用程式中實現多種登入選項，提升用戶體驗並簡化註冊流程。

## 安裝

```bash
# pnpm
pnpm install
```

## 開發伺服器

在 `http://localhost:3000` 啟動開發伺服器：

```bash
# pnpm
pnpm dev
```

## 生產環境

為生產環境建構應用程式：

```bash
# pnpm
pnpm build
```

在本地預覽生產環境建構：

```bash
# pnpm
pnpm preview
```

# 第三方登入設定指南

## 目錄
1. [Google 登入設定](#google-登入設定)
2. [GitHub 登入設定](#github-登入設定)
3. [Apple 登入設定](#apple-登入設定)
4. [Facebook 登入設定](#facebook-登入設定)
5. [Line 登入設定](#line-登入設定)

---

## Google 登入設定

### 步驟一：建立 Google Cloud 專案
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 登入您的 Google 帳戶
3. 點擊頁面上方的專案選擇器，然後點擊「新增專案」
4. 輸入專案名稱，然後點擊「建立」

### 步驟二：設定 OAuth 同意畫面
1. 在側邊欄中選擇「API 和服務」>「OAuth 同意畫面」
2. 選擇使用者類型（外部或內部），然後點擊「建立」
3. 填寫必要資訊：
   - 應用程式名稱
   - 使用者支援電子郵件
   - 開發人員聯絡資訊
4. 點擊「儲存並繼續」

### 步驟三：新增範圍
1. 在「範圍」頁面中，點擊「新增或移除範圍」
2. 選擇以下範圍：
   - `openid`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
3. 點擊「更新」，然後「儲存並繼續」

### 步驟四：新增測試使用者
1. 在「測試使用者」頁面，點擊「新增使用者」
2. 輸入測試使用者的電子郵件地址
3. 點擊「儲存並繼續」

### 步驟五：建立 OAuth 憑證
1. 在側邊欄中選擇「API 和服務」>「憑證」
2. 點擊「建立憑證」>「OAuth 用戶端 ID」
3. 選擇應用程式類型為「Web 應用程式」
4. 輸入名稱
5. 在「已授權的重新導向 URI」中，新增：
   - `http://localhost:3000/api/auth/callback/google`（本地開發環境）
   - `https://您的網域.com/api/auth/callback/google`（生產環境）
6. 點擊「建立」

### 獲取 Client ID 和 Client Secret
建立後，您將看到一個彈出視窗，顯示您的 Client ID 和 Client Secret。請複製這些值並妥善保存。這些值將需要設定在您的 `.env` 檔案中：

```
GOOGLE_CLIENT_ID=您的Client_ID
GOOGLE_CLIENT_SECRET=您的Client_Secret
```

---

## GitHub 登入設定

### 步驟一：建立新的 OAuth 應用程式
1. 登入您的 GitHub 帳戶
2. 前往 [GitHub Developer Settings](https://github.com/settings/developers)
3. 選擇「OAuth Apps」標籤
4. 點擊「New OAuth App」按鈕

### 步驟二：設定 OAuth 應用程式
1. 填寫應用程式資訊：
   - Application name：您的應用程式名稱
   - Homepage URL：您的應用程式主頁 URL
   - Application description（選填）：簡短描述您的應用程式
   - Authorization callback URL：
     - `http://localhost:3000/api/auth/callback/github`（本地開發環境）
     - `https://您的網域.com/api/auth/callback/github`（生產環境）
2. 點擊「Register application」按鈕

### 獲取 Client ID 和 Client Secret
註冊後，您將看到應用程式詳情頁面，其中顯示 Client ID。若要生成 Client Secret：

1. 點擊「Generate a new client secret」按鈕
2. 複製顯示的 Client Secret（注意：此值只會顯示一次）

將這些值設定在您的 `.env` 檔案中：

```
GITHUB_CLIENT_ID=您的Client_ID
GITHUB_CLIENT_SECRET=您的Client_Secret
```

---

## Apple 登入設定

### 步驟一：註冊 Apple Developer 帳戶
1. 前往 [Apple Developer Program](https://developer.apple.com/programs/)
2. 註冊或登入您的 Apple Developer 帳戶（需要支付年費）

### 步驟二：建立 App ID
1. 前往 [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list)
2. 點擊「+」按鈕，選擇「App IDs」
3. 選擇「App」作為類型，點擊「Continue」
4. 輸入描述和 Bundle ID（通常格式為：com.您的域名.應用名稱）
5. 在「Capabilities」部分，選擇「Sign In with Apple」
6. 點擊「Continue」，然後「Register」

### 步驟三：建立 Services ID
1. 再次前往「Identifiers」頁面
2. 點擊「+」按鈕，選擇「Services IDs」
3. 輸入描述和 Identifier（通常格式為：com.您的域名.服務名稱）
4. 點擊「Continue」，然後「Register」

### 步驟四：設定 Services ID
1. 在 Services ID 列表中，點擊剛建立的 Services ID
2. 選擇「Sign In with Apple」，點擊「Configure」
3. 選擇之前建立的 App ID 作為 Primary App ID
4. 在「Website URLs」中，新增：
   - Domains：您的域名（例如 `example.com`）
   - Return URLs：
     - `http://localhost:3000/api/auth/callback/apple`（本地開發環境）
     - `https://您的網域.com/api/auth/callback/apple`（生產環境）
5. 點擊「Save」，然後「Continue」和「Save」

### 步驟五：建立私鑰
1. 前往「Keys」頁面
2. 點擊「+」按鈕，新增新的密鑰
3. 輸入密鑰名稱
4. 選擇「Sign In with Apple」，點擊「Configure」
5. 選擇之前建立的 App ID
6. 點擊「Save」，然後「Continue」和「Register」
7. 下載私鑰（`.p8` 檔案），並記下 Key ID

### 獲取 Client ID、Client Secret 和其他必要資訊
1. Client ID：這是您的 Services ID（例如 `com.您的域名.服務名稱`）
2. Team ID：這在您的 Apple Developer 帳戶頁面右上角顯示
3. Key ID：這是您之前建立私鑰時的 Key ID
4. Client Secret：您需要使用下載的 `.p8` 檔案生成 JWT Token（這可能需要額外的程式碼）

在您的 `.env` 檔案中設定：

```
APPLE_CLIENT_ID=您的Services_ID
APPLE_CLIENT_SECRET=您的生成的JWT_Token
APPLE_KEY_ID=您的Key_ID
APPLE_TEAM_ID=您的Team_ID
```

---

## Facebook 登入設定

### 步驟一：建立 Facebook 開發者帳戶
1. 前往 [Facebook for Developers](https://developers.facebook.com/)
2. 登入您的 Facebook 帳戶
3. 若尚未註冊為開發者，請完成開發者註冊流程

### 步驟二：建立新應用程式
1. 在開發者面板，點擊「My Apps」
2. 點擊「Create App」
3. 選擇適合您應用程式的類型（例如「Consumer」或「Business」）
4. 輸入應用程式名稱，選擇 App 用途
5. 點擊「Create App」

### 步驟三：設定 Facebook 登入
1. 在左側導航欄找到「Products」
2. 找到「Facebook Login」並點擊「Set Up」
3. 選擇「Web」平台
4. 輸入您的網站 URL，然後點擊「Save」

### 步驟四：設定 OAuth 重定向 URI
1. 在左側導航欄，找到「Facebook Login」>「Settings」
2. 在「Valid OAuth Redirect URIs」欄位中，添加：
   - `http://localhost:3000/api/auth/callback/facebook`（本地開發環境）
   - `https://您的網域.com/api/auth/callback/facebook`（生產環境）
3. 點擊「Save Changes」

### 步驟五：設定基本資訊
1. 在左側導航欄，找到「Settings」>「Basic」
2. 填寫所有必要的欄位：
   - 應用程式圖示
   - 隱私政策 URL
   - 應用程式域名
   - 聯絡電子郵件

### 獲取 Client ID 和 Client Secret
在「Settings」>「Basic」頁面，您可以找到：
1. App ID（這是您的 Client ID）
2. App Secret（這是您的 Client Secret）。點擊「Show」來查看完整的密鑰。

將這些值設定在您的 `.env` 檔案中：

```
FACEBOOK_CLIENT_ID=您的App_ID
FACEBOOK_CLIENT_SECRET=您的App_Secret
```

---

## Line 登入設定

### 步驟一：建立 Line 開發者帳戶
1. 前往 [Line Developers Console](https://developers.line.biz/console/)
2. 登入您的 Line 帳戶
3. 若尚未註冊為開發者，請完成開發者註冊流程

### 步驟二：建立新的 Provider
1. 在 Providers 列表頁面，點擊「Create」
2. 輸入 Provider 名稱，然後點擊「Create」

### 步驟三：建立新的頻道（Channel）
1. 選擇剛建立的 Provider
2. 點擊「Create a new channel」
3. 選擇「LINE Login」作為頻道類型
4. 填寫頻道資訊：
   - 頻道名稱
   - 頻道描述
   - 頻道圖示
   - 隱私政策 URL
   - 服務條款 URL
5. 點擊「Create」

### 步驟四：設定頻道
1. 在頻道設定頁面，找到「LINE Login settings」部分
2. 在「Callback URL」欄位中，添加：
   - `http://localhost:3000/api/auth/callback/line`（本地開發環境）
   - `https://您的網域.com/api/auth/callback/line`（生產環境）
3. 開啟「Web app」選項
4. 設定「Scope」，至少選擇：
   - `profile`
   - `openid`
   - `email`（如果需要用戶電子郵件）
5. 點擊「Update」

### 步驟五：設定額外選項（如需要）
1. 若您的應用需要，可設定「OpenID Connect」
2. 可以在「Bot settings」部分設定聊天機器人功能

### 獲取 Client ID 和 Client Secret
在頻道基本資訊頁面，您可以找到：
1. Channel ID（這是您的 Client ID）
2. Channel Secret（這是您的 Client Secret）

將這些值設定在您的 `.env` 檔案中：

```
LINE_CLIENT_ID=您的Channel_ID
LINE_CLIENT_SECRET=您的Channel_Secret
```

---

## 一般注意事項

### 安全性建議
1. 永遠不要在公開的代碼庫中存儲您的 Client Secret
2. 使用環境變數（如 `.env` 檔案）來保存敏感資訊
3. 在生產環境中，確保使用 HTTPS
4. 定期更新您的 Client Secret

### 回調 URL 格式
對於所有提供者，回調 URL 格式為：
- 本地開發環境：`http://localhost:3000/api/auth/callback/[provider]`
- 生產環境：`https://您的網域.com/api/auth/callback/[provider]`

其中 `[provider]` 是提供者名稱（`google`、`github`、`apple`、`facebook` 或 `line`）。

### 設定完成後的驗證
1. 在本地環境運行應用程式
2. 測試登入流程
3. 檢查是否成功獲取用戶資訊
4. 部署到生產環境前再次測試

若在設定過程中遇到任何問題，請參考各提供者的官方文檔或支援頁面。
