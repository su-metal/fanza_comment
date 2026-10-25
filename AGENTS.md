# AGENTS.md

## 北極星（North Star）

神シーンメモは、動画視聴中の思考を邪魔せずに「神シーンをすぐ残せる」ことを最優先とする。  
保存データはユーザー端末ローカルが原則で、外部DBは課金判定にのみ使う。

## 現状サマリ（2026-10-25）

- コメント本文は `chrome.storage.local` に保存し、JSONバックアップ/復元で移行する
- 保存・削除・JSON復元前に、ローカルへ自動バックアップのスナップショットを保持する
- コメントを A/B 指定して任意区間をリピートできる
- 最小化位置を設定から切り替えられる（既定は左上固定）
- コメント入力ショートカットを設定でき、最小化中でも入力欄へ直接フォーカスできる。再押下時は最小化し、停止中の動画再生を再開する
- プレーヤー初回表示時のオーバーレイは最小化状態で立ち上がる
- `ABリピ解除` は A/B リピート範囲が有効なときだけ表示する
- 設定の「コメント済み動画」リンクから別動画へ遷移した直後は、オーバーレイを最小化状態で表示する
- DMM TV / FANZA でプレーヤー最大化表示に切り替えても、オーバーレイ表示を維持する
- 課金UIは `無料 / ベータ特典 / 購入済みPro` を表示上で区別し、ベータ特典者には課金導線を出さない
- 開発確認時のみ `chrome.storage.local` の `fanza_memo_force_show_upgrade_for_beta=true` で、ベータ特典者にも一時的に課金導線を表示できる
- 決済確認を無料状態で試す必要がある場合は `chrome.storage.local` の `fanza_memo_disable_beta_for_checkout_test=true` でベータ特典を一時無効化できる
- 公開中の拡張v1.0.2はSupabase版ライセンスAPIを利用する。移行対象ソースv1.0.3はFirebase Functions `licenseApi`を呼び出し、Functions/Rules/Stripe webhookを本番へ設定済み。Stripe test modeとFirebase EmulatorでCheckout・決済完了Webhook・Pro確認・返金失効をE2E確認し、activate/restore・誤入力・端末移行もEmulatorで確認済み。本番の実購入/返金は未確認で、v1.0.3は未配布
- Pro価格は買い切り `$3.99` / 1デバイスで表示し、Stripe Checkout も `$3.99` 用の Price ID を使う
- `create-checkout-session` で Stripe Checkout の `allow_promotion_codes=true` を有効化し、本番環境でも promotion code を入力して割引適用できる
- Stripe webhook の失効処理は `stripe_payment_intent_id` に加えて `stripe_checkout_session_id` でも追跡し、無料Checkout系イベントでも entitlement を無効化できる
- 拡張の Pro キャッシュは `verify-device` が `false` を返した時に自動で解除し、失効済みライセンス表示が端末に残留しない
- Pro版は購入時メールアドレスとライセンスコードで再アクティベートでき、Firebase版APIでは復元先を1台に限定する。別端末で復元すると旧端末のclaimを解除し、旧端末は次回 `verify-device` で無料状態へ同期する。拡張UI上でライセンスコードを確認できる
- `Proを復元` 導線は無料版でのみ表示し、ベータ特典者には表示しない
- popup から `onboarding.html` を任意に開ける導線を持ち、使い方とPro案内をいつでも参照できる
- 拡張UIは日本語/英語に対応し、タイムゾーンが `Asia/Tokyo` なら日本語、それ以外は英語で `popup` / `onboarding` / プレーヤー内主要導線の文言を切り替える
- 拡張の `popup` / `onboarding` / プレーヤー内UIは、LPと共通の暗色・ローズアクセント・細い境界線・システムフォントのデザインに揃える。広告掲載用の拡張画面スクリーンショットはローカルの模擬プレーヤーと説明用サンプルデータで撮影し、利用者のコメントや視聴履歴を使わない。このUI・LP差替えはGitHubの作業ブランチにあり、`en_language` へのマージ・Cloudflare Pages本番・配布ZIPには未反映
- 決済価格はタイムゾーン判定に連動し、`Asia/Tokyo` なら `¥500` の JPY Price、それ以外は `$3.99` の USD Price を自動選択する
- LPでは `Asia/Tokyo` 向けに `¥500` をリリース記念キャンペーン価格として2027年1月30日まで表示し、2027年1月31日から `¥980` で販売する予定を案内する。価格切替前にLP・拡張機能・Checkoutの表示と実価格を同期する
- 公開中v1.0.2の本番課金APIはSupabase。Firebaseプロジェクト `fanza-comment-lic-20260303` は2026-10-24にBlaze有効を確認済み。Firestoreには既存のデフォルトDBがあり、場所は `nam5`、データは空。Functionsの `asia-northeast1` とはリージョンが異なる
- FirestoreのリモートRulesはクライアントの読み書きをすべて拒否し、2026-10-24に本番デプロイ済み。移行コードはFirestoreデフォルトDBをAdmin SDKで使い、コメント本文は移行対象外。FunctionsのTypeScriptビルドは成功し、本番依存のnpm監査は0件
- ユーザー確認（2026-10-24）では既存購入者はいないため、初回Firebase公開ではSupabaseからのentitlement/claim/webhookデータ移行を省略し、空のFirestoreから開始する。Supabase Management APIの読み取り認証はHTTP 401だが、この初回公開のブロッカーではない。将来移行が必要になった場合は認証を復旧して再確認する
- Stripeの本番商品カタログでJPY ¥500 / USD $3.99のPrice IDを確認し、Firebase用の `functions/.env.fanza-comment-lic-20260303` にローカル設定済み（`functions/.gitignore` 対象）。Firebase Secret Managerの `LICENSE_TOKEN_SECRET` / `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` は有効なバージョン1を確認済み。Stripe本人確認（パスキー）は完了。差し替え後のrestricted API keyを使用し、旧キーの失効状態は未確認。Firebase向けStripe webhookは `checkout.session.completed` / `charge.refunded` で有効化済み、既存Supabase webhookも維持する。Firebase Functions `licenseApi` は `asia-northeast1` にデプロイ済み。Artifact Registryの古いイメージは7日後に整理する設定。本番APIのCORS `OPTIONS` と読み取り専用 `verify-device` は成功したが、本番Checkout/返金は未確認。v1.0.3は未配布
- Supabaseのデータ正本 `supabase/schema.sql` と説明資料は既存v1.0.2の運用・移行元として保持する。移行手順と実施状態は `docs/firebase_migration.md` を参照する
- 対応プレイヤーは YouTube / FANZA / DMM TV のローカルメモ用途を含む
- LPではストア外配布の拡張機能ZIPを直接ダウンロードでき、Chromeのデベロッパーモードで解凍フォルダを読み込む手順を案内する。ブラウザーの優先言語に応じて日本語・英語・簡体字中国語・韓国語を表示し、配布ZIPに各言語の導入手順書を同梱する
- LPには、FANZA/DMMの地域制限により日本国外で利用できないサービス・動画があること、VPN等でも利用は保証されず拡張機能は地域制限を回避しないことを、日本語・英語・簡体字中国語・韓国語で案内する
- 認知施策の原稿・配信台帳・運用手順は `docs/marketing/` で管理する。このチャットに週2回（月曜・木曜9時、日本時間）の原稿作成・確認を登録済みで、月曜に記事・効果確認も行う。Xの投稿先はユーザー指定の `@awawawawawadama`。公式X APIはユーザーが利用中との申告があるが、この環境での接続は未確認。認知施策は追加費用0円を原則とし、新規の有料契約・登録料・API従量課金が発生する手段を使わない。X投稿はAPIを呼ばず、原稿作成までを自動化し、無料の手動投稿を前提とする。計測はSearch ConsoleやCloudflare Web Analyticsなど無料で使える既存サービスを優先する
- LPは用途が分かる冒頭説明、説明重複の整理、実画面スクリーンショット、FANZA向け使い方ガイドを実装し、ユーザー指定の Cloudflare Pages `https://scene-memo.pages.dev/` の本番 `main` へ反映済み。LP・ガイド・ZIP・画像・英中韓の言語ファイルがHTTP 200で取得でき、英語表示とガイド画面をブラウザーで確認済み
- LPはブラウザー優先言語で日本語・英語・簡体字中国語・韓国語を表示する。FANZAガイドは現時点で日本語のみ。多言語固定URLとYouTubeガイドは後続候補。LP FAQとFANZAガイドにCloudflare Web Analyticsの計測範囲を説明する。公開説明が本番に反映されるまではAnalyticsを有効化しない（現在のPages設定状態は未確認）。計測対象はLP・ガイドの閲覧数と表示性能に限定し、拡張機能のコメント本文、動画ID、タイトル、保存時刻、利用状況は収集しない。Cloudflare PagesのDirect Uploadプロジェクトを維持し、GitHub Actions + Wranglerによる自動デプロイを設定した。PR #7は2026-10-25に `en_language` へマージ（`b95453d`）し、Actions runs `40161734375` と `40163075966` が成功して本番 `main` へ反映済み。Cloudflare APIトークンをローテーションしたため、GitHub Repository Secret `CLOUDFLARE_API_TOKEN` の差し替え待ち。追加費用0円を維持する間はX投稿APIを使わない
- LP整理・使い方ガイド・SEO/AIOの要件と進捗は `docs/marketing/lp-seo-requirements.md`。本番の `/robots.txt`（HTTP 200・`text/plain`）と `/sitemap.xml`（HTTP 200・`application/xml`）、共有画像を確認済み。Search Consoleの所有権確認はHTMLファイル方式で成功。サイトマップ初回レポートは「取得できませんでした」・検出0件だったため、公開URLの正常応答を確認後、2026-10-25に再送信し、Googleの送信成功表示を確認した。処理結果はまだ更新されていない。Bing Webmaster Toolsは未接続。Web Analyticsの公開説明はPR #9にあり、本番未反映・Pages設定状態は未確認。検索実績とSEO効果は未確認

