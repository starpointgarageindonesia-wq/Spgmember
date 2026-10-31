/* Starpoint Garage Member v110
 * Keep the open booking sheet and its form values when Android discards the WebView.
 * Never persist passwords, payment proof images or access/refresh tokens in this draft. */
(function () {
  'use strict';
  if (window.__spgMemberUiRecovery110) return;
  window.__spgMemberUiRecovery110 = true;
  const KEY = 'spg_member_ui_draft_v110';
  const PREVIOUS_KEY = 'spg_member_ui_draft_v109';
  const PAGES = ['home','reward','qr','services','store','booking','history','account'];
  const FIELDS = ['bkMotor','bkCatFallback','bkService','bkAddon','bkVoucher','bkPoints','bkDate','bkNotes'];
  const MAX_AGE = 7 * 86400000;
  let canPersist = false;
  let restoring = false;
  let finishedRestore = false;
  let lastSnapshot = null;
  let restoreTimer = 0;

  function currentUser() {
    try {
      const token = state.session && state.session.access_token;
      if (!token) return '';
      const raw = token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
      return String(JSON.parse(atob(raw)).sub || '');
    } catch (_) { return ''; }
  }

  function persisted() {
    try {
      const uid = currentUser();
      if (!uid) return null;
      const d = JSON.parse(localStorage.getItem(KEY) || localStorage.getItem(PREVIOUS_KEY) || 'null');
      if (!d || d.userId !== uid || Date.now() - d.time > MAX_AGE) return null;
      return d;
    } catch (_) { return null; }
  }

  function getDraft() {
    const first = document.getElementById('bkMotor');
    if (!first) return null;
    const draft = {};
    FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) draft[id] = String(el.value || '').slice(0, id === 'bkNotes' ? 1000 : 180);
    });
    return draft;
  }

  function persistNow() {
    if (!canPersist || restoring) return;
    try {
      const uid = currentUser();
      if (!uid) { localStorage.removeItem(KEY); localStorage.removeItem(PREVIOUS_KEY); return; }
      const draft = getDraft();
      const object = {
        userId: uid, time: Date.now(),
        page: PAGES.includes(state.page) ? state.page : 'home',
        bookingCat: state.bookingCat,
        rewardTab: state.rewardTab,
        serviceGroup: state.serviceGroup,
        serviceSearch: state.serviceSearch,
        bookingOpen: !!draft,
        draft: draft
      };
      // One atomic write. The browser never stores card data or uploaded images.
      localStorage.setItem(KEY, JSON.stringify(object));
      lastSnapshot = object;
    } catch (_) {}
  }

  // The prior version only saved on form input and page renders. Opening a sheet
  // does neither, so returning from Home lost the entire untouched booking form.
  const originalOpenBooking = openBooking;
  openBooking = function () {
    const ret = originalOpenBooking.apply(this, arguments);
    if (!restoring) persistNow();
    return ret;
  };
  const originalCloseSheet = closeSheet;
  closeSheet = function () {
    const ret = originalCloseSheet.apply(this, arguments);
    if (!restoring) persistNow();
    return ret;
  };
  const originalRender = render;
  render = function () {
    const ret = originalRender.apply(this, arguments);
    if (!restoring) persistNow();
    return ret;
  };

  document.addEventListener('input', e => {
    if (e.target && e.target.closest && e.target.closest('#sheetRoot')) persistNow();
  }, true);
  document.addEventListener('change', e => {
    if (e.target && e.target.closest && e.target.closest('#sheetRoot')) persistNow();
  }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) persistNow(); }, true);
  window.addEventListener('pagehide', persistNow, true);
  window.addEventListener('beforeunload', persistNow, true);
  window.__spgCaptureState = persistNow;

  const original = persisted();
  if (!original) {
    canPersist = true;
    return;
  }
  restoring = true;
  lastSnapshot = original;
  if (PAGES.includes(original.page)) state.page = original.page;
  if (['small','medium','large','big_bike','luxury'].includes(original.bookingCat)) state.bookingCat = original.bookingCat;
  if (['voucher','redeem','history'].includes(original.rewardTab)) state.rewardTab = original.rewardTab;
  if (typeof original.serviceGroup === 'string') state.serviceGroup = original.serviceGroup;
  if (typeof original.serviceSearch === 'string') state.serviceSearch = original.serviceSearch.slice(0,120);
  document.querySelectorAll('.nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.page === state.page));
  if (state.session && state.session.access_token) render();
  restoring = false;

  function finalize() {
    if (finishedRestore) return;
    finishedRestore = true;
    clearTimeout(restoreTimer);
    restoring = false;
    canPersist = true;
    // Once the booking is visible, persist refreshed state. An old draft is
    // never cleared simply because the dashboard needs another network request.
    persistNow();
  }
  if (!original.bookingOpen && !original.draft) { finalize(); return; }

  function restoreField(id, value, eventType) {
    const el = document.getElementById(id);
    if (!el || value === undefined || value === null) return;
    const text = String(value);
    if (el.tagName === 'SELECT' &&
        !Array.from(el.options).some(opt => opt.value === text)) return;
    el.value = text;
    if (eventType) el.dispatchEvent(new Event(eventType, {bubbles:true}));
  }

  let retries = 0;
  function restoreBooking() {
    if (finishedRestore) return;
    if (!state.session || !state.session.access_token) { finalize(); return; }
    // Catalog is cached before this script executes, so the form often appears
    // immediately rather than waiting for a slow dashboard network call.
    if (!Array.isArray(state.catalog) || state.catalog.length === 0) {
      if (++retries <= 90) restoreTimer = setTimeout(restoreBooking,200);
      else { canPersist = true; }
      return;
    }
    try {
      restoring = true;
      if (!document.getElementById('bkMotor')) originalOpenBooking(original.draft?.bkService || '');
      const d = original.draft || {};
      restoreField('bkMotor',d.bkMotor,'input');
      restoreField('bkCatFallback',d.bkCatFallback,'change');
      restoreField('bkService',d.bkService,'change');
      restoreField('bkAddon',d.bkAddon,'change');
      restoreField('bkVoucher',d.bkVoucher,'change');
      restoreField('bkPoints',d.bkPoints,'input');
      restoreField('bkDate',d.bkDate,'change');
      restoreField('bkNotes',d.bkNotes,'input');
    } catch (_) {
      // Keep page loaded even if a newer catalog no longer has an old service.
    }
    restoring = false;
    finalize();
  }
  // Load the modal before the user's next interaction; startup will also fetch
  // the latest prices asynchronously after the form has appeared.
  restoreBooking();
})();