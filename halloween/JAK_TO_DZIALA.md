# /halloween/ na media.bartechbooks.com

Scena pierwsza z pięciu: cmentarz, osiem kryjówek.

## Pliki

- `halloween/index.html`, 25 kB, cała logika w środku, zero zależności
- `images/halloween/*.webp`, 17 plików, razem 430 kB

Strona nie wczytuje żadnego skryptu z zewnątrz i nie używa `style.css`
serwisu, bo scena jest ciemna, a reszta serwisu jasna. Nagłówek i stopka
są własne, ale prowadzą tam gdzie trzeba.

## Adresy dla kodów QR

`https://media.bartechbooks.com/halloween/#<kryjowka>`

Dostępne kryjówki: `brama`, `nagrobek`, `krzyz`, `krypta`, `drzewo`,
`glaz`, `latarnia`, `dynia`.

Wejście z hashem podświetla tę jedną kryjówkę jako cel i pisze o niej
w podpisie. Bez hasha strona zachowuje się normalnie.

## Prywatność

Postęp siedzi w `localStorage`, klucz `bartech-halloween-cmentarz-v2`.
Zero kont, zero ciasteczek, zero wysyłania czegokolwiek na serwer.
Dźwięk jest syntezowany w przeglądarce, nie ma plików audio.

## Jak dołożyć kolejne sceny

Układ kryjówek siedzi w `buduj_strone.py`, w tablicy `KRYJOWKI`.
Generator ma dwa tryby: `TRYB=serwer` robi zwykłe ścieżki do plików,
domyślny wpisuje grafikę w plik jako data URI (do podglądu na claude.ai).

## Czego tu jeszcze nie ma

Kafla na stronie głównej. Świadomie: książki jeszcze nie ma, więc
sekcja nie powinna się reklamować. Wchodzi się na nią adresem wprost.
