# UI Spec: AI Chat Interface

| | |
|---|---|
| Last updated | 2026-11-17 |
| Related | [PRD.md](./PRD.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [Figma: current UI](https://www.figma.com/design/yx6nMI0QWNPdVyGDvXbZzd) |
| Scope | Web (desktop + tablet) and mobile-responsive chat interface for `client/` |
| Font | Geist (UI), Geist Mono (code, IDs). Already loaded in `client/app/layout.tsx` |

> **Branding note.** The layout follows the familiar "sidebar + centered conversation + floating composer" chat pattern, but uses this product's own name (**AI Voice Chat**), models (Gemini) and accent color. Don't ship third-party product names, logos or brand colors.

---

## 0. Layout at a glance

```
Desktop ≥1024px
┌──────────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR 260  │ HEADER 56   [Gemini 2.5 Flash ▾] (Live)       [share]│
│ [+ New chat] ├──────────────────────────────────────────────────────┤
│              │                                                      │
│ Today        │            MESSAGE STREAM (max-w 768, centered)      │
│ ▸ Active chat│                                   ┌──────────────┐   │
│   Chat 2     │                                   │ user bubble  │   │
│ Previous 7   │   (✦) assistant text ...          └──────────────┘   │
│   Chat 3     │       ┌ code block ───────[Copy]┐                    │
│              │       └─────────────────────────┘                    │
│              │       👍 👎 ↻ ⤴                                      │
│              │      ┌──────────────────────────────────────────┐    │
│ ──────────── │      │ (+)  Message AI Voice Chat...    (🎙) (↑) │   │
│ (MK) Name  ⚙ │      └──────────────────────────────────────────┘    │
│              │        AI Voice Chat can make mistakes. Check ...    │
└──────────────┴──────────────────────────────────────────────────────┘
```

Mobile <768px: sidebar becomes an off-canvas drawer (hamburger in header); composer pins to the bottom with safe-area padding.

---

## 1. Design tokens

### 1.1 Color

Use these as Figma variables in one collection, **Theme**, with two modes: `Dark` (default) and `Light`. Names map 1:1 to CSS custom properties (`--bg-app`, …).

| Token | Dark | Light | Usage |
|---|---|---|---|
| `bg/app` | `#212121` | `#FFFFFF` | Main canvas |
| `bg/sidebar` | `#171717` | `#F9F9F9` | Sidebar, mobile drawer |
| `bg/input` | `#2F2F2F` | `#F4F4F4` | Composer, user bubble, model menu |
| `bg/elevated` | `#2F2F2F` | `#FFFFFF` | Dropdowns, popovers, prompt cards (hover) |
| `bg/hover` | `#2A2A2A` | `#ECECEC` | Sidebar row hover, icon-button hover |
| `bg/active` | `#2F2F2F` | `#E3E3E3` | Active chat row |
| `bg/code` | `#0D0D0D` | `#F7F7F8` | Code block body |
| `bg/code-header` | `#2F2F2F` | `#ECECEC` | Code block title bar |
| `text/primary` | `#ECECEC` | `#0D0D0D` | Body text, headings |
| `text/secondary` | `#B4B4B4` | `#5D5D5D` | Labels, inactive history rows |
| `text/tertiary` | `#8F8F8F` | `#8F8F8F` | Group headings, disclaimer, placeholders |
| `border/subtle` | `#FFFFFF` @ 10% | `#000000` @ 10% | Dividers, card outlines, composer outline |
| `border/focus` | `#2DD4BF` | `#0D9488` | Focus rings (2px) |
| `accent/default` | `#2DD4BF` (teal) | `#0D9488` | Status dot, links, selected check, toggles |
| `accent/on` | `#0D0D0D` | `#FFFFFF` | Content on accent |
| `button/primary-bg` | `#ECECEC` | `#0D0D0D` | Send button, "+ New chat" (high-contrast) |
| `button/primary-fg` | `#0D0D0D` | `#FFFFFF` | Icon/text on primary |
| `button/disabled-bg` | `#676767` | `#D7D7D7` | Send button when the input is empty |
| `status/live` | `#22C55E` | `#16A34A` | SSE connected |
| `status/offline` | `#EF4444` | `#DC2626` | SSE disconnected |
| `status/recording` | `#EF4444` | `#DC2626` | Voice mode active |

Contrast check (WCAG AA, 4.5:1 for body text): `text/primary` on `bg/app` passes in both modes (~13:1 dark, ~19:1 light), and so does `text/secondary` (~7.6:1 dark, ~6.4:1 light). `text/tertiary` is only for 12px meta text and non-essential hints: ~4.6:1 on `#212121`, but only ~3.3:1 on white, so in Light mode don't use it for anything the user must read.

### 1.2 Typography (Geist)

| Style | Size / Line height | Weight | Usage |
|---|---|---|---|
| `display` | 28 / 36 | SemiBold | Welcome greeting (desktop) |
| `display-sm` | 24 / 32 | SemiBold | Welcome greeting (mobile) |
| `title` | 18 / 28 | SemiBold | Header model name, dialog titles |
| `body` | 16 / 28 | Regular | Message text (user + assistant) |
| `body-strong` | 16 / 28 | SemiBold | Markdown bold, list headings in replies |
| `label` | 14 / 20 | Medium | Buttons, sidebar rows, card titles |
| `label-sm` | 14 / 20 | Regular | Card subtitles, menu descriptions |
| `caption` | 12 / 16 | Medium | Sidebar group headings, badges |
| `micro` | 12 / 16 | Regular | Disclaimer, timestamps |
| `code` | 14 / 22 | Geist Mono Regular | Code blocks, inline code |

Letter spacing is 0 throughout, except `caption` group headings (+0.2px, sentence case, not uppercase).

### 1.3 Spacing, radius, elevation (8pt grid)

| Token | Value | Notes |
|---|---|---|
| `space/0.5` | 4 | Half-step: icon-to-label, tight stacks only |
| `space/1` | 8 | Default gap inside controls |
| `space/1.5` | 12 | Sidebar row padding-x, card gap |
| `space/2` | 16 | Standard padding, mobile gutter |
| `space/3` | 24 | Message-to-message gap, desktop gutter |
| `space/4` | 32 | Section spacing |
| `space/6` | 48 | Welcome block vertical spacing |
| `radius/sm` | 8 | Sidebar rows, menu items, code block |
| `radius/md` | 12 | Prompt cards, dropdown panels |
| `radius/lg` | 24 | User bubble |
| `radius/xl` | 28 | Composer (multiline still looks pill-like) |
| `radius/full` | 9999 | Pills, avatars, icon buttons, send button |
| `shadow/popover` | 0 8 24 rgba(0,0,0,.24) dark / .12 light | Dropdowns, model menu |
| `shadow/composer` | 0 0 0 1 `border/subtle` + 0 4 16 rgba(0,0,0,.12) | Floating composer |

Bind these as `FLOAT` variables (scopes: `GAP`, `PADDING`, `CORNER_RADIUS`) so components resize consistently.

### 1.4 Icons

[Lucide](https://lucide.dev), the set the client already uses: 20px in buttons, 16px in meta rows, 1.75–2px stroke, color from `text/secondary` (hover → `text/primary`). Names: `plus`, `square-pen`, `panel-left`, `chevron-down`, `settings`, `copy`, `check`, `thumbs-up`, `thumbs-down`, `refresh-cw`, `share`, `paperclip`, `image`, `globe`, `mic`, `arrow-up`, `sparkles` (assistant avatar), `menu`.

### 1.5 Breakpoints

| Name | Width | Sidebar | Stream gutter | Composer |
|---|---|---|---|---|
| `mobile` | < 768 | Off-canvas drawer, 85% width (max 320) | 16 | Full width minus 2×16, pinned bottom |
| `tablet` | 768–1023 | Collapsed by default (rail or hidden), overlays when open | 24 | Max 768 |
| `desktop` | ≥ 1024 | Docked 260px, collapsible | 24 | Max 768 |

Message stream and composer share one centered column: `max-width: 768px; margin-inline: auto`.

---

## 2. Left sidebar (collapsible)

**Frame:** `Sidebar` · vertical auto-layout · fixed width 260 · fill height · `bg/sidebar` · padding 8 · gap 0.

| Region | Auto-layout | Sizing |
|---|---|---|
| `Sidebar/Top` | Horizontal, space-between, padding 4 8, height 56 | Fill × Hug |
| `Sidebar/NewChat` | Horizontal, padding 0 4 8 | Fill × Hug |
| `Sidebar/History` | Vertical, gap 16, scrolls (clip content) | Fill × **Fill** |
| `Sidebar/Profile` | Horizontal, padding 8, top border `border/subtle` | Fill × Hug |

### 2.1 Top bar
- Left: collapse toggle (`panel-left`, 36×36 icon button, `radius/sm`).
- Right: compact new-chat icon (`square-pen`). Only visible when the sidebar is collapsed to a rail; otherwise hidden to avoid a duplicate action.

### 2.2 "+ New chat" button
- Pill button, full width, height 40, `radius/full`, padding 0 16, gap 8, `label` text.
- **High-contrast variant (default):** `button/primary-bg` fill, `button/primary-fg` text + `plus` icon.
- States: hover = 90% opacity; pressed = 80%; focus = 2px `border/focus` ring with 2px offset.
- Keyboard shortcut hint on hover tooltip: `Ctrl/⌘ Shift O`.
- Action: clears the canvas, generates a new `sessionId`, shows the Welcome screen.

### 2.3 Chat history
- **Group heading** (`caption`, `text/tertiary`, padding 8 12 4): "Today", "Yesterday", "Previous 7 Days", "Previous 30 Days", then month names. Hide empty groups.
- **Row** `HistoryItem`: horizontal, height 36, padding 0 12, `radius/sm`, title in `label`, single line with ellipsis truncation.

| State | Fill | Text | Extra |
|---|---|---|---|
| Default | none | `text/secondary` | — |
| Hover | `bg/hover` | `text/primary` | Trailing `more-horizontal` icon appears (rename, delete) |
| Active | `bg/active` | `text/primary` | Trailing icon always visible; `aria-current="page"` |
| Renaming | `bg/active` + 1px `border/focus` | `text/primary` | Inline text field |

Figma component: `HistoryItem` with variant `State=Default|Hover|Active|Renaming` and text property `Title`.

### 2.4 Profile section
- Horizontal, gap 12, height 56, padding 8, `radius/sm`, hover `bg/hover`, counter-axis center.
- **Avatar:** 32×32 circle, initials in `caption` SemiBold, fill `accent/default`, text `accent/on` (or the user's photo).
- **Name:** `label`, `text/primary`, fills remaining width (ellipsis); optional plan line under it in `micro` `text/tertiary`.
- **Settings:** `settings` gear, 32×32 icon button, `text/secondary`.
- Clicking the row opens an account menu (Settings, Theme: Dark/Light/System, Log out) above it.

### 2.5 Collapse behavior
- Desktop: toggle animates width 260 → 0 (200ms ease-out); the main canvas reflows. When collapsed, the header shows `panel-left` + `square-pen` at its left edge.
- Tablet/mobile: drawer slides over the canvas with a `#000` @ 50% scrim; tap the scrim or press Esc to close; focus is trapped in the drawer.
- Persist the collapsed state per device (localStorage).

---

## 3. Main chat canvas

**Frame:** `Canvas` · vertical auto-layout · fill × fill · `bg/app` · gap 0.
Children: `Header` (hug height) → `Stream` (fill height, scrolls) → `Composer` (hug height).

### 3.1 Header
- Horizontal, height 56, padding 0 16 (mobile 8), space-between, counter-axis center. No border at rest; a bottom 1px `border/subtle` fades in once the stream is scrolled.
- **Left:** (collapsed/mobile only) `menu` or `panel-left` + `square-pen`.
- **Center-left: Model selector**
  - Button: `title` text "Gemini 2.5 Flash" + `chevron-down` 16px, padding 6 12, `radius/sm`, hover `bg/hover`.
  - **Status badge** next to it: pill, height 20, padding 0 8, gap 6, `caption`; 8px dot plus label.
    - `Live`: dot `status/live`, text `text/secondary`
    - `Connecting…`: dot `text/tertiary` with pulse
    - `Offline`: dot `status/offline`, plus a tooltip with the retry hint
  - **Dropdown panel:** width 320, `bg/elevated`, `radius/md`, `shadow/popover`, padding 8. Each option row: name (`label`), one-line description (`label-sm`, `text/secondary`), and a check icon (`accent/default`) on the selected one. Options: *Gemini 2.5 Flash* ("Fast, everyday tasks"), *Gemini 2.5 Pro* ("Deeper reasoning, slower"). Driven by `GEMINI_MODEL` on the server.
- **Right:** `share` icon button (hidden on the Welcome screen); on mobile, a `square-pen` new-chat button.

### 3.2 Welcome / empty state
Shown when the active chat has no messages.

- **Container:** vertical, center-aligned on both axes, gap 32, max-width 768, padding 0 16. On desktop the composer sits directly under the greeting (vertically centered as one group); on mobile the greeting centers and the composer stays pinned to the bottom.
- **Greeting:** "What can I help with today?" in `display` (mobile `display-sm`), `text/primary`, centered.
- **Prompt cards:** 2×2 grid, gap 12, each card fills 50% of the row (desktop/tablet). On mobile, a single row that scrolls sideways (cards 240 wide) or a 1-column stack of 2 cards.

| Card property | Value |
|---|---|
| Layout | Vertical, gap 4, padding 16, min-height 88 |
| Fill / border | Transparent, 1px `border/subtle`, `radius/md` |
| Leading icon | 20px, `accent/default` (optional, e.g. `mic`, `globe`, `code`, `lightbulb`) |
| Title | `label`, `text/primary` ("Explain a concept") |
| Subtitle | `label-sm`, `text/secondary` ("like server-sent events, in simple terms") |
| Hover | `bg/hover` fill; subtitle → `text/primary` |
| Action | Fills the composer with title + subtitle and sends it |

Suggested cards: *Explain a concept*, *Practice a conversation* (voice), *Summarize text* (paste content), *Debug some code*.

Figma component: `PromptCard`, text props `Title` and `Subtitle`, boolean `Show icon`, instance-swap `Icon`.

### 3.3 Message stream
- **Scroll container:** fill × fill, scrolls vertically, padding 24 (mobile 16) top/side and 160 bottom so the last message clears the floating composer.
- **Column:** vertical, gap 24, max-width 768, centered.
- **Auto-scroll:** keep following the bottom while tokens stream, unless the user has scrolled up more than 80px; then show a floating "↓" jump-to-latest button (32×32, `bg/elevated`, `radius/full`, centered above the composer).

#### 3.3.1 User message
- Row: horizontal, primary-axis **end** (right-aligned).
- Bubble: max-width 70% of the column (mobile 85%), padding 12 20, `bg/input` fill, `radius/lg` (24) on every corner, `body` text in `text/primary`, preserves line breaks.
- **Voice turns:** the live transcript renders in the same bubble at 60% opacity with a trailing "…" until the transcript is final (`isFinal`), then becomes solid.
- Hover (desktop): an `edit` (pencil) icon button appears to the left of the bubble, and `copy` below it.

#### 3.3.2 Assistant response
- Row: horizontal, gap 16, primary-axis **start**, no bubble fill (transparent); the text sits directly on `bg/app`.
- **Avatar:** 28×28 circle, 1px `border/subtle`, `sparkles` icon 16px in `text/primary`. Top-aligned with the first text line.
- **Content column:** vertical, gap 16, fills the width.
  - **Formatted text:** Markdown rendering with `body` paragraphs (gap 16), `body-strong` headings, lists with 24px indent and 8px item gap, and inline code (`code` at 14px, `bg/input` fill, padding 2 6, `radius/sm`).
  - **Streaming:** append tokens in place with a blinking 8×16 caret (`text/primary`) at the end; the action footer stays hidden until the turn finishes.
  - **Code block** (component `CodeBlock`):
    - Container: vertical, `radius/sm`, clip content, 1px `border/subtle`.
    - Header bar: horizontal, height 36, padding 0 16, space-between, `bg/code-header`. Left: language label (`caption`, `text/secondary`, e.g. `typescript`). Right: **Copy** button (`copy` 16px + "Copy" in `caption`), which switches to `check` + "Copied!" for 2s.
    - Body: padding 16, `bg/code`, `code` style, scrolls sideways (no wrapping), syntax highlighting in a muted theme.
  - **Error state:** when the server sends `{type:"error"}`, show the message in `text/secondary` with a 16px `alert-circle` in `status/offline` and a **Retry** text button.
- **Action footer:** horizontal, gap 4, starts at the content's left edge. Icon buttons are 32×32, `radius/sm`, 16px icons in `text/tertiary` (hover `text/primary` + `bg/hover`), each with a tooltip:
  1. Copy (`copy`)
  2. Good response (`thumbs-up`; selected = filled icon, `text/primary`)
  3. Bad response (`thumbs-down`; opens an optional feedback popover)
  4. Regenerate (`refresh-cw`; a dropdown offers "Try again" / "Switch model")
  5. Read aloud (`volume-2`; replays ElevenLabs audio, a natural fit for this app)
  6. Share (`share`)
- Visibility: always visible on the latest reply; on older replies they appear on hover (desktop) or stay visible (touch).

Figma components: `UserMessage` (variants `State=Final|Interim`), `AssistantMessage` (variants `State=Streaming|Complete|Error`), `CodeBlock` (variant `Copied=False|True`), `MessageActions`.

---

## 4. Bottom prompt input bar (composer)

**Placement:** pinned to the bottom of `Canvas`, centered column (max-width 768), with a 24px-tall gradient above it from transparent to `bg/app` so the stream fades under it. Outer padding 0 16 16 (mobile adds `env(safe-area-inset-bottom)`).

### 4.1 Input box
- **Frame `Composer`:** vertical auto-layout, padding 12 12 12 16, gap 8, `bg/input` fill, `radius/xl` (28), `shadow/composer`.
- **Text area:** `body` text, placeholder **"Message AI Voice Chat…"** in `text/tertiary`; grows with content from 1 line (min height 24) up to 8 lines (~224px), then scrolls inside. Enter sends; Shift+Enter adds a new line; on mobile, Enter adds a new line.
- **Toolbar row:** horizontal, space-between, counter-axis center.
  - **Left: Attach (`plus`)**, 36×36 icon button, `radius/full`, 1px `border/subtle`. It opens a menu above the button (`bg/elevated`, `radius/md`, `shadow/popover`, rows 40 tall):
    - `paperclip` Upload a file
    - `image` Add an image
    - `globe` Search the web (switch row; on = `accent/default` track)
    - Added files show as removable chips (56×56 thumbnails or a filename pill) above the text area.
    - Active tools show as pills next to the + (e.g. "🌐 Search": `bg/hover`, `caption`, with a close ×).
  - **Right cluster** (horizontal, gap 8):
    - **Voice mode (`mic`):** 36×36 icon button, `text/secondary`. While recording: fill `status/recording`, icon becomes `mic-off` in white, with a 2px pulsing ring (reuses today's `Mic Button` behavior and `useAudioRecorder`). Optionally, a 3-bar live level meter replaces the placeholder while recording.
    - **Send (`arrow-up`):** 36×36 solid circle, `button/primary-bg` fill, `button/primary-fg` icon, 20px.
      - Disabled (input empty, not recording): `button/disabled-bg`, no hover.
      - While a reply streams, it becomes **Stop** (filled 12×12 square), which cancels the turn.
- **Focus:** the composer outline goes from `border/subtle` to `border/focus` at 1px (no glow).

### 4.2 Disclaimer
- Text: **"AI Voice Chat can make mistakes. Check important info."**
- `micro`, `text/tertiary`, centered, padding 8 0 0. Hidden on mobile when the keyboard is open.

Figma component: `Composer` with variants `State=Empty|Typing|Recording|Streaming` and boolean `Show attachments`; nested `IconButton` (variants `Style=Ghost|Outline|Solid`, `State=Default|Hover|Disabled|Active`).

---

## 5. Responsive behavior summary

| Element | Mobile < 768 | Tablet 768–1023 | Desktop ≥ 1024 |
|---|---|---|---|
| Sidebar | Drawer, opened from header `menu` | Overlay drawer | Docked 260, collapsible |
| Header | `menu` · model selector · `square-pen` | `panel-left` · model selector · share | Model selector · share |
| Welcome cards | 1 column or sideways scroll | 2×2 | 2×2 |
| Greeting | `display-sm` | `display` | `display` |
| User bubble max width | 85% | 70% | 70% |
| Composer | Pinned, full width − 32 | Max 768 | Max 768, centered with greeting on welcome |
| Action footer | Always visible | Always visible | Latest always, others on hover |

Touch targets are at least 44×44 on mobile: 36px icon buttons get a larger invisible hit area (`::before` inset −4px).

---

## 6. Interaction and motion

| Interaction | Motion |
|---|---|
| Sidebar collapse/expand | Width or translate, 200ms `cubic-bezier(.2,0,0,1)` |
| Dropdowns / menus | Fade + 4px rise, 120ms |
| New message appears | Fade + 8px rise, 150ms |
| Streaming caret | 1s blink (`steps(2)`) |
| Recording ring | Ping scale 1 → 1.4, opacity .75 → 0, 1s loop |
| Copy → Copied | Icon cross-fade, revert after 2s |

Respect `prefers-reduced-motion`: turn off the ping, blink and rise animations and keep only opacity changes.

---

## 7. Accessibility

- Landmarks: `<nav aria-label="Chat history">` for the sidebar, `<main>` for the canvas, and the composer as a `<form>`.
- The message stream is `role="log"` with `aria-live="polite"`. Announce only completed assistant turns, not every token.
- Every icon button has an `aria-label` that matches its tooltip; the model selector is a `listbox` button with `aria-expanded`.
- Visible focus ring everywhere (`border/focus`, 2px, offset 2px). The drawer and menus trap focus and close on Esc.
- The voice button announces its state change ("Recording started" / "Recording stopped").

---

## 8. Figma build checklist

| Component | Variants / properties |
|---|---|
| `Button/Pill` | `Style=Primary\|Secondary`, `State=Default\|Hover\|Focus`, text `Label`, swap `Icon` |
| `IconButton` | `Style=Ghost\|Outline\|Solid`, `Size=32\|36`, `State=Default\|Hover\|Active\|Disabled` |
| `HistoryItem` | `State=Default\|Hover\|Active\|Renaming`, text `Title` |
| `HistoryGroup` | text `Heading`, slot of `HistoryItem` |
| `ProfileRow` | text `Name`, text `Plan`, boolean `Show plan` |
| `ModelSelector` | `Open=False\|True`, text `Model`, nested `StatusBadge` |
| `StatusBadge` | `Status=Live\|Connecting\|Offline` |
| `PromptCard` | `State=Default\|Hover`, text `Title`, `Subtitle`, swap `Icon` |
| `UserMessage` | `State=Final\|Interim`, text `Message` |
| `AssistantMessage` | `State=Streaming\|Complete\|Error`, boolean `Show code`, boolean `Show actions` |
| `CodeBlock` | `Copied=False\|True`, text `Language`, text `Code` |
| `MessageActions` | `Feedback=None\|Liked\|Disliked` |
| `Composer` | `State=Empty\|Typing\|Recording\|Streaming`, boolean `Show attachments` |
| `AttachMenu` | boolean `Web search on` |

**Screens to compose** (Dark and Light via variable modes): Desktop Welcome · Desktop Conversation (streaming + code block) · Desktop Sidebar collapsed · Mobile Welcome · Mobile Conversation · Mobile Drawer open · Composer Recording.

**Implementation mapping (client):** tokens become CSS custom properties in `app/globals.css`, switched by a `[data-theme]` attribute, and exposed to Tailwind through `@theme inline`. The existing `useSSE` events map directly: `transcript` → `UserMessage` (Interim/Final), `token` → `AssistantMessage` (Streaming), `audio` → Read aloud / autoplay, `error` → `AssistantMessage` (Error).
