# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EDDI TCG — a browser-based Trading Card Game rendered with Three.js (WebGL) and written in TypeScript. The app uses `THREE.OrthographicCamera` for 2D-style card layout; there is no React/DOM UI framework — all interactive UI elements are textured meshes.

The repository is on branch `structure-refactoring` and is **actively being reorganized**. Read the architecture sections below before touching feature code — much of `src/` does *not* yet follow the target shape, and new code must.

The refactoring backlog lives in `docs/refactoring/`. `INDEX.md` is the ticket table; `RULES.md` holds the working rules the backlog was written under. **Read `RULES.md` before proposing structural changes** — it records decisions that look arbitrary out of context.

---

## Architecture principle

**The directory structure is a physical representation of dependency boundaries.**

The goal is not a clean-looking folder tree. The goal is to make responsibilities and dependency direction visible and *mechanically verifiable*.

- **Upper-level directories represent responsibility boundaries.**
- **Lower-level directories represent functional slices.**

Do not collapse or rearrange directories for tidiness. **A boundary that can be checked mechanically should be checked mechanically** — those are the ones that survive.

Not every boundary is mechanically checkable. Whether an aggregate really owns the order of a user action, whether an event states a fact rather than a presentation instruction, whether two pieces of code change for the same reason — those need judgment. The rules in `docs/refactoring/RULES.md` exist for exactly those.

## Battle architecture

`src/battle/` is the reference for the target shape. It is cut first by responsibility, then by feature.

```
src/battle/
├── domain/          Game rules and state. Pure — no THREE, no window, no randomness, no clock.
│   ├── battle/      The Battle aggregate: one match and its consistency boundary
│   ├── ability/     Card ability definitions: what a card targets, and the values written on the card
│   ├── flow/        Commands, Events, and the handler that applies them
│   ├── system/      Rules that sweep unit state, not cards
│   ├── read/        What the screen is allowed to see, in the user's own terms
│   ├── part/        State attached to a unit          (create when actually needed)
│   └── card/        One card per file                 (create when actually needed)
│
├── session/         The currently active battle, held in memory
│
├── simulation/      The starting board the verification screen opens with —
│                    replaced by server-provided state when the network path arrives
│
└── ui/              Everything that draws
    ├── animation/   Skill-slot position, attack choreography, per-card effects
    ├── hand/ field/ field_energy/ zone/ unit/ turn/ active_panel/ master_hp/ card_grid_popup/
    │       each: frame/ · renderer/ (and interaction/ · page/ · entity/ where needed)
    └── view/        Assembly: input → Command, Event → presentation / effect
```

This is the shape on disk as of R2-109. The two `domain/` subfolders marked *create when
actually needed* do not exist yet.

`system/` is the one that arrived: `flow/` answers *what does this card do*, `system/` answers
*what does this mark on a unit do*. A rule belongs in `system/` when it reads a unit's status
and never looks at which card was played — dark flame ticking each turn, freeze thawing,
a mark carried onto whoever gets hit. Card count grows; `system/` does not.

`read/` is the only way the screen sees battle state. It hands back plain records — never a
`FieldCard`, never a `HandCard` — so a screen cannot walk into a domain object and start
reading its internals. Name its methods after what the player calls things (`opponentUnit`,
`isYourTurn`, `yourTombCards`), not after how the aggregate stores them.

Do **not** create them preemptively. Declare where something belongs; build the folder when a real requirement arrives.

### Domain battle flow

How the aggregate itself runs. This says nothing about *where* it runs.

```
input
  ↓  Command
Battle (aggregate)
  ├ reads state
  ├ applies rules
  ↓  Event
```

### Client presentation flow

```
confirmed result / state
  ↓
read model / presentation state
  ├─(a) → layout → Renderer → THREE
  └─(b) → Effect (owns its own meshes and its own timeline)
```

**There are two read paths, and they must stay separate.** Values determined by state (hp numbers, energy counts, card positions) go through (a). Time-based choreography (explosions, screen shake, projectiles) goes through (b). Forcing effects through (a) makes the Renderer an animation scheduler.

