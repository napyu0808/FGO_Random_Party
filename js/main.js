(() => {
  const PARTY_SIZE = 6;
  const MAX_COST = 118;
  // cost per rarity; No.1 (Mash) and No.107 (Anri Mayu) are special cases, see costOf()
  const COST = { 0: 4, 1: 3, 2: 4, 3: 7, 4: 9, 5: 12 };
  const MASH_NO = 1;
  const ANRI_MAYU_NO = 107;
  // picks kept ready and already downloaded: the next full party + spares for single-slot rerolls
  const PREFETCH = 12;
  const IMAGE_BASE = 'https://static.atlasacademy.io/JP/NarrowFigure';

  const servants = Array.isArray(window.SERVANTS) ? window.SERVANTS : [];
  const statusEl = document.getElementById('status');
  const drawBtn = document.getElementById('draw');
  const partyEl = document.querySelector('.party');
  const costNowEl = document.getElementById('cost-now');
  document.getElementById('cost-max').textContent = MAX_COST;

  let party = new Array(PARTY_SIZE).fill(null);
  let queue = [];
  let preloaded = new Map(); // keeps the Image objects alive while their download is in flight
  const cards = [];

  const imageUrl = (s) => `${IMAGE_BASE}/${s.id}/${s.id}@0.png`;

  function costOf(s) {
    if (s.no === MASH_NO) return 0;
    if (s.no === ANRI_MAYU_NO) return 4;
    return COST[s.r] ?? 0;
  }

  function renderCost() {
    const total = party.reduce((sum, s) => sum + (s ? costOf(s) : 0), 0);
    costNowEl.textContent = total;
  }

  function setStatus(text, isError = false) {
    statusEl.textContent = text;
    statusEl.classList.toggle('error', isError);
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function preload(s) {
    if (preloaded.has(s.no)) return;
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = imageUrl(s);
    preloaded.set(s.no, img);
  }

  // top the queue back up with servants not in the party or queue, and start downloading them
  function refillQueue() {
    const used = new Set([...party.filter(Boolean), ...queue].map((s) => s.no));
    const pool = shuffle(servants.filter((s) => !used.has(s.no)));
    while (queue.length < PREFETCH && pool.length) {
      const s = pool.pop();
      queue.push(s);
      preload(s);
    }
    // forget finished picks so memory doesn't grow with every draw
    const keep = new Set(queue.map((s) => s.no));
    preloaded = new Map([...preloaded].filter(([no]) => keep.has(no)));
  }

  function buildCards() {
    for (let i = 0; i < PARTY_SIZE; i++) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'card';
      card.setAttribute('aria-label', `${i + 1}番目の枠`);
      card.innerHTML = '<span class="back">?</span><img alt="" referrerpolicy="no-referrer"><span class="no"></span>';
      card.addEventListener('click', () => rerollSlot(i));

      const img = card.querySelector('img');
      img.addEventListener('load', () => card.classList.add('has-image'));
      img.addEventListener('error', () => card.classList.remove('has-image'));

      partyEl.appendChild(card);
      cards.push(card);
    }
  }

  function renderSlot(i, order) {
    const card = cards[i];
    const s = party[i];
    const img = card.querySelector('img');

    card.classList.remove('has-image', 'drawn', 'reveal');
    card.querySelector('.no').textContent = `No.${s.no}`;
    card.querySelector('.back').textContent = `No.${s.no}`;
    card.setAttribute('aria-label', `${i + 1}番目の枠: No.${s.no}`);
    img.src = imageUrl(s);

    card.classList.add('drawn');
    card.style.setProperty('--i', order);
    void card.offsetWidth; // restart the reveal animation
    card.classList.add('reveal');
  }

  function drawParty() {
    if (servants.length < PARTY_SIZE) return;
    party =
      queue.length >= PARTY_SIZE
        ? queue.splice(0, PARTY_SIZE)
        : shuffle(servants.slice()).slice(0, PARTY_SIZE);
    party.forEach((_, i) => renderSlot(i, i));
    renderCost();
    refillQueue();
  }

  function rerollSlot(i) {
    if (!party[i]) return drawParty();
    const taken = new Set(party.map((s) => s.no));
    let next = queue.find((s) => !taken.has(s.no));
    if (next) {
      queue = queue.filter((s) => s !== next);
    } else {
      const candidates = servants.filter((s) => !taken.has(s.no));
      if (!candidates.length) return;
      next = candidates[Math.floor(Math.random() * candidates.length)];
    }
    party[i] = next;
    renderSlot(i, 0);
    renderCost();
    refillQueue();
  }

  function init() {
    buildCards();
    if (servants.length < PARTY_SIZE) {
      drawBtn.disabled = true;
      setStatus(
        servants.length === 0
          ? 'サーヴァントの一覧が空です。tools/build-list.ps1 を実行してください。'
          : `サーヴァントが${servants.length}騎しかいません。${PARTY_SIZE}騎以上必要です。`,
        true
      );
      return;
    }
    setStatus(`引けるサーヴァント ${servants.length}騎`);
    refillQueue(); // start downloading the first party before the button is pressed
    drawBtn.addEventListener('click', drawParty);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        drawParty();
      }
    });
  }

  init();
})();
