#!/usr/bin/env bash
# Publish foractive.info on GitHub Pages with the custom domain. Run from this directory.
#   ./publish.sh 1   create the public repo and push (docs/ is the site)
#   ./publish.sh 2   enable Pages from main:/docs, print the github.io URL to verify
#   ./publish.sh 3   after DNS points at GitHub: set the custom domain, then enforce HTTPS
#
# DNS at Porkbun, before step 3 (replaces the URL-forwarding records):
#   A      @    185.199.108.153
#   A      @    185.199.109.153
#   A      @    185.199.110.153
#   A      @    185.199.111.153
#   CNAME  www  satjow-git.github.io
# Leave MX / TXT (SPF, DKIM, DMARC) and the send.* / resend._domainkey records untouched.
set -euo pipefail
REPO="${REPO:-satjow-git/foractive-info}"
OWNER="${REPO%%/*}"; NAME="${REPO##*/}"
STEP="${1:-1}"
case "$STEP" in
  1)
    [ -d .git ] || git init -q
    git add -A
    git -c commit.gpgsign=false commit -q -m "foractive.info: running clubs landing page" || true
    git branch -M main
    gh repo create "$REPO" --public --description "foractive.info — ForActive landing pages (running clubs)" --source=. --remote=origin --push
    ;;
  2)
    gh api -X POST "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs" \
      || gh api -X PUT "repos/$REPO/pages" -f "source[branch]=main" -f "source[path]=/docs"
    echo "Pages enabled. Verify at: https://$OWNER.github.io/$NAME/running_clubs/"
    ;;
  3)
    echo "foractive.info" > docs/CNAME
    git add docs/CNAME && git -c commit.gpgsign=false commit -q -m "CNAME foractive.info" && git push
    gh api -X PUT "repos/$REPO/pages" -f cname=foractive.info
    echo "Custom domain set. Once GitHub has issued the certificate (minutes to ~24h):"
    echo "  gh api -X PUT repos/$REPO/pages -F https_enforced=true"
    ;;
  *) echo "usage: $0 1|2|3"; exit 1 ;;
esac
