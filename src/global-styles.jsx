import React from "react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Literata:ital,opsz,wght@0,7..72,400..700;1,7..72,400..700&family=Lora:ital,wght@0,400..700;1,400..700&family=Noto+Naskh+Arabic:wght@400;700&family=DM+Mono:wght@300;400;500&display=swap');

    :root {
      /* BOOX Tab Ultra C Pro / Kaleido 3 color e-ink palette */
      --navy:        #1B2220;             /* deep library green-black */
      --navy-2:      #222B28;
      --navy-3:      #2C3632;
      --navy-soft:   #36413C;
      --cream:       #F3F5EF;             /* cool paper, better on color e-ink */
      --cream-2:     #E5E9DF;
      --cream-3:     #FCFDF7;             /* card surface */
      --cream-tag:   #D7DEC9;
      --gold:        #7D6421;             /* muted brass */
      --gold-deep:   #473B18;
      --gold-soft:   #CBD4C1;
      --ink:         #111613;             /* near-black body text */
      --ink-2:       #2A332F;
      --ink-3:       #58635E;             /* readable graphite metadata */
      --rule:        #1E2823;             /* solid borders, not rgba */
      --rule-soft:   #A5AEA5;             /* still solid, lighter tone */
      --maroon:      #6B3038;             /* scholarly oxblood accent */
      --maroon-soft: #E4D3D5;
      --blue:        #2B5063;             /* quiet teal-blue for links/definitions */
      --green:       #2F6048;             /* calm sage for read/success states */
      --shadow:      none;                /* shadows kill e-ink, use borders */
      --shadow-lg:   none;
      --highlight:   #D7C968;             /* solid brass underline behind highlights */
    }

    *, *::before, *::after { box-sizing: border-box; }
    html, body, #root {
      width: 100%;
      max-width: 100%;
      overflow-x: hidden;
    }
    body { background: var(--cream); margin: 0; }
    .app-shell {
      width: 100%;
      max-width: 100%;
      overflow-x: clip;
    }
    .app-main-column,
    main,
    article,
    iframe {
      min-width: 0;
      max-width: 100%;
    }
    img, svg, canvas, video, table {
      max-width: 100%;
    }
    h1, h2, h3, h4, h5, h6,
    p, li, a, button, span {
      min-width: 0;
    }
    .display,
    .body {
      overflow-wrap: break-word;
    }

    .display { font-family: 'Cormorant Garamond', 'Lora', Georgia, serif; }
    .body    { font-family: 'Literata', 'Lora', Georgia, serif; }
    .ui      { font-family: 'DM Mono', ui-monospace, monospace; }
    .arabic-font { font-family: 'Noto Naskh Arabic', serif; direction: rtl; }

    /* RTL Arabic content — apply to articles in the arabic-law category */
    .rtl-arabic {
      direction: rtl !important;
      text-align: right;
      font-family: 'Noto Naskh Arabic', 'Lora', serif !important;
      line-height: 1.95;
    }
    .rtl-arabic.reading-column {
      text-align: justify;
      font-size: 1.15rem;
    }
    .rtl-arabic h1, .rtl-arabic h2, .rtl-arabic h3 {
      font-family: 'Noto Naskh Arabic', serif !important;
      font-weight: 700;
    }
    /* Editor inputs in RTL mode */
    .editor-input.rtl-arabic {
      text-align: right;
      direction: rtl;
    }
    /* Drop cap doesn't make sense in Arabic — disable when RTL */
    .article-body.rtl-arabic > p:first-of-type::first-letter {
      font-size: 1em !important;
      float: none !important;
      padding: 0 !important;
      color: inherit !important;
    }

    /* Core principle pull-quote — refined legal headnote
       Design language: a single editorial card with a thick gold accent on the
       starting edge (right side for RTL, left for LTR), a small inset eyebrow
       label that sits inside the corner, and a clean source rule. The opening
       guillemet is set as a true drop-glyph rather than a floating decoration. */
    .core-principle {
      max-width: 44rem;
      margin: 1.75rem auto 2.5rem;
      background: var(--cream-3);
      border: 1px solid var(--rule);
      border-right: 4px solid var(--gold);    /* RTL: accent on the start side */
      border-radius: 4px 12px 12px 4px;
      padding: 1.5rem 2rem 1.4rem;
      position: relative;
    }
    /* For LTR (non-Arabic), flip the accent to the left side */
    .core-principle.ltr {
      border-right: 1px solid var(--rule);
      border-left: 4px solid var(--gold);
      border-radius: 12px 4px 4px 12px;
    }

    .core-principle__label {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      color: var(--gold-deep);
      font-weight: 700;
      margin-bottom: 1rem;
    }
    .core-principle__label::before {
      content: "";
      display: inline-block;
      width: 22px;
      height: 1.5px;
      background: var(--gold);
    }

    .core-principle__text {
      font-family: 'Noto Naskh Arabic', serif;
      direction: rtl;
      text-align: justify;
      font-size: 1.18rem;
      line-height: 1.95;
      color: var(--ink);
      font-weight: 500;
      margin: 0 0 1rem;
      letter-spacing: 0.005em;
    }
    /* LTR variant uses Cormorant for elegance */
    .core-principle.ltr .core-principle__text {
      font-family: 'Cormorant Garamond', serif;
      direction: ltr;
      text-align: left;
      font-style: italic;
      font-size: 1.3rem;
      line-height: 1.7;
    }

    .core-principle__source {
      font-family: 'DM Mono', monospace;
      direction: rtl;
      text-align: right;
      font-size: 10.5px;
      color: var(--gold-deep);
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-weight: 700;
      padding-top: 0.85rem;
      border-top: 1px solid var(--rule);
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .core-principle__source::before {
      content: "§";
      color: var(--gold);
      font-size: 1.1rem;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      letter-spacing: 0;
    }
    .core-principle.ltr .core-principle__source {
      direction: ltr;
      text-align: left;
    }

    /* When two principles stack, soften the gap and add a tiny gold dot between them */
    .core-principle + .core-principle {
      margin-top: 1rem;
    }

    /* Reading column — never wraps mid-word */
    .reading-column {
      max-width: 38rem;
      line-height: 1.78;
      letter-spacing: 0.005em;
      text-align: justify;
      hyphens: none;
      word-break: keep-all;
      overflow-wrap: break-word;
      color: var(--ink);
    }
    .reading-column p { margin-bottom: 1.45em; }

    /* Drop cap */
    .article-body > p:first-of-type::first-letter {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-weight: 500;
      font-size: 4.5em;
      float: left;
      line-height: 0.85;
      padding: 0.05em 0.12em 0 0;
      color: var(--gold);
    }

    /* Highlight mark */
    mark.user-highlight {
      background: linear-gradient(180deg, transparent 42%, var(--highlight) 42%);
      color: var(--ink);
      padding: 0 0.04em;
      border-bottom: 1.5px solid var(--gold-deep);
      border-radius: 2px;
    }

    ::selection { background: var(--gold); color: var(--cream-3); }

    /* Animations */
    @keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .rise { animation: rise 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
    @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
    .fade { animation: fade 0.2s ease-out both; }
    @keyframes slideR { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .slide-r { animation: slideR 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both; }

    /* Sidebar nav button */
    .sidebar-brand {
      background: var(--cream-2);
      border-color: var(--gold) !important;
      color: var(--ink);
    }
    .sidebar-brand .logo-mark {
      background: var(--navy);
      border-color: var(--navy);
      color: var(--cream-3);
    }
    .sidebar-brand-kicker {
      color: var(--gold-deep);
      font-weight: 800;
    }
    .sidebar-brand-title {
      color: var(--ink);
      font-weight: 700;
    }
    .sidebar-section-title {
      color: var(--gold-deep);
      font-weight: 800;
    }
    .nav-btn {
      color: var(--ink);
    }
    .nav-btn:hover { background: var(--cream-2); }
    .nav-btn[data-active="true"] {
      background: var(--cream-tag);
      box-shadow: inset 4px 0 0 var(--gold);
    }

    /* Card */
    .card {
      background: var(--cream-3);
      border: 1.5px solid var(--rule);
      border-radius: 10px;
    }
    .card:hover { border-color: var(--gold); }

    .library-board {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    .library-main-stack {
      display: grid;
      gap: 1rem;
    }
    .archive-list {
      background: var(--cream-3);
      border: 1.5px solid var(--rule);
      border-radius: 8px;
      overflow: hidden;
      min-width: 0;
      max-width: 100%;
    }
    .archive-list__header {
      display: grid;
      grid-template-columns: 78px minmax(0, 1fr) 150px;
      gap: 1rem;
      align-items: center;
      padding: 0.8rem 1.1rem;
      border-bottom: 1.5px solid var(--rule);
      background: var(--cream-2);
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }
    .archive-row {
      display: grid;
      grid-template-columns: 78px minmax(0, 1fr) minmax(180px, 220px);
      gap: 1rem;
      align-items: stretch;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid var(--rule-soft);
      background: var(--cream-3);
      cursor: pointer;
      min-width: 0;
      max-width: 100%;
    }
    .archive-row:last-child { border-bottom: 0; }
    .archive-row:hover { background: var(--cream); }
    .archive-row__folio {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 96px;
      padding-inline-end: 0.85rem;
      border-inline-end: 1px solid var(--rule);
    }
    .archive-row__number {
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.18em;
    }
    .archive-row__category {
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      writing-mode: vertical-rl;
      transform: rotate(180deg);
      align-self: flex-start;
      max-height: 64px;
      overflow: hidden;
    }
    .archive-row__body {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }
    .archive-row__meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .archive-row__title {
      margin: 0;
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.45rem, 2.4vw, 2.05rem);
      font-style: italic;
      font-weight: 600;
      line-height: 1.02;
      max-width: 100%;
      min-width: 0;
      overflow-wrap: anywhere;
      word-break: normal;
    }
    .archive-row__excerpt {
      margin: 0;
      color: var(--ink-3);
      font-size: 0.92rem;
      font-style: italic;
      line-height: 1.55;
      max-width: 58rem;
      overflow-wrap: anywhere;
    }
    .archive-row__progress {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 0.8rem;
      border-inline-start: 1px solid var(--rule);
      padding-inline-start: 1rem;
      min-width: 0;
    }
    .archive-row__progress-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .mini-progress {
      height: 5px;
      width: 100%;
      background: var(--cream-2);
      border: 1px solid var(--rule);
      overflow: hidden;
    }
    .mini-progress span {
      display: block;
      height: 100%;
      width: var(--progress, 0%);
      background: var(--ink);
    }
    .archive-open-btn {
      min-height: 38px;
      justify-content: center;
      width: 100%;
    }
    .library-side-stack {
      display: grid;
      gap: 1rem;
      position: sticky;
      top: 6.5rem;
    }
    .shelf-panel {
      background: var(--cream-3);
      border: 1.5px solid var(--rule);
      border-radius: 8px;
      padding: 1.05rem;
    }
    .shelf-panel__label {
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.26em;
      text-transform: uppercase;
      margin-bottom: 0.7rem;
    }
    .shelf-panel__title {
      margin: 0 0 0.45rem;
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.6rem;
      font-style: italic;
      font-weight: 600;
      line-height: 1.05;
    }
    .shelf-panel__copy {
      margin: 0 0 0.9rem;
      color: var(--ink-3);
      font-size: 0.88rem;
      line-height: 1.55;
    }
    .shelf-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border: 1px solid var(--rule);
      margin-bottom: 1rem;
    }
    .shelf-stat {
      padding: 0.75rem 0.6rem;
      border-inline-end: 1px solid var(--rule);
    }
    .shelf-stat:last-child { border-inline-end: 0; }
    .shelf-stat strong {
      display: block;
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.45rem;
      font-style: italic;
      line-height: 1;
    }
    .shelf-stat span {
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }
    .shelf-mini-card {
      border-top: 1px solid var(--rule);
      padding-top: 0.9rem;
      margin-top: 0.9rem;
    }
    .shelf-mini-card:first-of-type {
      border-top: 0;
      padding-top: 0;
      margin-top: 0;
    }
    .shelf-mini-card__meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.45rem;
    }
    .shelf-mini-card__title {
      margin: 0 0 0.45rem;
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.25rem;
      font-style: italic;
      font-weight: 600;
      line-height: 1.08;
    }
    .shelf-mini-card__detail {
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }

    /* Section masthead */
    .section-masthead {
      background: var(--cream-3);
      border: 2px solid var(--rule);
      border-radius: 8px;
      min-height: 255px;
      overflow: hidden;
      position: relative;
    }
    .section-masthead:hover { border-color: var(--rule); }
    .section-masthead::before {
      content: "";
      position: absolute;
      inset: 12px;
      border: 1px solid var(--rule-soft);
      pointer-events: none;
    }
    .section-masthead__folio {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      width: 116px;
      background: var(--cream-2);
      border-inline-start: 2px solid var(--rule);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-masthead__folio::before,
    .section-masthead__folio::after {
      content: "";
      position: absolute;
      inset-inline: 20px;
      height: 1.5px;
      background: var(--rule);
    }
    .section-masthead__folio::before { top: 32px; }
    .section-masthead__folio::after { bottom: 32px; }
    .section-masthead__folio span {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.42em;
      color: var(--gold-deep);
      text-transform: uppercase;
    }
    .section-masthead__inner {
      padding: clamp(1.6rem, 3vw, 2.75rem);
      padding-inline-end: clamp(8.5rem, 14vw, 10.25rem);
      position: relative;
      z-index: 1;
    }
    .section-masthead__top,
    .section-masthead__title-row,
    .section-masthead__bottom {
      display: flex;
      align-items: center;
      min-width: 0;
    }
    .section-masthead__top {
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.4rem;
    }
    .section-masthead__eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .section-masthead__eyebrow::before {
      content: "";
      width: 42px;
      height: 2px;
      background: var(--gold);
      display: inline-block;
    }
    .section-masthead__seal {
      width: 54px;
      height: 54px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--cream);
      border: 1.5px solid var(--rule);
      color: var(--gold-deep);
      transform: rotate(45deg);
      flex: 0 0 auto;
    }
    .section-masthead__seal svg {
      transform: rotate(-45deg);
      stroke-width: 1.8;
    }
    .section-masthead__title-row {
      gap: 1.1rem;
      flex-wrap: wrap;
      margin-bottom: 0.65rem;
      max-width: 100%;
    }
    .section-masthead__title {
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-weight: 600;
      font-size: clamp(3.1rem, 7vw, 5.5rem);
      line-height: 0.92;
      color: var(--ink);
      margin: 0;
      max-width: 100%;
      overflow-wrap: anywhere;
      word-break: normal;
    }
    .section-masthead__mark {
      width: 0.95rem;
      height: 0.95rem;
      background: var(--gold);
      transform: rotate(45deg);
      display: inline-block;
      margin-top: 0.35rem;
    }
    .section-masthead__deck {
      color: var(--ink-2);
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
      font-size: clamp(1.15rem, 2.1vw, 1.55rem);
      line-height: 1.45;
      max-width: 42rem;
      margin: 0;
      overflow-wrap: anywhere;
    }
    .section-masthead__bottom {
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.05rem;
      border-top: 1.5px solid var(--rule);
    }
    .section-masthead__count {
      border: 1.5px solid var(--rule);
      background: var(--cream-2);
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      padding: 0.45rem 0.65rem;
      white-space: nowrap;
      max-width: 100%;
      overflow-wrap: anywhere;
    }
    .section-masthead__line {
      flex: 1;
      height: 1.5px;
      background: var(--rule);
      min-width: 3rem;
    }
    .section-masthead__prompt {
      color: var(--ink-3);
      font-family: 'Cormorant Garamond', serif;
      font-size: 1rem;
      font-style: italic;
      white-space: nowrap;
      overflow-wrap: anywhere;
    }
    .section-masthead.is-rtl .section-masthead__inner {
      padding-inline-start: clamp(8.5rem, 14vw, 10.25rem);
      padding-inline-end: clamp(1.6rem, 3vw, 2.75rem);
    }
    .section-masthead.is-rtl .section-masthead__folio {
      inset-inline-start: 0;
      inset-inline-end: auto;
      border-inline-start: none;
      border-inline-end: 2px solid var(--rule);
    }
    .section-masthead.is-rtl .section-masthead__title {
      font-family: 'Noto Naskh Arabic', serif;
      font-style: normal;
      line-height: 1.1;
    }
    .section-masthead.is-rtl .section-masthead__deck,
    .section-masthead.is-rtl .section-masthead__prompt {
      font-family: 'Noto Naskh Arabic', serif;
      font-style: normal;
    }
    @media (max-width: 1180px) {
      .library-board {
        grid-template-columns: 1fr;
      }
      .library-side-stack {
        position: static;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .library-side-stack .shelf-panel:first-child {
        grid-column: 1 / -1;
      }
      .reader-workbench {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 820px) {
      .archive-list__header {
        display: none;
      }
      .archive-row {
        grid-template-columns: 52px minmax(0, 1fr);
      }
      .archive-row__folio {
        min-height: auto;
      }
      .archive-row__progress {
        grid-column: 1 / -1;
        border-inline-start: 0;
        border-top: 1px solid var(--rule);
        padding-inline-start: 0;
        padding-top: 0.85rem;
      }
      .library-side-stack {
        grid-template-columns: 1fr;
      }
      .reader-control-bar {
        top: 72px;
        flex-direction: column;
        align-items: stretch;
      }
    }
    @media (max-width: 540px) {
      .library-board {
        padding-inline: 0 !important;
      }
      .archive-row {
        grid-template-columns: minmax(0, 1fr);
        gap: 0.85rem;
        padding: 0.9rem;
      }
      .archive-row__folio {
        min-height: auto;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding-inline-end: 0;
        padding-bottom: 0.65rem;
        border-inline-end: 0;
        border-bottom: 1px solid var(--rule);
      }
      .archive-row__category {
        writing-mode: horizontal-tb;
        transform: none;
        max-height: none;
        text-align: right;
      }
      .archive-row__meta,
      .archive-row__progress-label {
        gap: 0.5rem;
      }
      .archive-row__title {
        font-size: clamp(1.34rem, 7.7vw, 1.86rem);
        line-height: 1.08;
      }
      .archive-row__progress-label {
        white-space: normal;
        line-height: 1.35;
      }
      .archive-open-btn {
        min-height: 44px;
      }
    }
    @media (max-width: 760px) {
      .section-masthead {
        min-height: auto;
      }
      .section-masthead::before {
        inset: 8px;
      }
      .section-masthead__folio {
        position: relative;
        inset: auto;
        width: 100%;
        height: 42px;
        border-inline-start: none;
        border-inline-end: none;
        border-bottom: 1.5px solid var(--rule);
      }
      .section-masthead.is-rtl .section-masthead__folio {
        inset: auto;
        border-inline-end: none;
      }
      .section-masthead__folio::before,
      .section-masthead__folio::after {
        display: none;
      }
      .section-masthead__folio span {
        writing-mode: horizontal-tb;
        letter-spacing: 0.28em;
      }
      .section-masthead__inner,
      .section-masthead.is-rtl .section-masthead__inner {
        padding: 1.35rem;
      }
      .section-masthead__top {
        align-items: flex-start;
      }
      .section-masthead__eyebrow {
        letter-spacing: 0.18em;
        line-height: 1.4;
      }
      .section-masthead__seal {
        width: 44px;
        height: 44px;
      }
      .section-masthead__title {
        font-size: clamp(2.1rem, 11vw, 3.25rem);
        line-height: 0.98;
      }
      .section-masthead__bottom {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }
      .section-masthead__line {
        width: 100%;
      }
      .section-masthead__prompt {
        white-space: normal;
      }
      .section-masthead__count {
        white-space: normal;
        justify-self: start;
      }
    }

    /* Account + sync control */
    .account-shell {
      position: relative;
      flex: 0 0 auto;
    }
    .account-trigger {
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      padding: 0.36rem 0.5rem 0.36rem 0.4rem;
      background: var(--ink);
      border: 1.5px solid var(--ink);
      border-radius: 999px;
      color: var(--cream-3);
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(0,0,0,0.12);
      transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease;
    }
    .account-trigger:hover {
      transform: translateY(-1px);
      border-color: var(--gold-deep);
      background: var(--navy-soft);
    }
    .account-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid rgba(242,234,208,0.55);
      background: var(--cream-3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex: 0 0 auto;
      color: var(--ink);
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      font-weight: 700;
    }
    .account-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .account-label {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: 'DM Mono', monospace;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .account-kicker {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
    }
    .account-name {
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.65rem, 3vw, 2.25rem);
      font-style: italic;
      font-weight: 600;
      line-height: 1.05;
      margin: 0;
    }
    .account-email,
    .account-note {
      color: var(--ink-3);
      font-family: 'Literata', serif;
      font-size: 0.92rem;
      line-height: 1.45;
      margin: 0.35rem 0 0;
    }
    .account-field {
      width: 100%;
      min-height: 48px;
      background: #FFFCF1;
      border: 1.5px solid var(--rule);
      border-radius: 8px;
      color: var(--ink);
      font-family: 'Literata', Georgia, serif;
      font-size: 0.98rem;
      padding: 0.78rem 0.9rem;
      outline: none;
      transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
    }
    .account-field:focus {
      border-color: var(--gold-deep);
      background: var(--cream-3);
      box-shadow: 0 0 0 3px rgba(124, 92, 29, 0.14);
    }
    .account-actions {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      flex-wrap: wrap;
      margin-top: 0.85rem;
    }
    .account-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      border: 1.5px solid var(--rule);
      background: var(--cream);
      color: var(--ink);
      border-radius: 8px;
      padding: 0.72rem 1rem;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .auth-tabs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.35rem;
      margin-bottom: 1rem;
      padding: 0.3rem;
      border: 1.5px solid var(--rule);
      border-radius: 10px;
      background: #ECE6D5;
    }
    .auth-tabs button {
      min-height: 38px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .auth-tabs button[data-active="true"] {
      background: var(--ink);
      color: var(--cream-3);
    }
    .auth-form {
      display: grid;
      gap: 0.75rem;
    }
    @media (max-width: 760px) {
      .account-label {
        display: none;
      }
    }

    .reader-mode-shell {
      background: var(--cream);
    }
    .reader-main-immersive {
      background: var(--cream);
    }
    .reader-control-bar {
      position: sticky;
      top: 78px;
      z-index: 18;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.8rem;
      padding: 0.8rem 0.35rem 1rem;
      background: var(--cream);
      border-bottom: 1.5px solid var(--rule);
    }
    .reader-product-bar {
      align-items: center;
      gap: 1rem;
      padding: 0.72rem 0.35rem 0.9rem;
    }
    .reader-product-bar__identity {
      flex: 1 1 24rem;
      min-width: 0;
      flex-wrap: nowrap;
      justify-content: flex-start;
    }
    .reader-title-stack {
      min-width: 0;
      display: grid;
      gap: 0.22rem;
    }
    .reader-current-title {
      max-width: 100%;
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(1.05rem, 2vw, 1.3rem);
      font-style: italic;
      font-weight: 600;
      line-height: 1.05;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .reader-progress-panel {
      flex: 0 1 19rem;
      min-width: 12rem;
      display: grid;
      gap: 0.42rem;
    }
    .reader-progress-panel .reader-progress-text {
      justify-content: space-between;
      white-space: normal;
    }
    .reader-progress-track {
      height: 5px;
      width: 100%;
      border: 1px solid var(--rule);
      background: var(--cream-3);
    }
    .reader-progress-track span {
      display: block;
      height: 100%;
      background: var(--gold);
    }
    .reader-control-bar::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -1px;
      height: 1px;
      background: var(--cream);
    }
    .reader-progress-text {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .reader-workbench {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
      align-items: start;
    }
    .reader-primary {
      min-width: 0;
    }
    .reader-frame,
    .reader-rich-article iframe {
      max-width: 100%;
    }
    .reader-standard-article header,
    .reader-standard-article header h1,
    .reader-standard-article header p,
    .reading-column,
    .reading-column p {
      max-width: 100%;
      overflow-wrap: break-word;
      word-break: normal;
    }
    .reading-column {
      hyphens: auto;
    }
    .reader-metadata-strip {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--rule);
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      text-align: center;
    }
    .header-reading-controls {
      display: inline-flex;
      align-items: center;
      gap: 0.38rem;
      flex: 0 0 auto;
      flex-wrap: nowrap;
      min-width: 0;
    }
    .header-font-stepper {
      display: inline-flex;
      align-items: center;
      gap: 0.08rem;
      flex: 0 0 auto;
      padding: 0.14rem;
      border: 1.5px solid var(--rule);
      border-radius: 8px;
      background: var(--cream-3);
    }
    .font-step-btn {
      width: 29px;
      height: 29px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--ink);
      font-family: 'Cormorant Garamond', 'Lora', Georgia, serif;
      font-size: 15px;
      font-weight: 800;
      line-height: 1;
      cursor: pointer;
    }
    .font-step-btn--large {
      font-size: 17px;
    }
    .font-step-btn:hover:not(:disabled) {
      background: var(--cream-2);
    }
    .font-step-btn:disabled {
      color: var(--ink-3);
      cursor: default;
      opacity: 0.45;
    }
    .font-step-divider {
      width: 1px;
      height: 20px;
      background: var(--rule-soft);
    }
    .mode-toggle-group {
      display: inline-flex;
      align-items: center;
      gap: 0.34rem;
      flex: 0 0 auto;
      flex-wrap: nowrap;
    }
    .mode-toggle-btn {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.32rem;
      padding: 0.34rem 0.56rem;
      border: 1.5px solid var(--rule);
      border-radius: 8px;
      background: var(--cream-3);
      color: var(--ink-2);
      font-family: 'DM Mono', ui-monospace, monospace;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      cursor: pointer;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .mode-toggle-btn svg {
      width: 15px;
      height: 15px;
      color: var(--ink-2);
      stroke-width: 1.7;
    }
    .mode-toggle-btn[data-active="true"] {
      background: var(--navy);
      border-color: var(--navy);
      color: var(--cream-3);
    }
    .mode-toggle-btn[data-active="true"] svg {
      color: var(--cream-3);
    }
    .reader-control-group {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex-wrap: wrap;
    }
    .reader-mode-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      min-height: 38px;
      padding: 0.45rem 0.75rem;
      border: 1.5px solid var(--rule);
      border-radius: 999px;
      background: var(--cream-3);
      color: var(--ink);
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .reader-mode-btn[data-active="true"] {
      background: var(--ink);
      color: var(--cream-3);
    }
    .reader-font-stepper {
      display: inline-flex;
      align-items: center;
      gap: 0;
      padding: 3px;
      border: 1.5px solid var(--rule);
      border-radius: 999px;
      background: var(--cream-3);
    }
    .reader-font-stepper button {
      width: 36px;
      height: 32px;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--ink);
      font-family: 'Cormorant Garamond', serif;
      font-size: 18px;
      line-height: 1;
      font-weight: 700;
      cursor: pointer;
    }
    .reader-font-stepper button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    .reader-font-stepper span {
      width: 1px;
      height: 20px;
      background: var(--rule);
      display: block;
    }
    .reader-mode-shell .reader-rich-article,
    .reader-mode-shell .reader-standard-article {
      max-width: 980px;
      padding-top: 0.65rem;
    }
    .reader-mode-shell .reader-standard-article {
      max-width: 880px;
    }
    .reader-mode-shell .reader-frame {
      border-radius: 0 !important;
      border-left: 0 !important;
      border-right: 0 !important;
    }
    .boox-plain-shell {
      --navy: #FFFFFF;
      --navy-2: #FFFFFF;
      --navy-3: #FFFFFF;
      --cream: #FFFFFF;
      --cream-2: #FFFFFF;
      --cream-3: #FFFFFF;
      --cream-tag: #FFFFFF;
      --gold: #000000;
      --gold-deep: #000000;
      --gold-soft: #FFFFFF;
      --ink: #000000;
      --ink-2: #000000;
      --ink-3: #000000;
      --rule: #000000;
      --rule-soft: #000000;
      --highlight: #E8E8E8;
      background: #FFFFFF !important;
      color: #000000 !important;
    }
    .boox-plain-shell .reader-main-immersive,
    .boox-plain-shell .reader-control-bar,
    .boox-plain-shell .reader-rich-article,
    .boox-plain-shell .reader-standard-article,
    .boox-plain-shell .reader-frame,
    .boox-plain-shell .core-principle,
    .boox-plain-shell .tag,
    .boox-plain-shell .reader-btn,
    .boox-plain-shell .reader-mode-btn,
    .boox-plain-shell .reader-font-stepper {
      background: #FFFFFF !important;
      color: #000000 !important;
      border-color: #000000 !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    .boox-plain-shell .reader-mode-btn[data-active="true"] {
      background: #000000 !important;
      color: #FFFFFF !important;
    }
    .boox-plain-shell .reader-standard-article *,
    .boox-plain-shell .reader-control-bar *,
    .boox-plain-shell .core-principle *,
    .boox-plain-shell .tag {
      color: #000000 !important;
      text-shadow: none !important;
    }
    .boox-plain-shell .reader-mode-btn[data-active="true"] * {
      color: #FFFFFF !important;
    }
    .boox-plain-shell .gold-rule,
    .boox-plain-shell .gold-rule__mark {
      display: none !important;
    }
    .boox-plain-shell mark.user-highlight {
      background: #E8E8E8 !important;
      color: #000000 !important;
    }
    .boox-plain-shell img,
    .boox-plain-shell svg {
      filter: grayscale(1) contrast(1.08);
    }
    .ink-mode-shell,
    .ink-mode-shell * {
      color: #000000 !important;
      border-color: #000000 !important;
      background-image: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
    }
    .ink-mode-shell * {
      background-color: #FFFFFF !important;
    }
    .ink-mode-shell,
    .ink-mode-shell header,
    .ink-mode-shell aside,
    .ink-mode-shell main,
    .ink-mode-shell nav,
    .ink-mode-shell section,
    .ink-mode-shell article,
    .ink-mode-shell .card,
    .ink-mode-shell .section-masthead,
    .ink-mode-shell .section-masthead__inner,
    .ink-mode-shell .reader-main-immersive,
    .ink-mode-shell .reader-control-bar,
    .ink-mode-shell .reader-rich-article,
    .ink-mode-shell .reader-standard-article,
    .ink-mode-shell .reader-frame,
    .ink-mode-shell .reader-snippet,
    .ink-mode-shell .reader-metadata-strip,
    .ink-mode-shell .archive-list,
    .ink-mode-shell .archive-list__header,
    .ink-mode-shell .archive-row,
    .ink-mode-shell .shelf-panel,
    .ink-mode-shell .shelf-stat,
    .ink-mode-shell .shelf-mini-card,
    .ink-mode-shell .core-principle,
    .ink-mode-shell .tag,
    .ink-mode-shell .reader-btn,
    .ink-mode-shell .pill-light,
    .ink-mode-shell .tooltail,
    .ink-mode-shell .login-card,
    .ink-mode-shell .login-social-btn,
    .ink-mode-shell .account-trigger,
    .ink-mode-shell .account-sync-status,
    .ink-mode-shell .account-avatar,
    .ink-mode-shell .mode-toggle-btn,
    .ink-mode-shell .reader-font-stepper {
      background: #FFFFFF !important;
      background-color: #FFFFFF !important;
      background-image: none !important;
    }
    .ink-mode-shell *::before,
    .ink-mode-shell *::after {
      background-image: none !important;
      box-shadow: none !important;
      text-shadow: none !important;
      border-color: #000000 !important;
    }
    .ink-mode-shell [data-active="true"],
    .ink-mode-shell [data-active="true"] *,
    .ink-mode-shell .mode-toggle-btn[data-active="true"],
    .ink-mode-shell .mode-toggle-btn[data-active="true"] * {
      background: #000000 !important;
      background-color: #000000 !important;
      color: #FFFFFF !important;
    }
    .ink-mode-shell .gold-rule,
    .ink-mode-shell .gold-rule__mark,
    .ink-mode-shell .section-masthead__mark,
    .ink-mode-shell .section-masthead__seal,
    .ink-mode-shell .section-masthead__folio {
      display: none !important;
    }
    .ink-mode-shell mark.user-highlight {
      background: #E8E8E8 !important;
      color: #000000 !important;
    }
    .ink-mode-shell .mini-progress,
    .ink-mode-shell .mini-progress span {
      background: #FFFFFF !important;
      border-color: #000000 !important;
    }
    .ink-mode-shell .mini-progress span {
      background: #000000 !important;
    }
    .ink-mode-shell .mode-toggle-btn,
    .ink-mode-shell .reader-mode-btn,
    .ink-mode-shell .reader-btn,
    .ink-mode-shell .pill-light,
    .ink-mode-shell .archive-open-btn,
    .ink-mode-shell .account-trigger {
      min-height: 44px !important;
      border-width: 1.5px !important;
    }
    .ink-mode-shell .app-header .mode-toggle-btn {
      min-height: 33px !important;
    }
    .ink-mode-shell .header-reading-controls,
    .ink-mode-shell .header-font-stepper {
      background: #FFFFFF !important;
      border-color: #000000 !important;
    }
    .ink-mode-shell .tag,
    .ink-mode-shell .archive-list__header,
    .ink-mode-shell .shelf-stat {
      border-color: #000000 !important;
    }
    .ink-mode-shell img,
    .ink-mode-shell svg {
      filter: grayscale(1) contrast(1.08);
    }
    @media (max-width: 760px) {
      .reader-control-bar {
        align-items: flex-start;
        flex-direction: column;
      }
      .reader-control-group {
        width: 100%;
      }
      .reader-control-group:last-child {
        justify-content: space-between;
      }
      .reader-mode-btn {
        flex: 1 1 auto;
      }
      .mode-toggle-group {
        order: 5;
        width: 100%;
        justify-content: flex-end;
      }
    }

    .login-overlay {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: grid;
      place-items: center;
      padding: 1.25rem;
      background:
        radial-gradient(circle at 16% 18%, rgba(216,195,106,0.16), transparent 26rem),
        rgba(0, 0, 0, 0.62);
      backdrop-filter: blur(4px);
    }
    .login-card {
      width: min(820px, 100%);
      min-height: 520px;
      display: grid;
      grid-template-columns: minmax(230px, 0.82fr) minmax(0, 1.18fr);
      background: var(--cream);
      color: var(--ink);
      border: 1.5px solid var(--ink);
      border-radius: 10px;
      padding: 0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 28px 80px rgba(0,0,0,0.42);
    }
    .login-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, var(--gold-deep), var(--maroon), var(--ink));
    }
    .login-card::after {
      content: "";
      position: absolute;
      inset: 12px;
      border: 1px solid rgba(37,34,23,0.22);
      pointer-events: none;
    }
    .login-brand-panel {
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 2rem;
      padding: clamp(1.5rem, 4vw, 2.1rem);
      background: var(--ink);
      color: var(--cream-3);
      border-right: 1.5px solid var(--ink);
    }
    .login-brand-panel::after {
      content: "";
      position: absolute;
      inset: 18px;
      border: 1px solid rgba(242,234,208,0.22);
      pointer-events: none;
    }
    .login-monogram {
      width: 62px;
      height: 62px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--cream-3);
      color: var(--ink);
      border-radius: 8px;
      border: 1px solid rgba(242,234,208,0.65);
      margin-bottom: 1.25rem;
    }
    .login-brand-word {
      margin: 0;
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2rem, 4vw, 2.65rem);
      font-style: italic;
      font-weight: 600;
      line-height: 0.95;
      color: var(--cream-3);
    }
    .login-brand-copy {
      max-width: 15rem;
      margin: 0.9rem 0 0;
      color: #D8CDA8;
      font-family: 'Literata', Georgia, serif;
      font-size: 0.92rem;
      line-height: 1.55;
    }
    .login-brand-meta {
      color: #C8BD9A;
      font-family: 'DM Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }
    .login-form-panel {
      position: relative;
      z-index: 1;
      padding: clamp(1.65rem, 4vw, 2.6rem);
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .login-title {
      margin: 0 0 0.4rem;
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2.2rem, 5vw, 3.2rem);
      font-style: italic;
      font-weight: 600;
      letter-spacing: 0;
      line-height: 0.95;
      color: var(--ink);
    }
    .login-subtitle {
      margin: 0 0 1.45rem;
      max-width: 31rem;
      color: var(--ink-3);
      font-family: 'Literata', Georgia, serif;
      font-size: 0.96rem;
      line-height: 1.55;
    }
    .login-social-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.75rem;
    }
    .login-social-btn {
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      background: var(--ink);
      border: 1.5px solid var(--ink);
      border-radius: 8px;
      color: var(--cream-3);
      cursor: pointer;
      transition: border-color 0.16s ease, transform 0.16s ease, background 0.16s ease;
    }
    .login-social-btn.auth-primary {
      min-height: 52px;
    }
    .login-social-btn:hover {
      border-color: var(--gold-deep);
      background: var(--navy-soft);
      transform: translateY(-1px);
    }
    .login-social-btn svg {
      width: 16px;
      height: 16px;
    }
    .login-social-label {
      font-family: 'DM Mono', monospace;
      color: inherit;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .login-local-btn {
      min-height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      border: 1.5px solid var(--rule);
      border-radius: 8px;
      background: #FFFCF1;
      color: var(--ink);
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .login-local-btn:hover {
      border-color: var(--gold-deep);
      background: var(--cream-tag);
    }
    .login-status {
      margin: 0.85rem 0 0;
      color: var(--ink-2);
      font-family: 'Literata', Georgia, serif;
      font-size: 0.86rem;
      line-height: 1.45;
    }
    .login-status.is-error {
      color: var(--maroon);
      font-weight: 700;
    }
    .login-advanced {
      margin-top: 0.9rem;
      border-top: 1px solid var(--rule);
      padding-top: 0.85rem;
    }
    .login-advanced summary {
      cursor: pointer;
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .login-advanced .account-field {
      margin-top: 0.75rem;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
    }
    .login-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 36px;
      height: 36px;
      z-index: 3;
      border: 1.5px solid var(--rule);
      border-radius: 999px;
      background: var(--cream-3);
      color: var(--ink);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .login-close:hover {
      background: var(--ink);
      color: var(--cream-3);
    }
    .login-account-card {
      border: 1.5px solid var(--rule);
      border-radius: 10px;
      background: #FFFCF1;
      padding: 1rem;
    }
    @media (max-width: 760px) {
      .login-card {
        grid-template-columns: 1fr;
        min-height: auto;
      }
      .login-brand-panel {
        min-height: 190px;
        border-right: 0;
        border-bottom: 1.5px solid var(--ink);
      }
      .login-brand-copy {
        max-width: 100%;
      }
    }

    /* Tag pill */
    .tag {
      display: inline-flex;
      align-items: center;
      padding: 5px 11px;
      background: var(--cream-tag);
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      border-radius: 999px;
      font-weight: 600;
      border: 1px solid var(--gold-deep);
    }
    .tag-light {
      background: var(--cream-2);
      color: var(--ink-3);
      border: 1px solid var(--rule);
    }

    /* Reader button */
    .reader-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--navy);
      color: var(--cream);
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      border-radius: 999px;
      border: 1px solid var(--navy);
    }
    .reader-btn:hover { background: var(--gold-deep); border-color: var(--gold-deep); }

    /* Pill button (light) */
    .pill-light {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 18px;
      background: var(--cream-2);
      border: 1.5px solid var(--ink);
      color: var(--ink);
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      letter-spacing: 0.12em;
      border-radius: 999px;
      width: 100%;
      font-weight: 500;
    }
    .pill-light:hover { background: var(--cream-tag); }

    /* Logo mark — A inside square */
    .logo-mark {
      width: 38px; height: 38px;
      border-radius: 6px;
      background: var(--cream-3);
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--rule);
      color: var(--ink);
    }
    .logo-mark.dark { background: var(--cream-3); }
    .logo-mark svg { width: 22px; height: 22px; }
    .reader-snippet {
      border-top: 1px solid var(--rule);
      margin-top: 0.8rem;
      padding-top: 0.8rem;
      color: var(--ink-2);
      font-size: 0.82rem;
      font-style: italic;
      line-height: 1.45;
    }
    .account-sync-status {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      width: fit-content;
      margin-top: 0.75rem;
      padding: 0.35rem 0.55rem;
      border: 1px solid var(--rule);
      border-radius: 999px;
      color: var(--ink-2);
      font-family: 'DM Mono', monospace;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .collection-head {
      gap: 1rem;
    }
    .collection-head__actions {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .vocab-copy-btn {
      min-height: 42px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      padding: 0.55rem 0.85rem;
      background: var(--ink);
      color: var(--cream-3);
      border: 1.5px solid var(--ink);
      border-radius: 8px;
      font-family: 'DM Mono', monospace;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
    }
    .vocab-copy-btn:hover {
      background: var(--blue);
      border-color: var(--blue);
    }
    .vocab-list-shell {
      display: grid;
      border: 1.5px solid var(--rule);
      border-radius: 10px;
      overflow: hidden;
      background: var(--cream-3);
    }
    .vocab-row {
      display: grid;
      grid-template-columns: 3.25rem minmax(0, 1fr) minmax(4rem, auto) 2.5rem;
      align-items: start;
      gap: 1rem;
      padding: 1rem 1.15rem;
      border-bottom: 1px solid var(--rule-soft);
    }
    .vocab-row:last-child {
      border-bottom: 0;
    }
    .vocab-row__index {
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      padding-top: 0.28rem;
    }
    .vocab-row__word {
      color: var(--ink);
      font-family: 'Cormorant Garamond', 'Lora', Georgia, serif;
      font-size: clamp(1.5rem, 4vw, 2rem);
      font-style: italic;
      font-weight: 650;
      line-height: 1;
      overflow-wrap: anywhere;
    }
    .vocab-row__body {
      min-width: 0;
    }
    .vocab-row__meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem 0.7rem;
      margin-top: 0.35rem;
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .vocab-row__def {
      margin: 0.45rem 0 0;
      color: var(--ink-2);
      font-family: 'Literata', 'Lora', Georgia, serif;
      font-size: 0.92rem;
      font-style: italic;
      line-height: 1.48;
    }
    .vocab-row__translation {
      color: var(--blue);
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
      text-align: right;
      max-width: 10rem;
      overflow-wrap: anywhere;
    }
    .vocab-row__saved {
      align-self: start;
      justify-self: end;
      padding: 0.32rem 0.5rem;
      border: 1px solid var(--rule);
      border-radius: 999px;
      color: var(--ink-3);
      font-family: 'DM Mono', monospace;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .vocab-row__delete {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      justify-self: end;
      border: 1px solid var(--rule);
      border-radius: 8px;
      color: var(--ink-3);
      background: transparent;
    }
    .vocab-row__delete:hover {
      color: var(--cream-3);
      background: var(--maroon);
      border-color: var(--maroon);
    }

    .app-header {
      max-width: 100%;
      min-width: 0;
    }
    .header-spacer {
      flex: 1 1 auto;
      min-width: 0;
    }
    .header-reading-controls,
    .header-font-stepper,
    .header-mode-toggle,
    .header-menu-btn {
      flex: 0 0 auto;
    }
    .is-reader-view .app-header {
      padding-top: 0.55rem !important;
      padding-bottom: 0.55rem !important;
      gap: 0.6rem;
    }
    .is-reader-view .brand-lockup {
      display: none !important;
    }
    .is-reader-view .header-spacer {
      display: block !important;
      flex: 1 1 auto;
    }
    @media (max-width: 900px) {
      .app-header {
        flex-wrap: wrap;
        align-items: center;
        gap: 0.55rem;
        padding: 0.7rem 0.85rem !important;
      }
      .brand-lockup,
      .header-spacer {
        display: none !important;
      }
      .header-menu-btn {
        order: 1;
        display: flex !important;
        width: 42px;
        height: 42px;
        flex-basis: 42px;
      }
      .app-header > .header-reading-controls {
        order: 2;
        flex: 1 1 auto;
        justify-content: flex-start;
      }
      .account-shell {
        order: 3;
        flex: 0 0 auto;
      }
      .account-trigger {
        min-height: 42px;
      }
      .app-header .mode-toggle-group {
        flex: 0 0 auto;
      }
      .app-header .mode-toggle-btn {
        width: auto;
        min-width: 0;
        min-height: 34px;
      }
      .is-reader-view .app-header > .header-reading-controls {
        flex-basis: auto;
      }
    }
    @media (max-width: 760px) {
      .app-header {
        flex-wrap: wrap;
        align-items: center;
        gap: 0.55rem;
        padding: 0.65rem 0.75rem !important;
      }
      .brand-lockup,
      .header-spacer {
        display: none !important;
      }
      .header-menu-btn {
        order: 1;
        width: 42px;
        height: 42px;
        flex-basis: 42px;
      }
      .app-header > .header-reading-controls {
        order: 2;
        flex: 1 1 auto;
        justify-content: flex-start;
      }
      .account-shell {
        order: 3;
        flex: 0 0 42px;
      }
      .account-trigger {
        width: 42px;
        min-width: 42px;
        height: 42px;
        justify-content: center;
        padding: 0.25rem;
        box-shadow: none;
      }
      .account-avatar {
        width: 30px;
        height: 30px;
      }
      .app-header .mode-toggle-group {
        flex: 0 0 auto;
      }
      .app-header .mode-toggle-btn {
        width: auto;
        min-width: 0;
        min-height: 34px;
        padding: 0.32rem 0.5rem;
      }
    }
    @media (max-width: 420px) {
      .app-header {
        gap: 0.45rem;
      }
      .mode-toggle-btn {
        padding-inline: 0.45rem;
      }
    }
    @media (max-width: 430px) {
      .app-header {
        display: grid !important;
        grid-template-columns: 38px minmax(0, 1fr) 38px;
        align-items: center;
        gap: 0.38rem;
      }
      .header-menu-btn {
        grid-column: 1;
        grid-row: 1;
        width: 38px;
        height: 38px;
        flex-basis: 38px;
        order: initial;
      }
      .app-header > .header-reading-controls {
        grid-column: 2;
        grid-row: 1;
        width: 100%;
        min-width: 0;
        justify-content: center;
      }
      .account-shell {
        grid-column: 3;
        grid-row: 1;
        justify-self: end;
        order: initial;
      }
      .account-trigger {
        width: 38px;
        min-width: 38px;
        height: 38px;
      }
      .account-avatar {
        width: 28px;
        height: 28px;
      }
      .header-reading-controls .header-font-stepper {
        flex: 0 0 auto;
      }
      .app-header .mode-toggle-group {
        flex: 0 0 auto;
      }
      .font-step-btn {
        width: 27px;
        height: 27px;
      }
      .mode-toggle-btn {
        min-height: 32px;
        padding-inline: 0.42rem;
        font-size: 9px;
      }
      .mode-toggle-btn svg {
        width: 13px;
        height: 13px;
      }
      .section-masthead {
        border-radius: 10px;
      }
      .section-masthead__inner,
      .section-masthead.is-rtl .section-masthead__inner {
        padding: 1rem;
      }
      .section-masthead__title-row {
        gap: 0.65rem;
      }
      .section-masthead__title {
        font-size: clamp(1.85rem, 10.2vw, 2.7rem);
      }
      .section-masthead__seal {
        width: 38px;
        height: 38px;
      }
      .section-masthead__eyebrow::before {
        width: 24px;
      }
      .section-masthead__bottom {
        margin-top: 1.25rem;
      }
      .sidebar-fixed {
        width: min(86vw, 304px) !important;
      }
      .header-font-stepper button {
        flex: 0 0 auto;
      }
      .reader-rich-article,
      .reader-standard-article {
        padding-inline: 0.75rem !important;
        padding-top: 0.85rem !important;
      }
      .reader-control-bar {
        top: 0;
        gap: 0.55rem;
        padding: 0.65rem 0.25rem 0.75rem;
      }
      .reader-product-bar__identity {
        flex-basis: 100%;
      }
      .reader-progress-panel {
        min-width: 0;
        flex: 1 1 100%;
      }
      .reader-current-title {
        white-space: normal;
        line-height: 1.12;
      }
      .reader-control-group,
      .reader-control-bar {
        width: 100%;
      }
      .reader-control-group {
        justify-content: space-between;
      }
      .reader-mode-btn {
        min-height: 42px;
        padding-inline: 0.7rem;
      }
      .reader-progress-text {
        white-space: normal;
        flex-wrap: wrap;
        gap: 0.28rem 0.45rem;
        line-height: 1.45;
      }
      .reader-standard-article header {
        margin-bottom: 1.8rem !important;
        padding-bottom: 1.4rem !important;
      }
      .reader-standard-article header h1 {
        font-size: clamp(1.7rem, 9vw, 2.35rem) !important;
        line-height: 1.08 !important;
      }
      .reader-standard-article header p {
        font-size: 1rem !important;
        line-height: 1.48 !important;
      }
      .reader-frame {
        border-left: 0 !important;
        border-right: 0 !important;
        border-radius: 0 !important;
        margin-inline: -0.25rem;
      }
      .reading-column {
        max-width: 100%;
        text-align: left;
        line-height: 1.72;
        overflow-wrap: break-word;
      }
      .reading-column p {
        margin-bottom: 1.2em;
      }
      .article-body > p:first-of-type::first-letter {
        font-size: 3.25em;
      }
      .core-principle {
        margin-inline: 0;
        padding: 1.1rem;
        border-radius: 8px;
      }
      .collection-head {
        align-items: stretch;
        flex-direction: column;
        padding: 1rem !important;
      }
      .collection-head__actions,
      .vocab-copy-btn {
        width: 100%;
      }
      .vocab-row {
        grid-template-columns: 2.1rem minmax(0, 1fr) 2.5rem;
        gap: 0.7rem;
        padding: 0.9rem 0.8rem;
      }
      .vocab-row__translation,
      .vocab-row__saved {
        grid-column: 2 / -1;
        justify-self: start;
        text-align: left;
      }
      .vocab-row__delete {
        grid-column: 3;
        grid-row: 1;
      }
      .selection-popover {
        min-width: calc(100vw - 20px);
        max-width: calc(100vw - 20px);
      }
    }

    /* Toolbar arrow */
    .tooltail::after {
      content: ''; position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg);
      width: 10px; height: 10px; background: inherit;
      border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule);
    }

    /* Scrollbar */
    .thin-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .thin-scroll::-webkit-scrollbar-track { background: transparent; }
    .thin-scroll::-webkit-scrollbar-thumb { background: rgba(15,27,61,0.15); border-radius: 3px; }

    /* Floating selection toolbar */
    .glow-card {
      background: var(--cream-3);
      border: 2px solid var(--ink);
      border-radius: 10px;
    }

    .selection-popover {
      min-width: min(92vw, 420px);
      padding: 7px;
      background: color-mix(in srgb, var(--cream-3) 94%, white);
      border: 2px solid var(--ink);
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(10,10,10,0.16);
    }
    .selection-popover::after {
      content: "";
      position: absolute;
      bottom: -6px;
      left: 50%;
      width: 12px;
      height: 12px;
      transform: translateX(-50%) rotate(45deg);
      background: color-mix(in srgb, var(--cream-3) 94%, white);
      border-right: 2px solid var(--ink);
      border-bottom: 2px solid var(--ink);
    }
    .selection-popover__label {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.2rem 0.45rem 0.45rem;
      color: var(--gold-deep);
      font-family: 'DM Mono', monospace;
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 0.24em;
      text-transform: uppercase;
    }
    .selection-popover__label::before {
      content: "";
      width: 0.45rem;
      height: 0.45rem;
      background: var(--gold);
      border: 1px solid var(--gold-deep);
      transform: rotate(45deg);
      flex: 0 0 auto;
    }
    .selection-popover__actions {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 5px;
    }
    .selection-tool-btn {
      min-height: 42px;
      justify-content: center;
      border: 1px solid var(--rule);
      background: var(--cream);
      color: var(--ink);
    }
    .selection-tool-btn:hover {
      background: var(--ink);
      color: var(--cream-3);
      border-color: var(--ink);
    }
    @media (max-width: 540px) {
      .selection-popover { min-width: min(94vw, 340px); }
      .selection-popover__actions { grid-template-columns: 1fr; }
    }

    /* Editor textarea */
    .editor-input {
      width: 100%;
      background: var(--cream-3);
      border: 1px solid var(--rule);
      border-radius: 8px;
      padding: 12px 14px;
      font-family: 'Literata', 'Lora', serif;
      color: var(--ink);
      outline: none;
      transition: border-color 0.2s;
    }
    .editor-input:focus { border-color: var(--gold); }
    .editor-textarea {
      min-height: 60vh;
      resize: vertical;
      line-height: 1.8;
      font-size: 1.05rem;
    }

    /* Section divider */
    .gold-rule {
      display: flex; align-items: center; gap: 0.8rem;
      margin: 2.5rem 0;
    }
    .gold-rule::before, .gold-rule::after {
      content: ''; flex: 1; height: 1px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
      opacity: 0.4;
    }
    .gold-rule__mark {
      width: 5px; height: 5px; background: var(--gold);
      transform: rotate(45deg);
    }

    /* Mobile sidebar overlay */
    @media (max-width: 1024px) {
      .sidebar-fixed { transform: translateX(-100%); transition: transform 0.3s ease; }
      .sidebar-fixed.open { transform: translateX(0); }
    }
  `}</style>
);

/* ════════════════════════════════════════════════════════════════
   ATHENAEUM LOGO — small triangular A mark
   ════════════════════════════════════════════════════════════════ */

export default GlobalStyles;
