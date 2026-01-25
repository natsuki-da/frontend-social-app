import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
    :root{
        /* Pastel palette */
        --bg-app: #fff7fb;

        --pink-50:#fff0f7;
        --pink-100:#ffe2f0;
        --pink-200:#f8b4d9;
        --pink-300:#f472b6;
        --pink-700:#9d174d;

        --green-50:#ecfdf5;
        --green-100:#d1fae5;
        --green-200:#86efac;
        --green-300:#4ade80;
        --green-800:#14532d;

        --ink:#0f172a;
        --muted:#475569;

        --border-pink: color-mix(in srgb, var(--pink-200) 70%, white);
        --border-green: color-mix(in srgb, var(--green-200) 65%, white);
        --border-neutral: #eadfe7;

        --shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
        --radius: 16px;
        --radius-sm: 12px;
    }

    * { box-sizing: border-box; }

    /* Never fall back to the default "HTML vibe" */
    ul, ol { list-style: none; margin: 0; padding: 0; }

    html, body { height: 100%; }

    body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
        background:
          radial-gradient(900px 520px at 12% -10%, rgba(244, 114, 182, 0.20), transparent 60%),
          radial-gradient(900px 520px at 88% -5%, rgba(74, 222, 128, 0.16), transparent 55%),
          var(--bg-app);
        color: var(--ink);
        line-height: 1.5;
    }

    a {
        color: var(--pink-700);
        text-decoration: none;
        text-underline-offset: 2px;
    }
    a:hover { text-decoration: underline; }

    :focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.24);
        border-radius: 10px;
    }

    button, input, textarea { font: inherit; }

    h1, h2, h3 { letter-spacing: -0.03em; margin: 0; }
    h1 { font-size: 2.25rem; line-height: 1.12; font-weight: 850; }
    h3 { font-weight: 750; }

    p { margin: 0; }

    /* Layout helpers */
    .feed-container{
        width: min(1120px, calc(100% - 2rem));
        margin: 0 auto;
        padding: 1.25rem 0 0;
    }

    .page-title{ margin-top: 0.5rem; }
    .page-subtitle{ margin-top: 0.6rem; color: var(--muted); max-width: 60ch; }

    .pagination{ display:flex; justify-content: space-between; align-items:center; gap:0.75rem; padding: 0.85rem 0 2rem; color: var(--muted); }

    .toolbar{ display:flex; gap:0.6rem; flex-wrap:wrap; align-items:center; margin-bottom: 1rem; }

    /* Buttons */
    .btn {
        appearance: none;
        border: 1px solid var(--border-neutral);
        background: rgba(255,255,255,0.85);
        color: var(--ink);
        border-radius: 12px;
        padding: 0.48rem 0.78rem;
        cursor: pointer;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.05);
        transition: background 120ms ease, border-color 120ms ease, transform 60ms ease, box-shadow 120ms ease;
    }
    .btn:hover{
        background: #ffffff;
        border-color: color-mix(in srgb, var(--border-neutral) 70%, var(--pink-200));
        box-shadow: 0 12px 26px rgba(15, 23, 42, 0.08);
    }
    .btn:active{ transform: translateY(1px); }
    .btn:disabled{ opacity: 0.55; cursor: not-allowed; }

    .btn-small{ padding: 0.35rem 0.62rem; border-radius: 10px; font-size: 0.85rem; }

    .btn-primary{
        background: linear-gradient(180deg, var(--pink-300), #ec4899);
        border-color: color-mix(in srgb, var(--pink-200) 85%, white);
        color:#fff;
    }
    .btn-primary:hover{
        background: linear-gradient(180deg, #ec4899, #db2777);
        border-color: var(--pink-200);
    }

    .btn-secondary{
        background: linear-gradient(180deg, var(--green-200), var(--green-100));
        border-color: var(--border-green);
        color: var(--green-800);
    }
    .btn-secondary:hover{
        background: linear-gradient(180deg, var(--green-300), var(--green-100));
        border-color: color-mix(in srgb, var(--green-200) 80%, white);
    }

    .btn-danger{
        border-color: #f4b4b4;
        background: rgba(255,255,255,0.9);
        color: #b91c1c;
    }
    .btn-danger:hover{
        background: #fff1f1;
        border-color: #ef9a9a;
    }

    /* Inputs */
    input, textarea{
        width: 100%;
        border: 1px solid var(--border-neutral);
        background: rgba(255,255,255,0.92);
        color: inherit;
        border-radius: 12px;
        padding: 0.72rem 0.88rem;
        transition: border-color 120ms ease, box-shadow 120ms ease, transform 60ms ease;
    }
    input::placeholder, textarea::placeholder{ color: #94a3b8; }
    input:focus, textarea:focus{
        outline: none;
        border-color: var(--pink-200);
        box-shadow: 0 0 0 3px rgba(244, 114, 182, 0.18);
    }

    /* Sections */
    .section{ margin-top: 1.1rem; }
    .section-title{ margin: 0 0 0.6rem; font-size: 1.05rem; font-weight: 700; color: var(--muted); }

    .list-clean{ list-style:none; margin:0; padding:0; }
    .list-inline{ display:flex; flex-wrap:wrap; gap:0.55rem; }

    /* Cards with different tints */
    .card{
        background: rgba(255,255,255,0.86);
        border: 1px solid var(--border-neutral);
        border-radius: var(--radius);
        padding: 1rem 1.1rem;
        box-shadow: var(--shadow);
    }
    .card-subtle{ background: rgba(255,255,255,0.72); backdrop-filter: blur(10px); }

    .post-card{
        background: var(--pink-50);
        border: 1px solid var(--border-pink);
        border-radius: 16px;
        padding: 1rem 1.1rem;
        margin-bottom: 0.9rem;
        box-shadow: 0 10px 22px rgba(157, 23, 77, 0.06);
    }

    .friend-card,
    .row-card.friend-card{
        background: var(--green-50);
        border: 1px solid var(--border-green);
        border-radius: 14px;
    }

    .row-card{
        display:flex;
        align-items:center;
        justify-content: space-between;
        gap:0.75rem;
        padding: 0.78rem 0.92rem;
        margin-bottom: 0.65rem;
        border: 1px solid var(--border-neutral);
        border-radius: 14px;
        background: rgba(255,255,255,0.86);
    }

    .pill{
        border: 1px solid var(--border-neutral);
        background: rgba(255,255,255,0.86);
        border-radius: 999px;
        padding: 0.35rem 0.62rem;
    }

    .friend-pill{
        background: var(--green-50);
        border-color: var(--border-green);
    }

    .divider{
        height:1px;
        background: color-mix(in srgb, var(--border-neutral) 60%, white);
        margin: 0.9rem 0;
    }

    .stack{ display:grid; gap: 0.85rem; }

    .post-list{ display:grid; gap: 0.9rem; }

    .post-header{
        display:flex;
        align-items:center;
        justify-content: space-between;
        gap:0.75rem;
        margin-bottom: 0.65rem;
    }
    .post-header-left{ display:flex; align-items:center; gap:0.75rem; min-width:0; }

    .avatar{
        width: 38px; height:38px;
        border-radius: 12px;
        display:grid; place-items:center;
        border: 1px solid color-mix(in srgb, var(--border-pink) 45%, var(--border-green));
        background: linear-gradient(180deg, rgba(244,114,182,0.16), rgba(74,222,128,0.14));
        color: var(--ink);
        font-weight: 800;
        flex: 0 0 auto;
        user-select:none;
    }

    .post-author{ display:flex; flex-direction:column; min-width:0; }
    .post-author-name{
        font-weight: 800;
        letter-spacing: -0.01em;
        white-space: nowrap;
        overflow:hidden;
        text-overflow: ellipsis;
    }
    .post-author-name:hover{ color: var(--pink-700); }
    .post-author-hint{ color: #64748b; font-size: 0.9rem; white-space: nowrap; overflow:hidden; text-overflow: ellipsis; }

    .post-text{ white-space: pre-wrap; color: var(--ink); }

    .post-meta{ color: #64748b; font-size: 0.88rem; margin-top: 0.2rem; }

    .post-actions{ display:flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.85rem; }

    /* Comments */
    .comment-composer{
        margin-top: 0.85rem;
        background: rgba(255,255,255,0.86);
        border: 1px solid var(--border-neutral);
        border-radius: 14px;
        padding: 0.8rem;
    }
    .comment{
        display:flex;
        gap:0.55rem;
        align-items: baseline;
        padding: 0.55rem 0.65rem;
        border: 1px solid var(--border-neutral);
        border-radius: 12px;
        background: rgba(255,255,255,0.84);
        margin-bottom: 0.55rem;
    }
    .comment-author{ font-weight: 750; color: var(--ink); }
    .comment-text{ color: var(--ink); }

    /* Composer */
    .composer{
        margin-top: 1rem;
        background: var(--pink-50);
        border: 1px solid var(--border-pink);
        border-radius: 16px;
        padding: 0.95rem;
        box-shadow: 0 10px 22px rgba(157, 23, 77, 0.06);
    }
    .composer-textarea{
        min-height: 96px;
        background: rgba(255,255,255,0.9);
        border-color: color-mix(in srgb, var(--border-pink) 55%, white);
    }
    .composer-textarea:focus{
        border-color: var(--pink-200);
        box-shadow: 0 0 0 3px rgba(244,114,182,0.18);
    }
    .composer-actions{ display:flex; justify-content:flex-end; margin-top: 0.75rem; }

    /* Wall two-column layout */
    .wall-layout{
        display:grid;
        grid-template-columns: 320px 1fr;
        gap: 1rem;
        align-items: start;
        margin-top: 1rem;
    }
    .wall-sidebar{
        position: sticky;
        top: 0.75rem;
        display:grid;
        gap: 1rem;
        align-self: start;
    }
    .wall-box{
        background: var(--green-50);
        border: 1px solid var(--border-green);
        border-radius: var(--radius);
        padding: 1rem;
        box-shadow: 0 10px 22px rgba(20,83,45,0.06);
    }

    @media (max-width: 900px){
        .wall-layout{ grid-template-columns: 1fr; }
        .wall-sidebar{ position: static; }
    }
`;
