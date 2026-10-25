# 認知施策用の製品事実・計測確認表

確認日: 2026-10-25（日本時間）
用途: LP・投稿・記事の事実確認用。リポジトリ内の公開ZIPとソースを照合した結果であり、外部の公開サイトや各ダッシュボードの設定状態を今回再確認したものではない。

## 公開中の製品について使える事実

| 項目 | 確認できた事実 | 根拠・表現上の注意 |
|---|---|---|
| 公開対象 | LPの配布リンクは拡張 v1.0.2 のZIPを指す。ZIP内の `manifest.json` も `1.0.2`。作業ツリーの拡張ソースは `1.0.3` だが、Firebase移行版は未配布。 | [公開ZIP](../../scene-memo-LP/extension_v1.0.2.zip)、[作業ツリーのmanifest](../../extension/manifest.json)、[AGENTS.md](../../AGENTS.md)。投稿は公開ZIPの挙動を基準にし、未配布の1.0.3を公開済みとして扱わない。 |
| 対応環境 | PC版Chrome拡張。FANZA、DMM TV、YouTubeの対象プレーヤーページをmanifestに指定している。 | [公開ZIP内manifest](../../scene-memo-LP/extension_v1.0.2.zip)。各サービスの全ページ・全プレーヤー対応とは言わない。 |
| 主な機能 | 動画の再生時刻と文章メモを複数保存し、メモ一覧・検索から該当位置へ戻れる。A/Bで任意区間をリピートできる。 | [requirements_definition.md](../requirements_definition.md)、公開LP。公開ZIP内のコメント上限は50件。 |
| 保存対象 | コメント本文・再生時刻などのメモは `chrome.storage.local` に保存される。動画ファイルを保存・ダウンロードする機能ではない。 | [公開ZIP内content.js](../../scene-memo-LP/extension_v1.0.2.zip)、[LP](../../scene-memo-LP/index.html)。 |
| 外部通信 | コメント本文を開発者サーバーへ送信しない。動画タイトル補完ではYouTube oEmbedまたは対象動画ページへ取得通信する場合がある。Pro確認・購入では公開 v1.0.2 のSupabaseライセンスAPIへ通信する。 | [公開ZIP内content.js / popup.js](../../scene-memo-LP/extension_v1.0.2.zip)、[README](../../README.md)。「完全オフライン」「通信しない」とは表現しない。 |
| 無料上限 | 対応サイト・動画全体で合計50件。 | [公開ZIP内content.js](../../scene-memo-LP/extension_v1.0.2.zip)、[LP](../../scene-memo-LP/index.html)。 |
| Pro価格 | 1デバイス買い切り。LPはタイムゾーンが `Asia/Tokyo` の場合に¥500、それ以外は$3.99を表示する。 | [LP価格処理](../../scene-memo-LP/app.js)、[LP](../../scene-memo-LP/index.html)、[requirements_definition.md](../requirements_definition.md)。「500円」と書く場合は日本向け表現とする。 |
| 導入・更新 | 現行LPはChrome Web Storeを経由しないZIPの手動導入を案内。ストアの自動更新はなく、新しいZIPの手動更新が必要。 | [LP導入案内](../../scene-memo-LP/index.html)、公開ZIP内の多言語手順書。Chrome Web Store限定公開への切替は未決定。 |

## 追加費用0円で進める判断

- Chrome Web Storeへ公開するには開発者登録と一回限りの登録料が必要。既に登録済みで追加費用がないかは未確認のため、費用ゼロを優先する間は現行のZIP配布を維持する。
- X APIの投稿作成は従量課金で、2026-10-25に公式料金ページで1投稿リクエストあたり $0.015 と表示されていた。料金は変わり得るため0円運用では投稿APIを呼び出さず、原稿作成までにとどめて手動投稿を前提とする。
- Search Consoleはサイト所有者が無料で使える。Cloudflare Web Analyticsも無料で提供され、Cloudflare Pagesでは設定画面から有効化できる。アカウント接続・利用可能状態は未確認。
- 新規の有料契約、登録料、API従量課金を発生させる操作は行わない。

