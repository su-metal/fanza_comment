# 開発環境（ローカルCodex / Codex Cloud）

最終更新日: 2026-10-24

## 共通ルール

- 既存GitHubリポジトリをソースの受け渡し元にする。クラウド作業からローカルへ戻す場合も、コミット・Pull RequestなどGitHub経由で共有する
- Codex Cloudの各タスクは独立した作業環境で始まる。GitHubへ反映していないローカルの変更、Chromeの `chrome.storage.local` にあるメモ、ローカル環境変数はクラウドへ渡らない
- ローカルとクラウドで同じブランチを同時に編集せず、作業ごとのブランチを使う。作業開始前に未コミット変更を確認し、意図しない差分を巻き込まない
- `.env*`、`.secret.local`、サービスアカウント鍵、`node_modules`、ビルド生成物はコミットしない。秘密情報やローカルのコメントデータをチャット・ログ・Gitへ書き出さない
- GitHubへPushする前に、リポジトリ、ブランチ、コミット一覧、差分を確認する。このプロジェクトではPush前にユーザー確認を得る

## 複数レーンでの並行作業

調査・改善の対象を分離できる場合は、次の3レーンと統括役に分ける。タスク開始時に目的と担当範囲を決め、同じファイルを複数レーンが同時に編集しない。

| レーン | 標準担当 | 境界 |
| --- | --- | --- |
| 認知施策・計測 | 既存原稿と公開済み製品事実の照合、配信台帳、Search ConsoleやAnalytics等の計測状況 | 新規原稿は依頼範囲に従う。X投稿・記事公開は明示指示なしに行わない |
| LP・SEO | canonical、多言語表示、検索登録、Web Analytics等のWeb面 | 拡張版ZIP・配布用スクリーンショットは担当範囲に含めない |
| 拡張機能 | 現行公開版と未公開案の比較、拡張機能コード・UIの変更 | LPや共通資料は変更しない |
| 統括役 | 公開状態と要件の整合、依存関係確認、差分統合と全体報告 | `AGENTS.md` と `docs/requirements_definition.md` の変更が必要なら同期する |

### 作業の進め方

1. 着手時に対象ブランチ・基準コミット、レーンごとの所有ファイル、禁止事項、成果物を記録する。
2. 可能ならレーンごとに独立したworktree/ブランチを使う。同一ブランチを複数環境から同時編集しない。
3. 独立環境を用意できない場合は共有checkoutを使ってよいが、ファイルの所有者をレーン単位で固定し、範囲を重ねない。worktree作成後にGit操作が正常に行えることを確認し、無効なcheckoutは使わない。
4. 各レーンは変更ファイル、根拠・確認結果、未確認事項、ブロッカーを統括役に返す。統括役は公開中の状態と要件資料を照合し、重複・競合を解消して差分を統合する。
5. X投稿、記事公開、課金設定変更、Push、デプロイなど外部状態を変える操作は、作業の明示的な許可範囲を超えて行わない。Push前には対象リポジトリ・ブランチ・コミット・差分を提示してユーザー確認を得る。

依存する成果物（例: 拡張機能の画面を撮影してLPへ掲載する場合）は、元成果物を担当レーンで確定してから後続レーンに渡す。独立して確認できる項目は並行して進めてよい。

## 必要なツール

- Node.js 22
- npm（Node.jsに同梱）
- Firebase Emulatorを使う場合はFirebase CLI。CLIは以下の例のように `npx` から実行できる
- Chrome拡張の画面確認にはGoogle Chrome

FunctionsはNode.js 22を指定している。依存関係はロックファイルを使ってインストールする。

## 初期セットアップ

リポジトリのルートで実行する。

```sh
npm ci --prefix functions
npm run --prefix functions build
```

拡張機能のJavaScriptは現状バンドル工程を持たない。Chromeで `chrome://extensions` を開き、デベロッパーモードを有効にして、リポジトリ内の `extension` フォルダを読み込む。

マーケティング用画像生成ツールを変更する場合に限り、そのディレクトリの依存関係を追加する。

```sh
npm ci --prefix scripts/promo_generator
```

## ビルド・テスト

- Firebase FunctionsのTypeScriptビルド: `npm run --prefix functions build`
- `functions/package.json` に自動テスト用の `test` スクリプトはない
- 拡張機能にも現状テストランナーはないため、変更内容に応じてビルド・Emulator・Chrome上の手動確認を行う
- `scripts/promo_generator` の `test` は未設定を示す仮スクリプトで、実テストではない