## Battle authority

**In a real match, the server is authoritative for battle state and rule execution.**

The client does not re-run battle rules to correct, complete, or reproduce the server's result. It receives the confirmed result and presents it.

```
                    REAL MATCH
                      server
                        │
                authoritative Battle
                        │
                 result / state
                        │
                     network
                        ↓
                      client
                        │
             ┌──────────┴──────────┐
             ↓                     ↓
      read model / state      what happened
             ↓                     ↓
         UI Entity                Effect
             ↓                     ↓
           Frame                timeline
             ↓                     │
         Renderer                  │
             ↓                     │
           THREE ←─────────────────┘
```

The client may play a result out over time, but **the animation must not change battle state.** The result is already true before the effect starts.

**After receiving a fact, the client must not re-run game rules on it to decide new state.**

Reflecting a received fact is exactly what the client is for. Two energy drained → draw fewer icons. Unit defeated → hide it on the field, show it in the tomb. That is presenting the result.

What is forbidden is the step after: *"defeated, so it should go to the tomb, so it should leave the field, so this other effect fires too."* That is computing. Calling `sendToOpponentTomb()` or `removeFromOpponentField()` as battle operations makes the client authoritative by the back door — and the two sides disagree the moment a rule changes on one of them.

The other direction exists too, and its meaning is fixed even though its shape is not:

```
client
  ↓  player intent
server
  ├ validates the intent
  ├ reads battle state
  ├ applies rules
  └ produces a confirmed result / state
       ↓
     client
       ├ presentation state
       └ effects
```

**A Command describes player intent. It is not a network message.** `Command` ≠ WebSocket frame ≠ HTTP request. How that intent reaches the server, and how the result crosses back — snapshot or delta, event log or state dump — is **not decided yet**. Only the location of authority and the direction of meaning are fixed. Do not invent a transport shape ahead of a real requirement (see Rule 27 in `docs/refactoring/RULES.md`).

### Simulation / verification mode

`src/battle/ui/view/SimulationBattleFieldView.ts` is currently the battle verification screen, and it is reachable from the lobby through the test-battle entry.

Its local battle setup — seeding decks, hands, zones, and the opponent field — lives in
`src/battle/simulation/` and exists to give a self-contained environment where the battle UI can
be verified without a server. It is one call from the view, not lines scattered through the
drawing code, so the network path removes it by deleting that call. **This does not define the authority model of a real match.** When the network battle path arrives, server-provided state and results replace that simulation-only initialization.

Two things that look alike are not the same:

| | |
|---|---|
| Setting a starting state up locally so the screen can run | expected today, replaced later |
| Re-running battle rules on the client to follow up on a result | never correct |

Do not treat "it is the simulation screen" as licence for client UI to own battle rules.

### Expressing a result is not re-running the rules

This is the distinction that matters most in UI code.

```
defeated
  ↓
client calls sendToOpponentTomb() / removeFromOpponentField()     ✗ re-running the rules
```

```
defeated
  ↓
read model says: not on the field, in the tomb                    ⭕ projecting the result
  ↓
death effect plays for two seconds                                ⭕ presenting it over time
```

The client may show anything the result implies. It may not *derive and apply* the follow-up state changes itself.

### The swappable seam is a consequence, not a goal

The battle screen is not going to be duplicated into "verification" and "real match" copies. Card drawing, field, hand, zones, HUD, input, selection, effects and resize are identical either way — two copies would drift, and one of them would be the one nobody fixed.

What differs is only who computes the battle. So the objective is:

> Keep the screen's presentation responsibility. Remove its responsibility for computing the battle and for applying battle consequences. The same screen then works against a server.

Do not start by building a `BattleProvider` / `BattleAdapter` / `BattleRunner` abstraction. Put the responsibility back where it belongs first; the swappable point appears on its own, and its shape gets decided when something is actually swapped in.

## Dependency boundaries

**`domain` does not know `ui`. `ui` and `domain` meet only through contracts.**

