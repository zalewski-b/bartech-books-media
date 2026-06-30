# media.bartechbooks.com — Bartech Books Dotknij Świata

Domena Bartech Books hostująca interaktywne media (audio, a w przyszłości też
zdjęcia/grafiki różnych obiektów) dla serii kolorowanek i książek aktywności.
Dziecko skanuje kod QR przy obrazku w książce, trafia na podstronę konkretnego
obiektu i odtwarza prawdziwy odgłos (a docelowo: ogląda powiązane media).
Strona nigdy nie przekierowuje na xeno-canto.org ani inne źródło zewnętrzne,
odtwarzacz gra plik hostowany lokalnie na tej domenie.

WAŻNE — historia nazwy: ten projekt poprzednio żył pod `audio.bartechbooks.com`
i nazywał się "Bartech Books Audio". Domena i nazwa zmieniły się, gdy zakres
poszerzył się poza samo audio (mają tu być też obrazki różnych obiektów, nie
tylko ptaków). Struktura folderów mediów (`audio/`, `images/` na poziomie
korzenia, NIE w `assets/`) odzwierciedla to: to są treści merytoryczne, mogące
rosnąć niezależnie od kodu stron, oddzielone od `assets/` (które zawiera tylko
zasoby UI strony — fonty, CSS, JS, logo).

Statyczny HTML/CSS/JS, zero build stepu, ten sam wzorzec co bartech-books.com.
Design tokens (kolory, fonty Caveat/Nunito, promienie, cienie) skopiowane 1:1
z głównej strony — jeśli main site zmieni paletę w `:root`, przekopiować ten
sam blok do `assets/css/style.css` tutaj.

## Struktura folderów (po migracji na media.bartechbooks.com)

```
/                          (korzeń projektu)
├── index.html             (strona główna — wybór kategorii)
├── ptaki/
│   └── index.html         (podstrona Ptaki — kod, logika, BEZ mediów)
├── audio/
│   └── ptaki/*.mp3        (pliki audio, typ na wierzchu, temat w środku)
├── images/
│   └── ptaki/*.webp       (grafiki, ta sama konwencja)
└── assets/                (TYLKO zasoby UI strony, nie treści merytoryczne)
    ├── css/style.css
    ├── fonts/
    ├── js/ (player.js, birds-data.js)
    └── images/ (logo, favicon, ikona kategorii Ptaki)
```

Przyszłe kategorie (Płazy, Maszyny) mają iść analogicznie:
`audio/plazy/`, `images/plazy/`, `plazy/index.html`, itd. — typ mediów
zawsze na wierzchu, temat w środku, kod stron oddzielnie od mediów. To
trzyma deploy szybkim (Cloudflare Pages przesyła całość przy każdym
wdrożeniu — im więcej kategorii, tym ważniejsze, żeby drobne zmiany w
kodzie nie wymuszały ponownego przesłania wszystkich mediów niepotrzebnie,
choć fizycznie cały projekt i tak jedzie razem w jednym Pages deployu).

## Wielojęzyczność (PL/EN/DE/ES)

Cztery wersje językowe, każda z OSOBNYM podkatalogiem i własnymi stronami
HTML, zgodnie z tym samym wzorcem co bartech-books.com:

```
/                  (PL - domyślny, bez prefiksu)
├── index.html
├── ptaki/index.html
├── en/
│   ├── index.html
│   └── birds/index.html
├── de/
│   ├── index.html
│   └── voegel/index.html
└── es/
    ├── index.html
    └── aves/index.html
```

Nazwa podstrony jest PRZETŁUMACZONA per język (ptaki/birds/voegel/aves), nie
tylko treść — to jest świadoma decyzja, bo każdy język ma OSOBNE wydanie
książki z OSOBNYMI, osobno wydrukowanymi kodami QR wskazującymi na właściwy
podkatalog językowy. Nie ma współdzielonego URL z przełącznikiem JS na tej
samej stronie (inaczej niż mogłoby się wydawać z głównej strony) — to był
świadomy wybór przy projektowaniu tej części.

