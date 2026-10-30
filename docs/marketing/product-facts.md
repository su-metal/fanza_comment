# 認知施策用の製品事実・計測確認表

確認日: 2026-10-31（日本時間）
用途: LP・投稿・記事の事実確認用。リポジトリ内の公開ZIPとソースを照合した結果であり、GA4プロパティとCloudflare Pages Metricsの状態も確認した。GA4タグは本番未反映で、実測値は未取得。

## v1.0.3公開候補について使える事実

候補LPにはFirebase版v1.0.3 ZIPを含め、ダウンロードリンクを同期した。Cloudflare PagesのProduction workflow成功後に公開版切替を確認する。

| 項目 | 確認できた事実 | 根拠・表現上の注意 |
|---|---|---|
| 公開対象 | リリース候補LPの配布リンクは拡張 v1.0.3 ZIPを指し、ZIP内manifestも `1.0.3`。本番切替はCloudflare Pages Actions成功で確認する。 | [候補ZIP](../../scene-memo-LP/extension_v1.0.3.zip)、[ソースmanifest](../../extension/manifest.json)、[AGENTS.md](../../AGENTS.md)。公開確認前にv1.0.3を公開済みとして扱わない。 |
| 対応環境 | PC版Chrome拡張。FANZA、DMM TV、YouTubeの対象プレーヤーページをmanifestに指定している。 | [候補ZIP内manifest](../../scene-memo-LP/extension_v1.0.3.zip)。各サービスの全ページ・全プレーヤー対応とは言わない。 |
| 主な機能 | 動画の再生時刻と文章メモを複数保存し、メモ一覧・検索から該当位置へ戻れる。A/Bで任意区間をリピートできる。 | [requirements_definition.md](../requirements_definition.md)、公開LP。公開ZIP内のコメント上限は50件。 |
| 保存対象 | コメント本文・再生時刻などのメモは `chrome.storage.local` に保存される。動画ファイルを保存・ダウンロードする機能ではない。 | [候補ZIP内content.js](../../scene-memo-LP/extension_v1.0.3.zip)、[LP](../../scene-memo-LP/index.html)。 |
| 外部通信 | コメント本文を開発者サーバーへ送信しない。動画タイトル補完ではYouTube oEmbedまたは対象動画ページへ取得通信する場合がある。v1.0.3ではPro確認・購入にFirebase版ライセンスAPIを使い、v1.0.2はSupabase APIを継続利用する。 | [候補ZIP内content.js / popup.js](../../scene-memo-LP/extension_v1.0.3.zip)、[README](../../README.md)。「完全オフライン」「通信しない」とは表現しない。 |
| LP・ガイドのサイト計測 | GA4専用プロパティ「神シーンメモ」、Webストリーム `https://scene-memo.pages.dev`、測定ID `G-29BQ8L3ST0` を設定。トップ・FANZA・YouTubeガイドのローカルHTMLにGoogle tagと説明を追加したが本番未反映で、実測値は未取得。 | GA4はCookieなどの識別子を使用。Googleシグナル、広告パーソナライズ用シグナル、拡張計測は無効。拡張機能内データとページ操作イベントは計測対象外。Cloudflare Pages MetricsではWeb Analyticsが有効と表示されるため、GA4公開後に無効化してbeacon停止を確認する。 |
| 無料上限 | 対応サイト・動画全体で合計50件。 | [候補ZIP内content.js](../../scene-memo-LP/extension_v1.0.3.zip)、[LP](../../scene-memo-LP/index.html)。 |
| Pro価格 | 1デバイス買い切り。タイムゾーンが `Asia/Tokyo` の場合は¥500、それ以外は$3.99。LPは日本向けに¥500のリリース記念キャンペーン価格を2027年1月30日まで、2027年1月31日から¥980で販売する予定を表示する。価格切替時はLP・拡張機能・Checkoutの表示と実価格を同期する。 | [LP価格処理](../../scene-memo-LP/app.js)、[LP](../../scene-memo-LP/index.html)、[requirements_definition.md](../requirements_definition.md)。「500円」と書く場合は日本向け表現とする。 |
| 地域利用 | FANZA/DMMの地域制限により、日本国外では利用できないサービス・動画がある。LPではVPN等を使っても利用は保証されず、拡張機能が地域制限を回避しないことを4言語で案内する。 | [DMM公式サポート](https://support.dmm.com/accounts/article/45604)。利用可能性を一律に断定せず、サービスや動画によって制限があると説明する。 |
| 導入・更新 | 現行LPはChrome Web Storeを経由しないZIPの手動導入を案内。ストアの自動更新はなく、新しいZIPの手動更新が必要。 | [LP導入案内](../../scene-memo-LP/index.html)、公開ZIP内の多言語手順書。Chrome Web Store限定公開への切替は未決定。 |
| 公式プレーヤーの代替機能 | DMM Player v2はお気に入り場面へのチャプター追加、チャプター間のABリピートに対応する。公式ヘルプでは動画ファイルを開いて使うプレーヤーとして説明されている。 | [FANZA公式ヘルプ](https://support.fanza.jp/digital/article/46515)。神シーンメモを「唯一のシーン保存手段」と言わず、FANZAのブラウザー視聴中に文章メモ付きの時刻をローカル保存できる点を軸に説明する。 |

## 追加費用0円で進める判断

- Chrome Web Storeへ公開するには開発者登録と一回限りの登録料が必要。既に登録済みで追加費用がないかは未確認のため、費用ゼロを優先する間は現行のZIP配布を維持する。
- X APIの投稿作成は従量課金で、2026-10-25に公式料金ページで1投稿リクエストあたり $0.015 と表示されていた。料金は変わり得るため0円運用では投稿APIを呼び出さず、原稿作成までにとどめて手動投稿を前提とする。
- Search ConsoleとBing Webmaster Toolsは無料のサイト所有者向けサービス。Bing Webmaster Toolsには検索パフォーマンスとAI Performanceのレポートがある。Search ConsoleのURLプレフィックスは2026-10-25に所有権確認済みで、サイトマップ送信後の最新レポート状態は未確認。Bingは未接続。GA4は専用プロパティ作成済みだが、本番タグ配信と実測値確認は未完了。
- 新規の有料契約、登録料、API従量課金を発生させる操作は行わない。

### 原稿で避ける表現

- 動画をダウンロード・保存する、端末間でメモが自動同期する、すべてのプレーヤーで動く。
- 完全オフライン、外部通信なし、完全匿名。
- v1.0.3を公開済みと表現するのはCloudflare PagesのProduction workflow成功後。v1.0.2利用者もFirebase版APIへ移行済みと説明する。
- ZIPクリックをインストール完了数として扱う。
- 実測のない利用者数、継続率、検索数、検索順位。

## 計測の現状

- 2026-10-25にCloudflare Pages本番の `/robots.txt` はHTTP 200・`text/plain`、`/sitemap.xml` はHTTP 200・`application/xml`で正しい本文を返すことを確認した。Search ConsoleのURLプレフィックスはHTMLファイル方式で所有権確認済み。サイトマップの初回レポートは「取得できませんでした」・検出0件だったため、同日再送信しGoogleの送信成功表示を確認。既存レポート行は初回失敗のままで、再処理・レポート更新を待つ。
- 配信台帳の `analytics_connection` は `ga4_property_created_pending_deployment`。Search Consoleの所有権確認・サイトマップ再送信成功は記録済みだが、最新レポートは未確認。GA4は2026-10-30にプロパティとストリームを作成し、タグと説明をローカル3ページへ追加した。本番反映前のため受信データ・SNS/LP計測値は未取得。[queue.json](queue.json)、[初回準備記録](runs/2026-10-24.md)。
- GA4では標準の参照元レポートで流入元を確認できる。UTM別流入はタグの本番反映後に実際の受信を確認してから使う。
- GA4はページビューと標準イベントを収集する。ページ上のクリック・スクロール・ダウンロードイベント、ZIPクリック、拡張機能内利用は初期対象にしない。
- Cloudflare Pages MetricsではWeb Analyticsが有効と表示される。GA4タグの公開と同時期に無効化し、公開HTMLからCloudflare beaconが消えたことを確認する。
- Cloudflare PagesはDirect Upload型だが、GitHub Actions + Wranglerを使った本番自動配信を設定済み。PR #7は2026-10-25に `en_language` へマージされ、Actions runs `40161734375` と `40163075966` が成功。Cloudflare APIトークンのローテーション後、Actions run `40185303631`（commit `3e1ca5a`）が成功し、Repository Secretと本番配信を再確認した。
- Search Consoleの所有権確認とサイトマップ送信は完了。初回送信レポートは「取得できませんでした」・検出0件のまま。公開URLを修正後に再送信し、送信成功表示は確認済みだが、再処理後のレポートと検索実績はまだ未取得。
- 代替機能の確認では、FANZA公式ヘルプにDMM Player v2のチャプター追加・チャプター間ABリピートが記載されていた。対象ページは動画ファイルを開くデスクトッププレーヤーの説明なので、ブラウザー視聴向けの神シーンメモとは利用環境を分けて説明する。
- 拡張機能内のコメント本文・動画ID・動画タイトル・保存時刻・利用状況を、認知施策の計測へ追加しない。導入完了は、利用者の任意申告または直接確認できる根拠がある場合だけ記録する。

## 次に必要な計測判断

各サービスの無料接続手順と、確認前に満たす条件は[無料計測の接続チェックリスト](free-measurement-setup.md)に記録する。

1. Search Consoleのサイトマップレポートを後日再確認し、処理状態と検出URL数を記録する。
2. 既存MicrosoftアカウントでBing Webmaster Toolsに同じURLを登録・確認し、Search Consoleからインポートできる場合はそれを使う。検索パフォーマンスとAI Performanceは、プロパティの確認後に取得できる範囲で見る。
3. GA4タグを本番へ反映して3ページの自動収集イベントと参照元を確認する。Cloudflare Web AnalyticsはPages Metricsで無効化し、公開ページでCloudflare beaconが止まったことを確認する。
5. 接続後に最初の4週間の基準値を取り、X投稿は既存上限の週2件で試す。投稿別UTM・ZIPクリック・インストール完了は無料で直接確認できる方法がない限り未取得とし、未計測期間をゼロ実績にしない。

## 根拠資料

- [Chrome Web Store開発者登録](https://developer.chrome.com/docs/webstore/register): 公開には一回限りの登録料が必要。
- [X Developer Platform](https://developer.x.com/): 投稿作成を含む従量課金の単価を掲載。
- [Google Search Consoleの案内](https://developers.google.com/crawling/docs/about-crawling): サイト所有者向けに無償で提供。
- [Cloudflare PagesでWeb Analyticsを有効にする](https://developers.cloudflare.com/pages/how-to/web-analytics/): Pagesダッシュボードから有効化し、次回デプロイでスクリプトを挿入する手順。
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/): Direct Uploadの手順と、Git連携プロジェクトではダッシュボードのドラッグ＆ドロップが使えない制約。
- [Wrangler Pages deploy](https://developers.cloudflare.com/workers/wrangler/commands/pages/): Pagesの静的ファイルを手動デプロイするCLIコマンド。
- [Google AnalyticsでWebページのページビューを測定](https://developers.google.com/analytics/devguides/collection/ga4/views?technology=websites): 標準ページビューの計測とレポート確認。
- [Google Analyticsのデータ保護](https://support.google.com/analytics/answer/6004245?hl=ja): Google Analyticsにおけるデータの取扱い。
- [Google Search Consoleを使う](https://developers.google.com/search/docs/monitor-debug/search-console-start?hl=en): 検索パフォーマンス・検索語・ページ別指標の確認。
- [Search Consoleにサイトを追加する](https://support.google.com/webmasters/answer/34592?hl=en): URLプレフィックスの追加と所有権確認方法。
- [Bing Webmaster Tools](https://www.bing.com/webmasters/about): 無料SEO/GEOツール。
- [Bing Webmaster Tools AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c): AI回答で引用されたページ、可視性の変化、関連クエリのレポート。
- [FANZA公式ヘルプ: DMM Player v2の利用方法](https://support.fanza.jp/digital/article/46515): チャプター追加、チャプター間のABリピート、動画ファイル・プレイリストの扱い。

