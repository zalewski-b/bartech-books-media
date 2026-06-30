/* Renderowanie kart ptakow + odtwarzacz audio.
   Zasada: tylko jedno nagranie gra naraz - odtworzenie nowego
   zatrzymuje poprzednie. Kazda karta ma wlasny <audio> element
   (prosciej niz jeden globalny <audio> przy 78 kartach na stronie,
   bo nie trzeba podmieniac src przy kazdym kliknieciu). */

/* Teksty UI w 4 jezykach. Jeden plik player.js obsluguje wszystkie 4 strony
   (ptaki/, en/birds/, de/voegel/, es/aves/) - jezyk rozpoznawany z atrybutu
   <html lang="..."> ustawionego juz na kazdej z 4 stron HTML, nie ze
   sciezki URL (bardziej kruche, latwo by sie rozjechalo przy zmianie
   struktury katalogow). Fallback na PL jesli atrybut lang brakuje lub
   ma nieznana wartosc. */
const UI_TEXT = {
  pl: { linkCopied: 'Link skopiowany', shareAriaLabel: (name) => `Skopiuj link do tego ptaka: ${name}` },
  en: { linkCopied: 'Link copied', shareAriaLabel: (name) => `Copy link to this bird: ${name}` },
  de: { linkCopied: 'Link kopiert', shareAriaLabel: (name) => `Link zu diesem Vogel kopieren: ${name}` },
  es: { linkCopied: 'Enlace copiado', shareAriaLabel: (name) => `Copiar enlace de este ave: ${name}` },
};

function currentLang() {
  const lang = document.documentElement.lang;
  return UI_TEXT[lang] ? lang : 'pl';
}

function t(key) {
  return UI_TEXT[currentLang()][key];
}

let currentlyPlaying = null;

