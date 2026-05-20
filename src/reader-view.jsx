import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";

function getReadProgress(article, library) {
  const r = library?.reading?.[article.id];
  if (!r) return 0;
  if (article.richHtml) {
    const total = r.totalPanels || 0;
    if (!total) return 0;
    return Math.min(1, (r.readSections || []).length / total);
  }
  return r.marked ? 1 : 0;
}

function ProgressBar({ percent }) {
  const p = Math.max(0, Math.min(100, percent || 0));
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 19,
      height: 3,
      background: "var(--rule-soft)",
      width: "100%",
    }}>
      <div style={{
        width: `${p}%`,
        height: "100%",
        background: "var(--gold)",
      }}/>
    </div>
  );
}
function safeScriptJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003C");
}

function buildEinkRichHtml(rawHtml, fontMultiplier, articleId, readSections, plainInk = false, savedHighlights = []) {
  const richHighlightTexts = savedHighlights
    .map(item => item?.text || "")
    .filter(text => text.trim().length > 1);
  const overrideCss = `
<style id="boox-eink-override">
  @import url('https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&display=swap');

  *, *::before, *::after {
    text-shadow: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
  }

  /* === BOOKERLY-LIKE BODY FONT (Literata) — body text only, headings keep their original face === */
  body, .wrap, p, .tip-body, .tip-body p, .intro-block p, .intro-block,
  .quote-text, .quote-ref, .example-box p, .example-box,
  .do-box, .dont-box, .checklist, .checklist li,
  .theme-card .t-desc, .stat .lbl, .p-desc,
  .verdict-block p, .hero-author, .hero-year, .hero-subtitle {
    font-family: 'Literata', 'Cormorant Garamond', Georgia, serif !important;
  }
  /* Headings explicitly KEEP their original display face (IM Fell English etc.) */
  .hero-title, .section-title, .section-label, .tip-name, .tip-num,
  .p-label, .p-title, .stat .num, .theme-card .t-name, h1, h2, h3, h4, h5, h6 {
    /* font-family inherited from each book's own CSS — do not override */
  }

  /* Override root variables so var() references switch to light theme */
  html, body, .wrap, :root {
    --dark: #FFFCF1 !important;
    --dark2: #F7F4E8 !important;
    --text: #11110E !important;
    --muted: #3C382F !important;
    --cream: #FFFCF1 !important;
    --cream-dark: #ECE6D5 !important;
    --border-c: #252217 !important;
    --maroon: #762A32 !important;
    --maroon-light: #8D3842 !important;
    --maroon-bright: #762A32 !important;
    --gold: #7C5C1D !important;
    --gold-light: #4A3A1A !important;
    --gold-l: #4A3A1A !important;
    --blue: #263F63 !important;
    --blue-light: #334F78 !important;
    --teal: #762A32 !important;
    --teal-l: #8D3842 !important;
    --teal-b: #762A32 !important;
    --cream-d: #ECE6D5 !important;
    --border: #252217 !important;
    --red: #762A32 !important;
    --green: #315D40 !important;
    --paper: #F7F4E8 !important;
    --paper-warm: #ECE6D5 !important;
    --paper-card: #FFFCF1 !important;
    --ink-muted: #3C382F !important;
    --ink-faint: #5C5648 !important;
    --accent-power: #762A32 !important;
    --accent-power-light: #E8D3D4 !important;
    --accent-power-mid: #8D3842 !important;
    --accent-low: #263F63 !important;
    --accent-low-light: #DDE3EA !important;
    --accent-low-mid: #334F78 !important;
    --accent-good: #315D40 !important;
    --accent-good-light: #DEE7DA !important;
    --accent-warn: #4A3A1A !important;
    --accent-warn-light: #ECE6D5 !important;
  }

  html { background: #F7F4E8 !important; }
  body {
    background: #F7F4E8 !important;
    color: #11110E !important;
    zoom: ${fontMultiplier};
  }

  /* Invert all common dark sections */
  .hero, .part-banner, .stat-strip, .quotes-section, .verdict-block,
  .tab-bar, .theme-card, .tip-block, .kbox, .codebox, .pb, .tc {
    background: #FFFCF1 !important;
    color: #11110E !important;
    border-color: #252217 !important;
  }

  /* Inline style overrides for any element painted with dark hex */
  [style*="background:#0c1220"], [style*="background: #0c1220"],
  [style*="background:#131c2e"], [style*="background: #131c2e"],
  [style*="background:#080c18"], [style*="background: #080c18"],
  [style*="background:#18101a"], [style*="background: #18101a"],
  [style*="background-color:#0c1220"], [style*="background-color: #0c1220"],
  [style*="background-color:#131c2e"], [style*="background-color: #131c2e"] {
    background: #FFFCF1 !important;
    background-color: #FFFCF1 !important;
    color: #11110E !important;
  }

  /* Any remaining white text becomes dark */
  [style*="color:#fff"],     [style*="color: #fff"],
  [style*="color:#ffffff"],  [style*="color: #ffffff"],
  [style*="color:white"],    [style*="color: white"],
  [style*="color:var(--cream)"] {
    color: #11110E !important;
  }

  /* Force dark text inside originally-dark sections */
  .hero, .hero *, .part-banner, .part-banner *, .stat-strip, .stat-strip *,
  .quotes-section, .quotes-section *, .verdict-block, .verdict-block *,
  .theme-card, .theme-card *, .kbox, .kbox *, .codebox, .codebox *,
  .pb, .pb *, .tc, .tc * {
    color: #11110E !important;
  }

  /* Preserve accent colors with strong saturation */
  .hero-title { color: #762A32 !important; font-weight: 700 !important; }
  .hero-subtitle { color: #263F63 !important; }
  .hero-author { color: #3C382F !important; }
  .hero-year { color: #5C5648 !important; }
  .hero-ornament, .hero-badge { color: #762A32 !important; opacity: 1 !important; }
  .hero-meta { color: #5C5648 !important; }
  .hero::before { background: none !important; }

  .section-label, .tip-num, .p-label, .sl, .cn, .pl, .kl {
    color: #762A32 !important;
    font-weight: 600 !important;
  }
  .section-title, .p-title, .st, .pt { color: #11110E !important; font-weight: 600 !important; }
  .tip-name, .cname, .tn { color: #263F63 !important; }
  .stat .num { color: #762A32 !important; font-weight: 700 !important; }
  .stat .lbl { color: #5C5648 !important; }
  .theme-card .t-name { color: #762A32 !important; font-weight: 600 !important; }
  .theme-card .t-desc { color: #3C382F !important; }
  .quote-text { color: #11110E !important; font-weight: 500 !important; }
  .quote-ref { color: #762A32 !important; }
  .p-desc, .pd, .td { color: #5C5648 !important; }

  /* Tabs — bold across all books, clearer for e-ink touch */
  .tab {
    color: #252217 !important;
    background: #ECE6D5 !important;
    border-right: 1px solid #252217 !important;
    font-weight: 700 !important;
  }
  .tab:hover { color: #762A32 !important; background: #FFFCF1 !important; }
  .tab.active {
    color: #762A32 !important;
    background: #F7F4E8 !important;
    border-bottom: 3px solid #762A32 !important;
    font-weight: 700 !important;
  }

  /* Theme cards: light bg + strong border */
  .theme-card {
    background: #FFFCF1 !important;
    border: 1.5px solid #762A32 !important;
  }

  /* Quote items */
  .quote-item {
    background: #ECE6D5 !important;
    border-left: 4px solid #762A32 !important;
  }
  .quote-item .quote-text { color: #11110E !important; }
  .quote-item .quote-ref { color: #762A32 !important; }

  /* Do/Dont contrast */
  .do-box {
    background: #DEE7DA !important;
    color: #11110E !important;
    border-left: 5px solid #315D40 !important;
  }
  .do-box strong { color: #254B32 !important; }
  .dont-box {
    background: #E8D3D4 !important;
    color: #11110E !important;
    border-left: 5px solid #762A32 !important;
  }
  .dont-box strong { color: #762A32 !important; }

  /* Examples */
  .example-box {
    background: #ECE6D5 !important;
    border: 1px solid #263F63 !important;
  }
  .example-box .ex-label { color: #263F63 !important; }
  .example-box * { color: #11110E !important; }

  /* Tip blocks */
  .tip-block {
    background: #FFFCF1 !important;
    border-left: 5px solid #762A32 !important;
    border-radius: 4px !important;
  }
  .tip-body, .tip-body p, .tip-body * { color: #11110E !important; }

  /* Verdict */
  .verdict-block {
    background: #F7F4E8 !important;
    border-top: 3px double #762A32 !important;
  }
  .verdict-block p { color: #11110E !important; font-style: italic !important; }

  /* Misc */
  .section-title { border-bottom: 1.5px solid #252217 !important; }
  .intro-block { border-bottom: 1.5px solid #762A32 !important; }
  .intro-block p { color: #3C382F !important; }
  .checklist li { color: #3C382F !important; border-bottom: 1px solid #A89F87 !important; }
  .checklist li::before { color: #762A32 !important; }
  .divider { color: #762A32 !important; opacity: 0.7 !important; }

  /* Content area */
  .content-area { background: #F7F4E8 !important; border-color: #252217 !important; }

  /* Cryptography deep-research article: Point Made palette for e-ink */
  .ca {
    background: #F7F4E8 !important;
    border-color: #252217 !important;
  }
  .ib {
    border-bottom: 1.5px solid #762A32 !important;
  }
  .ib p, .cbody, .cbody p, .cbody li {
    color: #11110E !important;
    font-family: 'Literata', 'Cormorant Garamond', Georgia, serif !important;
  }
  .st {
    border-bottom: 1.5px solid #252217 !important;
  }
  .cb {
    background: #FFFCF1 !important;
    border-left: 5px solid #762A32 !important;
    border-radius: 4px !important;
  }
  .kbox, .codebox, .pb, .tc, .mathbox {
    background: #FFFCF1 !important;
    color: #11110E !important;
    border-color: #252217 !important;
  }
  .kbox {
    border-left: 5px solid #7C5C1D !important;
  }
  .kbox .kl, .pb .pl {
    color: #762A32 !important;
  }
  .kbox p, .pb .pt, .pb .pd, .tc .td {
    color: #11110E !important;
  }
  .codebox {
    border-left: 5px solid #762A32 !important;
    white-space: pre-wrap !important;
    overflow-wrap: anywhere !important;
  }
  .mathbox {
    background: #ECE6D5 !important;
    border: 1.5px solid #252217 !important;
  }
  .pb {
    border-top: 2px solid #762A32 !important;
    border-bottom: 2px solid #762A32 !important;
  }
  .tc {
    border: 1.5px solid #762A32 !important;
  }
  .sbox {
    background: #DEE7DA !important;
    border-left-color: #315D40 !important;
    color: #11110E !important;
  }
  .sbox strong {
    color: #254B32 !important;
  }
  .rbox {
    background: #E8D3D4 !important;
    border-left-color: #762A32 !important;
    color: #11110E !important;
  }
  .rbox strong {
    color: #762A32 !important;
  }
  .tyear {
    color: #762A32 !important;
  }
  .ttext {
    color: #11110E !important;
  }

  /* Underlines / borders */
  hr, .rule, .separator { border-color: #252217 !important; }

  /* ✓ mark before tabs the user has marked as read */
  .tab.tab-read::before {
    content: "✓";
    display: inline-block;
    margin-right: 5px;
    color: #315D40 !important;
    font-weight: 700;
    font-size: 0.95em;
  }

  mark.athenaeum-rich-highlight {
    background: linear-gradient(180deg, transparent 45%, rgba(216, 195, 106, 0.66) 45%) !important;
    color: inherit !important;
    border-bottom: 1.5px solid #7C5C1D !important;
    border-radius: 2px !important;
    padding: 0 0.04em !important;
  }
  ::selection {
    background: #7C5C1D !important;
    color: #FFFCF1 !important;
  }

  /* Manual "Mark as read" footer that we append to each panel */
  .athenaeum-mark-footer {
    margin: 2.5rem 0 0.5rem !important;
    padding: 1.6rem 1rem 0.4rem !important;
    border-top: 1.5px solid #252217 !important;
    text-align: center !important;
  }
  .athenaeum-mark-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 11px 26px !important;
    background: #FFFCF1 !important;
    border: 2px solid #252217 !important;
    color: #11110E !important;
    font-family: \'DM Mono\', \'Cormorant Garamond\', monospace !important;
    font-size: 11px !important;
    letter-spacing: 0.18em !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    border-radius: 999px !important;
    cursor: pointer !important;
  }
  .athenaeum-mark-btn:hover { background: #252217 !important; color: #FFFCF1 !important; }
  .athenaeum-mark-btn.is-read {
    background: #315D40 !important;
    color: #FFFCF1 !important;
    border-color: #315D40 !important;
  }
  .athenaeum-mark-btn.is-read:hover { background: #254B32 !important; border-color: #254B32 !important; }

  /* Whole-summary footer — distinct from per-section buttons */
  .athenaeum-mark-footer.is-whole {
    margin: 3rem 0 2rem !important;
    padding: 2rem 1rem !important;
    border-top: 2px double #7C5C1D !important;
    border-bottom: 2px double #7C5C1D !important;
    background: #FFFCF1 !important;
  }
  .athenaeum-mark-footer.is-whole::before {
    content: "End of summary";
    display: block;
    font-family: \'Cormorant Garamond\', \'DM Mono\', serif !important;
    font-style: italic;
    font-size: 13px;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: #7C5C1D !important;
    margin-bottom: 1rem !important;
    text-align: center;
  }
  .athenaeum-mark-btn-whole {
    padding: 14px 32px !important;
    font-size: 12px !important;
    border: 2.5px solid #7C5C1D !important;
    background: #FFFCF1 !important;
    color: #4A3A1A !important;
  }
  .athenaeum-mark-btn-whole:hover {
    background: #7C5C1D !important;
    color: #FFFCF1 !important;
  }
  .athenaeum-mark-btn-whole.is-read {
    background: #4A3A1A !important;
    color: #FFFCF1 !important;
    border-color: #4A3A1A !important;
  }
  .athenaeum-mark-btn-whole.is-read:hover {
    background: #332812 !important;
    border-color: #332812 !important;
  }

  /* === FULL-WIDTH READING FRAME (BOOX TAB ULTRA C PRO) === */
  /* Kill all browser default margins so the iframe edges = the content edges */
  html, body { margin: 0 !important; padding: 0 !important; }

  /* Each book bakes its own narrow .wrap (780–880px). Override to fill the iframe edge-to-edge. */
  .wrap {
    max-width: 100% !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  }

  /* The cream content panel: NO border, fill the whole iframe horizontally.
     Padding stays inside so the text has breathing room. */
  .content-area, .ca {
    padding: 0 1.5rem 2rem !important;
    margin: 0 !important;
    border: none !important;
    box-sizing: border-box !important;
    width: 100% !important;
  }

  /* Hero/banner: no inner offset beyond the wrap */
  .hero, .part-banner, .stat-strip, .quotes-section, .verdict-block, .intro-block {
    padding-left: 1.5rem !important;
    padding-right: 1.5rem !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
    border-left: none !important;
    border-right: none !important;
  }

  /* Tab bar runs wall-to-wall */
  .tab-bar {
    padding-left: 0 !important;
    padding-right: 0 !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    border-left: none !important;
    border-right: none !important;
  }

  /* Panels get breathing room without wasted gutters */
  .panel { padding: 1.5rem 0 0.75rem !important; margin: 0 !important; }

  /* Tip blocks, theme cards, quote items: keep left accent, no horizontal margin */
  .tip-block {
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding: 1.25rem 1.5rem !important;
  }
  .theme-card { padding: 1.25rem 1.5rem !important; margin-left: 0 !important; margin-right: 0 !important; }
  .quote-item { padding: 1rem 1.5rem !important; margin-left: 0 !important; margin-right: 0 !important; }
  .do-box, .dont-box, .example-box { padding: 1rem 1.5rem !important; margin-left: 0 !important; margin-right: 0 !important; }
  .cb, .kbox, .codebox, .pb, .tc, .mathbox, .sbox, .rbox {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  .cb, .kbox, .codebox, .mathbox, .sbox, .rbox {
    padding: 1rem 1.5rem !important;
  }
  .pb {
    padding: 1rem 1.5rem !important;
  }

  /* Rule boxes (used in Trial Techniques, Cross-Examination, Beyond Good and Evil)
     originally render as dark navy background with cream text. On the cream-themed
     e-ink layout that creates white-on-cream and the text disappears. Force a
     light surface with dark text and a strong gold accent on the left. */
  .rule-box {
    background: #FFFCF1 !important;
    color: #11110E !important;
    border-left: 5px solid #7C5C1D !important;
    padding: 1.25rem 1.5rem !important;
    margin: 1rem 0 1.3rem !important;
  }
  .rule-box * { color: #11110E !important; }
  .rule-box p, .rule-box li, .rule-box span {
    color: #11110E !important;
    font-weight: 500 !important;
  }
  .rule-box .r-label {
    color: #4A3A1A !important;
    font-weight: 700 !important;
    letter-spacing: 0.3em !important;
    margin-bottom: 0.5rem !important;
  }

  /* Advocate-initial badges (Point Made): keep visible against any background */
  .adv-initial {
    background: #254B32 !important;
    color: #FFFCF1 !important;
    font-weight: 700 !important;
    border: 1px solid #254B32 !important;
  }

  /* Deep Insights reports: fold supplied research pages into Athenaeum's e-ink house style. */
  .page-wrap {
    max-width: 980px !important;
  }
  .toc-strip {
    background: #FFFCF1 !important;
    border-top: 1.5px solid #252217 !important;
    border-bottom: 1.5px solid #252217 !important;
  }
  .toc-link {
    color: #3C382F !important;
    border-color: #A89F87 !important;
    font-family: 'DM Mono', monospace !important;
    font-weight: 700 !important;
  }
  .toc-link:hover,
  .toc-link.active {
    color: #762A32 !important;
    border-color: #762A32 !important;
  }
  .section,
  .content {
    background: #F7F4E8 !important;
  }
  .section-number,
  .hero-eyebrow,
  .fc-label,
  .case-type,
  .ethic-eyebrow {
    color: #762A32 !important;
    font-family: 'DM Mono', monospace !important;
    font-weight: 700 !important;
  }
  .section-rule {
    background: #762A32 !important;
  }
  .lead,
  .mod-body p,
  .fc-body,
  .case-body,
  .case-lesson,
  .iv-text,
  .source-item {
    color: #3C382F !important;
  }
  .framework-card,
  .diagram-wrap,
  .trajectory-block,
  .case-card,
  .intervention,
  .source-group,
  .trait-pill {
    background: #FFFCF1 !important;
    border-color: #252217 !important;
    border-radius: 4px !important;
  }
  .pull-quote {
    background: #FFFCF1 !important;
    border-left: 5px solid #762A32 !important;
  }
  .power-header,
  .low-header {
    background: #ECE6D5 !important;
    border-color: #252217 !important;
  }
  .traj-adaptive,
  .traj-maladaptive {
    background: #FFFCF1 !important;
    border-color: #252217 !important;
  }
  .ethic-box {
    background: #252217 !important;
    color: #FFFCF1 !important;
    border: 1.5px solid #252217 !important;
  }
  .ethic-box * {
    color: #FFFCF1 !important;
  }
  .ethic-text strong {
    color: #D8C36A !important;
  }

  /* Mobile containment: rich imported reports can ship desktop grids and
     oversized titles. These rules keep every book inside the phone viewport. */
  html, body {
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  *, *::before, *::after {
    box-sizing: border-box !important;
  }
  img, svg, canvas, video, table, pre, code {
    max-width: 100% !important;
  }
  .wrap, .content-area, .ca, .page-wrap, .content, .section,
  .panel, .hero, .part-banner, .stat-strip, .quotes-section,
  .theme-card, .tip-block, .framework-card, .diagram-wrap,
  .trajectory-block, .case-card, .intervention, .source-group,
  .toc-strip {
    max-width: 100% !important;
    min-width: 0 !important;
  }
  .hero-title, .hero-subtitle, .section-title, .chapter-title,
  .p-title, .tip-name, .rule-name, .maxim-title, .t-name,
  .ethic-title, .fc-title, .case-title, h1, h2, h3, h4 {
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    word-break: normal !important;
    white-space: normal !important;
  }
  p, li, blockquote, .lead, .mod-body, .fc-body, .case-body,
  .case-lesson, .iv-text, .source-item, .quote-text {
    overflow-wrap: break-word !important;
    word-break: normal !important;
  }

  /* Larger tablet: more breathing room inside content-area, still full width */
  @media (min-width: 768px) {
    .content-area, .ca { padding-left: 2.25rem !important; padding-right: 2.25rem !important; }
    .panel { padding: 2rem 0 1rem !important; }
  }

  @media (max-width: 700px) {
    body {
      zoom: ${Math.min(fontMultiplier, 1.18)};
    }
    .content-area, .ca {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    .hero, .part-banner, .stat-strip, .quotes-section, .verdict-block, .intro-block {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    .hero-title {
      font-size: clamp(1.85rem, 12vw, 2.8rem) !important;
      line-height: 1.05 !important;
    }
    .section-title, .p-title, .chapter-title, .ethic-title, .fc-title, .case-title {
      font-size: clamp(1.3rem, 7vw, 1.85rem) !important;
      line-height: 1.16 !important;
    }
    .hero-subtitle, .lead {
      font-size: clamp(1.02rem, 4.5vw, 1.2rem) !important;
      line-height: 1.55 !important;
    }
    .stat-strip, .themes-grid, .tips-grid, .principles-grid,
    .framework-grid, .case-grid, .source-grid, .ddgrid {
      grid-template-columns: 1fr !important;
    }
    .toc-strip, .tab-bar {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    table {
      display: block !important;
      overflow-x: auto !important;
    }
    .ddgrid {
      grid-template-columns: 1fr !important;
    }
  }
</style>`;

  const plainInkCss = plainInk ? `
<style id="boox-plain-reader-override">
  html, body, .wrap {
    background: #FFFFFF !important;
    color: #000000 !important;
  }
  *, *::before, *::after {
    color: #000000 !important;
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    border-color: #000000 !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }
  body, .wrap, .content-area, .ca {
    background: #FFFFFF !important;
  }
  a {
    color: #000000 !important;
    text-decoration: underline !important;
  }
  mark {
    background: #E8E8E8 !important;
    color: #000000 !important;
  }
  img, svg, video, canvas {
    filter: grayscale(1) contrast(1.1) !important;
  }
  .hero::before,
  .hero::after,
  .part-banner::before,
  .part-banner::after,
  .section-title::after,
  .divider,
  .hero-ornament,
  .hero-badge {
    display: none !important;
  }
  .tab,
  .tab.active,
  button,
  .athenaeum-mark-btn,
  .athenaeum-mark-btn-whole {
    background: #FFFFFF !important;
    color: #000000 !important;
    border: 1.5px solid #000000 !important;
  }
  .athenaeum-mark-btn.is-read,
  .athenaeum-mark-btn-whole.is-read {
    background: #000000 !important;
    color: #FFFFFF !important;
  }
</style>` : "";

  // Manual mark-as-read system:
  // - Seeds tabs/buttons from prior readSections.
  // - Appends a "Mark as read" button at the end of each .panel (or the whole
  //   body if the book has no panel structure).
  // - Toggling the button updates the corresponding tab's ✓ and posts a message.
  const trackerJs = `
<script>
(function() {
  try {
    var ARTICLE_ID = ${safeScriptJson(articleId || "")};
    var READ_SECTIONS = ${safeScriptJson(Array.from(readSections || []))};
    var SAVED_HIGHLIGHTS = ${safeScriptJson(richHighlightTexts)};

    function compactText(text) {
      return String(text || "").replace(/\\s+/g, " ").trim();
    }
    function shouldSkipTextNode(node) {
      if (!node || !node.nodeValue || !node.nodeValue.trim()) return true;
      var el = node.parentElement;
      while (el && el !== document.body) {
        var tag = el.tagName;
        if (
          tag === "SCRIPT" ||
          tag === "STYLE" ||
          tag === "NOSCRIPT" ||
          tag === "TEXTAREA" ||
          tag === "INPUT" ||
          tag === "BUTTON" ||
          tag === "MARK"
        ) return true;
        if (
          el.classList &&
          (
            el.classList.contains("athenaeum-mark-footer") ||
            el.classList.contains("athenaeum-mark-btn") ||
            el.classList.contains("tab")
          )
        ) return true;
        el = el.parentElement;
      }
      return false;
    }
    function shouldSkipWordTextNode(node) {
      if (!node || !node.nodeValue || !node.nodeValue.trim()) return true;
      var el = node.parentElement;
      while (el && el !== document.body) {
        var tag = el.tagName;
        if (
          tag === "SCRIPT" ||
          tag === "STYLE" ||
          tag === "NOSCRIPT" ||
          tag === "TEXTAREA" ||
          tag === "INPUT" ||
          tag === "BUTTON"
        ) return true;
        if (
          el.classList &&
          (
            el.classList.contains("athenaeum-mark-footer") ||
            el.classList.contains("athenaeum-mark-btn") ||
            el.classList.contains("tab")
          )
        ) return true;
        el = el.parentElement;
      }
      return false;
    }
    function wrapNeedleInNode(node, needle) {
      var value = node.nodeValue || "";
      var haystack = value.toLowerCase();
      var target = String(needle || "").toLowerCase();
      var index = haystack.indexOf(target);
      if (index === -1) return false;

      var doc = node.ownerDocument;
      var frag = doc.createDocumentFragment();
      var cursor = 0;
      while (index !== -1) {
        if (cursor < index) frag.appendChild(doc.createTextNode(value.slice(cursor, index)));
        var mark = doc.createElement("mark");
        mark.className = "athenaeum-rich-highlight";
        mark.textContent = value.slice(index, index + target.length);
        frag.appendChild(mark);
        cursor = index + target.length;
        index = haystack.indexOf(target, cursor);
      }
      if (cursor < value.length) frag.appendChild(doc.createTextNode(value.slice(cursor)));
      if (node.parentNode) node.parentNode.replaceChild(frag, node);
      return true;
    }
    function applySavedHighlights() {
      var SHOW_TEXT = 4;
      var FILTER_ACCEPT = 1;
      var FILTER_REJECT = 2;
      var seen = {};
      var needles = SAVED_HIGHLIGHTS
        .map(compactText)
        .filter(function(text) {
          var key = text.toLowerCase();
          if (text.length < 2 || seen[key]) return false;
          seen[key] = true;
          return true;
        })
        .sort(function(a, b) { return b.length - a.length; })
        .slice(0, 160);

      needles.forEach(function(needle) {
        var walker = document.createTreeWalker(
          document.body,
          SHOW_TEXT,
          {
            acceptNode: function(node) {
              return shouldSkipTextNode(node)
                ? FILTER_REJECT
                : FILTER_ACCEPT;
            }
          }
        );
        var nodes = [];
        var current = walker.nextNode();
        while (current) {
          nodes.push(current);
          current = walker.nextNode();
        }
        nodes.forEach(function(node) { wrapNeedleInNode(node, needle); });
      });
    }
    function selectionSourceLabel(range) {
      var el = range && range.commonAncestorContainer;
      if (el && el.nodeType === 3) el = el.parentElement;
      if (!el) return document.title || "Athenaeum";
      var scope = (el.closest && el.closest(".panel, .content-area, .ca, .wrap")) || document.body;
      var selectedTop = 0;
      try { selectedTop = el.getBoundingClientRect().top; } catch(e) {}
      var headings = Array.from(scope.querySelectorAll(".section-title, .tip-name, .p-title, .st, h1, h2, h3, .tab.active"));
      for (var i = headings.length - 1; i >= 0; i--) {
        var heading = headings[i];
        var headingTop = 0;
        try { headingTop = heading.getBoundingClientRect().top; } catch(e) {}
        if (headingTop <= selectedTop + 10) {
          var label = compactText(heading.textContent);
          if (label) return label;
        }
      }
      return document.title || "Athenaeum";
    }
    function reportSelection() {
      try {
        var sel = window.getSelection();
        var text = compactText(sel && sel.toString());
        if (!text || text.length < 2) {
          parent.postMessage({ type: "athenaeum-rich-selection-clear", articleId: ARTICLE_ID }, "*");
          return;
        }
        if (!sel.rangeCount) return;
        var range = sel.getRangeAt(0);
        var rect = range.getBoundingClientRect();
        if (!rect || (!rect.width && !rect.height)) return;
        parent.postMessage({
          type: "athenaeum-rich-selection",
          articleId: ARTICLE_ID,
          text: text,
          rect: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          },
          sourceSection: selectionSourceLabel(range)
        }, "*");
      } catch(e) {}
    }
    function reportSelectionSoon(delay) {
      window.setTimeout(reportSelection, delay || 0);
    }
    function eventPoint(event) {
      var touch = event && event.changedTouches && event.changedTouches[0];
      var point = touch || event;
      if (!point || typeof point.clientX !== "number" || typeof point.clientY !== "number") return null;
      return { x: point.clientX, y: point.clientY };
    }
    function wordRangeFromPoint(event) {
      var target = event && event.target;
      if (
        target &&
        target.closest &&
        target.closest("button, a, input, textarea, select, [contenteditable='true'], .athenaeum-mark-footer")
      ) return null;
      var point = eventPoint(event);
      if (!point) return null;
      var baseRange = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(point.x, point.y)
        : (function() {
            var pos = document.caretPositionFromPoint && document.caretPositionFromPoint(point.x, point.y);
            if (!pos) return null;
            var range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
            return range;
          })();
      var node = baseRange && baseRange.startContainer;
      if (!node || node.nodeType !== 3 || shouldSkipWordTextNode(node)) return null;
      var value = node.nodeValue || "";
      var offset = Math.max(0, Math.min(value.length, baseRange.startOffset || 0));
      var re = /[A-Za-z][A-Za-z'-]{1,}/g;
      var match;
      var chosen = null;
      while ((match = re.exec(value))) {
        var start = match.index || 0;
        var end = start + match[0].length;
        if (start <= offset && offset <= end) {
          chosen = match;
          break;
        }
        if (!chosen && (Math.abs(offset - start) <= 1 || Math.abs(offset - end) <= 1)) {
          chosen = match;
        }
      }
      if (!chosen) return null;
      var wordStart = chosen.index || 0;
      var wordEnd = wordStart + chosen[0].length;
      var wordRange = document.createRange();
      wordRange.setStart(node, wordStart);
      wordRange.setEnd(node, wordEnd);
      var rect = wordRange.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) return null;
      return { text: chosen[0], range: wordRange, rect: rect };
    }
    function reportSelectionOrWord(event, delay) {
      window.setTimeout(function() {
        try {
          var sel = window.getSelection();
          var text = compactText(sel && sel.toString());
          if (text && text.length >= 2) {
            reportSelection();
            return;
          }
          var hit = wordRangeFromPoint(event);
          if (!hit) {
            parent.postMessage({ type: "athenaeum-rich-selection-clear", articleId: ARTICLE_ID }, "*");
            return;
          }
          var current = window.getSelection();
          if (current) {
            current.removeAllRanges();
            current.addRange(hit.range);
          }
          parent.postMessage({
            type: "athenaeum-rich-selection",
            articleId: ARTICLE_ID,
            text: compactText(hit.text),
            rect: {
              left: hit.rect.left,
              top: hit.rect.top,
              width: hit.rect.width,
              height: hit.rect.height
            },
            sourceSection: selectionSourceLabel(hit.range)
          }, "*");
        } catch(e) {}
      }, delay || 0);
    }

    function getPanels() {
      return Array.from(document.querySelectorAll(".panel"));
    }
    function getPanelIdFromTab(tab) {
      var oc = tab.getAttribute("onclick") || "";
      var single = oc.indexOf("'");
      var double = oc.indexOf('"');
      var start = single;
      var quote = "'";
      if (double !== -1 && (single === -1 || double < single)) {
        start = double;
        quote = '"';
      }
      if (start === -1) return null;
      var end = oc.indexOf(quote, start + 1);
      return end === -1 ? null : oc.slice(start + 1, end);
    }
    function getTabByPanelId(id) {
      var tabs = document.querySelectorAll(".tab");
      for (var i = 0; i < tabs.length; i++) {
        if (getPanelIdFromTab(tabs[i]) === id) return tabs[i];
      }
      return null;
    }
    function setSectionRead(panelId, isRead) {
      var tab = getTabByPanelId(panelId);
      if (tab) {
        if (isRead) tab.classList.add("tab-read");
        else tab.classList.remove("tab-read");
      }
      var btns = document.querySelectorAll(
        '.athenaeum-mark-btn[data-panel-id="' + panelId + '"]'
      );
      var isWhole = panelId === "_whole";
      Array.prototype.forEach.call(btns, function(b){
        if (isRead) {
          b.classList.add("is-read");
          b.textContent = isWhole
            ? "✓ Whole summary read · Click to undo"
            : "✓ Read · Click to mark as pending";
        } else {
          b.classList.remove("is-read");
          b.textContent = isWhole
            ? "Mark whole summary as read"
            : "Mark as read";
        }
      });
    }
    function reportToggle(panelId, isRead, allPanels) {
      try {
        parent.postMessage({
          type: "athenaeum-mark-section",
          articleId: ARTICLE_ID,
          panelId: panelId,
          read: isRead,
          allPanels: allPanels,
        }, "*");
      } catch(e) {}
    }
    function buildButton(panelId, isRead) {
      var footer = document.createElement("div");
      footer.className = "athenaeum-mark-footer";
      var btn = document.createElement("button");
      btn.className = "athenaeum-mark-btn" + (isRead ? " is-read" : "");
      btn.setAttribute("data-panel-id", panelId);
      btn.textContent = isRead ? "✓ Read · Click to mark as pending" : "Mark as read";
      footer.appendChild(btn);
      return footer;
    }
    function attachClick(panel, btn, allPanelIds) {
      btn.addEventListener("click", function(){
        var id = btn.getAttribute("data-panel-id");
        var willBe = !btn.classList.contains("is-read");
        setSectionRead(id, willBe);
        reportToggle(id, willBe, allPanelIds);
      });
    }
    function addPerPanelButtons() {
      var panels = getPanels();
      var ids = panels.map(function(p){ return p.id; }).filter(Boolean);
      panels.forEach(function(panel){
        var id = panel.id;
        if (!id) return;
        if (panel.querySelector(".athenaeum-mark-footer")) return;
        var isRead = READ_SECTIONS.indexOf(id) !== -1;
        var footer = buildButton(id, isRead);
        panel.appendChild(footer);
        attachClick(panel, footer.querySelector("button"), ids);
      });
    }
    function addWholeBookButton(asSummaryLevel) {
      // Pick the outermost container so the summary-level button sits below
      // the last panel rather than inside it.
      var container = document.querySelector(".content-area")
                   || document.querySelector(".wrap")
                   || document.body;
      if (!container) return;
      // Avoid duplicate _whole footer if already injected
      if (container.querySelector(".athenaeum-mark-footer.is-whole")) return;
      var isRead = READ_SECTIONS.indexOf("_whole") !== -1;
      var footer = document.createElement("div");
      footer.className = "athenaeum-mark-footer is-whole";
      var btn = document.createElement("button");
      btn.className = "athenaeum-mark-btn athenaeum-mark-btn-whole" + (isRead ? " is-read" : "");
      btn.setAttribute("data-panel-id", "_whole");
      btn.textContent = isRead
        ? "✓ Whole summary read · Click to undo"
        : (asSummaryLevel ? "Mark whole summary as read" : "Mark as read");
      footer.appendChild(btn);
      // Append to body so it appears at the very bottom regardless of layout
      (document.body || container).appendChild(footer);
      attachClick(null, btn, ["_whole"]);
    }
    function applyInitial() {
      READ_SECTIONS.forEach(function(id){
        if (id !== "_whole") setSectionRead(id, true);
      });
    }
    function init() {
      applyInitial();
      var panels = getPanels();
      if (panels.length > 0) addPerPanelButtons();
      addWholeBookButton(panels.length > 0);
      applySavedHighlights();
      if (!window.__athenaeumSelectionBridge) {
        window.__athenaeumSelectionBridge = true;
        document.addEventListener("mouseup", function(event){ reportSelectionOrWord(event, 0); });
        document.addEventListener("touchend", function(event){ reportSelectionOrWord(event, 80); });
        document.addEventListener("keyup", function(event){
          if (event && event.key && event.key.indexOf("Arrow") === 0) reportSelectionSoon(0);
        });
        window.addEventListener("message", function(event) {
          var data = event.data || {};
          if (data.type !== "athenaeum-clear-rich-selection" || data.articleId !== ARTICLE_ID) return;
          var sel = window.getSelection();
          if (sel) sel.removeAllRanges();
        });
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  } catch(e) { /* no-op */ }
})();
</script>`;


  // Build the head additions (CSS) and body tail additions (script)
  const headPayload = overrideCss + plainInkCss;
  const bodyTail    = trackerJs;

  let out = rawHtml;
  if (out.includes("</head>")) {
    out = out.replace("</head>", headPayload + "</head>");
  } else if (/<body[^>]*>/i.test(out)) {
    out = out.replace(/<body([^>]*)>/i, "<body$1>" + headPayload);
  } else {
    out = headPayload + out;
  }
  // Append tracker script before </body> so DOM is ready
  if (out.includes("</body>")) {
    out = out.replace("</body>", bodyTail + "</body>");
  } else {
    out = out + bodyTail;
  }
  return out;
}

