# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EDDI TCG — a browser-based Trading Card Game rendered with Three.js (WebGL) and written in TypeScript. The app uses `THREE.OrthographicCamera` for 2D-style card layout; there is no React/DOM UI framework — all interactive UI elements are textured meshes.

The repository is on branch `structure-refactoring` and is **actively being reorganized toward an Entity + Frame + Renderer (E+F+R) architecture**. Read the architecture section below before touching feature code — many existing files do *not* yet follow the target shape, and new code must follow it.

## Commands

- `npm run dev` — main webpack-dev-server entry (`src/client/webpack.dev.js`).
- `npm run <scenario>` — every other script in `package.json` boots an **isolated webpack-dev-server** against a scenario under `test/<scenario>/` with its own `config/webpack.{common,dev}.js` and `index.html`. These are the project's test harnesses — there is no Jest/unit-test runner. `npm test` is a stub that exits 1.
- When adding a new feature, the established pattern is to add a matching `test/<feature>/` scenario and a script entry rather than a unit test.
- `npm run draw-simple-efr` (once wired) is the **canonical E+F+R reference scenario** — see below.

Resource pipeline tools live in `python/useful_tool/` (CSV→JS card data conversion, image-paths JSON generation, image resizing to power-of-two). Place source CSVs in that directory before running them.

## TypeScript / build config that matters

- Path alias: `@resource/*` → `./resource/*` (tsconfig `paths`). Asset imports like `import bgm from '@resource/music/.../x.mp3'` rely on this.
- `.mp3` imports are typed via `declarations.d.ts`.
- `strict: true`, ES6 modules, target es2017, `skipLibCheck: true`, types include `three` and `node`.
- Every scenario webpack config outputs `bundle.js` and the top-level `index.html` loads `./bundle.js` from the current directory — webpack-dev-server serves each scenario's bundle in-memory, so only one scenario runs at a time.

## Target architecture: Entity + Frame + Renderer

The intended layer responsibilities are:

```
Entity   — pure domain data. id / stats / refs (IDs) / logical position (Vector2d).
           MUST NOT import THREE.*. No meshes, textures, groups, geometries.

Frame    — layout spec as pure values. { anchor, offset, widthRatio, aspect, renderOrder }.
           A parent Frame is a composition of child SlotSpecs (e.g. UnitFrame = {card, weapon, hp, energy, race}).
           MUST NOT import THREE.* (Vector2d is fine; THREE.Vector2 is not).

Renderer — the ONLY place that constructs THREE.Object3D.
           build(entity, frame, resourceManager): THREE.Group
           update(entity, frame, group): void     // resize / state change
           dispose(group): void
           Reads from Frame; does not re-invent layout math.

Scene    — thin wrapper around THREE.Scene + a Group registry. add(group) / remove(group).
           MUST NOT construct meshes or calculate layout.

Service  — orchestration only: load data → call Renderer.build → hand the Group to Scene.
           MUST NOT call `new THREE.Mesh/Group/Geometry/Material` directly.
```

Shared types live at:

- `src/core/frame/` — `Anchor`, `SlotSpec`, `Frame` base
- `src/core/renderer/` — three Renderer interface variants:
  - `EntityRenderer<E, F>` — `build(entity, frame) → THREE.Group`. For domain-bearing meshes (cards, units).
  - `FrameRenderer<F>` — `build(frame) → THREE.Group`. For static THREE.js chrome (background, field area).
  - `DomFrameRenderer<F>` — `build(frame) → HTMLElement`. For HUD overlays in the DOM layer (field-energy HUD, turn counter, sand timer, guide messages). The Renderer owns DOM creation + resize recalculation (font size, absolute offsets) + removal.

### Reference implementation: `test/draw_simple_efr/`

`draw_simple_efr` is the **canonical pilot** — a single battle-field unit (card + weapon + HP + energy + race) rendered via pure E+F+R. When refactoring an existing feature or adding a new one, mirror this scenario's shape. It uses:

- `src/battle_field_unit/entity/BattleFieldUnit.ts` (already pure, treat as the entity gold-standard)
- `src/battle_field_unit/frame/UnitFrame.ts` (new — composes five `SlotSpec`s)
- `src/battle_field_unit/renderer/BattleFieldUnitRendererV2.ts` (new renderer — loads textures with its own `THREE.TextureLoader` using the same settings as `LegacyNonBackgroundImage`/`NonBackgroundImage`: `SRGBColorSpace` + `LinearFilter` min/mag + `generateMipmaps: false`. Does **not** go through `TextureManager.getTexture()` — those settings (`LinearSRGBColorSpace` + `LinearMipMapLinearFilter` + `mipmaps: true`) produce visibly blurred TCG art.)

The pilot does not replace `BattleFieldUnitRenderer.ts`; it lands alongside so the old `add-main-renderer` scenario keeps working during migration.

## Migration rules

When you touch any feature folder:

