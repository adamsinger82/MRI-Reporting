# MSK Dictation Dictionary — Working List

Scratchpad for terms to add, tune, or retire in `mskDictionaryData.js`.
This file is documentation only — nothing here affects the app until it is moved
into `MSK_DICTIONARY`.

---

## Reconciliation note (2026-08-21)

This feature was originally designed and built two sessions ago. Those output
files were never saved into this Claude Project, so an earlier session this
same day rebuilt the dictionary from scratch (106 reseeded entries) working
only from a screenshot description. Adam then located and uploaded the
**actual original files** (`mskDictionaryData.js`, `mskDictionaryUtils.js`,
this worklist) from that prior session.

The original files are now restored as canonical — they are more mature than
the rebuild in every respect: capitalization-preserving replacement,
longest-garble-first matching, a strict boost-10 Stage-1 gate, a
`BOOST_LEGEND` sent to the model, a `MSK_DICTIONARY_WATCHLIST` for
not-yet-promoted candidate terms, a `summarizeDictionary()` debug helper, and
~156 seeded entries vs. the rebuild's 106.

**What was merged in from the rebuild** (16 entries the original didn't have,
plus two corrections):
- `Baastrup` → renamed **`Baastrup's disease`** and merged with the "bass
  drops disease" family of heard-forms (these match an existing standing
  correction rule already hardcoded directly in `page.js`'s `buildPrompt()`).
- `supraspinatus` / `infraspinatus` → boost raised **9 → 10** and
  `"supraspinous"` / `"infraspinous"` added to `heard[]` (page.js already
  treats these as unambiguous in a shoulder-exam context).
- New entries: `genu valgum`, `genu varum`, `tibial plateau`, `chondral flap`,
  `quadriceps tendon` (knee); `subcoracoid`, `biceps pulley`,
  `sublabral foramen` (shoulder, `auto:false`); `trochanteric bursitis`,
  `os acetabuli` (hip); `syndesmosis`, `talar dome`,
  `spring ligament` (foot, `auto:false`); `Guyon canal`, `pisotriquetral`
  (wrist); `annular ligament` (elbow).

**`page.js` wiring was also corrected** during this reconciliation:
`applyHardCorrections()` in the *authentic* file returns
`{ text, corrections }`, not a plain string (the rebuild's version returned a
plain string, and `page.js` had been wired to match the rebuild). The call
site now reads `applyHardCorrections(dictationText, selectedBodyPart).text`.

Current total: **172 entries** in `MSK_DICTIONARY` (156 original + 16 merged)
plus 4 in `MSK_DICTIONARY_WATCHLIST`.

---

## Boost scale (quick reference)

| Boost | Meaning | When to assign |
|---|---|---|
| **10** | Lock — deterministic replace runs before the model | Eponyms and orphan anatomy with no English homophone: Schmorl, Lisfranc, Kienböck |
| **9** | Near-lock | Real MSK word, garble is nonsense: *enthesopathy*, *tenosynovitis* |
| **7–8** | Strong | Term wins whenever the sentence is anatomic |
| **5–6** | Moderate | Fix clear errors only |
| **3–4** | Nudge | Fix only if surrounding words are nonsense |
| **1–2** | Watch | Logged, never corrected — parking lot for candidates |

**The `auto: false` flag matters more than the boost number.** Set it whenever a
garbled form is also legitimate English ("animal", "second", "tofu", "fecal",
"small node"). Those entries keep their high boost but skip the blind
find-and-replace and are handled contextually by the model instead. Getting this
wrong is the one way this system can make a report *worse*.

---

## Capture workflow

1. **Catch it.** Dictate normally. When a term comes out wrong, copy the exact
   garbled string — not what you meant, what the engine actually printed. The
   literal string is the whole value of the entry.
2. **Log it below** under *Inbox*, with the joint you were reading.
3. **Triage weekly.** Assign a boost + `auto` flag, move into
   `mskDictionaryData.js` under the right `scope`.
4. **Re-dictate the same phrase** to confirm the fix. If it still fails, the
   garble string was probably slightly different — add the new variant to the
   same entry's `heard` array rather than creating a duplicate entry.

> Add variants to an existing entry before creating a new one. Two entries for
> the same term will both fire and can produce a double replacement.