export default function ReaderView({
  article: a,
  categoryLabels = {},
  isRtlCategory = () => false,
  onBack,
  articleRef,
  renderParagraph,
  fontPx,
  onEdit,
  library,
  onToggleMarkRead,
  booxPlain = false,
  onRichSelection,
}) {
  const iframeRef = useRef(null);
  const [iframeHeight, setIframeHeight] = useState(900);
  const initialReadSections = useMemo(
    () => (library?.reading?.[a?.id]?.readSections || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a?.id]
  );
  const readPct = a ? getReadProgress(a, library) * 100 : 0;
  const isMarkedRead = !!library?.reading?.[a?.id]?.marked;
  const isRtl = a ? isRtlCategory(a.category) : false;
  const articleHighlights = useMemo(
    () => (library?.highlights || []).filter(item => item.articleId === a?.id),
    [library?.highlights, a?.id]
  );
  const articleQuotes = useMemo(
    () => (library?.quotes || []).filter(item => item.articleId === a?.id),
    [library?.quotes, a?.id]
  );

  // Build the e-ink-styled iframe HTML with current font scale.
  // Re-runs when article or fontPx changes, causing the iframe to reload.
  const enhancedHtml = useMemo(
    () => (a?.richHtml
      ? buildEinkRichHtml(a.richHtml, fontPx, a.id, initialReadSections, booxPlain, articleHighlights)
      : null),
    // Intentionally NOT depending on readSections after mount — iframe handles
    // updates locally, parent only seeds initial state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [a?.id, a?.richHtml, fontPx, booxPlain, articleHighlights]
  );

  // Auto-size iframe to its content
  useEffect(() => {
    if (!a?.richHtml) return;
    setIframeHeight(900);
    let raf = 0;
    const tick = () => {
      const f = iframeRef.current;
      if (!f) return;
      try {
        const doc = f.contentDocument;
        if (doc?.body) {
          const body = doc.body;
          const bottom = Array.from(body.children).reduce((max, element) => {
            const rect = element.getBoundingClientRect();
            return Math.max(max, rect.bottom + (doc.defaultView?.scrollY || 0));
          }, 0);
          const measured = bottom || body.scrollHeight || body.offsetHeight;
          const nextHeight = Math.max(420, Math.ceil(measured) + 6);
          setIframeHeight(current => (
            Math.abs(current - nextHeight) > 4 ? nextHeight : current
          ));
        }
      } catch {}
    };
    raf = requestAnimationFrame(tick);
    const frame = iframeRef.current;
    frame?.addEventListener("load", tick);
    const iv = setInterval(tick, 400);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(iv);
      frame?.removeEventListener("load", tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a?.id, fontPx, booxPlain]);

  useEffect(() => {
    if (!a?.richHtml) return;
    const onMessage = (event) => {
      const payload = event.data;
      if (!payload || payload.articleId !== a.id) return;
      if (payload.type === "athenaeum-rich-selection") {
        onRichSelection?.(payload, iframeRef.current);
      } else if (payload.type === "athenaeum-rich-selection-clear") {
        onRichSelection?.({ clear: true, articleId: payload.articleId }, iframeRef.current);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [a?.id, a?.richHtml, onRichSelection]);

  if (!a) return null;

  const categoryLabel = categoryLabels[a.category] || "Misc";

  const readerControls = (
    <div className="reader-control-bar reader-product-bar">
      <div className="reader-control-group reader-product-bar__identity">
        <button onClick={onBack} className="reader-mode-btn" type="button">
          <ArrowLeft size={14}/> Library
        </button>
        <div className="reader-title-stack">
          <span className="tag">{categoryLabel}</span>
          <span className="reader-current-title">{a.title}</span>
        </div>
      </div>
      <div className="reader-progress-panel" aria-label="Reading progress">
        <div className="reader-progress-text">
          <span>{Math.round(readPct)}% Read</span>
          <span>{articleQuotes.length} Quotes</span>
        </div>
        <div className="reader-progress-track" aria-hidden="true">
          <span style={{ width: `${Math.round(readPct)}%` }}/>
        </div>
      </div>
      {a.custom && onEdit && (
        <div className="reader-control-group">
          <button type="button" onClick={onEdit} className="reader-mode-btn">
            Edit
          </button>
        </div>
      )}
    </div>
  );

  // ── RICH HTML ARTICLE (book summaries with original styling, e-ink retuned) ──
  if (a.richHtml) {
    return (
      <>
      <ProgressBar percent={readPct}/>
      <article className="reader-rich-article px-2 md:px-4 py-6 max-w-[1500px] mx-auto rise">
        {readerControls}

        <div className="reader-workbench">
          <div className="reader-primary">
        <div className="reader-frame" style={{
          border: "1.5px solid var(--rule)",
          borderRadius: 10,
          overflow: "hidden",
          background: "var(--cream-3)",
        }}>
          <iframe
            ref={iframeRef}
            srcDoc={enhancedHtml}
            title={a.title}
            sandbox="allow-same-origin allow-scripts"
            style={{
              width: "100%",
              height: iframeHeight,
              border: "none",
              display: "block",
              background: "transparent",
            }}
          />
        </div>

        <div className="mt-8 ui text-[10px] tracking-[0.25em] uppercase text-center" style={{ color: "var(--ink-3)" }}>
          By {a.author} · {a.readTime} · {a.date}
        </div>
          </div>
        </div>
      </article>
      </>
    );
  }

  // ── STANDARD ARTICLE ──
  return (
    <>
    <ProgressBar percent={readPct}/>
    <article className="reader-standard-article px-4 md:px-8 py-8 max-w-[1400px] mx-auto rise">
      {readerControls}

      <div className="reader-workbench">
        <div className="reader-primary">
      <header className={isRtl ? "max-w-3xl mx-auto mb-12 pb-8 border-b" : "max-w-3xl mx-auto mb-12 pb-8 border-b"}
        style={{ borderColor: "var(--rule)", ...(isRtl ? { direction: "rtl", textAlign: "right" } : {}) }}>
        <span className="tag mb-5 inline-block">{categoryLabel}</span>
        <h1 className={isRtl ? "leading-[1.15] mb-4 mt-2" : "display leading-[1.05] mb-4 mt-2"}
          style={{
            fontSize: "clamp(2rem, 5vw, 3.4rem)",
            fontWeight: isRtl ? 700 : 600,
            color: "var(--ink)",
            fontFamily: isRtl ? "'Noto Naskh Arabic', serif" : undefined,
            maxWidth: "100%",
            overflowWrap: "anywhere",
            wordBreak: "normal",
          }}>
          {a.title}
        </h1>
        {a.excerpt && (
          <p className={isRtl ? "text-xl md:text-2xl mb-5" : "display text-xl md:text-2xl italic mb-5"}
            style={{
              color: "var(--ink-2)",
              fontWeight: 400,
              fontFamily: isRtl ? "'Noto Naskh Arabic', serif" : undefined,
              overflowWrap: "break-word",
              wordBreak: "normal",
            }}>
            {a.excerpt}
          </p>
        )}
        <div className="ui text-[10px] tracking-[0.25em] uppercase flex items-center gap-3 flex-wrap" style={{ color: "var(--ink-3)" }}>
          <span>{isRtl ? "بقلم" : "By"} {a.author}</span><span>·</span><span>{a.readTime}</span><span>·</span><span>{a.date}</span>
        </div>
      </header>

      {/* Core legal principle — headnote-style pull quote */}
      {a.corePrinciple && (
        <div className="max-w-3xl mx-auto">
          {(Array.isArray(a.corePrinciple) ? a.corePrinciple : [a.corePrinciple]).map((cp, i) => (
            <div key={i} className={"core-principle" + (isRtl ? "" : " ltr")}>
              <div className="core-principle__label">{isRtl ? "المبدأ" : "The Principle"}</div>
              <p className="core-principle__text">{cp.text}</p>
              {cp.source && <div className="core-principle__source">{cp.source}</div>}
            </div>
          ))}
        </div>
      )}

      <div ref={articleRef}
        className={isRtl ? "reading-column article-body rtl-arabic mx-auto" : "reading-column article-body mx-auto"}
        style={{ fontSize: `${fontPx}rem` }}>
        {a.body.map((p, i) => (
          <React.Fragment key={i}>
            <p>{renderParagraph(p, a.id)}</p>
            {i === Math.floor(a.body.length / 2) - 1 && a.body.length > 4 && (
              <div className="gold-rule"><span className="gold-rule__mark"/></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Manual mark-as-read */}
      <div className="max-w-3xl mx-auto mt-12 mb-2 text-center">
        <button onClick={() => onToggleMarkRead?.(a.id)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 26px",
            background: isMarkedRead ? "#315D40" : "var(--cream-3)",
            border: `2px solid ${isMarkedRead ? "#315D40" : "var(--ink)"}`,
            color: isMarkedRead ? "var(--cream-3)" : "var(--ink)",
            fontFamily: "DM Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            fontWeight: 700,
            textTransform: "uppercase",
            borderRadius: 999,
            cursor: "pointer",
          }}>
          {isMarkedRead ? "✓ Read · Click to mark as pending" : "Mark as read"}
        </button>
      </div>

      <div className="max-w-3xl mx-auto mt-12 pt-8 border-t text-center"
        style={{ borderColor: "var(--rule)" }}>
        <div className="display text-3xl italic" style={{ color: "var(--gold)" }}>◆</div>
        <div className="ui text-[10px] tracking-[0.3em] uppercase mt-2" style={{ color: "var(--ink-3)" }}>End</div>
      </div>
        </div>
      </div>
    </article>
    </>
  );
}
