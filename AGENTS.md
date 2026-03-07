# AGENTS.md

## 北極星（North Star）

神シーンメモは、動画視聴中の思考を邪魔せずに「神シーンをすぐ残せる」ことを最優先とする。  
保存データはユーザー端末ローカルが原則で、外部DBは課金判定にのみ使う。

## 現状サマリ（2026-03-04）

- コメント本文は `chrome.storage.local` に保存し、JSONバックアップ/復元で移行する
- 保存・削除・JSON復元前に、ローカルへ自動バックアップのスナップショットを保持する
- コメントを A/B 指定して任意区間をリピートできる
- 課金判定の拡張UIは未接続で、現状はローカル entitlement フラグ運用
- Supabase 版ライセンスAPI実装は存在するが、拡張からはまだ呼び出していない
- 課金基盤は Supabase 方針に一本化済み
- 対応プレイヤーは YouTube / FANZA / DMM TV のローカルメモ用途を含む

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