At runtime, interaction flows from the UI into the domain and back out through contracts. That is a statement about flow, not a licence for the UI to reach into domain types — where Command / Event / ReadModel physically live is not settled yet, and the UI never handles domain objects directly either way.

`npm run check` runs the typecheck and every boundary rule below that is mechanical.
The **Checked by** column names the rule; blank means a human has to notice.

| From | To | Allowed | Checked by |
|---|---|---|---|
| domain | ui / session | ✗ | `domain-no-ui` |
| domain | THREE | ✗ | `domain-no-three` + purity script |
| domain | window / browser | ✗ | |
| domain | `Math.random` / `Date.now` | ✗ | purity script |
| ui | domain object (aggregate, part, session) | ✗ | `ui-no-domain-object` |
| ui | domain state mutation | ✗ | |
| ui | contract (Command / Event / ReadModel) | ⭕ | |
| presentation state (`frame/`) | THREE | ✗ | `frame-no-three` |
| renderer | THREE | ⭕ | |
| effect | domain state mutation | ✗ | |
| UI | applying a state change it inferred from an event | ✗ | |
| simulation harness | building a starting state locally | ⭕ | |

`ui-no-domain-object` has **no exceptions left** — as of R2-113 nothing under `src/battle/ui/`
touches a domain object. Do not add one back. `src/battle/simulation/` is outside that rule on
purpose: building a starting state locally is the one allowed way to hand the domain raw objects,
and it lives in its own folder so the allowance cannot leak into drawing code.

### What may cross each boundary

| Boundary | May carry | May not carry |
|---|---|---|
| **Command** (outside → battle) | The user's intent and the input needed to identify it | Values the domain can compute (damage, cost), THREE, screen coordinates |
| **Event** (battle → outside) | A fact that actually happened; before/after values where meaningful | How to show it, how long it takes |
| **ReadModel** (battle → UI) | Terms the user knows — my hand, opponent field, whose turn, what I can do now | Parts, session internals |
| **Effect input** | What happened, and where to draw it | Domain objects, and any state mutation |

`Effect(unitEntity)` is wrong. `Effect(unitDamagedEvent)` is right.

`scripts/check-domain-purity.js` enforces the THREE/random/clock rules over `src/battle/domain`; `.dependency-cruiser.js` enforces the import-direction rules. Both run from `npm run check`.

### Where a value belongs

**Fixed facts live in the definition. Facts that persist during a battle live in state. Values derived from the current situation are decided by rules. Facts a rule needs must be obtainable inside the domain.**

| What | Where | Example |
|---|---|---|
| Fixed fact | card definition | base attack, skill base damage, kind, grade, race — values printed on the card |
| Persisting fact | state on the unit | current hp, frozen, dark flame — with its expiry if it has one |
| Derived value | computed by a rule | effective attack |

Do not cache a derived value as state. Do not store the same truth in two places. Do not flatten every modifier into a number — a conditional bonus ("+5 while holding energy") is a rule, a timed bonus ("+5 this turn") is state; decide by the effect's lifetime and meaning.

## Battle session

`src/battle/session/` holds the currently active battle in memory. It offers `start` / `restore` /
`send` / `read` / `getCurrent` / `end`.

**Whoever holds the battle runs its rules.** `send(command)` applies a command and returns the
events; `read()` hands out the ReadModel. The screen never constructs a `BattleCommandHandler`
and never calls `handle` — it does not know where the rules run. That is the swappable point,
and it appeared because the responsibility moved, not because an adapter was designed for it
(Rule 27). When the network battle path arrives, `send` is what changes; its callers do not.

**It is not a persistence repository.** If persistent storage is introduced later, create a separate boundary for it. Do not rename or reuse `session` for persistence.

`repository/` is **not** a universal directory requirement. Use one only when the concept really is persistence-oriented retrieval and storage.

---

## UI architecture: Entity + Frame + Renderer

E+F+R is **not** the whole architecture. It is the rule for turning state into pixels, and it applies inside `ui/` only.