## プロダクト原則

1. コメント本文はDB保存しない（ローカルJSON保存/復元のみ）
2. 操作は再生体験を中断しない（最小クリック・最小視線移動）
3. 既存データを壊さない（後方互換を優先）
4. 権限は最小化し、挙動は説明可能にする
5. 認知計測は公開説明付きのLP・ガイドページ閲覧と表示性能に限り、拡張機能内データを計測しない

## スコープ境界

- すること:
  - タイムライン連動コメントUI
  - ローカル保存とJSONバックアップ/復元
  - ローカル自動バックアップの保持と書き出し
  - コメント区間リピート（A/B 指定）
  - 課金ユーザー判定（最終的にサーバー検証へ接続）
- しないこと:
  - コメント本文のサーバー保存
  - 不要なトラッキング
  - 未説明の権限追加

## 課金基盤 方針（SupabaseからFirebaseへ移行中）

- 現行本番（配布中v1.0.2）: Supabase Edge Function / Postgres。移行元URLは `https://wzinimxikcihdqqdvppa.supabase.co`
- 移行先プロジェクト: `fanza-comment-lic-20260303`。Stripe決済は維持する
- 移行先実装: `functions/src/index.ts`、Functionsエンドポイント `https://asia-northeast1-fanza-comment-lic-20260303.cloudfunctions.net/licenseApi`
- Firestoreモデルと運用手順: `docs/firebase_migration.md`。クライアント直接アクセスは禁止し、Functions Admin SDKだけが課金データを扱う
- Supabaseスキーマ `supabase/schema.sql` と `docs/supabase_schema_source_of_truth.md` は、現行本番と移行元データを扱うため保持する
- `app_id = fanza_comment` は両基盤で維持し、ライセンス照合をアプリ単位で分離する
- 移行スクリプト: `functions/scripts/migrate-supabase-to-firestore.mjs`。既定はdry-runで、`--apply` を付けるまでFirestoreに書き込まない
- `firestore.rules` はFirebase MCPの構文検証に合格し、2026-10-24に本番デプロイ済み。FirestoreデフォルトDBは空で `nam5`。Functionsは `asia-northeast1` のためリージョン差がある
- Firebase BillingはBlaze有効を2026-10-24に確認済み。Cloud Functions API / Secret Manager API等を有効化し、必要なSecrets・Stripe webhook・Functions `licenseApi` を本番へ設定済み。Firestore Rulesはクライアントアクセスを拒否し、本番デプロイ済み。本番APIのCORSと読み取り専用verifyは確認済み。Stripe test mode/EmulatorのCheckout・Webhook発行・返金失効E2E、およびactivate/restore・端末移行は確認済み。本番の実購入/返金は未確認で、v1.0.3は未配布。初回データ移行はユーザー確認により不要。価格IDとデプロイ用パラメーターはGit除外のローカルenvに設定済み
- Firebase Emulator SuiteはFunctions `5001` / Firestore `8080` / UI `4000`。`demo-scene-memo` のStripe test mode/Emulator E2EでJPY ¥500 Checkout作成API `200`、`checkout.session.completed` webhook `200`、Firestore entitlement `active`、`verify-device is_pro=true` を確認した。全額テスト返金後は `charge.refunded` webhook `200`、entitlement `refunded`、`verify-device is_pro=false`（`no_active_license`）を確認済み。検証専用Price ID・restricted Checkout API key・CLI listener secretはGit除外の `functions/.env.local` / `.secret.local` を使用し、2026-10-24にはEmulator内の合成entitlementでactivate/verifyの成功、誤メール403、未知コード404、同一端末再activation、別端末への移行と旧claim解除を確認した。本番データにはテスト書き込みなし

