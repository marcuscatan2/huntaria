# Cross-feature contracts

Generated from [architecture.json](<../../docs/architecture.json>). [Feature index](<../../FEATURE_MAP.md>).
Read the relevant connection only. Contracts are reviewed intent; source is the implementation.

<a id="combat-feedback"></a>
## combat-feedback

[combat](<../../features/combat/README.md>) → [animation](<../../features/animation/README.md>)

Battle.events -> app renderBattle -> CombatView.onEvent -> timing/rig/VFX. Compare event.time/actor/target with impactAudit before changing simulation timing.

Trace through: [app.js](<../../app.js>) → [presentation-contract.js](<../../presentation-contract.js>) → [combat-view.js](<../../combat-view.js>) → [character-rig.js](<../../character-rig.js>) → [combat-vfx.js](<../../combat-vfx.js>).

<a id="world-facing"></a>
## world-facing

[exploration](<../../features/exploration/README.md>) → [animation](<../../features/animation/README.md>)

Region movement/follower facing -> shared CharacterRig.pose and CSS facing transform. Verify left and right in world and arena.

Trace through: [region.js](<../../region.js>) → [character-rig.js](<../../character-rig.js>) → [world-v15.css](<../../world-v15.css>).

<a id="encounter-settlement"></a>
## encounter-settlement

[combat](<../../features/combat/README.md>) → [persistence](<../../features/persistence/README.md>)

reserveBattle -> seeded Battle -> settleKills/checkpoint -> complete -> map/loot. A returned popup is not a receipt; retries must not pay twice.

Trace through: [app.js](<../../app.js>) → [profile.js](<../../profile.js>) → [loot-popup.js](<../../loot-popup.js>).

<a id="spawn-reservation"></a>
## spawn-reservation

[population](<../../features/population/README.md>) → [persistence](<../../features/persistence/README.md>)

Quota and placement policy -> persisted life/seed/roll/position -> reserved encounter. Map reload/build edits cannot reroll an accepted life.

Trace through: [map-population.js](<../../map-population.js>) → [atlas-data.js](<../../atlas-data.js>) → [profile.js](<../../profile.js>).

<a id="world-collision"></a>
## world-collision

[world](<../../features/world/README.md>) → [exploration](<../../features/exploration/README.md>)

One authored geometry feeds collision/routing and scenery; use renderer bounds for painted service hit targets, not unrelated marker rectangles.

Trace through: [world-layout.js](<../../world-layout.js>) → [world-nav.js](<../../world-nav.js>) → [world-renderer.js](<../../world-renderer.js>) → [region.js](<../../region.js>).

<a id="owned-build"></a>
## owned-build

[party](<../../features/party/README.md>) → [persistence](<../../features/persistence/README.md>)

Visual picker chooses instance ID; migrateParty/setSkills validates ownership; bond-growth invalidates stale builds while preserving reservations.

Trace through: [app.js](<../../app.js>) → [profile.js](<../../profile.js>) → [companion-picker.js](<../../companion-picker.js>).

<a id="derived-stats"></a>
## derived-stats

[growth](<../../features/growth/README.md>) → [combat](<../../features/combat/README.md>)

Profile snapshot + species bases + individual XP/ranks + formation -> battle initialization. UI preview must use the same derived formulas.

Trace through: [progression.js](<../../progression.js>) → [growth.js](<../../growth.js>) → [formation.js](<../../formation.js>) → [profile.js](<../../profile.js>) → [game.js](<../../game.js>).

<a id="echo-to-individual"></a>
## echo-to-individual

[collection](<../../features/collection/README.md>) → [persistence](<../../features/persistence/README.md>)

Echo item/receipt -> profile.summon -> consume one Echo and create one instance atomically locally -> refresh collection and picker.

Trace through: [echoes.js](<../../echoes.js>) → [profile.js](<../../profile.js>) → [inventory-menu.js](<../../inventory-menu.js>) → [journey.js](<../../journey.js>).

<a id="injury-and-supplies"></a>
## injury-and-supplies

[recovery](<../../features/recovery/README.md>) → [persistence](<../../features/persistence/README.md>)