Firebase Emulatorを使うときは、リポジトリのルートから次を実行する。`demo-scene-memo` を指定し、本番Firebaseプロジェクトを使わない。

```sh
npx --yes firebase-tools@latest emulators:start --only functions,firestore --project demo-scene-memo
```

- Functions: `http://127.0.0.1:5001`
- Firestore: `127.0.0.1:8080`
- Emulator UI: `http://127.0.0.1:4000`
- 停止: 起動したターミナルで `Ctrl+C`

TypeScriptビルドだけならStripeやFirebaseの認証情報は不要。Checkout/WebhookをEmulatorで検証するときは、Stripe test modeの値と `LICENSE_TOKEN_SECRET` をこの目的専用に用意し、Functionsディレクトリ内の `.env.local` / `.secret.local` に設定する。Production用のStripeキー、Webhook secret、ライセンス署名Secretは使わない。必要な変数名・Emulator検証手順は `docs/firebase_migration.md` を参照する。

Emulatorや依存パッケージのダウンロードがCodex Cloudのネットワーク制限で失敗する場合は、環境設定で失敗した配布元ドメインだけを確認して許可する。ビルドだけを行う環境にStripeやFirebaseの本番Secretを登録する必要はない。

## LPのCloudflare Pages自動デプロイ

`scene-memo-LP/` は静的サイトの配布元。`.github/workflows/deploy-scene-memo-pages.yml` は `en_language` ブランチ上でLPファイルが更新されたとき、既存のCloudflare Pages `scene-memo` プロジェクトへWranglerでデプロイし、Production branch `main` に反映する。PR #9は `en_language` にマージ済みで、2026-10-25にGitHub Actions run `40165595407` の本番デプロイ成功を確認した。

デプロイ用のCloudflare API TokenとAccount IDはGitHub Actions Secretsに設定済み。設定値はソースコード、コミット、チャットに記載しない。

- `CLOUDFLARE_API_TOKEN`: Account / Cloudflare Pages / Edit
- `CLOUDFLARE_ACCOUNT_ID`: CloudflareアカウントID

`en_language` の `scene-memo-LP/` を更新してPushすると、ZIPを手動アップロードせずに本番へ反映できる。標準のUbuntu GitHub-hosted runnerを使うため、公開リポジトリではGitHub Actionsの実行料金はかからない。

## Codex Cloud環境の作成

Codex Cloudのリポジトリ接続と環境公開はCodexのWeb版またはデスクトップアプリの環境設定で行う。リポジトリにあるファイルだけではGitHub接続やクラウド環境の公開を完了できない。

1. `Work in > Cloud` から環境を作成し、GitHub接続が求められた場合は既存の `su-metal/fanza_comment` リポジトリを選ぶ
2. Node.js 22を選び、Install scriptに次を設定する

   ```sh
   npm ci --prefix functions
   npm run --prefix functions build
   ```

3. パッケージ取得に必要なネットワークを許可し、セットアップ結果を確認して環境をPublishする
4. Emulatorが必要なタスクでは、そのタスク内で上記の起動コマンドを実行する。Checkout/Webhookの検証はテスト専用資格情報を個人の環境変数・Secret保管機能に設定してから行う
5. スマートフォンでは公開済み環境を選んでタスクを開始する。同じタスクを再開するとクラウド上の作業を続けられる

この環境には通常のコード作業に本番Firebaseへのデプロイ権限を付与しない。本番デプロイが必要な場合は、別途対象環境・認証・差分を確認してから実施する。

## GitHub同期手順

この調査時点のGitHubリモートは `origin`、作業ブランチは `en_language`。作業開始時には最新のリモート状態を確認する。

```sh
git status --short --branch
git fetch origin
```

新しい作業は最新の `origin/en_language` から独立ブランチを作る。

```sh
git switch -c codex/<task-name> origin/en_language
```

作業後は差分を確認し、必要なファイルだけをコミットする。PushやPull RequestでGitHubに共有し、別の環境へ移る前に対象ブランチを確認する。Push前にはユーザー確認を得る。

別環境の変更を取り込むときは、未コミットの変更がないことを確認してから最新のリモートを取得し、作業ブランチへマージまたはリベースする。

```sh
git status --short --branch
git fetch origin
git switch <task-branch>
git rebase origin/en_language
```

コンフリクトが起きた場合は双方の変更内容を確認し、片側を機械的に破棄しない。作業ブランチをGitHubへ反映してから、ローカルまたはCodex Cloudで続きを行う。