### 原稿で避ける表現

- 動画をダウンロード・保存する、端末間でメモが自動同期する、すべてのプレーヤーで動く。
- 完全オフライン、外部通信なし、完全匿名。
- 公開済みv1.0.3、Firebase版の課金APIを現行利用者が使っている。
- ZIPクリックをインストール完了数として扱う。
- 実測のない利用者数、継続率、検索数、検索順位。

## 計測の現状

- 初回監査時、LPソースにアクセス解析タグや `google-site-verification` メタタグ、`scene-memo-LP/` にサイトマップとrobots.txtが見当たらなかった。2026-10-25に両ファイルをローカル作成した。公開URLをブラウザーで確認すると、`/robots.txt` と `/sitemap.xml` はどちらもHTTP 200だが `text/html` でLP本文を返したため、本番では未反映と判定する。CloudflareやSearch Console側の設定状態は断定できない。
- 配信台帳の `analytics_connection` は `not_connected`。Search Console・SNS・LPの計測値は未取得と記録されている。[queue.json](queue.json)、[初回準備記録](runs/2026-10-24.md)。
- UTMパラメータはリンクに付けるだけでは集計されない。LP側でクエリやイベントを受け取る計測先が必要。
- Cloudflare Web Analyticsは、Pagesのダッシュボードから有効化すると、次回デプロイ時に計測スクリプトを自動挿入できる。ページ閲覧・パフォーマンスの把握には使えるが、現行仕様ではUTMのクエリ文字列もカスタムイベントも記録しない。したがって、これだけでは投稿別の流入やZIPクリックを計測できない。
- Cloudflare Web Analyticsの利用可否はCloudflareアカウントのPages設定で確認が必要。今回の作業環境からそのダッシュボード状態は読めていない。
- Search Consoleの検索パフォーマンスは、Googleアカウントで対象サイトの所有権確認とプロパティ接続が必要。今回の作業環境からプロパティや検索実績は確認できていない。
- 拡張機能内のコメント本文・動画ID・動画タイトル・保存時刻・利用状況を、認知施策の計測へ追加しない。導入完了は、利用者の任意申告または直接確認できる根拠がある場合だけ記録する。

## 次に必要な計測判断

1. Search Consoleの既存プロパティと所有権確認状態を確認する。
2. Cloudflare Web AnalyticsをPagesの設定で有効化できるか確認する。これはページ閲覧・パフォーマンスの基準値用とし、UTM・ZIPクリックの計測には使わない。
3. まず無料計測の範囲でSearch ConsoleとCloudflare Web Analyticsを使う。有料分析サービスは導入しない。投稿別UTMとZIPクリックは、無料の計測方法が別途確認できるまでは未取得とする。
4. 計測を有効にできた後、最初の4週間の基準値を取り、X投稿を既存上限の週2件で試す。計測のない期間をゼロ実績として扱わない。

## 根拠資料

- [Chrome Web Store開発者登録](https://developer.chrome.com/docs/webstore/register): 公開には一回限りの登録料が必要。
- [X Developer Platform](https://developer.x.com/): 投稿作成を含む従量課金の単価を掲載。
- [Google Search Consoleの案内](https://developers.google.com/crawling/docs/about-crawling): サイト所有者向けに無償で提供。
- [Cloudflare PagesでWeb Analyticsを有効にする](https://developers.cloudflare.com/pages/how-to/web-analytics/): Pagesダッシュボードから有効化し、次回デプロイでスクリプトを挿入する手順。
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/): UTMクエリ文字列およびカスタムイベントは現在記録しない旨。
- [Google Search Consoleを使う](https://developers.google.com/search/docs/monitor-debug/search-console-start?hl=en): 検索パフォーマンス・検索語・ページ別指標の確認。
