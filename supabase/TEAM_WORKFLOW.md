# Team workflow: one file per state

Instead of everyone editing one giant `data.json`, each state now lives in its
own file under `states/`:

```
states/
  national.json       ← President, Senate President, Speaker (already done — don't touch)
  lagos.json          ← already real (Sanwo-Olu, Adebule, Faleke, Lawal, Chairman=TBD)
  bayelsa.json        ← already real (full state, Chairmen=TBD)
  abia.json           ← placeholder, needs a teammate
  adamawa.json        ← placeholder, needs a teammate
  ... (36 state files total)
  _TEMPLATE.json      ← reference only, not imported (starts with _)
```

## How a teammate works on a state

1. Open their assigned state's file, e.g. `states/ondo.json`
2. Research and replace every `PLACEHOLDER` / `TBD` with real, verified data
   (same rules as before — 3 senatorial districts always, LGAs/constituencies vary,
   ask for help verifying anything uncertain)
3. When the file has **zero** remaining placeholder text, change the top line:
   ```json
   "_status": "placeholder"
   ```
   to:
   ```json
   "_status": "verified"
   ```
4. Save. Done — no one else's file is touched, so there's nothing to merge or conflict over.

## Why this avoids conflicts

Everyone's changes live in a different file. If you're using git, GitHub, or even
just a shared Google Drive/Dropbox folder, two people can work on two different
states at the same time with zero risk of overwriting each other's work — the
old single `data.json` made that impossible.

## Importing everyone's work at once

`import-all.js` reads every file in `states/`, merges them into one dataset, and
imports it — same underlying logic as before, just reading many small files
instead of one big one.

```bash
cd supabase
npm install
SUPABASE_URL="https://cmacroitkjshyrxraotl.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" \
node import-all.js states
```

**To only import states that are actually finished** (skip anything still
`"_status": "placeholder"`), add the flag:

```bash
node import-all.js states --only-verified
```

This replaces the old `data-public.json` approach — instead of a separate
filtered file, `--only-verified` does the filtering automatically based on
each state's own `_status` field. Safe to run anytime; re-running never
creates duplicates, it just updates.

## Recommended team setup

Put the whole `know-your-leader` folder in a shared git repo (GitHub, GitLab,
whatever). Each person works on their state's branch/file, commits, pushes.
Whoever runs the import just pulls the latest and runs the command above —
they'll always get everyone's most recent verified work in one go.