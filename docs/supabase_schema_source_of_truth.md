# Supabaseスキーマ正本（Source of Truth）

このドキュメントは、`supabase/schema.sql` を基準にした課金判定専用スキーマの正本です。  
実装・運用上の最終的な真実は常に `supabase/schema.sql` とし、本書はその説明資料です。

## 1. 前提

- コメント本文はDBに保存しない
- コメントデータはローカルJSONの保存/復元のみで管理する
- Supabaseは「課金ユーザー判定（entitlement）」にのみ使用する

## 1.1 環境固定値（本プロジェクト）

- Supabase Project URL: `https://wzinimxikcihdqqdvppa.supabase.co`
- App Identifier: `app_id = fanza_comment`
- 方針:
  - すべてのライセンス照合は `app_id` でスコープを限定する
  - 複数アプリを同一DBで扱う場合も `app_id` を境界として分離する

## 2. 依存拡張

- `uuid-ossp`
  - 用途: UUID主キー生成（`uuid_generate_v4()`）

## 3. テーブル定義

### 3.1 `license_entitlements`

- 用途: ライセンス状態の正本
- 主キー
  - `id uuid primary key default uuid_generate_v4()`
- カラム
  - `app_id text not null default 'fanza_comment'`
  - `license_code text not null unique`
  - `purchase_email_hash text not null`
  - `status text not null check (status in ('active', 'revoked', 'refunded'))`
  - `product text not null default 'kamishine_memo_pro_lifetime'`
  - `stripe_checkout_session_id text`
  - `stripe_payment_intent_id text`
  - `last_verified_at timestamptz`
  - `verification_count integer not null default 0`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`

### 3.2 `license_claims`

- 用途: 端末紐づけログ（任意だが推奨）
- 主キー
  - `id uuid primary key default uuid_generate_v4()`
- カラム
  - `app_id text not null default 'fanza_comment'`
  - `license_id uuid not null references license_entitlements(id) on delete cascade`
  - `device_fingerprint_hash text not null`
  - `app_version text`
  - `created_at timestamptz not null default now()`
  - `last_seen_at timestamptz not null default now()`
- 制約
  - `unique (app_id, license_id, device_fingerprint_hash)`

### 3.3 `webhook_events`

- 用途: Stripe webhookの冪等処理
- 主キー
  - `event_id text primary key`
- カラム
  - `event_type text not null`
  - `processed boolean not null default false`
  - `received_at timestamptz not null default now()`
  - `processed_at timestamptz`

## 4. インデックス

- `idx_license_entitlements_app_status on license_entitlements(app_id, status)`
- `idx_license_entitlements_payment_intent on license_entitlements(stripe_payment_intent_id)`
- `idx_license_claims_license_id on license_claims(license_id)`

## 5. RLS（Row Level Security）設計

- `license_entitlements`: RLS有効、ポリシー未定義
- `license_claims`: RLS有効、ポリシー未定義
- `webhook_events`: RLS有効、ポリシー未定義

補足:
- `anon` / `authenticated` からの直接アクセスは不可
- サーバー側（`service_role`）経由のAPIのみ許可する想定

## 6. 運用ルール

- スキーマ変更は `supabase/schema.sql` を先に更新する
- 変更時は本ドキュメントを同時更新し、差分理由を残す
- コメント機能の仕様変更があっても、コメント本文はDBに保存しない方針を維持する
- Edge Function 実行環境では `SUPABASE_URL` を `https://wzinimxikcihdqqdvppa.supabase.co` に設定する

## 7. API実装

- 実装ファイル: `supabase/functions/license-api/index.ts`
- エンドポイント:
  - `POST /functions/v1/license-api/activate`
  - `POST /functions/v1/license-api/verify`
  - `POST /functions/v1/license-api/stripe-webhook`
