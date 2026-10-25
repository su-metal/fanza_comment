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
2. `https://scene-memo.pages.dev/sitemap.xml` は初回レポートが「取得できませんでした」・検出0件だったため、公開URLで正しいXMLと応答Content-Typeを確認したうえで2026-10-25に再送信し、Googleの送信成功表示を確認。画面の既存レポート行はまだ初回の失敗状態のままなので、処理結果と検出URL数の更新を後日確認する。
3. 検索表示・クリック等の実績はまだ未取得。未反映をゼロ実績として報告しない。

## 2. Bing Webmaster Tools

1. 既存のMicrosoft、Google、FacebookアカウントのいずれかでBing Webmaster Toolsを開く。
2. Search Consoleで所有権確認済みなら、**Google Search Consoleからインポート**を優先する。Google側の確認とサイトマップを引き継げる。
3. インポートできない場合は `https://scene-memo.pages.dev/` を手動追加し、画面が提示するXMLファイルまたはメタタグ方式で確認する。指定ファイルはサイトのルートへ置き、指定タグはトップページの`<head>`へ追加して本番へ反映する。
4. サイトマップがインポートされていない場合だけ、BingのSitemaps画面から `https://scene-memo.pages.dev/sitemap.xml` を送信する。
5. 登録後は検索パフォーマンスと、利用可能な場合はAI Performanceを確認する。インデックス掲載やAI回答での引用は保証されない。

## 3. Cloudflare Web Analytics（任意・無料）

現状: LPとFANZAガイドの公開説明を含むPR #9は未マージ。本番LPで説明が未掲載であることを確認した。Pages設定状態は未確認。公開説明が本番へ反映された後に設定を確認し、必要に応じて有効化する。

1. LP FAQとFANZAガイドのプライバシー欄に、計測範囲・Cloudflareへの送信・拡張機能データを対象外とする説明が公開されていることを確認する。
2. Cloudflare DashboardでWorkers & Pages → `scene-memo` → Metrics → Web Analytics → Enableを選ぶ。
3. Pagesは次回デプロイ時に計測スクリプトを自動挿入する。デプロイ後にHTMLの計測スクリプトとWeb Analytics画面の受信状態を確認する。
4. ページ閲覧数と表示性能を初回基準値として記録する。ZIPクリックや拡張機能の利用・インストール数として読み替えない。

Cloudflareの現行説明ではWeb Analyticsは無料で、Cookieを使わず、訪問者の個人データを収集・使用せず、顧客サイト間で個人を追跡しない。計測対象はLPとガイドのページ閲覧・表示性能に限る。拡張機能のメモ本文、動画ID、動画タイトル、再生位置、利用状況は送信しない。Cloudflare Web AnalyticsはURLクエリ文字列とカスタムイベントを記録しないため、UTM別流入やZIPクリックの値は取れないものとして扱う。

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