Media (audio/ptaki/, images/ptaki/) są WSPÓLNE dla wszystkich języków —
nie duplikowane. Tylko nazwy gatunków w UI się różnią, plik audio i grafika
to ten sam plik fizyczny niezależnie od języka strony.

Rejestry danych: `assets/js/birds-data.js` (PL), `birds-data-en.js`,
`birds-data-de.js`, `birds-data-es.js` — wszystkie generowane z tych samych
78 wpisów, połączone z tłumaczeniami przez nazwę łacińską (klucz niezależny
od języka). `player.js` jest WSPÓLNY, generyczny — nie ma wbudowanych
polskich tekstów, więc automatycznie działa z każdym z czterech rejestrów
bez zmian w kodzie.

Przełącznik języka (PL/EN/DE/ES) w nagłówku każdej strony — linki statyczne,
wygenerowane przy budowaniu stron, nie dynamiczny JS. Każda strona "wie",
czym jest (home czy birds) i w jakim jest języku, bo to ja generuję przy
tworzeniu plików, więc nie ma potrzeby wykrywania typu strony w runtime.

Wiarygodność tłumaczeń nazw gatunków: zweryfikowane przez Avibase
(avibase.bsc-eoc.org, baza danych nazw ptaków w wielu językach) na próbce
10 z 78 gatunków w trakcie budowy — wszystkie potwierdzone jako poprawne
(9 pełna zgodność, 1 drobny wariant stylistyczny niemiecki/hiszpański,
żaden błąd merytoryczny). Pozostałe 68 NIE zostały jeszcze zweryfikowane
źródłowo, pochodzą z dostarczonego pliku tłumaczeń `Tlumaczenia_PL_EN_DE_ES.xlsx`
— jeśli ktoś znajdzie nazwę gatunkową, która brzmi nietypowo w EN/DE/ES,
warto sprawdzić ją na avibase.bsc-eoc.org po nazwie łacińskiej przed
zaufaniem jej w 100%.

## Stan na dziś

- [x] Strona główna z wyborem kategorii: Ptaki / Płazy / Maszyny
- [x] Płazy i Maszyny: karty wyłączone z badge "wkrótce", czekają na własne dane
- [x] Podstrona `/ptaki/`: grid kart, wariant proporcji B (3/4 obrazek + 1/4 odtwarzacz)
- [x] Odtwarzacz: play/pause, restart, loop (pod paskiem, większe przyciski na
      mobile), progress bar przewijalny (klik + drag, mysz i dotyk), tylko
      jedno audio gra naraz
- [x] Lightbox: kliknięcie obrazka ptaka otwiera go w powiększeniu na całym
      ekranie (klik na tło / przycisk X / Escape zamyka), niezależne od
      ikony "i" atrybucji
- [x] Atrybucja licencji widoczna w UI: ikona "i" w rogu obrazka, popup z autorem,
      źródłem i linkiem do licencji CC (wymóg by/by-sa, nie kosmetyka) —
      NIE renderuje się dla gatunków bez znanego autora (świadomie, nie błąd)
- [x] Nazwa łacińska gatunku wyświetlana kursywą pod polską nazwą na każdej karcie
- [x] Grafiki skompresowane do WebP (~97% redukcji), przeskalowane do 600px
      szerokości — oryginalne pliki źródłowe zachowane w `source_assets/`
      na wypadek potrzeby wyższej rozdzielczości do innego celu (np. wydruk)
- [x] `assets/js/birds-data.js` generowany AUTOMATYCZNIE skryptem
      `generate_birds_data.py` na podstawie plików w `audio/ptaki/` +
      `images/ptaki/` + metadanych z `referencja_nagran.xlsx`. Generator
      normalizuje nazwy plików (wielkość liter, podkreślniki/myślniki, polskie
      znaki) niezależnie po stronie audio i grafik przed dopasowaniem, i
      waliduje realny kodek audio (wykrywa pliki .mp3 będące w rzeczywistości
      surowym PCM/WAV — taki plik gra, ale nie pozwala na przewijanie).
