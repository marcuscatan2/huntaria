# Remaining scope — implementation and decision audit

Audit updated for the 2026-09-14 class/farm expansion. Covers all 66 active cards. The request authorizes unblocked
implementation, not approval of final art, permanent economy, public services,
payments or unrelated stashed ideas. The owner explicitly activated Inner Sea AFK/defense and Hunter/Swordsman on 2026-09-14; see [farm scope](../inner-sea/FARM_SCOPE.md) and [class contract](../opening/CLASSES.md). No commercial criterion is accepted here.

## Implemented locally

- F-028: three original on-demand loops, procedural cues, volume/mute controls,
  impact-linked playback and source cleanup. Final listening review remains.
- F-030: persistent motion/FX/shake/flash controls, accessible settings dialog,
  focus restoration and responsive new controls. Whole-game physical/assistive
  certification is not supplied by automated tests.
- F-031 and local part of F-032: wooden farm, five automatic habitat residents,
  all-owned AFK XP, strongest-species power, lunar daily defenses with five
  selected monsters, replay, loot, all-owned XP loss, repairs and upgrades.
  Three decoration sockets, two skies and PNG export remain. Habitat equipment
  from bosses/dungeons is the next gameplay batch.
- F-006/F-019: Hunter and Swordsman join Druid and Mage, with five abilities,
  trainer trees, demonstrations and explicit easy master acceptance challenges.
- F-034 and local part of F-046: immutable allowlisted client bundles and
  hash manifests, failed-start reload UI, lazy hidden menus, pixel-identical
  compressed scenery and on-demand bridge. No deployment or online-rule claims.
- F-036: checked-in offline Node runner and 1,000-case browser/Node parity corpus,
  including 13 actors and escape. All outcomes match, but the local timing target
  is not consistently met. Evidence is local, not hosting capacity; see the runtime probe below.
- F-052: the above regressions join the existing full gate. Save export remains
  local only; it is not F-041's authenticated account-export implementation.

Routes: [preferences/audio](../experience/SETTINGS_AUDIO.md),
[Inner Sea](../inner-sea/DISPLAY.md), [client build](CLIENT_BUILD.md),
[runtime probe](../combat/RUNTIME.md). Regenerate verification evidence with the commands in [Operations](OPERATIONS.md).
Acceptance checkboxes remain untouched.

## Decisions and resources

### C1 — Class direction, before specialization/kit expansion

Direction chosen: keep Apprentice first and Druid/Mage/Hunter/Swordsman as the current launch
specializations; keep two companion slots. Extra summons remain effects, while a
future true merge replaces one companion actor. Adventure battles retain the
trainer defeat objective; Inner Sea defenses use five monsters without a trainer. The player/owned hard cap is60; the engine/wild curve stays
valid through100. Final class kits and the exact allocation/balance curve still
need a later content review before specialization production is expanded.

### C2 — Reference quality, before repeated content production

Review the actual first 20–30 minutes (OR-02), one village/field/cave slice (OR-03),
and the representative creature/animation sets (OR-01/04/05). Supplied sprites
are integrated but not automatically production-approved. Need explicit
Approve/Revise on the named reference, not approval of all 100 now. This batch
does not request more sprite production. Inner Sea/music also need your taste
review before their reference treatments become final assets.

### C3 — Launch devices and progression promise

Recommendation: desktop Chrome/Edge first; keep phone layouts usable but do not
advertise Android/iOS support until real-device certification. Confirm whether
Android is a launch requirement and provide the actual model for testing (OR-06).

Keep 15% Echo odds and fast opening XP in this prototype. Before permanent online
tests, approve release pacing and the unlucky-player experience (OR-07): proposed
10% starters/0.01% designated late drops remain unchanged. No hidden pity or
rarity-based stat advantage. Do not publish acquisition promises before review.

### C4 — Persistent online pilot, before backend/economy integration

Need approval to begin an online pilot, its test-wipe/persistence policy and
monthly operating cap. Existing local saves stay separately playable/exportable
and never become trusted online currency or rare ownership. Confirm the account
linking conflict policy: recommendation is choose one existing server profile,
never merge currencies/receipts. Confirm private 2–3-player boss parties as the
initial multiplayer scope, home realm and production boss availability policy.

Technical direction: the existing JS simulator in one Node service with a
transactional database, managed identity and static versioned assets; not
microservices. Node compatibility is now measured. Selecting an actual host,
data region and managed-account/email service needs the owner-controlled account,
spend authority and approved player-data policy. Credentials must be entered
through the provider/environment, never committed or pasted into project docs.
No fake login, simulated cloud ownership or pretend live boss rewards are added.

