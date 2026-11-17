---
version: alpha
name: Relay · Signal
description: >-
  Design system for Relay (repo: SSE-chat-ai), a real-time voice-to-voice assistant
  (browser mic → Deepgram → Gemini → ElevenLabs → browser, over SSE).
  Typography-led and utilitarian: the conversation itself is the interface,
  set as large editorial type on a neutral ground, with one signal-orange
  accent and a single frosted control dock. Light theme is the default;
  every color has a matching "-dark" token.
colors:
  # Brand
  primary: "#FF4F00"
  on-primary: "#0A0A0A"
  primary-text: "#C93B00"
  primary-soft: "#FF4F0029"
  # Light theme (default)
  canvas: "#F2F2F0"
  surface: "#FFFFFF"
  sunken: "#E7E7E4"
  glass: "#FFFFFFB8"
  glass-edge: "#FFFFFFE6"
  line-subtle: "#E0E0DC"
  line-strong: "#C9C9C4"
  ink: "#0A0A0A"
  ink-secondary: "#45454A"
  ink-tertiary: "#66666B"
  ink-pending: "#86868B"
  success: "#0E8A5C"
  warning: "#8F5200"
  error: "#C81E1E"
  shadow-soft: "#0A0A0A14"
  shadow-edge: "#0A0A0A0F"
  scrim: "#0A0A0A3D"
  # Dark theme
  primary-dark: "#FF5A14"
  primary-text-dark: "#FF7A3D"
  primary-soft-dark: "#FF5A1438"
  canvas-dark: "#0A0A0B"
  surface-dark: "#161618"
  sunken-dark: "#222225"
  glass-dark: "#1E1E21B8"
  glass-edge-dark: "#FFFFFF14"
  line-subtle-dark: "#26262A"
  line-strong-dark: "#3A3A40"
  ink-dark: "#F4F4F2"
  ink-secondary-dark: "#B9B9BF"
  ink-tertiary-dark: "#8E8E95"
  ink-pending-dark: "#66666C"
  success-dark: "#34D399"
  warning-dark: "#F5A524"
  error-dark: "#FF6B6B"
  shadow-soft-dark: "#00000073"
  shadow-edge-dark: "#00000099"
  scrim-dark: "#00000080"
typography:
  display-xl:
    fontFamily: Geist
    fontSize: 64px
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: -0.035em
  display-lg:
    fontFamily: Geist
    fontSize: 44px
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: -0.025em
  display-md:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.18
    letterSpacing: -0.018em
  display-mobile:
    fontFamily: Geist
    fontSize: 38px
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: -0.03em
  title:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  body:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em
  label:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0em
  caption:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
  meta:
    fontFamily: Geist Mono
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.06em
  mono:
    fontFamily: Geist Mono
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: 0em
rounded:
  xs: 6px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  sheet: 24px
  dock: 38px
  full: 9999px
spacing:
  2xs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  page-x: 120px
  page-x-mobile: 24px
  dock-bottom: 32px
  touch-target: 44px
components:
  mic-button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 56px
  mic-button-mobile:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 64px
  mic-button-interrupt:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.full}"
    size: 56px
  mic-button-disabled:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink-tertiary}"
    rounded: "{rounded.full}"
    size: 56px
  dock:
    backgroundColor: "{colors.glass}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.dock}"
    padding: 10px 10px 10px 22px
  icon-button:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.md}"
    size: 44px
  icon-button-active:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    size: 44px
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0px 16px
    height: 44px
  button-secondary:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: 0px 16px
    height: 44px
  utterance:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
  utterance-pending:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-pending}"
    typography: "{typography.display-xl}"
  utterance-current-word:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.primary-text}"
    typography: "{typography.display-xl}"
  previous-turn:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-tertiary}"
    typography: "{typography.display-md}"
  meta-label:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-tertiary}"
    typography: "{typography.meta}"
  keycap:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.meta}"
    rounded: "{rounded.xs}"
    padding: 3px 6px
  toast:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.lg}"
    padding: 10px 10px 10px 16px
  transcript-panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: 20px
    width: 368px
  settings-sheet:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: 16px 20px 24px
    width: 420px
  settings-group:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
  settings-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: 0px 16px
    height: 48px
  toggle-on:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    width: 44px
    height: 26px
  segment-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    height: 32px
  segment-track:
    backgroundColor: "{colors.sunken}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.md}"
    padding: 2px
