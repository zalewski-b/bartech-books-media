"""
Wstrzykuje pole `localSlug` do kazdego obiektu w rejestrach birds-data*.js.

localSlug = URL-safe wersja przetlumaczonej nazwy gatunku w danym jezyku
(pole `namePl`, ktore w plikach EN/DE/ES zawiera tlumaczenie, nie polska
nazwe - to jest istniejaca konwencja projektu). Dla PL localSlug == slug,
bo PL slug juz jest poprawna forma URL-safe polskiej nazwy.

Transliteracja obejmuje polskie, niemieckie i hiszpanskie znaki diakrytyczne
znalezione w danych (a, ss, a, i, n, o, o, u, u, a, e, l, l, s, s, z, z, z
plus wielkie litery).

KIEDY UZYWAC: tylko dla EN/DE/ES, gdy dopisujesz nowego ptaka RECZNIE do
tych trzech rejestrow (zgodnie z PODSUMOWANIE_SESJI.md - nie maja wlasnego
generatora). Dla PL NIE trzeba tego uruchamiac - generate_birds_data.py
od (sesja 06.2026, poprawka localSlug) juz sam dopisuje to pole.

IDEMPOTENTNY w sensie bezpiecznym: jesli odpalisz ten skrypt na pliku,
ktory JUZ MA pole localSlug, regex nie znajdzie wzorca (szuka "slug:"
bezposrednio przed "namePl:", a teraz miedzy nimi jest "localSlug:") i
zwroci "0 wpisow zaktualizowanych" - NIE doda duplikatu, NIE popsuje pliku.
Bezpiecznie odpalac wielokrotnie, ale nie naprawi recznie zmienionych
pojedynczych wpisow - do tego edytuj plik JS bezposrednio.

Uzycie: python3 inject_local_slug.py
Dziala na plikach w biezacym katalogu (assets/js/).
"""
import re
import json

TRANSLIT_DE = {
    'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
    'Ä': 'ae', 'Ö': 'oe', 'Ü': 'ue',
}

TRANSLIT_ES = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ü': 'u', 'ñ': 'n',
    'Á': 'a', 'É': 'e', 'Í': 'i', 'Ó': 'o', 'Ú': 'u', 'Ü': 'u', 'Ñ': 'n',
}

TRANSLIT_PL = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
    'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n',
    'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z',
}

# Polaczona mapa dla wspolnych przypadkow (np. attribution moze miec nazwiska
# z dowolnym akcentem) - kazdy jezyk i tak uzywa swojej dedykowanej wersji
# (TRANSLIT_DE/ES/PL) przy slugifikacji namePl, zeby uniknac kolizji jak
# wczesniej (niemieckie 'ue' z 'u-umlaut' nadpisywane bezmyslnie w ES, gdzie
# 'u-dieresis' to po prostu zwykle 'u' - to dwa rozne zjawiska ortograficzne,
# nie jeden znak Unicode do jednej reguly).
TRANSLIT = {**TRANSLIT_PL, **TRANSLIT_ES, **TRANSLIT_DE}


def slugify(name, translit_map):
    """'Weißwangengans' -> 'weisswangengans'; 'Cigüeña blanca' -> 'cigueña-blanca' -> 'cigueña-blanca' (ü->u w ES, nie ue)."""
    out = []
    for ch in name:
        out.append(translit_map.get(ch, ch))
    s = ''.join(out).lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = re.sub(r'-+', '-', s).strip('-')
    return s


def process_file(path, is_pl, translit_map):
    with open(path, encoding='utf-8') as f:
        content = f.read()

    # Znajdz kazdy blok obiektu i wstrzyknij localSlug po linii slug.
    # Wzorzec: linia "    slug: "xxx"," nastepnie linia "    namePl: "yyy","
    pattern = re.compile(
        r'(    slug:\s*"([^"]+)",\n)(    namePl:\s*"((?:[^"\\]|\\.)*)",\n)'
    )

    def repl(m):
        slug_line, slug_val, name_line, name_raw = m.groups()
        if is_pl:
            local_slug = slug_val  # PL: slug juz jest poprawny URL-safe
        else:
            name_decoded = json.loads('"' + name_raw + '"')
            local_slug = slugify(name_decoded, translit_map)
        return f'{slug_line}    localSlug: "{local_slug}",\n{name_line}'

    new_content, count = pattern.subn(repl, content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return count


if __name__ == '__main__':
    files = [
        ('birds-data.js', True, None),
        ('birds-data-en.js', False, TRANSLIT),  # EN: nazwy gatunkow nie maja obcych diakrytykow w tym zbiorze, ale uzywamy pelnej mapy jako bezpiecznik
        ('birds-data-de.js', False, TRANSLIT_DE),
        ('birds-data-es.js', False, TRANSLIT_ES),
    ]
    for fname, is_pl, tmap in files:
        n = process_file(fname, is_pl, tmap)
        print(f'{fname}: {n} wpisow zaktualizowanych')