```
Entity   — the data being drawn. MUST NOT import THREE.*.
           NOT the same thing as a domain Entity. See the warning below.

Frame    — presentation state: what this thing looks like right now.
           MUST NOT import THREE.* (Vector2d is fine; THREE.Vector2 is not).

Layout   — layout spec as pure values: { anchor, offset, widthRatio, aspect, renderOrder }.
           Most existing `frame/` folders actually hold this.

Renderer — the ONLY place that constructs THREE.Object3D.
           build(entity, layout) → THREE.Group
           update / resize / dispose
```

**The `Entity` in E+F+R does not mean a domain Entity.** This rule does not permit the UI to receive domain objects. Where the UI needs domain data, it comes through a ReadModel.

A UI Entity may be *built from* a ReadModel. It must never *be* a domain Entity.

```
domain Entity  ──✗──▶  UI          never handed over directly
domain         ──▶  ReadModel  ──▶  UI Entity  ──▶  Frame  ──▶  Renderer  ──▶  THREE
                                       (+ Layout)
```

Shared types live at:

- `src/core/frame/` — `Anchor`, `SlotSpec`, `Frame` base
- `src/core/renderer/` — three Renderer interface variants:
  - `EntityRenderer<E, F>` — `build(entity, frame) → THREE.Group`. For domain-bearing meshes (cards, units).
  - `FrameRenderer<F>` — `build(frame) → THREE.Group`. For static THREE.js chrome (background, field area).
  - `DomFrameRenderer<F>` — `build(frame) → HTMLElement`. For HUD overlays in the DOM layer (field-energy HUD, turn counter, sand timer, guide messages). The Renderer owns DOM creation + resize recalculation + removal.

### Anything drawn must follow the window

Every renderer that sizes from the viewport needs a `resize`, and something must call it. This has been the single most common bug class in this repo. When you add anything that draws:

- Wire its `resize` into the view's resize handler.
- Invisible things count — hit areas and targeting regions must follow the window too.
- A neon border reads the size of what it wraps *at attach time*; re-attach it when that size changes.
- Effects hold their meshes in an `EffectLayer` so one group scales with the window.
- A tween's destination must be re-read while in flight (`CardMove` takes a function), or a card resized mid-animation lands in the old place.

### Reference implementation: `test/draw_field_energy_full_efr/`

This is the canonical verification screen. It runs `SimulationBattleFieldView` — the same view users reach from the lobby — so anything that works there works for users. When adding or refactoring a battle feature, verify it here.

`test/draw_simple_efr/` remains as the minimal E+F+R sample (one unit: card + weapon + hp + energy + race).

Renderers load textures with their own `THREE.TextureLoader` using the same settings as `LegacyNonBackgroundImage`/`NonBackgroundImage`: `SRGBColorSpace` + `LinearFilter` min/mag + `generateMipmaps: false`.

---

## Migration rules

Rules differ by boundary. Do not apply E+F+R to domain code.

### Domain

- Domain code does **not** follow E+F+R. It holds game rules and state.
- No THREE, no `window`, no `Math.random`, no `Date.now`. `scripts/check-domain-purity.js` checks this.
- Randomness comes in as a seed from outside (`SeededRandom`).
- The aggregate receives one user action and processes it to the end, returning events. It is not a container that others reach into.

### UI

- New UI code follows E+F+R.
- **Touch-migrate the slice you edit.** If you're editing a service that constructs meshes, split out a Renderer as part of that change — don't add one more mesh to the service.
- **Preserve texture settings.** `SRGBColorSpace` + `LinearFilter` min/mag + `generateMipmaps: false`. Do not route card/unit rendering through `TextureManager.getTexture()` — it preloads with `LinearSRGBColorSpace` + `LinearMipMapLinearFilter` + mipmaps, which makes TCG pixel art blurry. Ask before changing.
- **Do not add new singletons** (`getInstance`) to Renderer, Frame, or Layout code — they are stateless. Services and repositories are already pervasively singleton; don't grow that number.

### Animation and effects

