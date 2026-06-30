# Podsumowanie sesji — media.bartechbooks.com

Ten dokument to punkt startowy dla następnej rozmowy. Opisuje co zostało
zrobione, co działa, i co zostało do dokończenia.

## Co to za projekt

Strona `media.bartechbooks.com` — dziecko skanuje kod QR przy obrazku w
kolorowance, trafia na podstronę konkretnego ptaka i słyszy jego prawdziwy
odgłos. Docelowo (nie jeszcze) też zdjęcia innych obiektów, nie tylko ptaków.

## Stan na koniec tej sesji

**78 z 78 ptaków kompletne** — audio + grafika + (dla większości) atrybucja
licencji. Zero brakujących gatunków z oryginalnej listy 78.

**Cztery wersje językowe, w pełni działające:**
- PL (domyślna, bez prefiksu): `/index.html`, `/ptaki/index.html`
- EN: `/en/index.html`, `/en/birds/index.html`
- DE: `/de/index.html`, `/de/voegel/index.html`
- ES: `/es/index.html`, `/es/aves/index.html`

Każda wersja ma własną stronę główną i podstronę ptaków, własne teksty UI,
ale WSZYSTKIE współdzielą te same pliki audio/obrazków (nic nie zduplikowane).
Przełącznik języka (rozwijana lista, `<details>`/`<summary>`, zamyka się po
kliknięciu poza nią) w nagłówku każdej z 8 stron.

**Funkcje strony:**
- Karty ptaków: obrazek (klikalny → lightbox pełnoekranowy), nazwa polska +
  łacińska, odtwarzacz audio (play/pause/restart/loop, pasek przewijalny
  klik+drag na myszy i dotyku), ikona "i" z popupem atrybucji licencji
  (tam gdzie znana)
- Link z hashem (`.../ptaki/#bogatka`) scrolluje i podświetla konkretną
  kartę — to jest URL, na które wskazują kody QR w fizycznej książce
- QR kody dla wszystkich 78 ptaków w `qr_urls.xlsx` (tylko wersja PL na
  razie — wersje EN/DE/ES będą potrzebować WŁASNYCH kodów QR w swoich
  wydaniach językowych książki, gdy/jeśli powstaną)

## Architektura (ważne do zrozumienia przed zmianami)

```
/                          (korzeń = wersja PL)
├── index.html
├── ptaki/index.html
├── en/index.html + en/birds/index.html
├── de/index.html + de/voegel/index.html
├── es/index.html + es/aves/index.html
├── audio/ptaki/*.mp3       (78 plików, WSPÓLNE dla wszystkich jezykow)
├── images/ptaki/*.webp     (78 plików, WSPÓLNE dla wszystkich jezykow)
└── assets/
    ├── css/style.css       (jeden plik, wszystkie jezyki)
    ├── js/
    │   ├── player.js              (generyczny, dziala z kazdym rejestrem)
    │   ├── lang-switcher.js        (zamyka rozwijana liste jezyka)
    │   ├── birds-data.js           (rejestr PL)
    │   ├── birds-data-en.js        (rejestr EN)
    │   ├── birds-data-de.js        (rejestr DE)
    │   └── birds-data-es.js        (rejestr ES)
    └── images/ (logo, favicon, ikona kategorii)
```

**Dlaczego media są oddzielone od kodu (`audio/`, `images/` na korzeniu,
nie w `assets/`):** Cloudflare Pages przesyła CAŁY projekt przy każdym
deployu. Im więcej kategorii (Płazy, Maszyny w przyszłości), tym ważniejsze,
żeby drobna zmiana w kodzie nie wymuszała ponownego przesłania wszystkich
plików binarnych. To jest też dlaczego rejestry per-język są ODDZIELNYMI
plikami JS, nie jednym plikiem z polami per-język — prostsze do debugowania,
`player.js` nie potrzebuje wiedzieć o językach wcale.

**generate_birds_data.py** generuje TYLKO `assets/js/birds-data.js` (PL).
Rejestry EN/DE/ES zostały wygenerowane RĘCZNIE w tej sesji (skrypt
`/tmp/i18n/build_lang_pages.py` i powiązane skrypty Python w `/tmp/i18n/`,
NIE są częścią repo — jeśli trzeba dodać nowego ptaka, należy zaktualizować
PL przez `generate_birds_data.py`, a potem RĘCZNIE dopisać odpowiadające
wpisy do trzech plików `birds-data-{en,de,es}.js`, zachowując te same
ścieżki audio/images (tylko z prefiksem `../../` nie `../`, bo strony
językowe są jeden poziom głębiej) i przetłumaczoną nazwę).

## Ważna, nierozwiązana sprawa: wiarygodność tłumaczeń nazw gatunków

Tłumaczenia EN/DE/ES nazw 78 gatunków pochodzą z pliku dostarczonego przez
użytkownika (`Tlumaczenia_PL_EN_DE_ES.xlsx`). W tej sesji zweryfikowano
źródłowo (przez avibase.bsc-eoc.org, baza danych nazw ptaków w wielu
językach) TYLKO 10 z 78 gatunków:

