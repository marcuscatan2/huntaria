# Apprentice road — validation and evidence

Status: Patch 26 local prototype implemented; commercial experience approval is
pending under OR-02. The owner walkthrough is
[PASS26_VALIDATION.md](PASS26_VALIDATION.md).

## Isolated test route

Serve the repository normally and open `http://127.0.0.1:8765/?test=1`. This
uses a separate browser save. Choose **Restart progress** when repeating the
opening; do not reset the owner's normal save.

The complete human review has three sessions:

- first 30 minutes with both weapons and both second-companion branches;
- four class demonstrations plus Tidecrown;
- both class trials, specialization, ability adaptation and the level-30 tree.

Record actual elapsed time, deaths, recovery trips, retries and the first moment
whose purpose was unclear. Automated simulation cannot establish fun, visual
clarity, emotional attachment or correct commercial pacing.

## Automated contract

The focused checks establish:

- fresh creation, one-time intro aggression, accepted-victory state and defeat
  recovery at the real Firstlight camp;
- exactly one first-Firstlight-Brimble Echo and exactly one chosen
  Bloomslime-or-Stonehorn Echo, with ordinary drop odds unchanged;
- atomic Inventory summoning, independent companion identity and automatic use
  of the first open party slot;
- independent trainer and companion XP, safe migration at the former displayed
  level, and exact authored thresholds through level 30;
- an in-frame objective/Bag tutorial, a visible Forest Mage/two-companion gate,
  and open roads after its easy proof battle;
- fixed live/saved field HP lines for trainer and selected companions, plus
  dead-companion deployment that preserves the loadout and trainer-only hunts;
- four semantic class demonstrations, fixed progression bosses and master
  visibility after Tidecrown;
- temporary three-of-five trials, a level-20 specialization gate and atomic
  Druid/Mage commitment;
- a genuine changed-ability requirement and individual monster trees locked
  until player level 30;
- all 100 species expose 18 ranked nodes, five named-skill links and an
  innate-identity node;
- named skill-power and skill-cooldown nodes change the actual deterministic
  combat result, including Leadership/DEX interaction and the shared cap;
- both weapons, both second-companion branches and both launch classes can clear
  every authored level-1-to-30 encounter at its milestone level.

Run the focused gates from the repository root:

```powershell
python tests/opening_check.py --browser chrome
python tests/pass18_check.py --browser chrome
python tests/pass18_campaign.py --browser chrome
python tests/pass18_ui.py --browser chrome
```

Then run `python scripts/project.py verify --browser chrome` for the full project,
artifact-hash and immutable-client gate. Current exact results and build path are
recorded at the top of `PROGRESS.md`; do not reuse older counts against changed
source hashes.

## Evidence boundaries

Tests use disposable browser contexts, deterministic seeds and accelerated
combat. They do not validate physical mobile hardware, Safari, production save
authority, online players, payments, live group bosses, economy balance or final
art. The normal personal browser save is not opened or reset by these commands.

The isolated solo sample may show that a level-one bow Apprentice cannot defeat
Stonehorn alone. That is not an opening-route failure: only Emberfox is promised
as a trainer-only target; Stonehorn appears after Emberfox joins the party.

## Unfinished decisions

1. Approve literal class permanence or the recommended persistent commitment
   with a non-paid server-controlled recovery/migration path.
2. Choose a bounded non-paid practical use for the level-25 Inner Sea ownership
   milestone. AFK/daily power remains only in Game Notes.
3. Approve Emberfox, Bloomslime and Stonehorn trees as the production content
   pattern before hand-authoring and balancing all remaining species trees.

These decisions do not invalidate the implemented route. They block production
copy, the missing Inner Sea milestone, and roster-wide final tree content.