### C5 — Commerce, privacy and support, before public accounts or money

Need seller/legal identity, launch countries, age policy, currencies and approved
cosmetic prices/bundles; provider eligibility, refund/retention/deletion policies
and a support contact. Qualified review where required remains external work.
F2P/cosmetics-only is already decided and is not reopened. No payment account,
email sender, hosted checkout, telemetry collector or public deployment is
created without the relevant approval. Source provenance is not whole-game
rights clearance. Choose whether the next outside test is explicitly free.

### C6 — Real validation and operating resources

Need named target hardware, uninvolved playtesters and permission/consent for a
bounded outside study; later, real accounts/clients for group and recovery tests.
Need an approved operating reserve/invitation cap before load tests or expansion,
and a final go/no-go before launch. The historical $1–2k is not proof the expanded
100-species service is funded. Optional PT-BR and iOS remain after P0 unless
explicitly promoted, with a fluent reviewer/physical iPhone respectively.

## Full card disposition

“Existing” means a local implementation to retain/regress, not commercial
acceptance. “Partial” names the missing boundary instead of marking the card
complete. Every skipped implementation below has a decision, sprite or external
evidence dependency; ordinary engineering choices were taken in the delivered
batch. Detailed criteria remain in [the backlog](../../FEATURE_BACKLOG.md).