- [x] Obecnie wgrane: **78 z 78 gatunków** z arkusza kart informacyjnych — pełna
      lista skompletowana. 73 z atrybucją (xeno-canto/Wikimedia), 6 bez ikony
      "i" (Batalion + Gągoł, Gęś tundrowa, Kraska, Myszołów włochaty, Perkoz
      dwuczuby — audio dostarczone bezpośrednio przez Bartosza z nieznanego
      źródła, świadomie bez atrybucji w UI)
- [ ] Brak i18n (na razie tylko PL, zgodnie z decyzją — i18n dodać później jeśli potrzebne)
- [ ] Header łamie się na dwie linie poniżej ~380px szerokości ekranu (drobny, nie
      blokujący problem mobile)
- [ ] Pliki audio na razie NIEPRZYCIĘTE (pełna długość oryginału) — przycinanie
      do krótkiego klipu Bartosz robi ręcznie po odsłuchaniu, automatyczna
      heurystyka testowana wcześniej okazała się niewystarczająco dokładna
      dla części nagrań terenowych
- [ ] 6 gatunków (Batalion, Gągoł, Gęś tundrowa, Kraska, Myszołów włochaty,
      Perkoz dwuczuby): dograć atrybucję (autor, licencja, źródło) w
      `referencja_nagran.xlsx` JEŚLI dane się znajdą — obecnie wiersze mają
      placeholder `'inne (do uzupelnienia)'` w kolumnie Źródło, karty działają
      w pełni (audio+grafika+nazwa łacińska) ale bez ikony "i" / popupu
      atrybucji, świadomie, na żądanie Bartosza
- [ ] Grafika "Gąsiorek" i "Dzięcioł czarny" maja wbudowany w samym obrazku angielski podpis
      (artefakt z generacji, nie problem kodu strony) — do oceny czy wymaga
      innej wersji grafiki

## Jak dodać/zaktualizować ptaki (workflow)

1. Wgraj plik(i) audio (mp3) do `audio/ptaki/`, nazwa = slug gatunku,
   np. `kos.mp3`, `sojka.mp3` (myślniki, bez polskich znaków, bez wielkich liter).
2. Wgraj grafikę (png/webp) do `images/ptaki/`, nazwa może mieć inną konwencję
   (wielkie litery, podkreślniki) — skrypt sam normalizuje i dopasowuje do audio
   po znormalizowanej nazwie.

   **WAŻNE — proporcje grafiki:** `.bird-card-art` w `style.css` ma na sztywno
   ustawione `aspect-ratio: 896 / 1200` (≈0.747), dopasowane do wymiarów
   wszystkich 5 obecnych grafik testowych. Jeśli kolejne dostawy grafik będą
   w INNEJ proporcji, te konkretne karty będą znowu ucinane przez
   `object-fit: cover` — sprawdzić wymiary nowych plików
   (`python3 -c "from PIL import Image; print(Image.open('plik.png').size)"`)
   i albo dopasować do 896×1200 przy eksporcie, albo zmienić wartość
   `aspect-ratio` w CSS jeśli WSZYSTKIE grafiki zmienią proporcję.
3. Upewnij się, że gatunek ma wiersz w `referencja_nagran.xlsx` (kolumna "Plik"
   musi zgadzać się ze slugiem audio) — stąd biorą się polska/łacińska nazwa,
   autor i licencja.
4. Uruchom: `python3 generate_birds_data.py`
5. Skrypt wypisze, czy czegoś brakuje (audio bez grafiki, grafika bez audio,
   brak wiersza w arkuszu) — gatunek z brakującym elementem NIE trafia do
   rejestru, żeby niedokończona karta nie wylądowała na stronie.
6. Jeśli dodajesz NOWE grafiki (świeże PNG, nie WebP): uruchom
   `python3 compress_images.py` ZANIM odpalisz `generate_birds_data.py` —
   konwertuje do WebP, przeskalowuje do 600px, oryginały trafiają do
   `images/ptaki/originals/`. Generator szuka `.webp` (i `.png`/`.jpg` jako
   fallback), więc kolejność nie jest krytyczna, ale nieskompresowane PNG
   na stronie to ~2MB/obrazek, nie chcesz tego w produkcji.
