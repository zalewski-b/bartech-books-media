#!/usr/bin/env bash
# Deploy media.bartechbooks.com na Cloudflare Pages.
#
# WYMAGANIA JEDNORAZOWE (zrob raz, zanim uzyjesz tego skryptu):
#   npm install -g wrangler
#   wrangler login
#   wrangler pages project create bartech-audio --production-branch=main
#   (potem w dashboardzie: Workers & Pages -> bartech-audio -> Custom domains
#    -> dodaj media.bartechbooks.com)
#
# UZYCIE (z dowolnego miejsca, podaj sciezke do folderu strony):
#   ./deploy.sh /Users/bartosz/Documents/audio-bartech
#
# albo bez argumentu, jesli stoisz w folderze strony:
#   ./deploy.sh

set -euo pipefail

PROJECT_NAME="bartech-audio"
SITE_DIR="${1:-.}"

if [ ! -f "$SITE_DIR/index.html" ]; then
  echo "BLAD: nie znaleziono index.html w '$SITE_DIR'."
  echo "Podaj poprawna sciezke do folderu strony, np.:"
  echo "  ./deploy.sh /Users/bartosz/Documents/audio-bartech"
  exit 1
fi

echo "Wdrazam '$SITE_DIR' do projektu Cloudflare Pages '$PROJECT_NAME'..."
wrangler pages deploy "$SITE_DIR" --project-name="$PROJECT_NAME" --commit-dirty=true

echo ""
echo "Gotowe. Sprawdz:"
echo "  https://media.bartechbooks.com"
echo "  (propagacja zmian na custom domain bywa do paru minut)"
