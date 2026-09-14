# Inner Sea display and earned decorations

Party & bag → Inner Sea contains one fixed scene, two companion display positions,
three decoration sockets and Dawn/Dusk skies. Arrange scene creates a draft;
Save commits the full layout, Cancel/Escape discards it. The portrait picker
selects owned individual IDs; two copies of a species are legal, the same
individual twice is not. Display choices are independent of the combat party.

`inner-sea-rules.js` owns pure eligibility/normalization. Additive `profile.haven`
version1 stores style, three slots and two individual IDs inside the existing v7
local save. `BondProfile.setHaven` validates and commits it critically; a failed
write preserves the prior scene and all items. Old saves get empty slots. No
account schema or future paid entitlement import is established by this field.

## Local earned sources

| Decoration | Existing progress fact |
| --- | --- |
| Trail cairn | At least one accepted wild kill |
| Echo lantern | At least one successful summon |
| Traveler’s bloom | Three discovered landmarks |

Eligibility is derived from local progress, so old saves receive the same
options without a second claim or duplicate grant. Eligible decorations can be
reused in multiple sockets. Both skies are free defaults. These are reversible
local reference rewards; no currency cost, paid catalog, stat, RNG, AFK output,
walking, public visiting or housing system exists.

## Scene and export boundary

`inner-sea.js` draws the same canvas used by Save picture. It reuses existing
CharacterRig portraits and original code-drawn scenery/decorations. Async image
loads are guarded by render tokens; late work cannot paint over a newer draft.
The portrait cache retains at most eight entries, instead of retaining the whole
decoded roster after browsing. Appearance changes use their actual image/SVG key.
Missing portraits produce an error and prevent a blank PNG download; retry is
available. Export is a local PNG, with no account ID, player name, private email
or upload. The display remains a reference layout, not final art acceptance.

Checks: `python tests/experience_check.py --browser chrome`. Includes empty
ownership, locked/foreign inputs, independent copies, cancel, failed writes,
reload, actual PNG export, responsive controls and combat invariance. Cloud
ownership, paid grants, cross-device recovery and final visual acceptance remain
in F-032 and the owner gates, not fulfilled by local decoration persistence.