| Card | Current delivery / remaining boundary | Unblock |
| --- | --- | --- |
| F-001 | Existing typed melee/ranged/magic; final kit/balance acceptance | C1,C2 |
| F-002 | Existing Speed/accuracy/dodge/regen; tuning acceptance | C1,C2 |
| F-003 | Existing trainer allocation/Leadership; group build locks absent | C1,C4 |
| F-004 | Existing solo/partial party and simulated groups; live authority absent | C4 |
| F-005 | Existing portrait picker, priorities, formation, frozen active build; online readiness absent | C4 |
| F-006 | Existing100-species content contract; final kits/identity/viability approval | C1,C2 |
| F-007 | Existing four elements/statuses/guard/shields; final kit review | C1,C2 |
| F-008 | Existing inspection, background fight, pause/speed/Run and item toasts; real group controls absent | C4 |
| F-009 | Existing launch cap60 with engine/wild curve100 and safe excess-XP migration; final pacing and late-world play evidence | C2,C3 |
| F-010 | Existing ranked trees; finalized class branches/build viability | C1,C2 |
| F-011 | Existing local per-kill loot/recovery; release tuning and authoritative economy | C3,C4 |
| F-012 | Existing usable inventory and individual summoning; account/revoked-entitlement states absent | C4,C5 |
| F-013 | Existing100-entry guide/independent copies; six live group acquisition sources absent | C4 |
| F-014 | Existing guaranteed receipt-backed local summon; server atomicity absent | C4 |
| F-015 | Existing Apprentice opening and four-class Lv20 specialization; final class feel/commitment policy pending | C1,C2 |
| F-016 | Existing24 large maps/six hubs/six boss domains and open roads; full quality/device/online-lifecycle acceptance | C2,C4,C6 |
| F-017 | Existing spatial gates and reciprocal routes; online lifecycle | C4 |
| F-018 | Existing cave/forest exploration and durable local lives; server claims | C4 |
| F-019 | Existing six chapters/48 objectives/solo ending; approved first-loop pacing and full playtest | C1,C2,C6 |
| F-020 | Existing60 trainer compositions; final lesson/kit/balance review | C1,C2 |
| F-021 | Existing12 pack templates; final difficulty/play evidence | C2,C3 |
| F-022 | Existing six spatial reward-free boss domains/practices/phases; real group bosses and final motion absent | C2,C4; sprites |
| F-023 | Existing local mastery/challenges; real optional group hunts | C4 |
| F-024 | Reference art direction not approved | C2; sprites |
| F-025 | Supplied stills/reference motion, not100 approved animation packages | C2; sprites |
| F-026 | Existing synchronized impacts plus new audio integration; final motion/crowded-group review | C2,C4; sprites |
| F-027 | Existing world kits, new lossless exports and fixed Inner Sea scene; final region art acceptance | C2; scene/trainer art |
| F-028 | Implemented local loops/cues/controls; final listening/mix acceptance | C2,C6 |
| F-029 | Existing quiet creation/navigation, plus settings/scene; real offline/login/group states absent | C1,C4 |
| F-030 | New persistent controls/focus/responsive checks; whole-game human/device and future checkout acceptance | C3,C5,C6 |
| F-031 | Implemented farm, AFK training, lunar five-monster defense, repairs/upgrades, scene/export; habitat equipment and final visual/device review pending | C2,C6 |
| F-032 | Three local earned decorations and invariant gameplay; cloud/paid ownership and outfit slots absent | C4,C5; outfits use sprites |
| F-033 | No paid catalog; needs approved products/prices and actual preview assets | C5; sprites |
| F-034 | Implemented local immutable build/load safeguards; production rules/cache/network acceptance incomplete | C3,C4,C6 |
| F-035 | Loading diagnostics and scenery compression; physical performance certification absent | C3,C6; final asset budgets |
| F-036 | Implemented Node/browser parity corpus; local timing gate inconsistent, actual host/room-capacity measurement absent | C4,C6 |
| F-037 | Managed guest/accounts/email recovery absent | C4,C5 |
| F-038 | Cloud saves/concurrency/migration absent; local saves preserved | C4 |
| F-039 | Authoritative tickets/deaths/live rooms absent | C4 |
| F-040 | Server atomic reward/summon ledger absent; local receipts remain | C4 |
| F-041 | Authenticated data export/deletion/retention absent; local download is not a substitute | C4,C5 |
| F-042 | Hosted checkout absent | C4,C5 |
| F-043 | Verified payment/grant ledger absent | C4,C5 |
| F-044 | Refund/dispute/support workflows absent | C5 |
| F-045 | Real auth/session/rate boundaries absent | C4,C5 |
| F-046 | Local reproducible package done; isolated hosting and deploy/rollback drill absent | C4,C5 |
| F-047 | Source/local export tooling only; cloud backup/rare-reward/payment reconciliation absent | C4,C5,C6 |
| F-048 | No operator service or server kill switches | C4,C5 |
| F-049 | No live telemetry/load/billing evidence; local CPU is not capacity | C4,C6 |
| F-050 | Measurement protocols planned; no consented collector/authoritative cohort feed | C4,C5,C6 |
| F-051 | Protocols exist; real recruitment/studies/reports cannot be fabricated | C2,C6 |
| F-052 | Full local regression expanded; final RC/500 observed sessions and online suites missing | C4,C5,C6 |
| F-053 | Local provenance/tools; seller, policies, rights and budget readiness unapproved | C5,C6 |
| F-054 | No public launch package; requires real RC, approved claims/support/policies | C2,C5,C6; actual release art |
| F-055 | No launch or commercial learning cohort authorized | C5,C6 |
| F-056 | Optional PT-BR remains after P0, not silently promoted | C6 |
| F-057 | Optional Safari/iOS remains uncertified | C3,C6 |
| F-058 | Existing 36-place atlas:24 large maps/six hubs/six boss domains; complete final-map/device acceptance | C2,C6 |
| F-059 | Existing map-wide local counts/lives/respawns; server timing and cross-device claims absent | C4 |
| F-060 | Exact local integer rolls/test15%; release pacing approval/server entropy absent | C3,C4 |
| F-061 | Real invite/readiness/reconnect lobbies absent | C4 |
| F-062 | Local13-actor/cross-party simulation; authoritative multi-client sessions absent | C4 |
| F-063 | No live boss essence issuance or server claim ledger | C4 |
| F-064 |100 definitions/sprites integrated; production batches/build/motion acceptance incomplete | C1,C2; sprites |
| F-065 | No server anti-farming/account-abuse service | C4,C5 |
| F-066 | Some local payload/CPU measurements; complete production pilot and funded forecast absent | C2,C4,C6 |

## What to validate now

1. Settings: enable sound; change all volume/visual controls; move between world,
   battle and Inner Sea; pause/resume; reload. Listen for harsh/clipped/repeated
   sounds. The current mix is a reference, not a claim of commercial music quality.
2. Inner Sea: establish the farm at Lv25, check the highest habitat residents,
   assign defenders, clean, upgrade and watch a saved defense. Review an all-owned
   XP loss and item repair before expanding equipment. Check decoration drafts,
   reload and PNG export. Test grants stay in the isolated QA profile.
3. Replay the quiet first 20–30 minutes and record pacing/clarity concerns (C2).
   Review all four class kits and master acceptance flow; device decisions remain C3.

Coming next: habitat equipment after the farm loop review; C4 when online work
is selected, then C5 before accounts/commerce or
public data collection. Safe to defer: distant sprite batches, paid cosmetics,
optional languages/iOS and final launch copy. Deferred Game notes remain stashed.