---

# Relay · Signal

## Overview

Relay is a voice-first assistant: you talk, it transcribes you live, writes a
reply and speaks it back. **Signal** is designed so that the product reads as a
calm, precise instrument rather than a generic AI chatbot.

- **The words are the interface.** What the user says and what the assistant
  replies are shown as large, left-aligned editorial type. There are no chat
  bubbles, no centred glowing orb and no hero waveform.
- **One accent, used sparingly.** A neutral ground, near-black ink and a single
  signal orange (`primary`) that marks the live, actionable thing: the mic,
  the user's live speech and the word being spoken.
- **One control surface.** Everything you can do lives in a single frosted
  dock at the bottom: level meter, current state, keyboard hint, mic, end.
  Status sits next to the control it describes, not in a row of dashboard chips.
- **Quiet failures.** Problems appear in the flow of the conversation or as a
  small toast; the conversation stays visible.
- **Light and dark are equals.** Every color token has a `-dark` twin; design
  and build both.

Avoid the AI-product clichés: purple/teal gradients, neon on black, sparkle
icons, glowing orbs, emoji, gradient text, and left-border accent cards.

## Colors

Tokens are semantic. Use the role, never the raw hex, in code.

| Role | Light | Dark | Use |
|---|---|---|---|
| `primary` | #FF4F00 | #FF5A14 | Mic button, live-listening dot and level bars, toggle on. Fills only. |
| `on-primary` | #0A0A0A | #0A0A0A | Icons and text on `primary` (6:1). Never white on orange. |
| `primary-text` | #C93B00 | #FF7A3D | Orange *text*: the word currently being spoken. |
| `primary-soft` | 16% orange | 22% orange | The 8px ring around the mic while recording. |
| `canvas` | #F2F2F0 | #0A0A0B | Page background. |
| `surface` | #FFFFFF | #161618 | Raised cards: transcript panel, toast, settings groups. |
| `sunken` | #E7E7E4 | #222225 | Pressed/selected backgrounds, keycaps, segmented track, secondary buttons. |
| `glass` / `glass-edge` | 72% white / 90% white | 72% graphite / 8% white | The dock material and its bright top edge. |
| `ink` | #0A0A0A | #F4F4F2 | Primary text; confirmed words. |
| `ink-secondary` | #45454A | #B9B9BF | Body copy in panels, secondary icons. |
| `ink-tertiary` | #66666B | #8E8E95 | Meta labels, helper text, the previous turn. |
| `ink-pending` | #86868B | #66666C | Interim (unconfirmed) words and words not yet spoken. **Display sizes only** (≥24px): 3.2:1. |
| `success` / `warning` / `error` | #0E8A5C / #8F5200 / #C81E1E | #34D399 / #F5A524 / #FF6B6B | Connection dot, reconnect toast, failed reply. |
| `scrim` | 24% ink | 50% black | Behind modal sheets only. |

Contrast (on `canvas`): `ink` 17.7:1, `ink-secondary` 8.5:1, `ink-tertiary` 5.1:1,
`primary-text` 4.6:1, `warning` 5.6:1, `error` 5.1:1, `on-primary` on `primary` 6:1.
All dark-theme text roles are ≥ 4.5:1 except `ink-pending-dark` (3.5:1).
`ink-pending` (3.2:1 light, 3.5:1 dark) passes WCAG only as large text, so a
contrast linter will flag `utterance-pending`; that is expected, and the role is
restricted to display sizes (≥ 24px).

## Typography

Geist for everything, Geist Mono for meta labels, timers and model ids. Both are
on Google Fonts. Fallback: `ui-sans-serif, system-ui` / `ui-monospace`.

