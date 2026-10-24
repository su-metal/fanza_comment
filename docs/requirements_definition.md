# 神シーンメモ 要件定義書（現行実装反映版）

作成日: 2026-03-04  
最終更新日: 2026-10-24
対象リポジトリ: `fanza_comment`

## 1. 文書の目的

本書は、Chrome拡張「神シーンメモ」の現行実装を正確に反映した要件定義書である。  
設計・実装・運用・将来拡張時の判断基準を統一することを目的とする。
計画中のLP整理・SEO/AIO要件は12章で現行実装と区別し、詳細を `docs/marketing/lp-seo-requirements.md` に記録する。

## 2. プロダクト概要

- 名称: 神シーンメモ
- 提供形態: Chrome拡張（Manifest V3）
- 主用途: 動画再生中にタイムスタンプ付きの「シーン・メモ」を即時記録し、再生体験を中断せず参照する
- 対応サイト:
  - FANZA: `https://www.dmm.co.jp/digital/-/player/*`
  - DMM TV: `https://tv.dmm.com/vod/playback/*`
  - YouTube: `https://www.youtube.com/watch*`, `https://www.youtube.com/shorts/*`, `https://www.youtube.com/live/*`

## 3. 北極星・原則

- 最優先価値: 視聴中の思考を邪魔せず「神シーンをすぐ残せる」こと
- コメント本文は外部DBへ保存しない
- 保存データはローカル保存を原則とする
- 外部DBは課金状態（entitlement）判定専用

## 4. スコープ

### 4.1 実装スコープ（現行）

- タイムライン連動「シーン・メモ」UI
- コメントの投稿・編集・削除
- コメント検索（検索開始時に動画一時停止）
- 前後コメントジャンプ（`Ctrl + ← / →`）
- コメント区間リピート（A/B 指定）
- オーバーレイ最小化・ドラッグ移動・表示ON/OFF
- 動画ごとのローカル保存
- JSONバックアップ/復元
- 無料枠制御（50件）
- ベータ特典判定（初回利用時刻が期限内なら無制限）

### 4.2 非スコープ（現行）

- コメント本文のサーバー保存
- 共有コメント機能（他ユーザー公開）
- 会員ログイン機能
- 不要な追跡/トラッキング

### 4.3 LP配布・導入案内

- LPから Chrome Web Store を経由しない拡張機能ZIPを直接ダウンロードできること
- LPで、ZIPの解凍、`chrome://extensions` の表示、デベロッパーモードの有効化、`manifest.json` を含むフォルダの読み込みを案内すること
- ブラウザーの優先言語から表示言語を判定し、日本語 (`ja`)、簡体字中国語 (`zh`)、韓国語 (`ko`)、それ以外は英語で表示すること
- ページタイトル・説明、LP本文、FAQ、操作デモを選択言語で表示すること
- Pro価格は拡張機能と同じく、タイムゾーンが `Asia/Tokyo` なら `¥500`、それ以外は `$3.99` と表示すること
- ストア経由の自動更新がないことを利用者に案内すること
- 配布ZIPのルートに日本語 (`INSTALL.txt`)、英語 (`INSTALL_en.txt`)、簡体字中国語 (`INSTALL_zh-CN.txt`)、韓国語 (`INSTALL_ko.txt`) の手順書を含めること

### 4.4 認知施策の自動運用

- 運用正本を `docs/marketing/automation.md`、原稿・配信状態を `docs/marketing/queue.json` に保持する
- このチャットの定期実行で、月曜・木曜9時（日本時間）に原稿作成と運用確認を行う。X原稿は週2件、記事は週1本を上限とし、未配信原稿の無制限な積み増しを避ける
- 投稿先のアカウント・記事公開先・API接続を確認し、送信結果のIDや公開URLを読み返せた場合のみ予約・公開済みと記録する。Xの投稿先はユーザー指定の `@awawawawawadama`。公式X APIはユーザーが利用中だが、この環境での認証・投稿接続、記事公開先、計測接続は未確認・未設定
- 原稿は実装済み機能と対応範囲を根拠とし、利用者のコメント本文・視聴情報を取得しない。自動投稿は指定された自身の公開先を対象とする
- 指標が未接続なら未取得と記録する。ZIPクリックをインストール完了数と扱わない
- 具体的な実行手順・重複防止・接続条件・外部方針の根拠は運用正本に記載する

