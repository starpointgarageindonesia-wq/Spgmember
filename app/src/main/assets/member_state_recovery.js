/* Member v109: recover the active page and unfinished booking after Android reclaims a WebView.
   Does not store passwords, payment files, photos or authentication credentials. */
(function () {
  'use strict';
  if (window.__spgMemberRecoveryV109) return;
  window.__spgMemberRecoveryV109 = true;
  const KEY = 'spg_member_ui_draft_v109';
  const PAGES = ['home', 'reward', 'qr', 'services', 'store', 'booking', 'history', 'account'];
  const FIELDS = ['bkMotor', 'bkCatFallback', 'bkService', 'bkAddon', 'bkVoucher', 'bkPoints', 'bkDate', 'bkNotes'];
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  let restored = false;
  let allowSave = false;

  function userId() {
    try {
      if (!state.session || !state.session.access_token) return '';
      const token = state.session.access_token.split('.')[1];
      const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(normalized)).sub || '';
    } catch (_) { return ''; }
  }
  function read() {
    try {
      const entry = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!entry || !userId() || entry.userId !== userId() ||
          Date.now() - entry.time > MAX_AGE) return null;
      return entry;
    } catch (_) { return null; }
  }
  function draftFields() {
    if (!document.getElementById('bkMotor')) return null;
    const values = {};
    FIELDS.forEach(id => {
      const element = document.getElementById(id);
      if (element) values[id] = String(element.value || '').slice(0, id === 'bkNotes' ? 1000 : 180);
    });
    return values;
  }
  function save() {
    if (!allowSave) return;
    try {
      const uid = userId();
      if (!uid) { localStorage.removeItem(KEY); return; }
      const page = PAGES.includes(state.page) ? state.page : 'home';
      localStorage.setItem(KEY, JSON.stringify({
        userId: uid, time: Date.now(), page,
        bookingCat: state.bookingCat, rewardTab: state.rewardTab,
        serviceGroup: state.serviceGroup, serviceSearch: state.serviceSearch,
        draft: draftFields()
      }));
    } catch (_) { /* private storage may be disabled */ }
  }

  const oldRender = render;
  render = function () {
    const result = oldRender.apply(this, arguments);
    save();
    return result;
  };
  document.addEventListener('input', event => {
    if (event.target && event.target.closest && event.target.closest('#sheetRoot')) save();
  }, true);
  document.addEventListener('change', event => {
    if (event.target && event.target.closest && event.target.closest('#sheetRoot')) save();
  }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
  window.addEventListener('pagehide', save);
  window.addEventListener('beforeunload', save);

  const snapshot = read();
  if (!snapshot) {
    allowSave = true;
    save();
    return;
  }
  if (PAGES.includes(snapshot.page)) state.page = snapshot.page;
  if (['small', 'medium', 'large', 'big_bike', 'luxury'].includes(snapshot.bookingCat)) {
    state.bookingCat = snapshot.bookingCat;
  }
  if (['voucher', 'redeem', 'history'].includes(snapshot.rewardTab)) {
    state.rewardTab = snapshot.rewardTab;
  }
  if (typeof snapshot.serviceGroup === 'string') state.serviceGroup = snapshot.serviceGroup;
  if (typeof snapshot.serviceSearch === 'string') state.serviceSearch = snapshot.serviceSearch.slice(0, 120);
  document.querySelectorAll('.nav button').forEach(button =>
    button.classList.toggle('active', button.dataset.page === state.page));
  if (state.session && state.session.access_token) render();

  function finishRestore() {
    if (restored) return;
    restored = true;
    allowSave = true;
    save();
  }
  if (!snapshot.draft || !snapshot.draft.bkMotor) {
    finishRestore();
    return;
  }
  let tries = 0;
  function tryRestoreBooking() {
    if (!state.session || !state.session.access_token) { finishRestore(); return; }
    if (!state.member || !state.catalog || state.catalog.length === 0) {
      if (++tries <= 55) setTimeout(tryRestoreBooking, 300);
      else finishRestore();
      return;
    }
    try {
      if (document.getElementById('bkMotor')) { finishRestore(); return; }
      openBooking(snapshot.draft.bkService || '');
      function setField(id, val, eventName) {
        const input = document.getElementById(id);
        if (!input || val === undefined || val === null) return;
        input.value = String(val);
        if (eventName) input.dispatchEvent(new Event(eventName, {bubbles:true}));
      }
      const d = snapshot.draft;
      setField('bkMotor', d.bkMotor, 'input');
      if (d.bkCatFallback) setField('bkCatFallback', d.bkCatFallback, 'change');
      setField('bkService', d.bkService, 'change');
      setField('bkAddon', d.bkAddon, 'change');
      setField('bkVoucher', d.bkVoucher, 'change');
      setField('bkPoints', d.bkPoints, 'input');
      setField('bkDate', d.bkDate, 'change');
      setField('bkNotes', d.bkNotes, 'input');
    } catch (_) { /* keep the booking page usable if the draft is outdated */ }
    finishRestore();
  }
  tryRestoreBooking();
})();