/* Zamyka rozwijana liste jezyka (<details class="lang-switcher">) po
   kliknieciu gdziekolwiek poza nia - natywny <details> nie robi tego
   sam z siebie, co zostawia liste otwarta i zaslaniajaca tresc strony. */
document.addEventListener('click', (e) => {
  document.querySelectorAll('.lang-switcher[open]').forEach((el) => {
    if (!el.contains(e.target)) el.removeAttribute('open');
  });
});
