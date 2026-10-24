(() => {
  const preferences = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages : [navigator.language || "en"];
  let locale = "en";
  for (const preference of preferences) {
    const value = String(preference).toLowerCase();
    if (value.startsWith("ja")) { locale = "ja"; break; }
    if (value.startsWith("zh")) { locale = "zh-CN"; break; }
    if (value.startsWith("ko")) { locale = "ko"; break; }
  }
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
  window.sceneMemoLocale = locale;

  const japanese = {
    title: "FANZAのシーン保存・ABリピートをブラウザで｜神シーンメモ",
    description: "FANZAをブラウザで観る人へ。動画をダウンロードせず、好きなシーンの再生位置を時刻付きメモで保存・検索。クリックで頭出し、ABリピートにも対応するPC版Chrome拡張「神シーンメモ」。無料で合計50件、Proは買い切り{price}。",
    ogLocale: "ja_JP", strings: { "¥500": "{price}", "Proは買い切り500円で保存数が無制限になります。": "Proは買い切り{price}で保存数が無制限になります。" },
    heroHtml: null, attrs: { theme: "背景テーマ", captions: "シーンの文字デザイン", placeholder: "忘れたくない場面に、ひとこと…", save: "メモを保存", timeline: "デモの再生位置" },
    demo: {
      notes: ["見返したい場面", "気になった台詞", "お気に入りのカット", "ラストシーン"], captions: [["見返したい", "場面"], ["気になった", "台詞"], ["お気に入りの", "カット"], ["ラスト", "シーン"]],
      alts: ["海辺を歩くピンクのワンピース水着姿の成人女性の全身", "プールサイドで飲み物を持って座るグリーンのセパレート水着姿の成人女性", "黄色い花柄の水着姿の成人女性の顔のアップ", "夕景のテラスに立つボーダーの水着姿の成人女性と海の風景"], generated: "のAI生成イメージ",
      play: "デモを再生", pause: "デモを一時停止", jump: "{time}「{text}」へ移動しました。", repeatOn: "00:48〜01:35をリピートします。", repeatOff: "区間リピートを解除しました。",
      maxNotes: "デモでは12件まで追加できます。再読み込みで初期状態に戻ります。", saved: "{time}にメモを保存しました（このページ内のデモ）。"
    }
  };
  window.sceneMemoLocaleReady = new Promise(resolve => {
    if (locale === "ja") { resolve(japanese); return; }
    const script = document.createElement("script");
    script.src = `locales/${locale}.js`;
    script.onload = () => resolve(window.sceneMemoCopy || japanese);
    script.onerror = () => { window.sceneMemoLocale = "ja"; document.documentElement.lang = "ja"; document.documentElement.dataset.locale = "ja"; resolve(japanese); };
    document.head.append(script);
  });
})();
