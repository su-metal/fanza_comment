# 無料計測の接続チェックリスト

対象: `https://scene-memo.pages.dev/`  
方針: 新規契約・有料API・計測用の拡張機能内データ収集は使わない。

## 0. 公開状態を先に確認する

- [x] Cloudflare Pagesの本番へ `robots.txt` と `sitemap.xml` を反映する。
- [x] `https://scene-memo.pages.dev/robots.txt` がHTTP 200・`text/plain`でrobots.txt本文を返すことを確認する。
- [x] `https://scene-memo.pages.dev/sitemap.xml` がHTTP 200・`application/xml`で有効なXMLを返すことを確認する。
- [x] サイトマップ内のURLが `https://scene-memo.pages.dev/` と `https://scene-memo.pages.dev/guide-fanza.html` であることを確認する。

2026-10-25時点でHTTP応答ヘッダー、robots本文、XML表示を確認済み。

## 1. Google Search Console

1. Search ConsoleのURLプレフィックス `https://scene-memo.pages.dev/` は、2026-10-25にHTMLファイル方式で所有権確認済み。確認用HTMLファイルは公開ルートから削除・改名しない。
2. `https://scene-memo.pages.dev/sitemap.xml` を送信済み。初回レポートは「取得できませんでした」・検出0件だが、URL検査の公開URLライブテストはクロール許可・ページ取得成功。Search Consoleの定期再試行とレポート更新を待ち、後日ステータスと検出URL数を再確認する。
3. 検索表示・クリック等の実績はまだ未取得。未反映をゼロ実績として報告しない。

## 2. Bing Webmaster Tools

1. 既存のMicrosoft、Google、FacebookアカウントのいずれかでBing Webmaster Toolsを開く。
2. Search Consoleで所有権確認済みなら、**Google Search Consoleからインポート**を優先する。Google側の確認とサイトマップを引き継げる。
3. インポートできない場合は `https://scene-memo.pages.dev/` を手動追加し、画面が提示するXMLファイルまたはメタタグ方式で確認する。指定ファイルはサイトのルートへ置き、指定タグはトップページの`<head>`へ追加して本番へ反映する。
4. サイトマップがインポートされていない場合だけ、BingのSitemaps画面から `https://scene-memo.pages.dev/sitemap.xml` を送信する。
5. 登録後は検索パフォーマンスと、利用可能な場合はAI Performanceを確認する。インデックス掲載やAI回答での引用は保証されない。

## 3. Cloudflare Web Analytics（任意）

1. 既存CloudflareアカウントでWorkers & Pagesを開き、`scene-memo` のPagesプロジェクトを選ぶ。
2. **Metrics → Web Analytics → Enable** を選ぶ。Pagesは次回デプロイ時に計測スクリプトを挿入する。
3. 有効化前に公開プライバシー説明を確認し、分析利用について説明が足りなければ先に文面を整える。
4. 公開後、Web Analytics画面でページ閲覧とパフォーマンスの基準値を記録する。

この機能はページ閲覧・パフォーマンスの確認用とする。現行のCloudflare Web AnalyticsはUTMクエリ文字列とカスタムイベントを記録しないため、投稿別流入やZIPクリックの数値として扱わない。必要なプライバシー説明が整うまで有効化を保留してよい。

## 4. 初回の基準値

- [ ] 接続した日付と、各サービスが示す最初の対象期間を記録する。
- [ ] Search Console: 検索語、表示、クリック、平均掲載順位。
- [ ] Bing Webmaster Tools: 検索語、表示、クリック、AI Performanceが利用できる場合は引用状況。
- [ ] Cloudflare Web Analytics: ページ別閲覧とパフォーマンス（任意）。
- [ ] 4週間後に同じ指標を比較する。未取得は空欄または「未取得」とし、ゼロ実績に置き換えない。

拡張機能のメモ本文、動画ID、動画タイトル、保存時刻、利用状況は認知施策の計測へ追加しない。UTMは集計先の仕様を確認するまで付けない。

## 公式手順

- [Search Consoleへサイトを追加](https://support.google.com/webmasters/answer/34592?hl=en)
- [Search Consoleの所有権確認方法](https://support.google.com/webmasters/answer/9008080?hl=en)
- [Bing Webmaster Tools: サイト追加・所有権確認](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b)
- [Bing Webmaster Tools: サイトマップ送信](https://www.bing.com/webmasters/help/Sitemaps-3b5cf6ed)
- [Cloudflare Pages: Web Analyticsを有効化](https://developers.cloudflare.com/pages/how-to/web-analytics/)

