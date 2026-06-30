#!/bin/bash
# Szybki deploy media.bartechbooks.com: commit + push.
# Dziala TYLKO po podlaczeniu repo GitHub jako zrodla w Cloudflare Pages
# (Workers & Pages -> bartech-audio -> Settings -> Build -> Connect to Git).
# Po podlaczeniu, Cloudflare sam wykryje push na main i zbuduje nowa wersje
# - tak samo jak przy bartechbooks.com.
#
# Stary, rowny w uzyciu sposob (Wrangler CLI, bez GitHub) zostal w
# deploy-wrangler-manual.sh - dziala niezaleznie od tego, czy repo jest
# podlaczone w Cloudflare czy nie.
set -e
cd "$(dirname "$0")"
git add -A
git commit -m "${1:-Aktualizacja media.bartechbooks.com}"
git push