## 5. 機能要件

### FR-01: オーバーレイ表示（シーン・メモ）

- プレイヤー画面上にコメントオーバーレイを表示できること
- オーバーレイは非表示/再表示をショートカットで切り替えできること
- 初期ショートカットは `Alt + C` であること
- 最小化位置を設定から変更できること（既定は左上）
- プレーヤー初回表示時のオーバーレイは最小化状態で立ち上がること
- popup から `onboarding.html` を任意に開ける導線を提供し、使い方とPro案内をいつでも参照できること
- タイムゾーンが `Asia/Tokyo` なら `popup` / `onboarding` / プレーヤー内主要導線の表示文言を日本語へ切り替え、それ以外は英語へ切り替えること
- Pro価格はタイムゾーンが `Asia/Tokyo` なら `¥500` / 1デバイス、それ以外は `$3.99` / 1デバイスで表示すること
- Stripe Checkout も同じ判定に連動し、`Asia/Tokyo` なら JPY Price、それ以外は USD Price を使用すること
- 設定の「コメント済み動画」リンクから同一タブ遷移した場合、遷移先ではオーバーレイを最小化状態で表示すること
- DMM TV / FANZA のプレーヤー最大化表示中も、オーバーレイを継続表示できること
- コメント入力ショートカットを設定できること（既定 `Alt + Shift + M`）
- コメント入力ショートカット押下時、非表示なら表示して入力欄へフォーカスし、最小化中なら展開して入力欄へフォーカスすること
- コメント入力ショートカット押下時、展開済みなら最小化し、動画が停止中であれば再生を再開すること
- 表示ON/OFFショートカットと同一キーの設定を禁止すること

### FR-02: コメント投稿

- 入力欄で `Enter` または `+` ボタン押下で投稿できること
- 投稿時刻は動画再生秒（小数2桁）を保存すること
- 空入力は投稿しないこと

### FR-03: コメント編集・削除

- 既存コメントをインライン編集できること
- 編集保存時は保存データへ反映されること
- 個別削除・動画単位全削除ができること

### FR-04: タイムライン同期表示

- 再生時間に近いコメントをアクティブ表示できること
- コメントクリックで該当時刻へシークできること

### FR-05: 前後ジャンプ

- `Ctrl + ←` で前コメント時刻へ移動できること
- `Ctrl + →` で次コメント時刻へ移動できること

### FR-05.5: コメント区間リピート

- コメントを A/B 指定して任意区間をリピート再生できること
- A は最終コメント以外を指定できること
- B は A より後のコメントのみ指定できること
- A または B の再押下でリピート解除できること
- `ABリピ解除` ボタンは A/B リピート範囲が有効なときだけ表示すること

### FR-06: 検索

- コメント本文を部分一致検索できること
- 検索開始時に必要に応じて動画を一時停止し、終了時に復帰できること
- `Esc` / `Enter` / クリアボタン / 外部クリックで検索モードを終了できること

### FR-07: ローカル保存

- `chrome.storage.local` に動画単位でコメントを保存できること
- 既存キー（旧形式）からの後方互換読み込みを行うこと

### FR-08: JSONバックアップ/復元

- 管理対象キーのみをJSON保存できること
- JSON復元時に既存管理データを置換できること
- バックアップスキーマバージョンを保持すること（現行 `BACKUP_SCHEMA_VERSION = 2`）
- 保存・削除ごとにローカル自動バックアップを最新5件まで保持すること
- `JSON復元` の直前に退避用の自動バックアップを作成すること
- 最新の自動バックアップを設定画面からJSONとして書き出せること

### FR-09: 無料枠・特典判定

