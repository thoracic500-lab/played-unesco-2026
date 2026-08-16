/* ============================================================
   PLAYED — icons.js
   Self-hosted UI icon set: 24×24 stroke icons (Feather/Lucide-
   style geometry, hand-authored — no CDN, no license strings
   required, works fully offline, inherits currentColor).
   Usage: window.UI_ICON("shield") → inline <svg> markup.
   Emoji remain ONLY inside simulated social-media content,
   where they are authentic; all interface icons use this set.
   ============================================================ */

(function () {
  "use strict";

  const P = {
    /* roles & core */
    pen: '<path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    bot: '<rect x="5" y="8" width="14" height="11" rx="2"/><path d="M12 8V4.5"/><circle cx="12" cy="3.5" r="1"/><path d="M9.3 13.5h.01M14.7 13.5h.01"/><path d="M9.5 16.5h5"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    shield: '<path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10z"/>',
    message: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.7-.8L3 21l1.8-5.8A8.5 8.5 0 1 1 21 11.5z"/>',
    /* verify lab tools */
    scan: '<circle cx="12" cy="12" r="6.5"/><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    book: '<path d="M2 4.5h6.5A3.5 3.5 0 0 1 12 8v13a3 3 0 0 0-3-3H2v-13.5z"/><path d="M22 4.5h-6.5A3.5 3.5 0 0 0 12 8v13a3 3 0 0 1 3-3h7v-13.5z"/>',
    sparkles: '<path d="M11 3l1.7 4.8L17.5 9.5l-4.8 1.7L11 16l-1.7-4.8L4.5 9.5l4.8-1.7L11 3z"/><path d="M19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z"/>',
    /* case types */
    flask: '<path d="M9.5 3h5M10.5 3v6l-5.6 9.7A1.8 1.8 0 0 0 6.5 21.5h11a1.8 1.8 0 0 0 1.6-2.8L13.5 9V3"/><path d="M7.5 15.5h9"/>',
    storm: '<path d="M6.5 16.5A4.5 4.5 0 1 1 7.4 7.6 6 6 0 0 1 19 9.3a4 4 0 0 1-.6 7.2"/><path d="M12.5 11.5l-3 5h4l-3 5"/>',
    banknote: '<rect x="2" y="7" width="20" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M5.5 12h.01M18.5 12h.01"/>',
    ballot: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12.2l2.8 2.8L16 9"/>',
    alert: '<path d="M12 3L1.8 20.5h20.4L12 3z"/><path d="M12 10v4.5"/><path d="M12 17.8h.01"/>',
    "eye-off": '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/><path d="M4 4l16 16"/>',
    "check-circle": '<circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.7 2.7 5.3-6"/>',
    /* communities */
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.8 15.6a4.6 4.6 0 0 1 4.7 4.4"/>',
    shirt: '<path d="M8 3.5L12 5.5l4-2 4.5 3.5-2 3-1.5-1V21h-10V9l-1.5 1-2-3L8 3.5z"/>',
    plane: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
    access: '<circle cx="12" cy="4.5" r="2"/><path d="M5 9.5l7 1.2 7-1.2"/><path d="M12 10.5v5"/><path d="M9 21l3-5.5 3 5.5"/>',
    "shield-heart": '<path d="M12 22s8-3.6 8-10V5.2L12 2 4 5.2V12c0 6.4 8 10 8 10z"/><path d="M12 15s-3-2.1-3-4.1a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 2-3 4.1-3 4.1z"/>',
    /* prebunk cards */
    bridge: '<path d="M2 18h20"/><path d="M5 18V8M19 18V8"/><path d="M5 9c3.5-4 10.5-4 14 0"/><path d="M9 18v-4.5M12 18v-6M15 18v-4.5"/>',
    leaf: '<path d="M11 20.5A7.5 7.5 0 0 1 4 13C4 8 8 4 20 3.5c-.5 12-4.5 16-9 17z"/><path d="M4 21c3-5.5 7-8.5 12-10.5"/>',
    video: '<rect x="2" y="6" width="13" height="12" rx="2"/><path d="M15 10.5l7-4v11l-7-4z"/>',
    waves: '<path d="M2 7.5c2.5-2 4.5-2 6.5 0s4 2 6.5 0 4.5-2 7 0"/><path d="M2 13c2.5-2 4.5-2 6.5 0s4 2 6.5 0 4.5-2 7 0"/><path d="M2 18.5c2.5-2 4.5-2 6.5 0s4 2 6.5 0 4.5-2 7 0"/>',
    "message-heart": '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.7-.8L3 21l1.8-5.8A8.5 8.5 0 1 1 21 11.5z"/><path d="M12 14.5s-2.8-2-2.8-3.8a1.6 1.6 0 0 1 2.8-1 1.6 1.6 0 0 1 2.8 1c0 1.8-2.8 3.8-2.8 3.8z"/>',
    /* manipulation techniques */
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.7 14L7 22l5-3 5 3-1.7-8"/>',
    chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-6"/><path d="M22 20H2"/>',
    flame: '<path d="M12 2.5s5.5 5 5.5 9.9a5.5 5.5 0 0 1-11 0c0-2 .9-3.8 2.3-5.3C10 5.9 12 4.2 12 2.5z"/>',
    split: '<path d="M12 3v5"/><path d="M12 8c0 4-6.5 4-6.5 9v2"/><path d="M12 8c0 4 6.5 4 6.5 9v2"/>',
    "heart-crack": '<path d="M12 21S3 13.8 3 8.2A4.8 4.8 0 0 1 12 5.5 4.8 4.8 0 0 1 21 8.2C21 13.8 12 21 12 21z"/><path d="M12 6l-1.8 3.4 2.8 2.6-1.4 3.5"/>',
    filter: '<path d="M3 4.5h18l-7 8v5.5l-4 2.5v-8l-7-8z"/>',
    corner: '<path d="M4 20v-7a4 4 0 0 1 4-4h12"/><path d="M15 4l5 5-5 5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15.5l-5-5L5 21"/>',
    /* badges & misc */
    eye: '<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.8"/>',
    cog: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.2 5.2l2.1 2.1M16.7 16.7l2.1 2.1M18.8 5.2l-2.1 2.1M7.3 16.7l-2.1 2.1"/>',
    brain: '<path d="M12 4.5a3.5 3.5 0 0 0-3.5 3.4 3.8 3.8 0 0 0-1.6 6.8v1.8A3.5 3.5 0 0 0 10.4 20h3.2a3.5 3.5 0 0 0 3.5-3.5v-1.8a3.8 3.8 0 0 0-1.6-6.8A3.5 3.5 0 0 0 12 4.5z"/><path d="M12 4.5V20"/>',
    home: '<path d="M3 10.5L12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M10 21v-6h4v6"/>',
    compass: '<circle cx="12" cy="12" r="9.5"/><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z"/>',
    "volume-x": '<path d="M11 5.5L6.5 9H3v6h3.5L11 18.5v-13z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
    syringe: '<path d="M21 3l-2 2"/><path d="M13 5l6 6"/><path d="M15.5 7.5l-7 7L4 19l.5-4.5 7-7"/><path d="M9 11l2 2"/>',
    printer: '<path d="M6.5 8.5V3.5h11v5"/><path d="M6.5 17.5h-2a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6.5" y="14.5" width="11" height="6.5"/>',
    rotate: '<path d="M3.5 12a8.5 8.5 0 1 0 2.8-6.3L3.5 8"/><path d="M3.5 3.5V8H8"/>',
    /* inclusion badges */
    "wifi-off": '<path d="M3 3l18 18"/><path d="M5.5 12.5a10.5 10.5 0 0 1 4.6-3M2.5 9A15 15 0 0 1 8 6M10.9 5.6A15 15 0 0 1 21.5 9M16.6 11.4a10.5 10.5 0 0 1 2 1.5"/><path d="M12 19.8h.01"/>',
    smartphone: '<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M12 18h.01"/>',
    globe: '<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19"/><path d="M12 2.5c3 3.2 3 15.8 0 19M12 2.5c-3 3.2-3 15.8 0 19"/>',
    gift: '<rect x="3" y="8" width="18" height="4"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8H8.2A2.1 2.1 0 0 1 8.2 3.8C10.2 3.8 12 8 12 8zM12 8h3.8a2.1 2.1 0 0 0 0-4.2C13.8 3.8 12 8 12 8z"/>',
  };

  window.UI_ICON = function (name) {
    const body = P[name];
    if (!body) return "";
    return `<svg class="uic" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  };

  // hydrate static HTML: <span data-icon="shield"></span> → inline svg
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-icon]").forEach(el => {
      el.innerHTML = window.UI_ICON(el.dataset.icon) + el.innerHTML;
    });
  });
})();
