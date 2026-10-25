# Firebase 課金API移行

最終更新日: 2026-10-24

## 1. 目的と現在地

課金判定専用のバックエンドを Supabase Edge Functions / Postgres から Firebase Cloud Functions 第2世代 / Cloud Firestore へ移す。Stripe Checkout と webhook は維持する。コメント本文・再生時刻・設定は移行対象に含めず、今後もユーザー端末内に保存する。

| 項目 | 現在の状態 |
| --- | --- |
| Firebase プロジェクト | `fanza-comment-lic-20260303` を移行先に指定済み |
| Firebase Functions / Firestore のコード | ローカルに追加済み。Node.js 22向けTypeScriptビルド成功。依存はFirebase Admin 14.5 / Functions 7.4 |
| 新しい拡張ソース | Firebase API を呼び出す 1.0.3 として変更済み |
| Firestore Rules | Firebase MCPの構文検証に合格。クライアント読み書き拒否のRulesを2026-10-24に本番デプロイ済み |
| Firebase Billing | 2026-10-24にBlaze有効を確認 |
| Firestore のDBロケーション | 既存デフォルトDB `nam5`。Consoleで空のDBを確認。Functionsは `asia-northeast1` のためリージョン差がある |
| 初回データ移行 | ユーザー確認（2026-10-24）で既存購入者なし。entitlement / claim / webhookデータを移行せず、空のFirestoreから開始する |
| Firebase のシークレット・価格設定 | JPY ¥500 / USD $3.99 Price ID、fallback Price ID、YouTube許可オリジンは `functions/.env.fanza-comment-lic-20260303` にローカル設定済み（Git除外）。3つのSecretはSecret Managerで有効なバージョン1を確認済み |
| Cloud Functions API | 2026-10-24に必要APIを有効化。Firebase CLIでFunctions一覧を取得できることを確認 |
| Firebase Functions | `licenseApi` を2026-10-24にNode.js 22 / Functions v2 / `asia-northeast1` へデプロイ済み。CLI一覧で確認。test mode/EmulatorでCheckout・返金失効・activate/restore・端末移行を確認済み。本番Checkout/返金は未確認（任意の追加確認で、配布条件ではない） |
| Secret Manager API / Secret | 2026-10-24にAPI有効化済み。`LICENSE_TOKEN_SECRET` / `STRIPE_API_KEY` / `STRIPE_WEBHOOK_SECRET` の有効なバージョン1を確認 |
| Firebase CLI | `npx firebase-tools@latest` から対象プロジェクトへアクセスできることを確認 |
| Firebase Emulator Suite | `firebase.json` にFunctions `5001` / Firestore `8080` / Emulator UI `4000` を設定。demoプロジェクトで起動し、ランダムfingerprintへの `verify-device` が `200 no_claim_found` を返すことを確認。Stripe test modeの検証専用商品とJPY/USD Priceを作成し、IDをGit除外の `.env.local` に設定済み。`Scene Memo Firebase Emulator Test` 制限付きtest API keyを `Checkout Sessions: write` のみで作成し、キー値をGit除外の `.secret.local` に保存済み。Emulator経由でJPY Checkout作成APIが `200` を返すことを確認（test決済・Webhook発行・返金失効E2E確認済み）。Stripe CLIのSandbox認証とlistener起動を確認し、ローカルWebhook signing secretをGit除外の `.secret.local` に保存済み。テスト用 `.env.local` / `.secret.local` はGitとFunctionsデプロイから除外する |
| Supabase移行元の認証 | 環境内の `SUPABASE_ACCESS_TOKEN` による読み取りはHTTP 401。既存購入者なしのため初回公開では移行不要。将来データ移行が必要になれば認証を復旧する |
| Stripe本番webhook | Supabase向け `engaging-brilliance` が有効。`checkout.session.completed` / `charge.refunded` を購読 |
| Functions / Firebase Stripe webhook | `licenseApi` はデプロイ済み。Firebase webhookも承認済みURLで有効化され、`checkout.session.completed` / `charge.refunded` を購読。既存Supabase endpointも有効のまま |
| 公開LPと配布ZIP | v1.0.2 のまま。Supabase API を使用 |

