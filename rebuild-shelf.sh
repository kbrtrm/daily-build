#!/usr/bin/env bash
# Regenerate days.json from the date folders, so the local shelf (index.html)
# lists every build. Mirrors what .github/workflows/build-index.yml does on push.
# Run from anywhere:  ./rebuild-shelf.sh
set -euo pipefail
cd "$(dirname "$0")"

python3 - <<'PY'
import os, re, json
dirs = sorted(
    (d for d in os.listdir('.') if os.path.isdir(d) and re.match(r'\d{4}-\d{2}-\d{2}', d)),
    reverse=True,
)
with open('days.json', 'w') as f:
    json.dump(dirs, f)
    f.write('\n')
print(f"days.json -> {len(dirs)} build(s):")
for d in dirs:
    print(f"  {d}")
PY

echo
echo "Serve the folder and open the shelf:"
echo "  python3 -m http.server 8080   # then visit http://localhost:8080/"
