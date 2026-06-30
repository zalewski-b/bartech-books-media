/**
 * Formularz zapisu na newsletter dla media.bartechbooks.com.
 *
 * To jest port renderNewsletterSignup()/initNewsletterForm() z
 * bartechbooks-deploy/assets/js/books.js - ten sam Brevo form action,
 * ten sam Turnstile sitekey, ta sama lista pol (honeypot, hidden locale),
 * ten sam mechanizm AJAX (fetch + mode:'no-cors', patrz komentarz w
 * handlerze submit nizej dla wyjasnienia tego ograniczenia).
 *
 * Roznice wzgledem main site, swiadome, nie przeoczenie:
 * 1. Media site nie ma i18n.js/routes.js (jezyk jest "zaszyty" w
 *    osobnych plikach HTML per katalog, nie w jednym JS rejestrze),
 *    wiec tlumaczenia newsletter_* sa tu zaszyte lokalnie (skopiowane
 *    1:1 z wartosci PL/EN/DE/ES w bartechbooks-deploy/assets/js/i18n.js)
 *    a biezacy jezyk czytany jest z <html lang="...">.
 * 2. Media site nie ma wlasnej strony polityki prywatnosci - link
 *    "fineprint" prowadzi na strone polityki prywatnosci main site
 *    (bartechbooks.com), w odpowiedniej wersji jezykowej.
 * 3. Main site po sukcesie przekierowuje na newsletter-potwierdzony.html
 *    (strona, ktorej media site nie ma). Tutaj zostaje tylko inline
 *    komunikat sukcesu (.newsletter-success.is-visible), bez przekierowania.
 *
 * NIEZWERYFIKOWANE PRZEZE MNIE (do sprawdzenia przez Bartosza):
 * Turnstile sitekey ponizej jest skonfigurowany w panelu Cloudflare z
 * lista dozwolonych domen. Jesli media.bartechbooks.com nie jest na tej
 * liscie (lub nie jest pokryty wildcardem *.bartechbooks.com), widget
 * moze sie nie zwalidowac. To trzeba sprawdzic w Cloudflare Turnstile
 * dashboard, ja nie mam do niego wgladu.
 */

const BREVO_FORM_ACTION = 'https://644ce846.sibforms.com/serve/MUIFAIdHqj-g-toKBaL8IyaWJ02bwQxywOjoccxdIgonZQ7m9shVHV6S6lqXPum0gvgSnsu46QpjHe3KWVSaca5_Q7ttiY6XOegCNP3hxGkVK6IYVrKpjn3FNRiuW7CDTsnNtGT74mn0ki_LTiMBdvkNdfJjqcLqJAkgvBlRvAYoSHnAqKsXz3d2YCEB2chJcyDCC7sciKSIJ7YFMw==';
const TURNSTILE_SITE_KEY = '0x4AAAAAADqMCb18XvHIdBEh';

/** Skopiowane 1:1 z assets/js/i18n.js (bartechbooks-deploy), tylko klucze newsletter_*. */
const NEWSLETTER_STRINGS = {
  pl: {
    title: 'Więcej stron do kolorowania, prosto na maila',
    desc: 'Zapisz się, a od czasu do czasu wyślemy bezpłatne strony do wydruku oraz informację, gdy wyjdzie nowa książka. Bez spamu, można się wypisać w jednej chwili.',
    placeholder: 'Twój adres email',
    btn: 'Zapisz mnie!',
    fineprintPre: 'Zapisując się, zgadzasz się na przetwarzanie Twojego adresu email zgodnie z',
    fineprintLink: 'polityką prywatności',
    fineprintPost: 'Możesz wypisać się w każdej chwili.',
    success: 'Dziękujemy! Twój adres został dodany!',
    error: 'Coś poszło nie tak. Spróbuj ponownie za chwilę.',
    privacyHref: 'https://bartechbooks.com/polityka-prywatnosci.html',
  },
  en: {
    title: 'More coloring pages, straight to your inbox',
    desc: 'Sign up and we will occasionally send free printable pages and a note whenever a new book comes out. No spam, unsubscribe anytime.',
    placeholder: 'Your email address',
    btn: 'Sign me up',
    fineprintPre: 'By signing up, you agree to the processing of your email address in accordance with our',
    fineprintLink: 'privacy policy',
    fineprintPost: 'You can unsubscribe at any time.',
    success: 'Thank you! Your email has been added!',
    error: 'Something went wrong. Please try again in a moment.',
    privacyHref: 'https://bartechbooks.com/en/privacy-policy.html',
  },
  de: {
    title: 'Mehr Ausmalseiten direkt in deine Mailbox',
    desc: 'Melde dich an und wir schicken dir ab und zu kostenlose Druckseiten und eine Nachricht, wenn ein neues Buch erscheint. Kein Spam, jederzeit abmeldbar.',
    placeholder: 'Deine E-Mail-Adresse',
    btn: 'Anmelden',
    fineprintPre: 'Mit der Anmeldung stimmst du der Verarbeitung deiner E-Mail-Adresse gemäß unserer',
    fineprintLink: 'Datenschutzerklärung',
    fineprintPost: 'zu. Du kannst dich jederzeit abmelden.',
    success: 'Danke! Deine E-Mail-Adresse wurde hinzugefügt!',
    error: 'Etwas ist schiefgelaufen. Bitte versuche es gleich noch einmal.',
    privacyHref: 'https://bartechbooks.com/de/datenschutz.html',
  },
  es: {
    title: 'Más páginas para colorear, directamente en tu correo',
    desc: 'Suscríbete y de vez en cuando te enviaremos páginas gratuitas para imprimir y un aviso cuando salga un nuevo libro. Sin spam, puedes darte de baja en cualquier momento.',
    placeholder: 'Tu dirección de email',
    btn: 'Suscribirme',
    fineprintPre: 'Al suscribirte, aceptas el tratamiento de tu dirección de email conforme a nuestra',
    fineprintLink: 'política de privacidad',
    fineprintPost: 'Puedes darte de baja en cualquier momento.',
    success: '¡Gracias! ¡Tu dirección de email ha sido añadida!',
    error: 'Algo salió mal. Inténtalo de nuevo en un momento.',
    privacyHref: 'https://bartechbooks.com/es/politica-de-privacidad.html',
  },
};