Battle injury ratios -> checkpoint/complete -> vitality. Firstlight defeat records campRecovery and full camp revival; later defeats rescue to regional town with injuries. Before a new adventure, deploy removes selected zero-HP companions from the encounter copy but never from the saved loadout; trainer health remains the readiness gate. Buy/recover/rest validate proximity, resources and no active reservation; forest camp is a real rest service.

Trace through: [adventure-rules.js](<../../adventure-rules.js>) → [profile.js](<../../profile.js>) → [game.js](<../../game.js>) → [recovery-menu.js](<../../recovery-menu.js>).

<a id="campaign-encounter"></a>
## campaign-encounter

[campaign](<../../features/campaign/README.md>) → [combat](<../../features/combat/README.md>)

Authored encounter -> requirement check -> saved temporary/fixed build and seed -> simulator -> accepted trainer/companion rewards and milestone reconciliation. Progression bosses use fixed levels; simulated practice parties never grant real acquisition.

Trace through: [campaign.js](<../../campaign.js>) → [campaign-menu.js](<../../campaign-menu.js>) → [profile.js](<../../profile.js>) → [app.js](<../../app.js>) → [game.js](<../../game.js>).

<a id="early-progression"></a>
## early-progression

[opening](<../../features/opening/README.md>) → [campaign](<../../features/campaign/README.md>)

Accepted first Firstlight Brimble claim -> guaranteed ordinary Echo -> highlighted Bag/Echo/Summon path and auto-party -> Forest Mage meeting -> guaranteed second-role Echo and second summon -> easy Mage proof that opens physical roads -> four recorded class demonstrations -> fixed Tidecrown -> temporary class trial -> Lv20 specialization -> adaptation encounters -> Lv30 monster-tree proof. Trainer XP and monster XP remain independent; UI hints and travel never grant milestones.

Trace through: [opening-rules.js](<../../opening-rules.js>) → [wild-behavior.js](<../../wild-behavior.js>) → [region.js](<../../region.js>) → [campaign.js](<../../campaign.js>) → [profile.js](<../../profile.js>) → [app.js](<../../app.js>) → [menu.js](<../../menu.js>) → [growth.js](<../../growth.js>) → [tree-menu.js](<../../tree-menu.js>).

<a id="created-apprentice"></a>
## created-apprentice

[opening](<../../features/opening/README.md>) → [persistence](<../../features/persistence/README.md>)

Fresh path: validated name/palette/weapon -> painted creation preview -> createCharacter atomic local commit at BondOpening.start forest camp -> saved apprentice build and weapon-derived combat. Migration path: an unnamed legacy marker or literal Apprentice placeholder opens a one-time name-only screen -> nameCharacter updates only identity while preserving class/build, appearance, progress, location and encounter; it cannot be repeated. UI cannot create starter items independently.

Trace through: [character-creation.js](<../../character-creation.js>) → [opening-rules.js](<../../opening-rules.js>) → [apprentice-preview.js](<../../apprentice-preview.js>) → [profile.js](<../../profile.js>) → [app.js](<../../app.js>) → [game.js](<../../game.js>) → [menu.js](<../../menu.js>).

<a id="territorial-encounter"></a>
## territorial-encounter

[exploration](<../../features/exploration/README.md>) → [persistence](<../../features/persistence/README.md>)

Notice -> warning -> chase/contact -> reserve existing spawn life. With an active fight, joinBattle saves entry and tick before Battle.addEnemy. In-game tabs/modals do not pause active-fight pursuit; explicit Pause/browser-hidden does. Leash and line of sight apply. No visual reward authority.

Trace through: [wild-behavior.js](<../../wild-behavior.js>) → [region.js](<../../region.js>) → [profile.js](<../../profile.js>) → [app.js](<../../app.js>) → [map-population.js](<../../map-population.js>).

<a id="device-presentation"></a>
## device-presentation

[experience](<../../features/experience/README.md>) → [animation](<../../features/animation/README.md>)

Settings changes invalidate visual preferences only; CombatView sends contact-timed cues. Device preference storage cannot alter battle/profile authority.

Trace through: [settings.js](<../../settings.js>) → [audio.js](<../../audio.js>) → [combat-view.js](<../../combat-view.js>) → [app.js](<../../app.js>) → [region.js](<../../region.js>).

