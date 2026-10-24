# AGENTS.md

## 北極星（North Star）

神シーンメモは、動画視聴中の思考を邪魔せずに「神シーンをすぐ残せる」ことを最優先とする。  
保存データはユーザー端末ローカルが原則で、外部DBは課金判定にのみ使う。

## 現状サマリ（2026-10-24）

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
- 拡張は Supabase 版ライセンスAPIの `verify-device` / `create-checkout-session` を呼び出し、購入済みProを端末へ反映する
- Pro価格は買い切り `$3.99` / 1デバイスで表示し、Stripe Checkout も `$3.99` 用の Price ID を使う
- `create-checkout-session` で Stripe Checkout の `allow_promotion_codes=true` を有効化し、本番環境でも promotion code を入力して割引適用できる
- Stripe webhook の失効処理は `stripe_payment_intent_id` に加えて `stripe_checkout_session_id` でも追跡し、無料Checkout系イベントでも entitlement を無効化できる
- 拡張の Pro キャッシュは `verify-device` が `false` を返した時に自動で解除し、失効済みライセンス表示が端末に残留しない
- Pro版は購入時メールアドレスとライセンスコードで再アクティベートでき、拡張UI上でライセンスコードを確認できる
- `Proを復元` 導線は無料版でのみ表示し、ベータ特典者には表示しない
- popup から `onboarding.html` を任意に開ける導線を持ち、使い方とPro案内をいつでも参照できる
- 拡張UIは日本語/英語に対応し、タイムゾーンが `Asia/Tokyo` なら日本語、それ以外は英語で `popup` / `onboarding` / プレーヤー内主要導線の文言を切り替える
- 決済価格はタイムゾーン判定に連動し、`Asia/Tokyo` なら `¥500` の JPY Price、それ以外は `$3.99` の USD Price を自動選択する
- 拡張から Supabase Edge Function を呼ぶ際は `apikey` ヘッダーに publishable key を付与し、`license-api` は `verify_jwt=false` で運用する
- 課金基盤は Supabase 方針に一本化済み
- 対応プレイヤーは YouTube / FANZA / DMM TV のローカルメモ用途を含む
- LPではストア外配布の拡張機能ZIPを直接ダウンロードでき、Chromeのデベロッパーモードで解凍フォルダを読み込む手順を案内する。ブラウザーの優先言語に応じて日本語・英語・簡体字中国語・韓国語を表示し、配布ZIPに各言語の導入手順書を同梱する
- 認知施策の原稿・配信台帳・運用手順は `docs/marketing/` で管理する。このチャットに週2回（月曜・木曜9時、日本時間）の原稿作成・確認を登録済みで、月曜に記事・効果確認も行う。Xの投稿先はユーザー指定の `@awawawawawadama`。公式X APIはユーザーが利用中だが、この環境での認証・投稿接続、記事公開先、計測接続は未確認・未設定
- LPは用途が分かる冒頭説明、説明重複の整理、実画面スクリーンショット、FANZA向け使い方ガイドを実装し、ユーザー指定の Cloudflare Pages `https://scene-memo.pages.dev/` の本番 `main` へ反映済み。LP・ガイド・ZIP・画像・英中韓の言語ファイルがHTTP 200で取得でき、英語表示とガイド画面をブラウザーで確認済み
- LPはブラウザー優先言語で日本語・英語・簡体字中国語・韓国語を表示する。FANZAガイドは現時点で日本語のみ。多言語固定URL、YouTubeガイド、計測、本番の自動配信は後続の提案で、X API認証設定の確認はユーザー指定により後で行う
- LP整理・使い方ガイド・SEO/AIOの要件と進捗は `docs/marketing/lp-seo-requirements.md`。中国語・韓国語の実ブラウザー表示、SEO効果・検索数は未確認であり、本番反映と区別する

## プロダクト原則

1. コメント本文はDB保存しない（ローカルJSON保存/復元のみ）
2. 操作は再生体験を中断しない（最小クリック・最小視線移動）
3. 既存データを壊さない（後方互換を優先）
4. 権限は最小化し、挙動は説明可能にする

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

## 課金基盤 方針（移行中）

- 目標基盤: Supabase（entitlement判定専用）
- 利用プロジェクトURL: `https://wzinimxikcihdqqdvppa.supabase.co`
- スキーマ正本: `supabase/schema.sql`
- ドキュメント正本: `docs/supabase_schema_source_of_truth.md`
- API実装: `supabase/functions/license-api/index.ts`
- アプリ識別子: `app_id = fanza_comment`（ライセンス判定・紐づけのスコープに使用）

### Edge Function エンドポイント（Supabase）

- `POST /functions/v1/license-api/activate`
- `POST /functions/v1/license-api/verify`
- `POST /functions/v1/license-api/stripe-webhook`

### 運用必須シークレット（Supabase）

- `SUPABASE_URL`（`https://wzinimxikcihdqqdvppa.supabase.co`）
- `SUPABASE_SERVICE_ROLE_KEY`
- `LICENSE_TOKEN_SECRET`
- `STRIPE_API_KEY`
- `STRIPE_PRICE_ID_JPY`（`¥500` / 1デバイス用の Stripe Price ID）
- `STRIPE_PRICE_ID_USD`（`$3.99` / 1デバイス用の Stripe Price ID）
- `STRIPE_PRICE_ID`（任意。単一 Price 運用時または移行用 fallback）
- `STRIPE_WEBHOOK_SECRET`
- `ALLOWED_ORIGINS`（任意。未設定時は `https://www.youtube.com` と `https://m.youtube.com` を許可）

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
4. スキーマ変更時に `supabase/schema.sql` と `docs/supabase_schema_source_of_truth.md` を同期したか
5. 課金まわりの変更が Supabase 方針と矛盾していないか

## AGENTS.md運用ルール

- `AGENTS.md` はプロジェクトの現状を表す北極星ドキュメントとして扱う
- 機能追加・仕様変更・運用方針変更が発生した場合、エージェントはこのファイルを都度自律的に更新し、記述を最新状態に保つ
- 要件整理・仕様確認・実装判断が必要な作業では、`docs/requirements_definition.md` を参照する
- `AGENTS.md` と `docs/requirements_definition.md` に差分が生じた場合は、両方を同時に更新して整合を保つ
