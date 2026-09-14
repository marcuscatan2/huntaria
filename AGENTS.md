# Project workflow

## Mandatory AI entry and completion contract

- Start with README.md, then one features/<owner>/README.md. Use the compact
  FEATURE_MAP for symptoms or `python scripts/project.py context <query>` for
  a feature, owned file, global, F-### card or connection. Read that source first;
  follow linked connections as needed, not every guide/history by default.
  Use `python scripts/project.py impact <file>` before cross-feature edits.
- Check OWNER_REVIEWS.md before planning dependent production. Run
  `python scripts/project.py reviews --work <milestone> --enforce`, adding
  `--species <stable IDs>` for creature/animation production. Select the honest
  milestone; never relabel production as prototype to bypass a gate.
- When an owner gate is unapproved/rejected/stale, stop only its dependent
  production/commitment. Prepare the review packet, run diagnostics or continue
  independent reversible work. Technical testing must not wait for final art.
- Keep the owner informed before crossing a gate and in every substantive
  development handoff: Needs you now (max three), Coming next (trigger),
  Safe to defer. If unchanged say so briefly. State what to review, why waiting
  costs more, what would pause and what can continue. No background reminders
  are implied when an assistant is not running.
- Only explicit owner approval of a named scope/revision counts. Never infer
  approval from green tests, silence, generic encouragement or a different batch.
  Record the exact statement/source and evidence hashes in docs/review-gates.json.
  Rejected expanded-roster art is not the approved production standard.
- Update gate triggers/decisions/evidence and reopen affected approvals when their
  inputs change. Run `project.py reviews --write` and `project.py map --write`
  together after gate routing changes; run `project.py check`. Entry documents
  contain links/rules, not duplicate approval histories.
- Work from current source, not historical pass claims. Read relevant acceptance
  cards; local simulation is not commercial or online completion evidence.
- README is a light router (max600 words), FEATURE_MAP a compact index (max1300).
  Explanations belong in the owning feature folder/specification, not these entry
  documents. Do not put duplicate runtime implementations in feature folders.
- docs/architecture.json owns feature summaries, implementation files, contracts,
  interfaces and tests. `python scripts/project.py map --write` generates the
  index, all feature READMEs, connections and module graph; never hand-edit them.
  Add detailed manually maintained guides beside the relevant feature README
  and register them in that feature's docs. Keep actual source paths explicit.
- Update README, the manifest and owning guide/specification in the same change
  when their facts change. Run `python scripts/project.py check` before completion.
- Document only ownership, contracts, supported commands, invariants, verified
  constraints or explicit future release gates. No diaries, obvious comments,
  unverified results or duplicate tuning. No ceremonial edits if facts are unchanged.
- Every runtime file needs one primary owner. Update boot dependencies, events
  and test routing when affected. Keep deterministic rules free of DOM, storage,
  network and wall-clock access. UI cannot award inventory.
- Add a regression for a bug; test its feature and affected connections. Use the
  full gate for cross-cutting work. Never weaken tests just to get a green result.
- Preserve normal browser saves, stable IDs and legacy migration inputs. Use
  disposable test contexts. Future servers cannot trust client-owned rewards.
- Use Git commits for source checkpoints. Create ZIP backups only when the
  owner explicitly requests one; keep backup/ and backups/ out of Git.
- No public deployment, external sharing, paid services, production accounts,
  secrets or destructive save operations without appropriate user authority.
- Name new code by responsibility, not pass number; avoid personal paths.
  Extract tested responsibilities incrementally, not broad cosmetic rewrites.

## Player-facing copy

- Describe current actions and information the player needs, briefly.
- Keep drop odds and implementation/testing details out of ordinary game UI.
- When mechanics change, remove their obsolete text. Do not explain absent
  mechanics, invent uncertainty, or contrast current behavior with retired rules.
- Developer documentation and explicitly isolated QA tools may retain tuning.

## Deferred game ideas

- Read `Game notes.md` when the user asks to stash or add game notes.
- Stashing means record the idea and confirm it was saved; it does not authorize
  gameplay implementation.
- If now-versus-later intent is ambiguous, ask the user before changing gameplay.
  You may record the idea with an awaiting-confirmation status in the meantime.
- Explicit implementation requests can promote a note into active work. Update
  the note's status and preserve unrelated ideas.
- `Companion stats.md` documents implemented pass 13 formulas. Label future
  proposals separately; do not mistake examples in stashed notes for live rules.