Batalion, Bażant, Bernikla białolica, Bielik, Bocian biały, Bocian czarny,
Bogatka, Cyranka, Czapla biała, Czajka — wszystkie potwierdzone jako
poprawne (9 pełna zgodność, 1 drobny wariant stylistyczny niemiecki/
hiszpański dla Bażanta, zero błędów merytorycznych).

**Pozostałe 68 gatunków NIE zostały zweryfikowane źródłowo.** Plik wygląda
solidny na tej próbce, ale to nie jest dowód, że wszystkie 68 są poprawne.
Lista gatunków z nazwami łacińskimi do sprawdzenia: była w `/tmp/all_species.tsv`
w poprzedniej sesji (może nie istnieć już w tym kontenerze — trzeba
wygenerować na nowo z `assets/js/birds-data.js`, kolumny slug/namePl/nameLat).

Jeśli kontynuacja tej weryfikacji jest priorytetem: metoda sprawdzona i
działająca to `web_search` z zapytaniem typu `"<nazwa łacińska> avibase
German Spanish"`, czytanie wyniku Avibase, porównanie z plikiem. Wolne
(każdy gatunek to ~1 wyszukiwanie z długim wynikiem), ale rzetelne.

## Błąd znaleziony i naprawiony w tej sesji

Gęś tundrowa miała przypisaną BŁĘDNĄ nazwę łacińską w projekcie:
`Anser fabalis` (to jest "Gęś zbożowa") zamiast właściwej `Anser
serrirostris`. To był błąd Claude z wcześniejszej sesji (przypisany bez
źródła, gdy dany gatunek nie miał jeszcze wiersza w arkuszu kart). NAPRAWIONE
w `referencja_nagran.xlsx` i wszystkich czterech rejestrach językowych —
poprawna nazwa łacińska i tłumaczenia (EN: Tundra Bean Goose, DE:
Tundrasaatgans, ES: Ánsar campestre de la tundra) są już wszędzie.

## Inne otwarte sprawy (z wcześniejszych sesji, wciąż nieaktualne)

1. **Przewijanie paska postępu nie działa na desktopowym Chrome (myszą)**
   — działa poprawnie na mobile/dotyku. Nie udało się zreprodukować w
   testach automatycznych Playwright mimo wielu prób. Tymczasowe logi
   `[DEBUG]` w `player.js` (funkcje mousedown/mousemove/mouseup) zostały
   zostawione w kodzie na wypadek powrotu do diagnozy.
2. Header łamie się na dwie linie poniżej ~380px szerokości ekranu mobile
   (drobny, nie blokujący problem).
3. Brak podstron Płazy i Maszyny (czekają na materiał źródłowy — audio,
   grafiki, teksty).
4. 6 gatunków bez ikony "i" / atrybucji w UI (świadomie, autor nieznany):
   Batalion, Gągoł, Gęś tundrowa, Kraska, Myszołów włochaty, Perkoz
   dwuczuby. Wiersze w `referencja_nagran.xlsx` mają placeholder
   `'inne (do uzupelnienia)'` w kolumnie Źródło — dograć jeśli dane się
   znajdą.
5. Grafiki "Gąsiorek" i "Dzięcioł czarny" mają wbudowany w sam obrazek
   angielski podpis (artefakt generacji) — nieusunięty, niski priorytet.

## Pliki ważne do znania

- `referencja_nagran.xlsx` — metadane audio (autor, licencja, źródło) per
  gatunek, klucz: nazwa pliku audio
- `qr_urls.xlsx` — lista 78 URL (wersja PL) do generowania kodów QR
- `Tlumaczenia_PL_EN_DE_ES.xlsx` — oryginalny plik tłumaczeń od użytkownika
  (powinien być gdzieś w uploads tej rozmowy lub poprzedniej)
- `generate_birds_data.py` — generator rejestru PL, z walidacją kodeka
  audio (wykrywa pliki .mp3 będące w rzeczywistości PCM/WAV)
- `compress_images.py` — konwersja PNG→WebP, 600px szerokości

## Nauczki techniczne warte pamiętania

- **Zawsze testować audio lokalnie serwerem ze wsparciem HTTP Range**
  (`pip install RangeHTTPServer --break-system-packages && python3 -m
  RangeHTTPServer`), NIE zwykłym `python3 -m http.server` — ten nie
  wspiera Range requests, co psuje seek/przewijanie w testach mimo że
  Cloudflare Pages produkcyjnie wspiera je natywnie.
- Pliki audio z xeno-canto mogą mieć rozszerzenie `.mp3` mimo bycia
  surowym PCM/WAV w środku — zawsze sprawdzać realny kodek
  (`ffprobe -show_entries stream=codec_name`), nie ufać rozszerzeniu.
- Polskie znaki diakrytyczne w NAZWACH PLIKÓW (nie w treści) są źródłem
  powtarzających się błędów przy przetwarzaniu regexem / JSON — ostrożnie
  z `\uXXXX` escape sequences, łatwo o podwójne escapowanie.
- System plików nieczuły na wielkość liter (macOS, prawdopodobnie
  Cloudflare) może powodować, że dwa pliki różniące się tylko wielkością
  liter (`Rudzik.webp` / `rudzik.webp`) kolidują nieprzewidywalnie —
  zdarzyło się to kilka razy, warto sprawdzać `ls | tr A-Z a-z | sort |
  uniq -d` po każdej większej operacji na plikach.
