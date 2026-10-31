/* v110 - durable Member navigation/booking draft. Never stores passwords, tokens or photos. */
(function () {
  'use strict';
  if (window.__spgMemberRecoveryV110) return;
  window.__spgMemberRecoveryV110 = true;

  const KEY = 'spg_member_resume_v110';
  const PAGES = ['home','reward','qr','services','store','booking','history','account'];
  const FIELDS = ['bkMotor','bkCatFallback','bkService','bkAddon','bkVoucher','bkPoints','bkDate','bkNotes'];
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  let sheetType = null;
  let restoring = false;
  let readyToSave = false;
  let recoveryTimer = null;

  function currentUser() {
    try {
      const jwt = state.session && state.session.access_token;
      if (!jwt) return '';
      const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(part)).sub || '';
    } catch (e) { return ''; }
  }
  function readSnapshot() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!saved || !currentUser() || saved.user !== currentUser()) return null;
      if (Date.now() - saved.at > MAX_AGE || saved.at > Date.now() + 60000) return null;
      return saved;
    } catch(e) { return null; }
  }
  function captureFields() {
    const fields = {};
    FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) fields[id] = String(el.value || '').slice(0, id === 'bkNotes' ? 1000 : 180);
    });
    return fields;
  }
  function persist() {
    if (!readyToSave || restoring) return;
    try {
      const user = currentUser();
      if (!user) { localStorage.removeItem(KEY); return; }
      localStorage.setItem(KEY, JSON.stringify({
        user:user,at:Date.now(),page:PAGES.includes(state.page) ? state.page : 'home',
        bookingCat:state.bookingCat,rewardTab:state.rewardTab,
        serviceGroup:state.serviceGroup,serviceSearch:state.serviceSearch,
        sheet:sheetType,form:sheetType === 'booking' ? captureFields() : null
      }));
    } catch (e) {}
  }
  window.__spgMemberSaveDraft = persist;
  const originalRender = render;
  render = function() {
    const value = originalRender.apply(this, arguments);
    persist();
    return value;
  };
  const originalOpenSheet = openSheet;
  openSheet = function() {
    sheetType = 'other';
    const value = originalOpenSheet.apply(this, arguments);
    persist();
    return value;
  };
  const originalOpenBooking = openBooking;
  openBooking = function() {
    sheetType = 'booking';
    const value = originalOpenBooking.apply(this, arguments);
    sheetType = 'booking';
    persist(); // Save the sheet even if no field has been edited yet.
    return value;
  };
  const originalCloseSheet = closeSheet;
  closeSheet = function() {
    const value = originalCloseSheet.apply(this, arguments);
    sheetType = null;
    persist(); // Closing/cancelling/finishing clears the draft.
    return value;
  };
  ['input','change'].forEach(type =>
    document.addEventListener(type, event => {
      if (sheetType === 'booking' && event.target &&
          event.target.closest && event.target.closest('#sheetRoot')) persist();
    }, true)
  );
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) persist();
  }, true);
  window.addEventListener('pagehide',persist,true);
  window.addEventListener('beforeunload',persist,true);

  const saved = readSnapshot();
  if (!saved) {
    readyToSave = true;
    persist();
    return;
  }

  restoring = true; // Do not overwrite stored draft before asynchronous data finishes loading.
  if (PAGES.includes(saved.page)) state.page = saved.page;
  if (typeof saved.bookingCat === 'string') state.bookingCat = saved.bookingCat;
  if (typeof saved.rewardTab === 'string') state.rewardTab = saved.rewardTab;
  if (typeof saved.serviceGroup === 'string') state.serviceGroup = saved.serviceGroup;
  if (typeof saved.serviceSearch === 'string') state.serviceSearch = saved.serviceSearch.slice(0,120);
  document.querySelectorAll('.nav button').forEach(button => {
    button.classList.toggle('active',button.dataset.page === state.page);
  });
  try { originalRender(); } catch(e) {}

  function finishRestore() {
    if (recoveryTimer !== null) clearTimeout(recoveryTimer);
    recoveryTimer = null;
    restoring = false;
    readyToSave = true;
    persist();
  }
  if (saved.sheet !== 'booking') { finishRestore(); return; }

  let attempts = 0;
  function restoreBooking() {
    if (!currentUser()) { finishRestore(); return; }
    // Cached service catalog normally loads instantly. Wait for live data when empty.
    if ((!state.catalog || !state.catalog.length) && attempts++ < 40) {
      recoveryTimer = setTimeout(restoreBooking,250);
      return;
    }
    try {
      if (!document.getElementById('bkMotor')) {
        originalOpenBooking.call(window,saved.form && saved.form.bkService || '');
      }
      sheetType = 'booking';
      const form = saved.form || {};
      function put(id,value,eventType) {
        if (value === undefined || value === null) return;
        const el = document.getElementById(id);
        if (!el) return;
        el.value = String(value);
        if (eventType) el.dispatchEvent(new Event(eventType,{bubbles:true}));
      }
      put('bkMotor',form.bkMotor,'input');
      put('bkCatFallback',form.bkCatFallback,'change');
      put('bkService',form.bkService,'change');
      put('bkAddon',form.bkAddon,'change');
      put('bkVoucher',form.bkVoucher,'change');
      put('bkPoints',form.bkPoints,'input');
      put('bkDate',form.bkDate,'change');
      put('bkNotes',form.bkNotes,'input');
    } catch (e) {
      // Restore page even if the server changed its catalog. Never submit a booking.
    }
    finishRestore();
  }
  restoreBooking();
})();