function currentNewsletterLang() {
  const lang = (document.documentElement.lang || 'pl').toLowerCase();
  return NEWSLETTER_STRINGS[lang] ? lang : 'pl';
}

function renderNewsletterSignup(container) {
  if (!container) return;
  const lang = currentNewsletterLang();
  const s = NEWSLETTER_STRINGS[lang];
  container.innerHTML = `
    <div class="newsletter-panel">
      <h3 class="newsletter-title">${s.title}</h3>
      <p class="newsletter-desc">${s.desc}</p>
      <div class="newsletter-success" id="newsletter-success">${s.success}</div>
      <form class="newsletter-form" id="newsletter-form" data-type="subscription">
        <div class="newsletter-form-row">
          <input type="email" name="EMAIL" id="newsletter-email" class="newsletter-input" placeholder="${s.placeholder}" required>
          <input type="text" name="email_address_check" value="" class="newsletter-honeypot" tabindex="-1" autocomplete="off">
          <input type="hidden" name="locale" value="${lang}">
          <button type="submit" class="newsletter-btn" disabled>${s.btn}</button>
        </div>
        <!-- KRYTYCZNE: kontener Turnstile MUSI byc wewnatrz <form> - patrz
             ten sam komentarz w books.js (renderNewsletterSignup) na main site. -->
        <div class="newsletter-turnstile" id="newsletter-turnstile"></div>
      </form>
      <p class="newsletter-fineprint">
        ${s.fineprintPre}
        <a href="${s.privacyHref}" target="_blank" rel="noopener">${s.fineprintLink}</a>.
        ${s.fineprintPost}
      </p>
    </div>
  `;
  initNewsletterForm(container, lang, s);
}

function initNewsletterForm(container, lang, s) {
  const form = container.querySelector('#newsletter-form');
  const successBox = container.querySelector('#newsletter-success');
  const turnstileEl = container.querySelector('#newsletter-turnstile');
  if (!form || form.dataset.newsletterBound) return;
  form.dataset.newsletterBound = 'true';

  form.action = BREVO_FORM_ACTION;
  form.method = 'POST';

  const submitBtn = form.querySelector('button[type="submit"]');
  let widgetId = null;

  function renderTurnstileWidget() {
    if (!window.turnstile || !turnstileEl) return;
    widgetId = window.turnstile.render(turnstileEl, {
      sitekey: TURNSTILE_SITE_KEY,
      language: lang,
      callback: () => { submitBtn.disabled = false; },
      'expired-callback': () => { submitBtn.disabled = true; },
      'error-callback': () => { submitBtn.disabled = true; },
    });
  }

  if (window.turnstile) {
    renderTurnstileWidget();
  } else {
    let attempts = 0;
    const poll = setInterval(() => {
      attempts++;
      if (window.turnstile) {
        clearInterval(poll);
        renderTurnstileWidget();
      } else if (attempts > 100) {
        clearInterval(poll);
        console.warn('Newsletter: Turnstile script nie wczytal sie w 10s - captcha niedostepna, formularz zostaje zablokowany.');
      }
    }, 100);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    try {
      await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        mode: 'no-cors',
      });
      // Patrz wyjasnienie mode:'no-cors' w books.js (main site) - Brevo nie
      // wysyla naglowkow CORS dla tego endpointu, wiec nie da sie odczytac
      // statusu odpowiedzi. Komunikat sukcesu pojawia sie, gdy zadanie
      // FIZYCZNIE dotrze do serwera. Jedyna wiarygodna weryfikacja to panel
      // Brevo (Contacts) - po wdrozeniu zapisz testowo swoj email i sprawdz.
      successBox.classList.add('is-visible');
      form.reset();
    } catch (err) {
      alert(s.error);
    } finally {
      submitBtn.style.opacity = '1';
      if (widgetId !== null && window.turnstile) {
        submitBtn.disabled = true;
        window.turnstile.reset(widgetId);
      } else {
        submitBtn.disabled = false;
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderNewsletterSignup(document.getElementById('newsletter-signup'));
});