1. **New code must follow E+F+R.** No exceptions. If you're adding a feature from scratch, copy the `draw_simple_efr` shape.
2. **Touch-migrate the slice you edit.** If you're editing `FooServiceImpl.createFoo()` and it constructs meshes directly, split out a `FooRenderer.build()` as part of that change — don't "just add one more mesh" to the service.
3. **Preserve texture settings.** Unit/card/UI rendering uses `SRGBColorSpace` + `LinearFilter` min/mag + `generateMipmaps: false` (see `src/shape/image/LegacyNonBackgroundImage.ts` and `NonBackgroundImage.ts`). A Renderer that loads its own textures MUST apply these same settings. Do not route card/unit rendering through `TextureManager.getTexture()` — it preloads with `LinearSRGBColorSpace` + `LinearMipMapLinearFilter` + `mipmaps: true`, which makes TCG pixel art look blurry. If you think a different setting is warranted, ask the user before changing.
4. **`src/*/deprecated_*/` stays dead.** Don't extend `src/deprecated_battle_field_card/` or the commented-out `initializeBackground` block in `MainRenderer.ts`. `LegacyNonBackgroundImage`/`NonBackgroundImage` themselves are *not* deprecated — they define the texture-settings baseline above and may be reused or mirrored.
5. **Do not add new singletons** (`getInstance`) to Renderer or Frame code — they are stateless. Services and Repositories are already pervasively singleton (~830 `getInstance` calls); don't grow that number.
6. **`card/unit/generate.ts`, `card/support/generate.ts`, `card/item/generate.ts`, `card/energy/generate.ts` are a parallel rendering pipeline slated for absorption into E+F+R.** Don't add new card-building logic there; put it behind a Renderer.

### Known anti-patterns to expect in current code

When you encounter these, they are **not the pattern to copy** — they are the migration backlog:

- `src/your_field_area/entity/YourFieldArea.ts` and `src/background/entity/Background.ts` hold `THREE.Mesh` / `THREE.Texture` directly — entities should not. Flag/migrate when touched.
- `BattleFieldUnitScene.addUnit()` constructs five meshes and calculates offsets — this is what the new Renderer owns.
- `BattleFieldHandServiceImpl.createHand()` builds a `THREE.Group` of meshes inside the service — should delegate to a `BattleFieldHandRenderer`.
- `*_position/` feature folders (`battle_field_card_position/`, `battle_field_card_attribute_mark_position/`, etc.) are proto-Frames: they hold layout values but are named "Position". Long-term they're absorbed into `frame/` folders.
- Renderer files that are only one line (`renderer.render(scene.getScene(), camera)`) — the Scene is doing the Renderer's work. When you touch one, invert the relationship.

## Routing (SPA without a framework)

`src/router/` implements a hand-rolled SPA router:

- `routes.ts` — array of `{ path, getComponentInstance(rootElement, routeMap) }`. Current paths: `/tcg-main-lobby`, `/tcg-card-shop`, `/tcg-simulation-battle-field`, `/tcg-my-card`.
- `RouteMap.ts` — holds the active `Component`, calls `hide()` on the old and `show()` on the new on every route change.
- `Component.ts` — every top-level view implements `initialize/show/hide/animate` and exposes a `getInstance(rootElement, routeMap)` singleton factory.

When adding a screen: implement `Component`, expose `getInstance`, add a route entry, register with `routeMap.registerRoutes(routes)`.

## Feature-per-directory layout under `src/`

`src/` has ~230 top-level feature folders (`battle_field`, `battle_field_unit`, `my_deck_card`, `card_filter_panel`, `global_navigation_bar_button_click_detect`, …). This flat naming is intentional — features are sliced by concept, not nested by layer. Inside a feature, the target shape is:

```
src/<feature>/
├── entity/        # pure domain classes
├── frame/         # SlotSpec composition (target — many features don't have this yet)
├── repository/    # in-memory stores, often singletons
├── scene/         # thin THREE.Scene wrapper (target — many features overdo this)
├── renderer/      # the ONLY THREE.* construction site
└── service/       # orchestration only (target — many features overdo this)
```

Click/hover detection is usually its own sibling feature (e.g. `deck_card_add_button` + `deck_card_add_button_click_detect` + `deck_card_add_button_position`). When adding behavior to a button, look for the matching `_click_detect` / `_hover_detect` / `_position` / `_effect` folders rather than piling it into the button folder.

## Rendering composition (top level)

`src/main/renderer/MainRenderer.ts` and `src/ui/screens/battle_field/BattleFieldView.ts` show composition: a top-level view owns one `SceneManager` + `RendererManager` + `CameraManager` (all in `src/core/`), instantiates per-feature scenes, and attaches them via `parentScene.add(featureScene.getScene())`. On resize, the top-level view calls each feature's `resize` hook. New features integrated at this level should expose a matching hook.

## Resources

`resource/image-paths.json` is the manifest consumed by `TextureManager.preloadTextures(...)`. `python/useful_tool/image_resource_to_json_convert.py` generates it. `resource.zip` is the bundled asset archive — everything under `resource/` is gitignored (png/jpg/mp3/ttf/otf/webp/csv/xlsx/json), so expect to unzip `resource.zip` in a fresh checkout.

## Conventions

- Korean inline comments are common and expected; don't translate or strip them during unrelated edits.
- Views and most services are singletons via `getInstance(...)` — don't `new` them from outside their module. (New Renderer/Frame code is an exception; keep those stateless.)
- Prefer editing an existing feature folder over creating a new one when a concept already has a slice.