7. Sprawdź wizualnie lokalnie (uruchom serwer z WSPARCIEM HTTP RANGE, nie
   zwykły `python3 -m http.server` — ten nie wspiera Range requests, co
   psuje seek/przewijanie audio w testach lokalnych mimo że produkcyjny
   Cloudflare wspiera je natywnie. Użyj: `pip install RangeHTTPServer
   --break-system-packages && python3 -m RangeHTTPServer`) przed deployem.

UWAGA: `assets/js/birds-data.js` jest generowany automatycznie — nie edytuj go
ręcznie, zmiany przepadną przy następnym uruchomieniu skryptu.

## Jak działają kody QR (mechanizm hash-link)

Każdy ptak ma jeden, stały adres: `https://media.bartechbooks.com/ptaki/#<slug>`
(np. `.../ptaki/#bogatka`). To NIE jest osobna podstrona — to ta sama strona
`/ptaki/` z fragmentem (`#...`) w adresie. Po wczytaniu strony, JS
(`scrollToHighlightedBird()` w `player.js`) odczytuje fragment, znajduje kartę
o `id="bird-<slug>"` i scrolluje do niej automatycznie, z chwilowym pulsującym
podświetleniem, żeby było jednoznaczne, który ptak z 69 na ekranie to ten
zeskanowany. Generowanie QR: każdy kod wskazuje na ten URL ze swoim slugiem,
plik `qr_urls.xlsx` ma gotową listę wszystkich 69 adresów do wygenerowania
kodów (np. przez goqr.me, qr-code-generator.com, albo bulk przez API).

Audio NIE startuje automatycznie po zeskanowaniu — to ograniczenie wszystkich
przeglądarek (autoplay z dźwiękiem wymaga wcześniejszej interakcji
użytkownika ze stroną, sam fakt otwarcia linku przez QR się nie liczy).
Decyzja: zaakceptowane, użytkownik klika play sam, jeden dotyk.

Techniczny detal warty znania: karty używają `loading="lazy"` na obrazkach
(poprawa wydajności — nie wczytujemy 69 dużych obrazków na raz). To koliduje
z potrzebą scrollowania do karty, która jeszcze nie jest w viewporcie — kod
w `scrollToHighlightedBird()` wymusza `loading="eager"` na obrazkach WSZYSTKICH
kart przed kartą docelową (bo to one wpływają na jej finalną pozycję pionową
w layoucie) przed wykonaniem scrolla. Bez tego layout "rośnie" pod kartą
docelową po wykonaniu scrolla i użytkownik ląduje w niewłaściwym miejscu.

## Pochodzenie nagrań i status prawny

Lista 78 gatunków z arkusza kart informacyjnych — KOMPLETNA, zero braków.
Wszystkie nagrania z xeno-canto/Wikimedia (73) mają licencję Creative Commons
bez klauzuli NC (CC0 / CC BY / CC BY-SA), zweryfikowane programowo przez API
xeno-canto przed pobraniem. Źródła: 67 z xeno-canto.org, 5 z Wikimedia Commons,
1 (Batalion) z innego źródła. Pozostałe 5 (Gągoł, Gęś tundrowa, Kraska,
Myszołów włochaty, Perkoz dwuczuby) — xeno-canto nie miał dla nich żadnego
nagrania z dozwoloną licencją (sprawdzone w pełni), jedyne dostępne nagrania
były na YouTube (ich ToS zakazuje pobierania poza wbudowaną funkcją
"Download"); Bartosz dostarczył pliki audio z innego, nieznanego źródła —
karty działają w pełni, ale bez atrybucji w UI (świadoma decyzja, nie błąd).