依存関係は `firebase-admin@14.5.0` / `firebase-functions@7.4.0` / Express型5系に更新し、本番依存のnpm監査は0件。`/activate` の応答も拡張が期待するentitlement形式に合わせた。本番APIのCORSと読み取り専用verify、およびStripe test mode / Firebase Emulator E2Eは確認済み。Emulatorで合成entitlementによるactivate/restore・誤入力・端末移行を確認した。本番Checkout/返金とStripe発行ライセンスを使う実購入フローは未確認だが、任意の追加確認で配布条件ではない。公開中v1.0.2の本番課金APIは引き続きSupabaseであるため、Firebaseのデプロイだけで本番移行完了とは扱わない。

## 2. 移行先の構成

- Firebaseプロジェクト: `fanza-comment-lic-20260303`
- Cloud Functions: Node.js 22 / Functions 第2世代 / `asia-northeast1`
- Functions実装: `functions/src/index.ts`
- Firestoreルール: `firestore.rules`。クライアントからの読み書きをすべて拒否し、Admin SDKを使うFunctionsだけがアクセスする
- Functionsのエンドポイント: `https://asia-northeast1-fanza-comment-lic-20260303.cloudfunctions.net/licenseApi`
- Stripe商品、価格、割引コードの扱いは既存と同じ。JPYは `¥500`、USDは `$3.99`、買い切り1デバイス。Checkoutはpromotion codeを受け付ける

### Firestoreコレクション

- `license_entitlements/{id}`: ライセンス状態、購入メールのハッシュ、Stripe参照ID、検証記録
- `license_code_indexes/fanza_comment/codes/{license_code}`: ライセンスコードから entitlement へ解決するサーバー専用索引
- `license_claims/{sha256(app_id:license_id:device_fingerprint_hash)}`: デバイス紐づけ
- `webhook_events/{event_id}`: Stripeイベントの冪等処理記録

コメント本文や動画タイトルはこれらのコレクションへ保存しない。

### HTTP API

- `POST /activate`
- `POST /verify`
- `POST /verify-device`
- `POST /create-checkout-session`
- `POST /stripe-webhook`
- Stripe Checkoutから戻る `GET ?redirect=success|cancel` はYouTubeへリダイレクトする

ブラウザー拡張の呼び出しではSupabaseの `apikey` ヘッダーを送らない。Firestore Rulesを公開APIの代替認証として使わず、Functions側で入力を検証し、データアクセスはAdmin SDKに限定する。

## 3. データ移行

移行スクリプト `functions/scripts/migrate-supabase-to-firestore.mjs` は Supabase REST API から次のデータを読み、対応するFirestore文書を作る。

- `license_entitlements` は `app_id=fanza_comment` の行
- `license_claims` は `app_id=fanza_comment` の行
- `webhook_events` は既存テーブル全行（このテーブルには `app_id` がないため）
- entitlementごとのライセンスコード索引を生成

既定動作はdry-runで、Firestoreへの書き込みは行わない。既存文書が同一内容なら再実行可能。内容の異なる文書が存在する場合は全書き込み前に停止する。`--apply` で書き込む場合もバッチ単位で冪等に再実行できる。

実行前に、オペレーターのローカル環境へ `SUPABASE_URL` と `SUPABASE_SERVICE_ROLE_KEY` を環境変数として設定し、Firebase Admin SDKのApplication Default Credentialsに対象Firestoreへの権限を与える。キーやサービスアカウント秘密鍵をGit、拡張機能、チャットへ保存しない。スクリプトはライセンスコード・メールハッシュなどの行内容をログへ出さず、件数だけを表示する。