function formatTime(seconds) {
  if (!isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function createBirdCard(bird) {
  const card = document.createElement('div');
  card.className = 'bird-card';
  card.id = `bird-${bird.localSlug}`;

  const art = document.createElement('div');
  art.className = 'bird-card-art';

  if (bird.attribution) {
    const infoBtn = document.createElement('button');
    infoBtn.className = 'bird-info-btn';
    infoBtn.textContent = 'i';
    infoBtn.setAttribute('aria-label', `Informacje o źródle nagrania: ${bird.namePl}`);

    const popup = document.createElement('div');
    popup.className = 'bird-attribution-popup';
    popup.textContent = bird.attribution + '. ';
    if (bird.licenseUrl) {
      const link = document.createElement('a');
      link.href = bird.licenseUrl;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Licencja';
      popup.appendChild(link);
    }

    infoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      popup.classList.toggle('visible');
    });
    document.addEventListener('click', (e) => {
      if (!art.contains(e.target)) popup.classList.remove('visible');
    });

    art.appendChild(infoBtn);
    art.appendChild(popup);
  }

  const img = document.createElement('img');
  img.src = bird.imageUrl;
  img.alt = `${bird.namePl} (${bird.nameLat})`;
  img.loading = 'lazy';
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => openLightbox(bird.imageUrl, img.alt));
  img.onerror = function () {
    art.innerHTML = `<svg class="bird-card-art-placeholder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 7h.01M8 21l4-7 4 7M4 11c0-3.87 3.13-7 7-7h2c3.87 0 7 3.13 7 7v1c0 1.1-.9 2-2 2h-1l-2 3h-6l-2-3H6c-1.1 0-2-.9-2-2v-1z"/></svg>`;
  };
  art.appendChild(img);

  const player = document.createElement('div');
  player.className = 'bird-card-player';

  const nameRow = document.createElement('div');
  nameRow.className = 'bird-card-name-row';

  const name = document.createElement('div');
  name.className = 'bird-card-name';
  name.textContent = bird.namePl;

  const shareBtn = document.createElement('button');
  shareBtn.className = 'bird-share-btn';
  shareBtn.setAttribute('aria-label', t('shareAriaLabel')(bird.namePl));
  shareBtn.innerHTML = iconShare();

  const shareTooltip = document.createElement('div');
  shareTooltip.className = 'bird-share-tooltip';
  shareTooltip.textContent = t('linkCopied');

  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyBirdLink(bird.localSlug, shareBtn, shareTooltip);
  });

  nameRow.appendChild(name);
  nameRow.appendChild(shareBtn);
  nameRow.appendChild(shareTooltip);

  const nameLat = document.createElement('div');
  nameLat.className = 'bird-card-name-lat';
  nameLat.textContent = bird.nameLat || '';

  const controls = document.createElement('div');
  controls.className = 'bird-card-controls';

  const progress = document.createElement('div');
  progress.className = 'bird-progress';
  const progressFill = document.createElement('div');
  progressFill.className = 'bird-progress-fill';
  const progressHandle = document.createElement('div');
  progressHandle.className = 'bird-progress-handle';
  progress.appendChild(progressFill);
  progress.appendChild(progressHandle);

  const buttonsRow = document.createElement('div');
  buttonsRow.className = 'bird-card-buttons-row';

  const restartBtn = document.createElement('button');
  restartBtn.className = 'bird-restart-btn';
  restartBtn.setAttribute('aria-label', `Od początku: ${bird.namePl}`);
  restartBtn.innerHTML = iconRestart();

  const playBtn = document.createElement('button');
  playBtn.className = 'bird-play-btn';
  playBtn.setAttribute('aria-label', `Odtwórz głos: ${bird.namePl}`);
  playBtn.innerHTML = iconPlay();

  const loopBtn = document.createElement('button');
  loopBtn.className = 'bird-loop-btn';
  loopBtn.setAttribute('aria-label', `Zapętl: ${bird.namePl}`);
  loopBtn.innerHTML = iconLoop();

  const audio = document.createElement('audio');
  audio.src = bird.audioUrl;
  audio.preload = 'none';

  buttonsRow.appendChild(restartBtn);
  buttonsRow.appendChild(playBtn);
  buttonsRow.appendChild(loopBtn);

  controls.appendChild(progress);
  controls.appendChild(buttonsRow);

  player.appendChild(nameRow);
  player.appendChild(nameLat);
  player.appendChild(controls);

  card.appendChild(art);
  card.appendChild(player);
  card.appendChild(audio);

  // --- logika odtwarzacza ---

  function pauseThisCard() {
    audio.pause();
    playBtn.innerHTML = iconPlay();
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
        const otherBtn = currentlyPlaying.closest('.bird-card')?.querySelector('.bird-play-btn');
        if (otherBtn) otherBtn.innerHTML = iconPlay();
      }
      audio.play();
      currentlyPlaying = audio;
      playBtn.innerHTML = iconPause();
    } else {
      pauseThisCard();
    }
  });

  restartBtn.addEventListener('click', () => {
    audio.currentTime = 0;
    progressFill.style.width = '0%';
    progressHandle.style.left = '0%';
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressFill.style.width = `${pct}%`;
      progressHandle.style.left = `${pct}%`;
    }
  });

  audio.addEventListener('ended', () => {
    if (!audio.loop) {
      playBtn.innerHTML = iconPlay();
      progressFill.style.width = '0%';
      progressHandle.style.left = '0%';
    }
  });

  // Przewijanie paska - wspiera klik (przeskok) ORAZ przeciaganie (scrub),
  // mysz i dotyk. Podczas przeciagania audio.currentTime aktualizuje sie
  // na biezaco, dajac wrazenie "scrubowania" jak w typowych odtwarzaczach.
  let isDragging = false;

  function seekToClientX(clientX) {
    if (!audio.duration || isNaN(audio.duration)) {
      // metadane jeszcze nie wczytane (preload="metadata" moze zajac chwile
      // w zaleznosci od sieci) - zapamietujemy pozycje i wykonujemy seek
      // jak tylko duration bedzie znane, zamiast po cichu ignorowac klik.
      const pendingRatio = computeRatio(clientX);
      const onceLoaded = () => {
        audio.currentTime = pendingRatio * audio.duration;
        updateProgressUI(pendingRatio * 100);
      };
      audio.addEventListener('loadedmetadata', onceLoaded, { once: true });
      // preload="none" oznacza ze audio jest w stanie NETWORK_IDLE (nic sie
      // nie wczytuje) do tego momentu - wymuszamy load() tej JEDNEJ karty
      // (nie wszystkich 70 na raz, co przy globalnym preload="metadata"
      // przeciazaloby slabe polaczenia mobilne).
      if (audio.networkState !== HTMLMediaElement.NETWORK_LOADING) {
        audio.load();
      }
      return;
    }
    const ratio = computeRatio(clientX);
    audio.currentTime = ratio * audio.duration;
    updateProgressUI(ratio * 100);
  }

  function computeRatio(clientX) {
    const rect = progress.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
  }

  function updateProgressUI(pct) {
    progressFill.style.width = `${pct}%`;
    progressHandle.style.left = `${pct}%`;
  }

  progress.addEventListener('mousedown', (e) => {
    isDragging = true;
    console.log('[DEBUG]', bird.slug, 'mousedown, clientX=', e.clientX);
    seekToClientX(e.clientX);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      console.log('[DEBUG]', bird.slug, 'mousemove (dragging), clientX=', e.clientX);
      seekToClientX(e.clientX);
    }
  });
  window.addEventListener('mouseup', (e) => {
    if (isDragging) console.log('[DEBUG]', bird.slug, 'mouseup, currentTime=', audio.currentTime);
    isDragging = false;
  });

  progress.addEventListener('touchstart', (e) => {
    isDragging = true;
    seekToClientX(e.touches[0].clientX);
  }, { passive: true });
  progress.addEventListener('touchmove', (e) => {
    if (isDragging) seekToClientX(e.touches[0].clientX);
  }, { passive: true });
  progress.addEventListener('touchend', () => { isDragging = false; });

  loopBtn.addEventListener('click', () => {
    audio.loop = !audio.loop;
    loopBtn.classList.toggle('active', audio.loop);
  });

  return card;
}