- 無料枠は 50 コメントであること
- 初回利用時刻が `2026-04-02 23:59:59 JST` 以前ならベータ特典を付与すること
- 購入済みPro判定は端末ローカルフラグを基本とし、`verify-device` の結果で再同期できること
- 課金UIでは `無料 / ベータ特典 / 購入済みPro` を区別表示し、ベータ特典者には購入導線を表示しないこと
- 開発確認用として `chrome.storage.local.fanza_memo_force_show_upgrade_for_beta=true` のときのみ、ベータ特典者にも一時的に購入導線を表示できること
- 開発確認用として `chrome.storage.local.fanza_memo_disable_beta_for_checkout_test=true` のときは、ベータ特典者を一時的に無料扱いとして決済導線と上限制御を確認できること

### FR-10: コメントデータの将来拡張耐性

- コメントごとに `comment_id` を保持すること
- `schema_version`, `site`, `video_id`, `visibility`, `share_id`, `created_at`, `updated_at` を保持すること
- 既定 `visibility` は `private` とすること
- 将来共有用の送信境界関数（`serializeCommentForShare`）で本文を除外可能であること

## 6. 非機能要件

### NFR-01: プライバシー

- コメント本文・コメント時刻・UI設定を開発者サーバーへ送信しないこと
- ただし動画タイトル補完のため、対象ページ取得や YouTube oEmbed への通信が発生し得ること

### NFR-02: 権限最小化

- 拡張権限は `storage` のみ
- Host permissions は対象動画URLおよび課金判定用の Supabase license API に限定する

### NFR-03: 後方互換

- 旧保存形式を読み込み可能であること
- 読み込み時に現行スキーマへ正規化し再保存できること

### NFR-04: 可用性（ローカル動作）

- ネットワーク不通時でもコメント機能（投稿/編集/検索/保存）は利用可能であること

## 7. データ要件

### 7.1 ローカルコメントデータ（概念）

- `id`（レガシー互換）
- `comment_id`（UUID相当）
- `schema_version`
- `site`（`dmm` / `dmmtv` / `youtube`）
- `video_id`
- `t`（秒, number）
- `text`
- `visibility`（現行運用は `private`）
- `share_id`（将来用）
- `created_at` / `updated_at`

### 7.2 課金判定データ（Supabase）

- Project URL: `https://wzinimxikcihdqqdvppa.supabase.co`
- App Identifier: `app_id = fanza_comment`
- テーブル:
  - `license_entitlements`
  - `license_claims`
  - `webhook_events`
- コメント本文は保存しない

## 8. 外部インターフェース要件

### 8.1 Chrome拡張

- `manifest_version: 3`
- `permissions: ["storage"]`
- content script: `extension/content.js`（`run_at: document_start`）

### 8.2 Supabase Edge Function（実装済み）

- `POST /functions/v1/license-api/activate`
- `POST /functions/v1/license-api/verify`
- `POST /functions/v1/license-api/stripe-webhook`
- `POST /functions/v1/license-api/create-checkout-session`
- `POST /functions/v1/license-api/verify-device`
- 拡張からの呼び出しは Supabase publishable key を `apikey` ヘッダーで付与し、`license-api` は `verify_jwt=false` で公開する
- `create-checkout-session` は Stripe Checkout の `allow_promotion_codes=true` を有効化し、promotion code 入力欄を表示できる
- `create-checkout-session` は拡張から受け取った実行時ロケールに応じて `STRIPE_PRICE_ID_JPY` または `STRIPE_PRICE_ID_USD` を `line_items[].price` に使用する
- `STRIPE_PRICE_ID` は単一 Price 運用時または移行用 fallback として利用できる
- Stripe webhook の entitlement 失効処理は `stripe_payment_intent_id` に加えて `stripe_checkout_session_id` も利用し、無料Checkout由来の失効イベントにも対応する
- 拡張は `verify-device` の結果が `is_pro=false` だった場合、ローカルの購入済みキャッシュを解除して無料状態へ戻す
- 拡張は購入済み端末の `license_code` を表示でき、購入時メールアドレス + ライセンスコードで `activate` を呼んで再アクティベートできる
- `Proを復元` 導線は無料版でのみ表示し、ベータ特典および購入済みProでは表示しない