- Effects are time-based choreography. **They never mutate domain state.**
- State changes before the effect is awaited. The truth is already updated while the effect plays it out over two seconds.
- Effects receive events, not domain objects.
- Effects may overlap. Anything that resets shared state at the end — the scene shake position, for instance — must count how many are running and only restore on the last one.

### Deleting

- **Reachability is measured, not guessed.** Walk imports from every entry point — `src/client/main.ts` plus every harness in `package.json`. Counting by name gives wrong answers.
- Delete dead code *before* moving things. Otherwise dead code gets relocated and becomes harder to spot.
- `.d.ts` files have no importer but are still used.
- After deleting, typecheck and build every remaining harness.

### Known anti-patterns to expect in current code

These are the migration backlog, not the pattern to copy:

These numbers were measured on the date of the last update and go stale as the migration proceeds. Re-measure before relying on them.

- `src/battle/ui/view/SimulationBattleFieldView.ts` is ~4,230 lines. It constructs meshes in 17 places, holds card ordering and pending-selection state, and branches per card. Splitting it is planned; do not add to it casually.
- The screen mutates battle state directly in 18 places, bypassing commands. Eight of those are the simulation harness building a starting state, which is fine there. Most of the rest are cards the battle does not handle yet — 차갑게 불타는 암흑 에너지, 시체 폭발, 네더 블레이드 — so the screen computes them instead. Those move in R2-102 through R2-105.
- The screen reads inside the battle in 58 places. There is no read model yet.
- `card/unit/generate.ts`, `card/support/generate.ts`, `card/item/generate.ts`, `card/energy/generate.ts` are a parallel rendering pipeline slated for absorption. Don't add new card-building logic there.
- `*_position/` feature folders are proto-layouts: they hold layout values but are named "Position".

---

## Before merging code that looks similar

**Do not merge two things because they look the same today. Ask whether they change for the same reason.** If they will change for different reasons, keep them separate even when the code is currently identical.

Similarity is not sufficient evidence for consolidation. Merge only when all four hold:

1. the concepts have the same responsibility,
2. they change for the same reason,
3. no known future requirement distinguishes them,
4. the merged abstraction *reduces* change propagation rather than increasing it.

Only 14 of the 100 cards in `src/common/every_card_info.js` are implemented. Code that looks duplicated is often duplicated *because the differentiating cards are not built yet*. Look for the eventual requirement in the card descriptions, not in the code.

Worked example — `src/battle/ui/zone/`:

- `YourTombPanelRendererV2` and `OpponentTombPanelRendererV2` differ by 7–28 lines once names are normalized. Tempting to merge.
- But card #33 (시체 폭발) sends **allied** units to **your** tomb, and card #17 (해골 군주 레오닉) sends the **opponent's** hand to the **opponent's** lost zone. Thirteen cards touch tomb or lost zone, and they distinguish the two sides.
- Merging now means adding conditionals or re-splitting when those cards land.

Cost asymmetry: keeping two copies costs two edits. Merging wrongly costs a conditional branch plus every future change to one side dragging the other along. **The wrong merge is more expensive than the duplication.**

The converse also holds: **do not add structure before a real difference appears.** One new card does not justify a new layer.

---

## Commands

- `npm run dev` — the game (`src/client/webpack.dev.js`). Entry is `src/client/main.ts`, which mounts the router.
- `npm run <scenario>` — every other script boots an **isolated webpack-dev-server** against a scenario under `test/<scenario>/` with its own `config/webpack.{common,dev}.js` and `index.html`. These are the project's verification screens — there is no Jest/unit-test runner. `npm test` is a stub that exits 1.
- `npm run draw-field-energy-full-efr` — the canonical battle verification screen.
- When adding a feature, add a matching `test/<feature>/` scenario and script entry rather than a unit test — unless an existing screen already covers it. Prefer extending `draw_field_energy_full_efr` over adding a screen that shows a subset of it.

Resource pipeline tools live in `python/useful_tool/` (CSV→JS card data conversion, image-paths JSON generation, image resizing to power-of-two). Place source CSVs there before running them.