function iconRestart() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>';
}

function iconPlay() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
}
function iconPause() {
  return '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>';
}
function iconLoop() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
}

function iconShare() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/></svg>';
}
function iconCheck() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
}

/* Kopiuje do schowka pelny URL do konkretnego ptaka, z hashem w jezyku
   strony (np. #Fasan na DE, #ciguena-blanca na ES), NIE polskim slugiem.
   To jest INNY identyfikator niz bird.slug - ten drugi jest polski i wspolny
   dla wszystkich 4 jezykow, uzywany w kodach QR ksiazki (ksiazka nie jest
   jeszcze wydrukowana, stad ta zmiana jest bezpieczna - gdyby byla, trzeba
   bylo by przebudowac kody QR per jezyk zamiast samego linku do udostepniania).
   card.id w DOM jest budowany z localSlug (zobacz createBirdCard), wiec
   scrollToHighlightedBird() poprawnie znajdzie karte po tym hashu.
   location.origin + location.pathname biora aktualna strone jezykowa
   (ptaki/, en/birds/, de/voegel/, es/aves/), wiec link kopiowany z wersji
   EN wskazuje z powrotem na wersje EN.
   tooltip dostaje juz przetlumaczony tekst (UI_TEXT/t()) ustawiony w
   createBirdCard - funkcja tylko przelacza widocznosc, nie zna jezyka. */
function copyBirdLink(localSlug, btn, tooltip) {
  const url = `${location.origin}${location.pathname}#${localSlug}`;

  function showCopied() {
    const original = btn.innerHTML;
    btn.innerHTML = iconCheck();
    btn.classList.add('copied');
    tooltip.classList.add('visible');
    setTimeout(() => {
      btn.innerHTML = original;
      btn.classList.remove('copied');
      tooltip.classList.remove('visible');
    }, 1500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(showCopied).catch(() => fallbackCopy(url, showCopied));
  } else {
    fallbackCopy(url, showCopied);
  }
}

/* Fallback dla przegladarek bez navigator.clipboard (stary Safari, kontekst
   bez HTTPS) - tymczasowy textarea + execCommand('copy'), metoda przestarzala
   ale wciaz szeroko wspierana jako siatka bezpieczenstwa. */
function fallbackCopy(text, onSuccess) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    onSuccess();
  } catch (err) {
    console.error('Kopiowanie do schowka nie powiodlo sie:', err);
  }
  document.body.removeChild(textarea);
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('bird-grid');
  if (!grid || typeof BIRDS === 'undefined') return;
  BIRDS.forEach(bird => grid.appendChild(createBirdCard(bird)));

  scrollToHighlightedBird();
});

/* Obsluga linku z konkretnym ptakiem, np. .../ptaki/#bogatka (uzywane przez
   kody QR w ksiazce - kazdy ptak ma wlasny QR ze swoim slugiem w hashu).
   Scrolluje do karty i podswietla ja na chwile, zeby bylo jednoznaczne
   ktora karta z 69 to ta zeskanowana. */