| Token | Size / weight | Leading | Tracking | Use |
|---|---|---|---|---|
| `display-xl` | 64 / 500 | 1.04 | −3.5% | The live utterance. Fluid: `clamp(36px, 5vw, 64px)`, max ~18ch. |
| `display-lg` | 44 / 500 | 1.10 | −2.5% | Long replies, dimmed past replies. |
| `display-md` | 30 / 500 | 1.18 | −1.8% | The previous turn shown above the reply. |
| `display-mobile` | 38 / 500 | 1.06 | −3% | Utterance on phones. |
| `title` | 20 / 600 | 1.3 | −1% | Sheet titles, error headline. |
| `body` | 15 / 400 | 1.5 | 0 | Panel copy, settings rows, helper text. |
| `label` / `label-sm` | 14 / 500, 13 / 500 | 1.3 | 0 | Buttons, dock status. |
| `caption` | 13 / 400 | 1.4 | 0 | Hints, toast description. |
| `meta` | Mono 11 / 500, UPPERCASE | 1.3 | +6% | "YOU · LIVE", "ASSISTANT · 00:07", group titles. |
| `mono` | Mono 13 / 400 | 1.4 | 0 | Timers, model ids. |

Rules: tracking tightens as size grows (negative on display, zero on body);
hierarchy comes from size + weight + leading together; use `text-wrap: pretty`
on display text.

## Layout

- **Desktop app shell:** top bar (no divider), then a body row: the conversation
  column (`flex: 999 1 560px`) and, when open, the transcript panel
  (`flex: 1 1 320px`, max 400px, inset 12px from the edges). The row wraps,
  so on narrow screens the panel drops below.
- **Conversation column:** content is left-aligned and vertically centred, with
  `padding-inline: clamp(24px, 8vw, 120px)` and an 18px gap between meta label and
  utterance. The previous turn sits 28px above the current one.
- **Dock:** centred at the bottom of the conversation column, 32px from the
  bottom edge. It floats; content can scroll beneath it.
- **Mobile (≤ 480px):** 24px side padding, `display-mobile` utterance, the dock
  spans the width with 12px side margins and 28px bottom margin (respect
  `env(safe-area-inset-bottom)`).
- **Spacing scale:** 4 · 8 · 12 · 16 · 24 · 32 · 48. Lay out siblings with flex/grid and `gap`.
- **Touch targets:** every control is ≥ 44 × 44px (`spacing.touch-target`).

## Elevation & Depth

Depth expresses hierarchy, following Apple's materials model.

| Level | Surface | Treatment |
|---|---|---|
| 0 | `canvas` | Flat. No borders between regions; use space. |
| 1 | `surface` cards (transcript panel, settings groups) | 1px `line-subtle` border, no shadow. |
| 2 | Dock (floating, interactive) | `glass` + `backdrop-filter: blur(24px) saturate(180%)` + 1px `glass-edge` + shadows `0 12px 40px shadow-soft, 0 1px 2px shadow-edge`. |
| 3 | Toast | `surface` + `line-subtle` border + `0 8px 28px shadow-soft`. |
| 4 | Modal sheet (settings) | `canvas` + `0 24px 64px shadow-soft` over a `scrim`. |

Never stack a translucent surface on another translucent surface. Non-blocking
panels (transcript) get no scrim; modal tasks (settings) do.

## Shapes

Radii from the `rounded` scale: keycaps 6, segments 8, buttons and icon buttons 12,
cards and toasts 16, transcript panel 20, sheets 24, the dock 38 (a capsule), the
mic `full`. Keep corners concentric: inner radius = outer radius − padding.
Icons are 2px-stroke line icons on a 24px grid (shown at 16/20/22px), never emoji
or filled glyph sets mixed in.

## Components

- **Dock** (`dock`): `[level meter + status] [Space keycap + hint] [mic] [end]`.
  One component with states Ready, Listening, Thinking, Speaking, Paused.
- **Mic button** (`mic-button*`): Talk (orange, mic icon) → Stop (orange, square,
  `primary-soft` 8px ring) → Interrupt (ink fill, mic icon) → Disabled (`sunken`).
- **Level meter:** five 3px bars in a 20px box. Orange while listening, ink while
  speaking, `line-strong` at 3px when idle.
- **Utterance** (`utterance*`): one paragraph of `display-xl`. Word colors carry
  state: confirmed `ink`, interim `ink-pending`, being spoken `primary-text`,
  not yet spoken `ink-pending`.
- **Meta label** (`meta-label`): mono uppercase line above each utterance, with an
  optional 6px dot ("YOU · LIVE" with an orange dot).
- **Top bar:** "Relay" wordmark left; connection text + transcript + settings icon
  buttons right. No bottom border.