<a id="haven-layout"></a>
## haven-layout

[inner-sea](<../../features/inner-sea/README.md>) → [persistence](<../../features/persistence/README.md>)

Progress facts determine decoration availability; owned individual IDs and three sockets validate before a critical profile write. Draft/export never consume items or change combat.

Trace through: [inner-sea-rules.js](<../../inner-sea-rules.js>) → [inner-sea.js](<../../inner-sea.js>) → [profile.js](<../../profile.js>) → [menu.js](<../../menu.js>).

## Shared interface shapes

<a id="interface-1"></a>
### Combat event: game.js Battle.emit

time (logical seconds), kind, optional actor/target/side, text, amount; event-specific details include category, bypass, targets or until.

Events are ordered by simulation time. app delivers unseen events; view schedules visual deadlines. Never derive reward authorization from an event's display text.

Relevant features: [combat](<../../features/combat/README.md>), [animation](<../../features/animation/README.md>), [shell](<../../features/shell/README.md>).

<a id="interface-2"></a>
### Profile read and command: profile.js

snapshot() returns a cloned v7 profile. Operation return types vary: boolean, receipt/result, or pending completion; error() explains failed persistence.

Use the specific method's result. A button click, view refresh or mutated snapshot is not a successful persisted command. Respect false/pending and idempotent retries.

Relevant features: [persistence](<../../features/persistence/README.md>), [party](<../../features/party/README.md>), [collection](<../../features/collection/README.md>), [recovery](<../../features/recovery/README.md>), [campaign](<../../features/campaign/README.md>), [exploration](<../../features/exploration/README.md>), [opening](<../../features/opening/README.md>).

<a id="interface-3"></a>
### Individual: progression.js / profile.js

id, species type, ordinal, active xp, optional deferredXP and sourceLevel, three skill IDs, growth ranks, pact metadata. Trainer uses profile attributes; owned level is derived from active XP and capped at60.

Use id for ownership/build/progress; use type for shared content/art. Never key individual mutations only by display name or species. Keep Lv61–100 wild provenance separate from the Lv60 owned-state ceiling, and never discard deferred legacy XP.

Relevant features: [growth](<../../features/growth/README.md>), [party](<../../features/party/README.md>), [content](<../../features/content/README.md>), [collection](<../../features/collection/README.md>), [persistence](<../../features/persistence/README.md>), [combat](<../../features/combat/README.md>).

<a id="interface-4"></a>
### Spawn life / reservation: profile.js

Map population slot identifies a resident slot; saved life, position, seed, roll and readyAt identify its current incarnation. Encounter reservation records build/profile/seed/supplies/tick.

Preserve the incarnation and reserved inputs across reload/retry. Completion/kill receipts prevent paying that accepted life twice locally.

Relevant features: [population](<../../features/population/README.md>), [persistence](<../../features/persistence/README.md>), [campaign](<../../features/campaign/README.md>), [combat](<../../features/combat/README.md>).

<a id="interface-5"></a>
### View invalidation signals

bond-profile and bond-growth from profile.js; bond-art-ready from character-rig.js; bond-creation-art-ready from apprentice-preview.js. Current consumers reread state; no command payload.

Do not use these signals to infer a reward or pass mutable battle state. Add producer/consumer contracts before introducing new signals.

Relevant features: [shell](<../../features/shell/README.md>), [persistence](<../../features/persistence/README.md>), [animation](<../../features/animation/README.md>), [party](<../../features/party/README.md>), [collection](<../../features/collection/README.md>), [exploration](<../../features/exploration/README.md>), [opening](<../../features/opening/README.md>).

<a id="interface-6"></a>
### Space/time units

Battle coordinates use arena units; navigation/geometry use world units; rendering projects to CSS/device pixels. Combat event deadlines use battle seconds.

Convert at presentation boundaries only. Resizing, playback speed, camera zoom and reduced motion must not change deterministic outcomes.

Relevant features: [combat](<../../features/combat/README.md>), [world](<../../features/world/README.md>), [exploration](<../../features/exploration/README.md>), [animation](<../../features/animation/README.md>).

