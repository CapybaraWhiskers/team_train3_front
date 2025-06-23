# 社内勤怠・日報管理アプリ

このリポジトリは、Flask を用いたバックエンドとシンプルなフロントエンド、SQLite データベースを Docker Compose で動作させるローカル開発環境です。勤怠の打刻と Markdown 形式の日報投稿をブラウザから行えます。

## 前提条件

- Docker 20.10 以上
- Docker Compose 1.29 以上 (Compose V2 でも可)

## ローカルセットアップ

1. `.env` ファイルを作成します。サンプルとして `.env.example` を用意しています。

   ```env
   FLASK_ENV=development
   DB_PATH=/db/app.db
   API_HOST=backend
   API_PORT=5000
   ```

2. コンテナを起動します。

   ```bash
   docker compose up --build
   ```

   フロントエンドは <http://localhost:8080>、API は <http://localhost:5000> で利用できます。

## 環境変数

- **FLASK_ENV**: Flask の実行モード。開発用では `development` を指定します。
- **DB_PATH**: SQLite データベースファイルのパス。デフォルトでは `db/` ディレクトリ配下に `app.db` が作成されます。
- **API_HOST**: サービス内部で参照するバックエンドホスト名。通常は変更不要です。
- **API_PORT**: バックエンドが待ち受けるポート番号。Docker Compose で同じ番号がホストに公開されます。

## データベースファイル

データはコンテナの `db/` ボリュームに保存されます。プロジェクト直下に自動生成される `db/app.db` が SQLite ファイルです。

## API 使用例

以下はいずれも `localhost` 上での実行例です。

```bash
# 勤怠打刻（出勤）
curl -X POST http://localhost:5000/attendance/clock-in

# 勤怠打刻（退勤）
curl -X POST http://localhost:5000/attendance/clock-out

# 日報登録（JSON で内容を送信）
curl -X POST http://localhost:5000/report/ \
     -H "Content-Type: application/json" \
     -d '{"content": "本日の作業内容"}'

# 日報一覧取得
curl http://localhost:5000/reports
```

## ディレクトリ構成

```text
.
├── backend        # Flask アプリケーション
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── frontend       # 静的ファイルと簡易 SPA
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   └── src
│       ├── app.js
│       ├── style.css
│       └── vendor
├── docker-compose.yml
└── README.md
```

## Azure へのデプロイ

GitHub Actions ワークフロー `.github/workflows/azure.yml` を利用すると、Azure Web App for Containers へデプロイできます。

1. Azure Container Registry と Web App を作成します。
2. リポジトリの Secrets に以下を登録します。
   - `AZURE_CREDENTIALS`: `az ad sp create-for-rbac` の出力 JSON
   - `ACR_USERNAME` / `ACR_PASSWORD`: Container Registry の資格情報
3. `azure.yml` 内の `AZURE_WEBAPP_NAME` などの変数を環境に合わせて変更します。
4. `main` ブランチへ push するとイメージがビルドされ Web App へ自動デプロイされます。

Web App 側で `WEBSITES_PORT=5000` を設定しておくと、Flask アプリをそのまま動かせます。

## 注意事項

このリポジトリは主にローカル開発用の構成ですが、上記ワークフローを利用することで簡易的に Azure 環境へ公開することも可能です。

