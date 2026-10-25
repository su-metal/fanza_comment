# 無料計測の接続チェックリスト

対象: `https://scene-memo.pages.dev/`  
方針: 新規契約・有料API・計測用の拡張機能内データ収集は使わない。

## 0. 公開状態を先に確認する

- [x] Cloudflare Pagesの本番へ `robots.txt` と `sitemap.xml` を反映する。
- [x] `https://scene-memo.pages.dev/robots.txt` が期待するrobots.txt本文を返し、LPのHTMLを返さないことを確認する。
- [x] `https://scene-memo.pages.dev/sitemap.xml` が有効なXMLを返し、LPのHTMLを返さないことを確認する。
- [x] サイトマップ内のURLが実際に公開しているcanonical URLと一致することを確認する。

本番のrobots.txtとサイトマップは確認済み。サイトマップはGoogle Search Consoleへ送信済みだが、取得状態は引き続き確認する。

## 1. Google Search Console（所有権確認済み・サイトマップ処理中）

1. 既存のGoogleアカウントでSearch Consoleを開き、サイトプロパティを追加する。
2. `https://scene-memo.pages.dev/` を**URLプレフィックス**として登録する。`pages.dev` のDNSを管理していない場合、DNS確認が必要なドメインプロパティではなくURLプレフィックスを使う。
3. Search Consoleが提示する所有権確認方法のうち、利用できるものを選ぶ。HTMLファイル方式なら指定ファイルをサイトのルートへ配置し、HTMLタグ方式なら指定タグをトップページの`<head>`へ追加して本番へ反映する。確認用の値はチャットやリポジトリへ書かず、Googleの画面から直接扱う。
4. 所有権確認後、サイトマップ欄へ `https://scene-memo.pages.dev/sitemap.xml` を送信する。
5. 送信状態、検出URL数、ページのインデックス状態を記録する。表示回数やクリックがまだない場合は「0件」と断定せず、「データ未反映」と区別する。

## 2. Bing Webmaster Tools（ユーザー方針で後回し）

1. 既存のMicrosoft、Google、FacebookアカウントのいずれかでBing Webmaster Toolsを開く。
2. Search Consoleで所有権確認済みなら、**Google Search Consoleからインポート**を優先する。Google側の確認とサイトマップを引き継げる。
3. インポートできない場合は `https://scene-memo.pages.dev/` を手動追加し、画面が提示するXMLファイルまたはメタタグ方式で確認する。指定ファイルはサイトのルートへ置き、指定タグはトップページの`<head>`へ追加して本番へ反映する。
4. サイトマップがインポートされていない場合だけ、BingのSitemaps画面から `https://scene-memo.pages.dev/sitemap.xml` を送信する。
5. 登録後は検索パフォーマンスと、利用可能な場合はAI Performanceを確認する。インデックス掲載やAI回答での引用は保証されない。

## 3. Cloudflare Web Analytics（有効化・本番デプロイ済み、実測値待ち）

1. 既存CloudflareアカウントでWorkers & Pagesを開き、`scene-memo` のPagesプロジェクトを選ぶ。
2. Metrics → Web Analytics → Enable は実施済み。次回デプロイへの計測スクリプト挿入と本番デプロイ成功まで確認した。
3. 公開FAQではページ閲覧・パフォーマンスの計測を説明し、拡張機能内のメモ本文や視聴情報を計測対象としていないことを確認した。
4. 公開後、Web Analytics画面でページ閲覧とパフォーマンスの基準値を記録する。

この機能はページ閲覧・パフォーマンスの確認用とし、投稿別流入やZIPクリックの数値として扱わない。公開FAQでも計測対象をページ閲覧・パフォーマンスに限定して説明済み。計測範囲を変える場合は、先に公開プライバシー説明を更新する。

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

## 2026-10-25 実施状況（Google優先）

- Google Search ConsoleのURLプレフィックスプロパティ `https://scene-memo.pages.dev/` は所有権確認済み。Search Consoleの通知にも確認完了と表示された。
- 公開 `/sitemap.xml` は有効なXMLで、トップページと `/guide-fanza.html` の2 URLを含む。公開 `/robots.txt` も期待する本文を返す。
- サイトマップは送信済みだが、Search Consoleの一覧は最終読み込み 2026/10/25、型「不明」、状態「取得できませんでした」、検出ページ0件。詳細画面にも具体的な原因は表示されていない。
- トップページとFANZAガイドのURL検査では、ライブテストが成功し、クロール許可・取得・インデックス登録許可を確認した。これはインデックス済みを意味しない。ページのインデックス登録と検索パフォーマンスの各レポートは「データを処理しています。1日後にもう一度ご確認ください」と表示し、検索実績はまだ取得できていない。
- トップページのインデックス登録リクエストは1日の割り当て上限で拒否された。同日は再試行せず、処理状況を待つ。翌日以降、必要なURLだけを少数ずつ申請する。
- Bing Webmaster Toolsは保留。Google側のサイトマップ・インデックス状態を先に確認する。
- Cloudflare Web Analyticsは有効化後の本番デプロイまで成功。実データが画面に届いたかはまだ未確認。
