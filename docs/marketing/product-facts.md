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
| 公式プレーヤーの代替機能 | DMM Player v2はお気に入り場面へのチャプター追加、チャプター間のABリピートに対応する。公式ヘルプでは動画ファイルを開いて使うプレーヤーとして説明されている。 | [FANZA公式ヘルプ](https://support.fanza.jp/digital/article/46515)。神シーンメモを「唯一のシーン保存手段」と言わず、FANZAのブラウザー視聴中に文章メモ付きの時刻をローカル保存できる点を軸に説明する。 |

## 追加費用0円で進める判断

- Chrome Web Storeへ公開するには開発者登録と一回限りの登録料が必要。既に登録済みで追加費用がないかは未確認のため、費用ゼロを優先する間は現行のZIP配布を維持する。
- X APIの投稿作成は従量課金で、2026-10-25に公式料金ページで1投稿リクエストあたり $0.015 と表示されていた。料金は変わり得るため0円運用では投稿APIを呼び出さず、原稿作成までにとどめて手動投稿を前提とする。
- Search ConsoleとBing Webmaster Toolsは無料のサイト所有者向けサービス。Bing Webmaster Toolsには検索パフォーマンスとAI Performanceのレポートがある。Cloudflare Web Analyticsも無料で提供され、Cloudflare Pagesでは設定画面から有効化できる。各アカウントの接続・利用可能状態は未確認。
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
- Pagesへの反映方法はプロジェクト種別によって異なる。Cloudflare公式手順では、Git連携プロジェクトはWranglerから手動デプロイできるが、ダッシュボードのドラッグ＆ドロップは使えない。Direct Uploadプロジェクトならドラッグ＆ドロップまたはWranglerを使える。現在のPagesプロジェクト種別は未確認。この環境にはCloudflare APIトークン・アカウントID・Wrangler CLIがなく、ログインも確認できていないため、デプロイは未実施。
- Search Consoleの検索パフォーマンスは、Googleアカウントで対象サイトの所有権確認とプロパティ接続が必要。今回の作業環境からプロパティや検索実績は確認できていない。
- 代替機能の確認では、FANZA公式ヘルプにDMM Player v2のチャプター追加・チャプター間ABリピートが記載されていた。対象ページは動画ファイルを開くデスクトッププレーヤーの説明なので、ブラウザー視聴向けの神シーンメモとは利用環境を分けて説明する。
- 拡張機能内のコメント本文・動画ID・動画タイトル・保存時刻・利用状況を、認知施策の計測へ追加しない。導入完了は、利用者の任意申告または直接確認できる根拠がある場合だけ記録する。

## 次に必要な計測判断

各サービスの無料接続手順と、確認前に満たす条件は[無料計測の接続チェックリスト](free-measurement-setup.md)に記録する。

1. 本番のデプロイ元を確定し、`robots.txt` が `text/plain`、`sitemap.xml` が有効なXMLとして返る状態に反映する。現在の公開URLは両方ともLPの `text/html` を返すため、修正が公開されるまではサイトマップを送信しない。
2. 既存GoogleアカウントでSearch ConsoleのURLプレフィックス `https://scene-memo.pages.dev/` を追加し、利用可能な方法で所有権を確認してから `https://scene-memo.pages.dev/sitemap.xml` を送信する。
3. 既存MicrosoftアカウントでBing Webmaster Toolsに同じURLを登録・確認し、サイトマップを送信する。検索パフォーマンスとAI Performanceは、プロパティの確認後に取得できる範囲で見る。
4. Cloudflare Pagesの既存アカウントでWeb Analyticsを利用できるか確認する。有効化の前に公開プライバシー説明との整合を確認する。ページ閲覧・パフォーマンスの基準値用とし、UTM・ZIPクリックの計測には使わない。
5. 接続後に最初の4週間の基準値を取り、X投稿は既存上限の週2件で試す。投稿別UTM・ZIPクリック・インストール完了は無料で直接確認できる方法がない限り未取得とし、未計測期間をゼロ実績にしない。

## 根拠資料

- [Chrome Web Store開発者登録](https://developer.chrome.com/docs/webstore/register): 公開には一回限りの登録料が必要。
- [X Developer Platform](https://developer.x.com/): 投稿作成を含む従量課金の単価を掲載。
- [Google Search Consoleの案内](https://developers.google.com/crawling/docs/about-crawling): サイト所有者向けに無償で提供。
- [Cloudflare PagesでWeb Analyticsを有効にする](https://developers.cloudflare.com/pages/how-to/web-analytics/): Pagesダッシュボードから有効化し、次回デプロイでスクリプトを挿入する手順。
- [Cloudflare Pages Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/): Direct Uploadの手順と、Git連携プロジェクトではダッシュボードのドラッグ＆ドロップが使えない制約。
- [Wrangler Pages deploy](https://developers.cloudflare.com/workers/wrangler/commands/pages/): Pagesの静的ファイルを手動デプロイするCLIコマンド。
- [Cloudflare Web Analyticsの概要](https://developers.cloudflare.com/web-analytics/about/): 無料提供と、個人データを収集・使用しないというCloudflareの説明。
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/): UTMクエリ文字列およびカスタムイベントは現在記録しない旨。
- [Google Search Consoleを使う](https://developers.google.com/search/docs/monitor-debug/search-console-start?hl=en): 検索パフォーマンス・検索語・ページ別指標の確認。
- [Search Consoleにサイトを追加する](https://support.google.com/webmasters/answer/34592?hl=en): URLプレフィックスの追加と所有権確認方法。
- [Bing Webmaster Tools](https://www.bing.com/webmasters/about): 無料SEO/GEOツール。
- [Bing Webmaster Tools AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c): AI回答で引用されたページ、可視性の変化、関連クエリのレポート。
- [FANZA公式ヘルプ: DMM Player v2の利用方法](https://support.fanza.jp/digital/article/46515): チャプター追加、チャプター間のABリピート、動画ファイル・プレイリストの扱い。