- **Toast** (`toast`): Sonner-style, top-centre, 76px from the top; icon, title,
  description and one secondary action ("Retry now").
- **Transcript panel** (`transcript-panel`): header + items (meta label + body text).
- **Settings sheet** (`settings-sheet`): grouped inset lists (`settings-group`)
  with value rows (chevron), toggle rows, segmented rows and read-only mono
  info rows.
- **Buttons:** `button-primary` (ink) for the single main action in a context,
  `button-secondary` (sunken) for everything else. 44px tall.

## Do's and Don'ts

**Do**
- Let the type carry the experience; keep the screen mostly empty.
- Use orange only for what is live or actionable right now.
- Show interim words immediately in `ink-pending`; recolor to `ink` when final.
- Keep the conversation visible during errors and reconnects.
- Design every state in both themes.

**Don't**
- Don't add chat bubbles, avatars, a centred orb or a full-width waveform.
- Don't use gradients, glows, neon, purple, sparkles or emoji.
- Don't put white text on orange, or use `ink-pending` below 24px.
- Don't add borders between regions or a divider under the top bar.
- Don't show more than one primary button at a time.

## Voice states

Each state maps to the server's SSE events.

| State | Trigger | Utterance | Dock |
|---|---|---|---|
| Ready | page load / turn finished | "Start talking." in `ink-pending` | Ready (green dot), mic Talk, hint "to talk" |
| Listening | mic pressed; `transcript` events | user words; interim in `ink-pending`, final in `ink` | Listening (orange), level orange, mic Stop + ring |
| Thinking | final transcript sent; `token` events | previous turn above; reply streams word by word with an orange caret | Thinking, mic Interrupt |
| Speaking | `audio` events playing | reply; spoken words `ink`, current word `primary-text`, rest `ink-pending` | Speaking, level ink, mic Interrupt |
| Reconnecting | `EventSource` error | last exchange dimmed to `ink-pending` | Paused (warning dot), mic Disabled; toast "Connection lost · Reconnecting in N s · Retry now" |
| Reply failed | `error` event | the user's question in `ink`, then inline alert icon + title + body + "Try again" / "Show details" | Ready |

## Motion

Physical, interruptible and quick (Apple design + Emil Kowalski's rules).

- **Press:** `transform: scale(0.97)` on pointer-down, 160ms `cubic-bezier(.23,1,.32,1)`.
- **State changes** (mic fill, status, ring): spring, bounce 0, ~0.35s. Every
  animation is interruptible; pressing the mic during Thinking/Speaking cancels
  audio and returns to Listening immediately.
- **Words in:** per token, opacity 0→1, `blur(6px)`→0, translateY 4px→0, 260ms ease-out.
- **Level bars:** `transform: scaleY()` driven by an `AnalyserNode`; never animate height.
- **Dock enter:** materialize (blur + scale 0.96→1), spring 0.4s.
- **Transcript panel:** slides from its button, spring bounce 0, 0.4s, no scrim.
- **Settings sheet:** scrim fade 200ms + sheet spring (bounce 0.15, 0.3s).
- **Toast:** enters from the top, 400ms ease; swipe to dismiss.
- **Never** use `ease-in` for UI, animate from `scale(0)`, or exceed 300ms for
  plain UI transitions (sheets and toasts excepted).
- **Reduced motion:** cross-fades only; no blur, scale or bar movement.

## Accessibility

- Real `<button>`s; icon-only buttons have `aria-label` ("Start talking",
  "Stop talking", "Interrupt and talk", "End session").
- The conversation column is an `aria-live="polite"` region; the dock status is `role="status"`.
- Toggles are `role="switch"` with `aria-checked`; segmented controls use `aria-pressed`.
- Visible focus: 2px `primary` outline, 2px offset.
- Space is the push-to-talk shortcut; it must not fire while focus is in a text field.
- Color is never the only signal: states also change the status label and the mic icon.

## Implementation

- CSS custom properties per theme on `[data-theme="light"|"dark"]`, following
  `prefers-color-scheme` when Settings › Theme is System.
- Stack: Next.js + Tailwind + Motion. Component starting points (recolor to these
  tokens): Kokonut UI AI Voice / AI Text Loading for the mic and Thinking state,
  Sonner for toasts.
- Fonts: `next/font/google` with Geist and Geist_Mono.
