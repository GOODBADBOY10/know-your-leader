# Contributing to Know Your Leader

You've been assigned one Nigerian state. Your job: fill in that state's file
with real, verified data. Here's exactly how to do it and submit it.

## 1. Get the project

```bash
git clone <repo-url>
cd know-your-leaders
```

## 2. Create your own branch — never work directly on main

```bash
git checkout -b data/<your-state-name>
```
Example: `git checkout -b data/ondo`

**You cannot push to `main` directly** — GitHub is set up to block it. All work
goes through a branch + Pull Request, reviewed before it's merged.

## 3. Find your file

Your file is in `supabase/states/<your-state>.json`. Example: `ondo.json`.

## 4. Fill it in

Replace every `PLACEHOLDER` and `TBD` with real, verified information:
- 3 senatorial districts (always exactly 3 per state)
- Federal constituencies (varies per state — research the real count)
- State constituencies (varies, often more than the LGA count)
- Every real LGA in the state, linked to its district/constituency
- Officeholders: 1 Governor, 3 Senators, however many Reps, one Assembly
  member per LGA, one Chairman per LGA (Chairmen are often genuinely
  unfindable — leave as `"TBD — not yet verified"` rather than guess)

If you're unsure about a name, spelling, or which district something
belongs to, ask before you commit it — don't guess.

## 5. Mark it done

When your file has zero remaining `PLACEHOLDER`/`TBD` text, change:
```json
"_status": "placeholder"
```
to:
```json
"_status": "verified"
```

## 6. Commit and push your branch

```bash
git add supabase/states/<your-state>.json
git commit -m "Add verified data for <your-state>"
git push origin data/<your-state>
```

## 7. Open a Pull Request

On GitHub, open a PR from your branch into `main`. In the description, list
your sources (news articles, official sites, INEC results, etc.) so it's easy
to verify.

## 8. Wait for review

The project owner reviews every PR before merging — don't merge your own PR,
and don't ask others to approve it for you. If changes are requested, push
more commits to the same branch; the PR updates automatically.

## Rules

- **One state per file, one file per person** — don't edit a state that isn't
  yours without asking first.
- **Never push to `main` directly** — GitHub will block it anyway.
- **Cite your sources** in the PR description.
- **When in doubt, leave it as `TBD`** rather than guessing a name — wrong
  information is worse than missing information here.