## Routing (SPA without a framework)

`src/router/` implements a hand-rolled SPA router:

- `routes.ts` — array of `{ path, getComponentInstance(rootElement, routeMap) }`. Paths: `/tcg-main-lobby`, `/tcg-card-shop`, `/tcg-simulation-battle-field`, `/tcg-my-card`.
- `RouteMap.ts` — holds the active `Component`, calls `hide()` on the old and `show()` on the new. It does **not** call `initialize()` — `show()` must handle first-time setup.
- `Component.ts` — every top-level view implements `initialize/show/hide/animate` and exposes a `getInstance(rootElement, routeMap)` singleton factory.

A view must hide **both** its own canvas and the shared container in `hide()`, and restore each appended element's original `display` value in `show()` — setting `display = ''` wipes `flex`.

When adding a screen: implement `Component`, expose `getInstance`, add a route entry, register with `routeMap.registerRoutes(routes)`.

## TypeScript / build config that matters

- Path alias: `@resource/*` → `./resource/*` (tsconfig `paths`). Asset imports like `import bgm from '@resource/music/.../x.mp3'` rely on this.
- `.mp3` imports are typed via `declarations.d.ts`. `src/common/every_card_info.d.ts` types the generated card data.
- `strict: true`, ES6 modules, target es2017, `skipLibCheck: true`, types include `three` and `node`.
- Tweening comes from the `@tweenjs/tween.js` package via `installTween()` in `src/core/tween/Tween.ts`, not from a CDN `<script>`.
- Dev servers set `static.watch: false` — watching the repo root caused constant reloads.
- Every scenario webpack config outputs `bundle.js` and the top-level `index.html` loads `./bundle.js` from the current directory, so only one scenario runs at a time.

## Resources

`resource/image-paths.json` is the manifest consumed by `TextureManager.preloadTextures(...)`. `python/useful_tool/image_resource_to_json_convert.py` generates it. `resource.zip` is the bundled asset archive — everything under `resource/` is gitignored (png/jpg/mp3/ttf/otf/webp/csv/xlsx/json), so expect to unzip `resource.zip` in a fresh checkout.

## Feature-per-directory layout outside `src/battle/`

`src/` has ~180 top-level feature folders (`my_deck_card`, `card_filter_panel`, `global_navigation_bar_button_click_detect`, …) for the lobby, shop, my-card and deck-building screens. This flat naming is intentional — features are sliced by concept, not nested by layer.

Those screens have **not** been migrated. Expect entities holding `THREE.Mesh`, services constructing meshes, and heavy singleton use. Follow the target shape for new code there, but a full migration is out of the current scope.

Click/hover detection is usually its own sibling feature (e.g. `deck_card_add_button` + `deck_card_add_button_click_detect` + `deck_card_add_button_position`). When adding behavior to a button, look for the matching `_click_detect` / `_hover_detect` / `_position` / `_effect` folders rather than piling it into the button folder.

## Conventions

- Korean inline comments are common and expected; don't translate or strip them during unrelated edits.
- Views and most services are singletons via `getInstance(...)` — don't `new` them from outside their module. New Renderer/Frame/Layout code is an exception; keep those stateless.
- Prefer editing an existing feature folder over creating a new one when a concept already has a slice.
- Write docs and backlogs in words a non-developer can read. Avoid jargon that reads as something else (회귀 reads as "roll back"; use 동작 확인). Attach a referent to every number — `저장소 8개` is unusable, `저장소 파일 8개 (네 폴더가 각각 인터페이스와 구현체를 하나씩)` is. List the items instead of counting them when there are more than two. See `docs/refactoring/RULES.md` (규칙 10~12).
- Backlog documents follow a fixed shape: `# [ETWGL-R2-N] title`, then `Success criteria`, `To-do` (max 5 numbered top-level items), `Issue`, `Review`. Copy the most recent one rather than inventing a format.
- Ticket titles start from what the user does, not from class or function names.