function scrollToHighlightedBird() {
  const hashSlug = decodeURIComponent(location.hash.replace('#', '')).trim();
  if (!hashSlug) return;

  // case-insensitive: ktos moze wpisac hash z wielkiej litery (np. "#Fasan"
  // tak jak wyswietla sie nazwa na karcie), a id w DOM jest zawsze lowercase
  // (slugify() w inject_local_slug.py normalizuje do lowercase).
  const card = document.getElementById(`bird-${hashSlug}`)
    || document.getElementById(`bird-${hashSlug.toLowerCase()}`);
  if (!card) return;

  const allCards = Array.from(document.querySelectorAll('.bird-card'));
  const targetIndex = allCards.indexOf(card);
  // karty PRZED docelowa w dokumencie wplywaja na jej finalna pozycje pionowa -
  // ich obrazki (czesto lazy, poza viewportem) musza sie wczytac, inaczej
  // strona "urosnie" pod karta docelowa PO wykonaniu scrolla.
  const cardsAffectingPosition = allCards.slice(0, targetIndex + 1);
  const imgsToWaitFor = cardsAffectingPosition
    .map(c => c.querySelector('.bird-card-art img'))
    .filter(Boolean);

  // wymuszamy eager load na tych obrazkach, zamiast czekac az lazy loading
  // sam zdecyduje kiedy je wczytac (mogloby to nigdy nie nastapic przed scrollem)
  imgsToWaitFor.forEach(img => { img.loading = 'eager'; });

  const doScroll = () => {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('bird-card-highlighted');
    setTimeout(() => card.classList.remove('bird-card-highlighted'), 2600);
  };

  // Wolamy doScroll TYLKO RAZ, niezaleznie ktora sciezka pierwsza zadzwoni
  // (wszystkie obrazki sie wczytaly NORMALNIE, vs zabezpieczenie czasowe
  // gdyby cos nigdy nie dokonczylo ladowania). Bez tej ochrony dwa niezalezne
  // wywolania doScroll planowaly dwa niezalezne setTimeout(remove, 2600) -
  // pierwszy z nich usuwal klase highlighted PRZEDWCZESNIE, w okienku gdy
  // wizualnie powinna byc jeszcze widoczna (karta migala/gasla po ok. 1s
  // zamiast trwac pelne ~2.6s). Blad byl utajony dla kart gdzie wszystkie
  // obrazki-poprzedniki byly juz w cache (brak "pending", tylko jedna
  // sciezka wywolania) - czyli przy zmianie kolejnosci kart (np. sortowanie
  // alfabetyczne) inne karty zaczely trafiac w ten wyscig.
  let scrolled = false;
  const doScrollOnce = () => {
    if (scrolled) return;
    scrolled = true;
    doScroll();
  };

  const pending = imgsToWaitFor.filter(img => !img.complete);
  if (pending.length === 0) {
    doScrollOnce();
  } else {
    let remaining = pending.length;
    const onDone = () => {
      remaining -= 1;
      if (remaining <= 0) doScrollOnce();
    };
    pending.forEach(img => {
      img.addEventListener('load', onDone, { once: true });
      img.addEventListener('error', onDone, { once: true });
    });
    setTimeout(doScrollOnce, 2000); // zabezpieczenie gdyby cos nigdy nie dokonczylo ladowania
  }

  window.addEventListener('hashchange', scrollToHighlightedBird);
}

/* Lightbox - powiekszenie zdjecia ptaka po kliknieciu. Jeden globalny
   element w <body>, nie 78 osobnych (wydajnosc + prostota). Zamykanie:
   klik na tlo, klik na X, klawisz Escape. */

let lightboxEl = null;

function ensureLightbox() {
  if (lightboxEl) return lightboxEl;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';

  const img = document.createElement('img');
  img.className = 'lightbox-img';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Zamknij powiększenie');
  closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>';

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  closeBtn.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
  });

  lightboxEl = { overlay, img };
  return lightboxEl;
}

function openLightbox(src, alt) {
  const { overlay, img } = ensureLightbox();
  img.src = src;
  img.alt = alt;
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden'; // blokuje scroll strony pod lightboxem
}

function closeLightbox() {
  if (!lightboxEl) return;
  lightboxEl.overlay.classList.remove('visible');
  document.body.style.overflow = '';
}