## 通信・データ取り扱い注記

- コメント本文を外部送信しない方針は維持する
- ただし現状実装には、動画タイトル補完のための外部 `fetch` がある
- README/プライバシー説明は、この実装実態と矛盾しないよう維持する

## コメントデータ設計（将来共有に備えた現行実装）

- 現行運用は `visibility=private`（自分用）を前提とする
- コメント1件ごとに `comment_id`（UUID相当）を保持する
- レコードに `schema_version` を持ち、後方互換マイグレーション可能にする
- 動画識別のため `site`（`dmm` / `dmmtv` / `youtube`）と `video_id` を保持する
- 共有拡張時は送信用シリアライザを分離し、本文共有の可否を明示制御する
- 送信データは `serializeCommentForShare` 相当の境界を通し、初期実装では本文を含めない

## ブランディング
- 日本語名称: **神シーンメモ**
- 英語名称: **Scene Memo**
- 英語UIでは 「Epic Moments」 や 「Kami Scene Memo」 ではなく 「Scene Memo」 を使用する

## 変更時チェックリスト

1. この変更は「視聴中の即メモ性」を改善するか
2. コメント本文が外部送信されないことを維持しているか
3. READMEは公開向けの説明に留まり、実装実態（外部通信の有無）と矛盾しないか
4. 課金スキーマや移行に変更がある場合、Firebaseのデータモデルと `docs/firebase_migration.md`、および移行元の `supabase/schema.sql` / `docs/supabase_schema_source_of_truth.md` の役割を同期したか
5. 課金まわりの変更がFirebase移行方針およびv1.0.2のSupabase互換期間と矛盾していないか