2026-10-24、ユーザーから既存購入者がいないことを確認した。このため初回公開では移行スクリプトを実行せず、Firestoreの空状態から開始する。Supabase Management APIの読み取りは環境内の `SUPABASE_ACCESS_TOKEN` でHTTP 401となったが、今回の初回公開には不要である。公開準備中にSupabase側へ購入者データが作成された場合や、将来データ移行する場合は、その時点で認証を復旧し、移行対象を再判断する。

```powershell
Set-Location functions
npm install
npm run migrate:supabase -- --dry-run
npm run migrate:supabase -- --apply
```

`--apply` は、将来Supabaseに移行対象データが存在し、要約と競合を確認して移行すると決めた場合に限る。今回の初回公開では移行しない。

## 4. シークレットと設定値

Cloud FunctionsのSecret Managerに設定する値:

- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `LICENSE_TOKEN_SECRET`

Functionsパラメーターとして設定する値（Stripe本番アカウント「神シーンメモ」で価格を確認済み）:

- `STRIPE_PRICE_ID_JPY=price_1T8IEHPa0VuZQWboXMu2EuXf`（¥500）
- `STRIPE_PRICE_ID_USD=price_1TGJdxPa0VuZQWboX77vSKrv`（$3.99）
- `STRIPE_PRICE_ID`（任意のfallback）
- `ALLOWED_ORIGINS`（任意。YouTubeの標準許可に追加するオリジン）

Price IDは `functions/.env.fanza-comment-lic-20260303` に保存し、`functions/.gitignore` でGit対象外にしている。Firebase CLIはFunctionsのデプロイ時に同ファイルの値を読み込む。

Supabaseの `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` は移行スクリプトの実行時だけ必要で、Firebase Functionsの本番環境へ移さない。

## 5. 切替の順序と運用境界

1. Firebase Blaze有効状態、FirestoreのDBロケーションと既存データを確認する（2026-10-24確認済み）。既存デフォルトDB `nam5` は空で、実装もデフォルトDBを参照するため移行先として使う。Firestoreロケーションは変更できず、Functions `asia-northeast1` とはリージョン差がある。
2. Firestore Rulesはリモートもクライアントアクセス拒否を確認済み。デプロイ時もこの制限を維持する。
3. Secret Manager APIを有効化し、`LICENSE_TOKEN_SECRET` / 差し替えStripe keyの `STRIPE_API_KEY` / webhook signing secretの `STRIPE_WEBHOOK_SECRET` を登録する（2026-10-24完了）。3件とも有効なバージョン1を確認した。価格IDとデプロイパラメーターはGit除外のローカル設定からFunctionsへ反映する。
4. 今回は既存購入者なしのため、移行dry-run・Firestoreへの既存データ書き込みを省略する。公開準備期間中にSupabase側で購入が発生した場合は移行対象を再確認する。
5. JPY/USD Price ID、fallback、許可オリジンを設定してFunctionsをデプロイする（2026-10-24完了）。Firebase向けStripe webhook endpointをSupabase向けendpointと並行して追加する（2026-10-24完了）。Supabase endpointは切替時に削除しない。
6. Stripe test modeとFirebase EmulatorでCheckout、決済完了Webhook、同じ端末のverify、テスト返金による失効を確認する（2026-10-24完了）。合成entitlementによるactivate/verify、誤入力の拒否、同一端末再activation、別端末へのclaim移行も確認済み。本番Checkout/返金とStripe発行ライセンスから拡張UIまでの実購入フローは未確認だが、任意の追加確認で配布条件ではない。
7. 受け入れ確認後に拡張v1.0.3のZIPを生成し、ZIP内manifestとLPのバージョン・リンクをそろえてから公開する。公開中ZIPは現在v1.0.2。本番の実購入・返金は公開条件にしない。
8. v1.0.2の既存インストールはSupabase APIを引き続き呼び出す。互換期間中はSupabase APIとwebhookを維持し、Stripeイベントを両基盤へ配信する。旧API/webhookの停止は旧版の購入・復元をサポートしなくてよいと判断した後に別途行う。

