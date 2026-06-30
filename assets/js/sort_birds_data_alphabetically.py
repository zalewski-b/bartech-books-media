"""
Sortuje alfabetycznie wpisy w birds-data-{en,de,es}.js wedlug localSlug
(czyli wedlug zlatynizowanej nazwy WYSWIETLANEJ w danym jezyku - sprawdzone
juz wczesniej w tej sesji przy generowaniu qr_urls_{en,de,es}.xlsx, ze to
jest rownowazne prawidlowemu porzadkowi alfabetycznemu jezykowemu, np.
niemieckie Bluthänfling -> localSlug "bluthaenfling" siada w sekcji B,
nie po Z).

NIE dotyka birds-data.js (PL) - ten plik jest juz poprawnie sortowany
alfabetycznie po polsku (przez generate_birds_data.py, ktory iteruje
"sorted(both)" po slug, a polskie slugi sa juz w prawidlowym polskim
porzadku alfabetycznym zaczynajac sie od tej samej litery co nazwa).

Metoda: caly plik to jeden blok `const BIRDS = [ ... ];`. Kazdy element
listy to blok `  {\n ... \n  },\n`. Parsujemy liste blokow (string, nie
JS AST - prostsze i wystarczajace dla tej plaskiej, regularnej struktury),
sortujemy bloki wedlug localSlug znalezionego w kazdym, skladamy z
powrotem z identycznym naglowkiem/zakonczeniem pliku.

Uzycie: python3 sort_birds_data_alphabetically.py
Dziala na plikach w biezacym katalogu (assets/js/).
"""
import re

FILES = ["birds-data-en.js", "birds-data-de.js", "birds-data-es.js"]


def sort_file(path):
    content = open(path, encoding="utf-8").read()

    # Naglowek (np. "const BIRDS = [\n") i zakonczenie (np. "];\n") -
    # wszystko PRZED pierwszym "  {" i PO ostatnim "  },".
    match = re.match(r"^(.*?\[\s*\n)(.*)(\n\];\s*\n?)$", content, re.DOTALL)
    if not match:
        raise ValueError(f"{path}: nie udalo sie rozpoznac struktury naglowek/[...]/zakonczenie")
    header, body, footer = match.groups()

    # Kazdy blok zaczyna sie od "  {" i konczy na "  },\n" (z mozliwym
    # dodatkowym wcieciem - obserwowany format ma rowno 2 spacje wciecia
    # dla "{" i "}," na poziomie elementu listy).
    blocks = re.findall(r"  \{.*?\n  \},", body, re.DOTALL)

    if not blocks:
        raise ValueError(f"{path}: nie znaleziono zadnych blokow obiektow")

    # sprawdzenie integralnosci: polaczenie znalezionych blokow z separatorem
    # "\n" musi dac dokladnie body (modulo biale znaki na samych krancach
    # body, NIE wewnatrz - .strip() na calym body bylby zbyt agresywny i
    # ucinalby wciecie "  " pierwszego bloku, dajac falszywy alarm) - inaczej
    # regex blokow nie objal calej zawartosci (np. przez nietypowe wciecie).
    reconstructed = "\n".join(blocks)
    body_trimmed = body.strip("\n")  # tylko skrajne nowe linie, nie spacje wciecia
    if reconstructed != body_trimmed:
        raise ValueError(
            f"{path}: rekonstrukcja blokow nie zgadza sie z oryginalna zawartoscia - "
            f"nie nadpisuje pliku, sprawdz format recznie."
        )

    def local_slug_of(block):
        m = re.search(r'localSlug:\s*"([^"]+)"', block)
        if not m:
            raise ValueError(f"{path}: blok bez pola localSlug:\n{block[:120]}")
        return m.group(1)

    blocks_sorted = sorted(blocks, key=local_slug_of)

    new_body = "\n".join(blocks_sorted)
    new_content = header + new_body + footer

    open(path, "w", encoding="utf-8").write(new_content)
    return len(blocks)


if __name__ == "__main__":
    for fname in FILES:
        n = sort_file(fname)
        print(f"{fname}: {n} blokow przesortowanych alfabetycznie wg localSlug")