## AGENTS.md運用ルール

- `AGENTS.md` はプロジェクトの現状を表す北極星ドキュメントとして扱う
- 機能追加・仕様変更・運用方針変更が発生した場合、エージェントはこのファイルを都度自律的に更新し、記述を最新状態に保つ
- 要件整理・仕様確認・実装判断が必要な作業では、`docs/requirements_definition.md` を参照する
- `AGENTS.md` と `docs/requirements_definition.md` に差分が生じた場合は、両方を同時に更新して整合を保つ

## 開発環境・GitHub同期

- ローカルCodexとCodex Cloudは既存のGitHubリポジトリを共有元とし、コミット済みのソースと開発指示を受け渡す。ローカルブラウザーの `chrome.storage.local` や環境変数・認証情報は同期対象にしない
- Node.js 22を使い、依存関係は各 `package-lock.json` に基づいて `npm ci` で再現する。ビルド・Emulator・Chrome拡張の起動手順は `docs/development_environment.md` を参照する
- ローカルとクラウドで同じブランチを同時編集せず、作業ごとにブランチを分けてGitHub上で差分を確認する
- `.env*`、`.secret.local`、サービスアカウント鍵、依存関係ディレクトリ、生成物をGitへ含めない。Emulator用の値はテスト専用とし、本番Secretをクラウド開発環境へ複製しない
- GitHubへのPushまたは新規リポジトリ作成の前に、対象リポジトリ・ブランチ・コミット・差分を提示してユーザー確認を得る