2026-10-24にStripe本番アカウントへFirebase向けwebhook endpointを有効化し、`checkout.session.completed` / `charge.refunded` を購読するよう設定した。既存Supabase endpointは維持している。3つのSecretをSecret Managerへ登録し、`licenseApi` とFirestore Rulesを本番デプロイ済み。Artifact Registryは7日経過した古いイメージを整理する。本番APIではCORS `OPTIONS` が204、ランダム指紋の読み取り専用 `verify-device` が `200 no_claim_found` で成功した。本番StripeでのCheckout/返金は実施していない。Stripe test mode / Firebase EmulatorでのCheckout・Webhook発行・全額返金失効E2Eは2026-10-24に確認済み。さらに合成entitlementによるactivate/restore・誤入力・端末移行を2026-10-24に確認済み（詳細は次項）。

決済とWebhookの受け入れ確認にはStripe test modeとFirebase Emulatorを使い、本番のキー・Webhook secret・Firestoreを変更しない。EmulatorはFunctions `5001` / Firestore `8080` / UI `4000`。検証専用JPY/USD Price ID、Checkout Sessions書き込み限定のtest API key、ローカルWebhook signing secret、`LICENSE_TOKEN_SECRET` はGit除外の `functions/.env.local` / `.secret.local` に保存済み。Stripe CLI Sandbox認証とlistener起動を確認した。2026-10-24の実測ではJPY ¥500 Checkout作成がHTTP 200、`checkout.session.completed` webhookがHTTP 200、Firestore entitlementが `active`、同じ端末の `verify-device` が `is_pro=true`。Sandboxで全額返金後、`charge.refunded` webhookがHTTP 200、entitlementが `refunded`、`verify-device` が `is_pro=false` / `no_active_license` を返した。

```powershell
npx firebase-tools@latest emulators:start --only functions,firestore --project demo-scene-memo
npx --yes @stripe/cli listen --events 'checkout.session.completed,charge.refunded' --forward-to http://127.0.0.1:5001/demo-scene-memo/asia-northeast1/licenseApi/stripe-webhook
```

Stripe CLIが表示するローカルWebhook署名シークレットを `.secret.local` に保存し、Emulatorを起動し直す。Stripe test modeで作成したJPY/USD Price IDと制限付きテストAPI keyを使って `/create-checkout-session` を呼び、CheckoutではStripe提供のテストカードを使う。Webhookの成功応答とEmulator UI上の `license_entitlements` / `license_code_indexes` / `license_claims` / `webhook_events` を確認し、同じ端末指紋への `verify-device` がProを返すこと、テスト返金後にProが失効することを確認する。Stripe test modeはテストキーとtest Price IDを使い、テストデータは本番データから分離する。テストキーや署名シークレットをチャットやGitへ書かない。

Stripe test mode / Firebase EmulatorのCheckout・Webhook発行・返金失効E2Eと、合成entitlementによるactivate/restore・誤入力・端末移行確認は完了した。本番Checkout/返金およびStripe発行ライセンスから拡張UIまでの実購入フローは未確認だが、任意の追加確認で配布条件ではない。v1.0.3 ZIPは未作成・未公開。ローカルFunctionsビルドと拡張JavaScript構文・ロケールJSONの最終確認は2026-10-25に成功した。LPは現在v1.0.2 ZIPを参照しているため、公開時に配布ZIPとリンクを同期する。過去にStripe画面の読み取り結果へ含まれたキーは使用していないが、旧キーの失効状態は未確認。標準テストSecret keyも画面に表示されたため、他環境で使っている場合は差し替える。Supabaseはv1.0.2互換のため維持する。Supabaseを停止する日付・旧版サポート期間は未決定。初回Firestoreデータ移行はユーザー確認により不要。