必須シークレット/環境値:

- `SUPABASE_URL`（`https://wzinimxikcihdqqdvppa.supabase.co`）
- `SUPABASE_SERVICE_ROLE_KEY`
- `LICENSE_TOKEN_SECRET`
- `STRIPE_API_KEY`
- `STRIPE_PRICE_ID_JPY`（`¥500` / 1デバイス用の Stripe Price ID）
- `STRIPE_PRICE_ID_USD`（`$3.99` / 1デバイス用の Stripe Price ID）
- `STRIPE_PRICE_ID`（任意。単一 Price 運用時または移行用 fallback）
- `STRIPE_WEBHOOK_SECRET`
- `ALLOWED_ORIGINS`（任意。未設定時は `https://www.youtube.com` と `https://m.youtube.com` を許可）

## 9. 現状の制約・既知ギャップ

- コメント保存上限の実効判定はローカル entitlement を基準とする
- 購入済みProの端末反映は `verify-device` の応答とローカルフラグに依存する
- 共有機能は未提供（将来向けデータ項目のみ先行整備）

## 10. 受け入れ基準（現行版）

- FANZA / DMM TV / YouTube の対象URLでオーバーレイが表示される
- LPから現行拡張機能ZIPを取得でき、ストアを使わない手動導入手順を確認できる
- LPがブラウザー言語に応じて日本語・英語・簡体字中国語・韓国語を表示し、ZIP内に4言語の `INSTALL` 手順書を含む
- コメント投稿/編集/削除/検索/前後ジャンプが動作する
- リロード後もコメントが復元される
- JSON保存/復元で管理対象データを移行できる
- コメント本文が外部DBへ保存されない
- Supabaseスキーマが `supabase/schema.sql` と `docs/supabase_schema_source_of_truth.md` で一致している

## 11. 将来拡張方針（要件レベル）

- 共有機能は段階導入し、初期は動画内タイムスタンプ共有を優先する
- 本文共有は明示同意と送信境界制御を前提に追加する
- 課金判定は拡張から `license-api` へ接続し、ローカルフラグ依存を解消する

## 12. LP整理・SEO/AIO 要件と進捗

- 要件と進捗の詳細は `docs/marketing/lp-seo-requirements.md`、検索意図の根拠と限界は `docs/marketing/keyword-research-2026-10-24.md` を参照する
- LP冒頭の機能説明、重複説明の整理、実画面の操作例、LP下部のガイド紹介、同一サイト内の日本語FANZAガイド1本を実装・本番反映済み
- 主軸候補「FANZA 動画 再生位置 保存」に対応する説明をタイトル・本文・FAQへ反映し、保存対象を動画ファイルと誤認させない。ブラウザー優先言語による4言語表示・ZIP配布・導入手順を維持する
- ガイドは独立URL `guide-fanza.html` とし、LPからの紹介リンク、記事から導入案内・ZIPへのリンクを実装済み。検索数やAI掲載・引用を保証しない
- 公開先はユーザー指定の Cloudflare Pages `https://scene-memo.pages.dev/`。本番 `main` へ反映済み。LP・ガイド・ZIP・画像・英中韓の言語ファイルのHTTP取得を確認し、英語表示とガイド画面をブラウザーで確認済み
- 中国語・韓国語の実ブラウザー表示、検索流入・順位・SEO/AIO効果は未確認
- 多言語固定URL、クロール基盤、YouTube向けガイド、計測、本番の自動配信は後続の提案として扱う。既存の定期実行登録と本番の配信開始を区別する
- SEO効果・検索順位・検索数は未確認。X API認証設定の確認はユーザー指定により後で行う

---

本書は現行実装の正確な反映を目的とする。仕様変更時は `AGENTS.md`、`supabase/schema.sql`、`docs/supabase_schema_source_of_truth.md` と同時に更新すること。