Uwaga merytoryczna do zapamiętania: plik audio podpisany jako "Bielik" pochodzi
z nagrania opisanego na Wikimedia Commons jako orlik białobrzuchy (Haliaeetus
leucogaster, gatunek azjatycko-australijski, nie Haliaeetus albicilla). Użycie
tego pliku pod tą etykietą było świadomą decyzją Bartosza, nie pomyłką.

Skrypt `download_birds.py` (osobny plik, nie w tym zipie) pobiera wszystkie
72 dostępne nagrania na dysk pod polskimi nazwami gatunków. Plik
`referencja_nagran.xlsx` (osobny plik) ma metadane każdego: długość oryginału,
jakość, typ dźwięku, autora, link źródłowy, licencję.

## Deployment (Cloudflare Pages)

### Wariant A: ręcznie przez dashboard (jednorazowy pierwszy deploy)

Subdomena `bartechbooks.com`, osobny projekt Cloudflare Pages od głównej
strony (`bartech-books.com`). Jeśli wcześniej ten projekt był wdrożony pod
`audio.bartechbooks.com`: w tym samym projekcie Cloudflare Pages usuń starą
custom domain i dodaj nową (`media.bartechbooks.com`) — nie trzeba tworzyć
nowego projektu, to ten sam kod, tylko z innym adresem.

1. Cloudflare Pages → Create a project → Direct upload (albo połącz z repo, jeśli
   wolisz git-based deploy jak przy głównej stronie).
2. Wgraj całą zawartość tego zipa jako root projektu (czyli `index.html` ma być
   na najwyższym poziomie, nie w podfolderze).
3. Po deployu: Custom domains → dodaj `media.bartechbooks.com`, Cloudflare
   sam zaproponuje rekord CNAME jeśli domena `bartechbooks.com` jest już
   w tym samym koncie Cloudflare.
4. Brak build commandu, brak zmiennych środowiskowych — czysty static hosting.

### Wariant B: automatyczny deploy przez Wrangler (zalecany od drugiego deploya)

Setup jednorazowy:

```bash
npm install -g wrangler
wrangler login
wrangler pages project create bartech-audio --production-branch=main
```

Potem w dashboardzie: Workers & Pages → bartech-audio → Custom domains →
dodaj `media.bartechbooks.com` (to jest jednorazowe, wygodniej zrobić klikiem).

Każdy kolejny deploy (po dograniu nowych ptaków, audio, obrazków):

```bash
./deploy.sh /sciezka/do/folderu/audio-bartech
```

Skrypt `deploy.sh` jest w tym zipie, gotowy do użycia, wymaga tylko że Wrangler
jest zalogowany (`wrangler login` raz na maszynę). Pełna lista komend Wranglera
dla Pages: https://developers.cloudflare.com/workers/wrangler/commands/pages/


## Do zrobienia w kolejnych krokach

1. Bartosz: odsłuchać i przyciąć ręcznie pliki audio (wszystkie 78 wgranych
   gatunków mają pełną, nieprzyciętą długość oryginału).
2. Poprawić header na wąskim mobile (poniżej ~380px).
3. Dodać podstrony Płazy i Maszyny, kiedy będzie gotowy materiał źródłowy.
4. 6 gatunków bez atrybucji (Batalion, Gągoł, Gęś tundrowa, Kraska, Myszołów
   włochaty, Perkoz dwuczuby): dograć autora/licencję/źródło w
   `referencja_nagran.xlsx` JEŚLI dane się znajdą — obecnie wiersze mają
   placeholder `'inne (do uzupelnienia)'` w kolumnie Źródło, karty działają
   w pełni ale bez ikony "i" / popupu atrybucji, świadomie.
6. Zbadać i rozwiązać problem z przewijaniem paska postępu na desktopowym
   Chrome (myszą) — nie udało się zreprodukować w testach automatycznych,
   działa poprawnie na mobile/dotyku. Tymczasowe logi `[DEBUG]` w `player.js`
   (w funkcjach mousedown/mousemove/mouseup) zostały zostawione w kodzie na
   wypadek powrotu do diagnozy — bezpieczne do usunięcia, jeśli problem uznany
   za nieistotny.