---

## Inbox — caught in the wild, not yet triaged

| Garbled output (verbatim) | Intended term | Joint | Date |
|---|---|---|---|
| | | | |
| | | | |

---

## Candidates — terms I expect to break but haven't caught yet

- Sacroiliac joint subtypes (iliac vs sacral side)
- Ischial tuberosity / hamstring origin avulsion
- Sternoclavicular, costovertebral, costotransverse
- Interosseous membrane (forearm, leg)
- Talar dome osteochondral lesion — laterality/quadrant phrasing
- Retrocalcaneal vs retro-Achilles bursa
- Bone marrow lesion vs marrow replacement (distinct — do not merge)

---

## Tuning log — boost changes and why

| Term | Old | New | Reason | Date |
|---|---|---|---|---|
| Baastrup's disease | `Baastrup`, boost 10 | Renamed to `Baastrup's disease`, boost 10, heard[] merged | Reconciliation merge — matches page.js's existing standing correction rule and canonical output phrasing | 2026-08-21 |
| supraspinatus | boost 9 | boost 10, `"supraspinous"` added to heard[] | "supraspinous" is unambiguous in a shoulder-exam context; page.js already treats it as a standing correction | 2026-08-21 |
| infraspinatus | boost 9 | boost 10, `"infraspinous"` added to heard[] | Same as above | 2026-08-21 |

---

## Retired / demoted

Terms pulled back because they caused false corrections. Keep the reason —
prevents re-adding the same mistake later.

| Term | What went wrong | Action taken |
|---|---|---|
| | | |

---

## Known collisions to watch

These pairs are phonetically close but clinically distinct. Never let one
auto-correct into the other.

- **physeal** ↔ **thecal** ↔ **fecal** — all three can render nearly
  identically. Disambiguate by what follows: "...sac" → thecal; "...plate" /
  growth-plate context → physeal; bowel/stool context → fecal (rare in MSK
  dictation, but possible on an incidental finding). Note: "fecal sac" is
  folded into the `thecal sac` entry's `heard[]` at boost 10 (auto) because a
  true "fecal sac" reading is vanishingly rare in an MSK spine dictation
  context; the standalone single-word `physeal` entry stays `auto:false`
  because "fecal" alone is far more ambiguous.
- **popliteus** ↔ **popliteal** — two different real structures (a
  muscle/tendon vs. a fossa/artery/vein region). Never swap one for the
  other; preserve whichever the dictation actually said.
- **tendinosis** ↔ **tendinitis** — clinically distinct (degenerative vs.
  inflammatory) and NOT interchangeable. Never auto-correct one to the
  other — report whichever the radiologist actually dictated.
- **scaphoid** ↔ **scapula** — different bones entirely (wrist vs. shoulder
  girdle); only disambiguate by scope/context, never blind-replace.
- **Segond** ↔ **second** — "second" is one of the most common words in
  English. Only correct to "Segond" for a described lateral tibial rim
  avulsion / ACL injury pattern.
- **Schmorl node** ↔ **small node / lymph node** — only correct in a
  vertebral body/endplate context.
- **foraminal** ↔ **animal / formal** — "animal" and "formal" are ordinary
  English. Only ever correct to "foraminal" when it directly precedes
  stenosis/narrowing language in a spine canal/nerve-root context.

If you find a new collision in the wild, add it here **and** mark the
corresponding `mskDictionaryData.js` entry `auto:false` with a `note`
explaining it — both places, not just one.

---

## Current coverage (as of the 2026-08-21 reconciliation)

| Body part | Entries |
|---|---|
| global | 41 |
| spine | 25 |
| shoulder | 24 |
| knee | 29 |
| hip | 13 |
| foot (incl. ankle) | 20 |
| wrist (incl. hand) | 13 |
| elbow | 7 |
| **Total** | **172**, plus 4 in `MSK_DICTIONARY_WATCHLIST` (Bosniak, Kohler disease, Maffucci syndrome, Milwaukee shoulder — boost 1-2, not yet promoted) |

Run `summarizeDictionary()` (exported from `mskDictionaryUtils.js`) any time
for a live count instead of trusting this table — it will drift as entries
are added.
