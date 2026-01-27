# StudyOS – Product Requirements Document (PRD)

## 1. Overview
**Product name:** StudyOS (working title)

**Product vision:**  
StudyOS is a local-first, encrypted study and productivity system that unifies task management, note-taking, and flashcards into a single coherent workflow, reinforced by streaks, heatmaps, and light gamification. It is built on a JavaScript/TypeScript core to ensure portability across web and mobile platforms.

**Problem statement:**  
Learners and professionals currently rely on fragmented tools (task apps, note apps, flashcard apps) that do not interoperate well, lack strong motivation loops, and often depend on cloud-first architectures that compromise privacy.

**Solution:**  
A modular, feature-forward study tool that:
- Works offline by default
- Encrypts all user data locally
- Supports open formats (Markdown, CSV)
- Is easily portable to iOS and Android

---

## 2. Goals & Objectives

### Primary goals
- Reduce friction between task planning, execution, and learning
- Encourage consistency via streaks, heatmaps, and rewards
- Maintain full user data ownership via local-first encrypted storage
- Enable future mobile and cross-platform expansion with minimal refactor

### Success metrics
- Daily and weekly active usage
- Median streak length over time
- Percentage of tasks completed from Q2 (Important / Not Urgent)
- Flashcard review consistency (Phase 2)
- Export usage rate (proxy for user trust)

---

## 3. Non-Goals (Initial Releases)
- Real-time collaboration
- Mandatory cloud accounts or sync
- Full Anki package parity in MVP
- Social features without explicit opt-in

---

## 4. Target Users
- Students preparing for exams or long-term study goals
- Professionals managing learning alongside work
- Knowledge workers who prefer Markdown-based workflows
- Users who value privacy, offline access, and data portability
- Neurodivergent users (e.g. ADHD) who benefit from structured prioritisation

---

## 5. Platform & Architecture

### Technology strategy
- **Language:** TypeScript (shared core)
- **UI:** React (Web), React Native via Expo (Mobile)
- **State management:** Zustand or Redux Toolkit
- **Storage abstraction:** IndexedDB (Web), SQLite/MMKV (Mobile)
- **Crypto:** AES-256-GCM with passphrase-derived keys
- **Notifications:** Local notifications (mobile-first)

### Monorepo structure
```
packages/
  core/        # Domain logic, scoring, streaks, schedulers
  storage/     # Storage adapters + migrations
  crypto/      # Encryption, key derivation, export bundles
  importers/   # Notion, Obsidian, Anki CSV
apps/
  web/
  mobile/
```

---

## 6. Core Features

## 6.1 Task System

### Features
- Task Dumper (Inbox): rapid capture of tasks
- Daily Task Manager: curated daily plan
- Eisenhower Matrix (Urgent/Important grid)
- Task metadata: due date, estimate, energy, tags, recurrence
- Task rollover with friction (snooze reason)
- Task completion tracking

### Eisenhower Quadrants
- Q1: Urgent + Important → Do
- Q2: Not Urgent + Important → Schedule
- Q3: Urgent + Not Important → Delegate / Quick wins
- Q4: Not Urgent + Not Important → Eliminate / Backlog

---

## 6.2 Gamification
- Points awarded for task completion
- Bonus weighting for Q2 tasks
- Streak-based multipliers
- Token wallet for future cosmetic or utility rewards
- No pay-to-win mechanics

---

## 6.3 Notification System
- Local reminders for due tasks
- Daily planning reminder
- Optional smart nudges (e.g. neglected Q2 tasks)
- Quiet hours and notification preferences

---

## 6.4 Notes Manager

### Features
- Markdown-based note editor
- Wikilinks and automatic backlinks
- Zettelkasten-friendly atomic note workflow
- Tagging and metadata via frontmatter
- Encrypted local note vault

### Import / Export
- Import from Obsidian (Markdown folders + media)
- Import from Notion exports (Phase 3)
- Export entire vault as a single encrypted bundle file

---

## 6.5 Flashcard System (Phase 2)

### Features
- Anki-compatible CSV import/export
- Card types: Basic, Cloze (MVP)
- Spaced repetition scheduling (SM-2 style)
- Media support (JPEG, PNG, GIF)
- Encrypted local storage and encrypted export bundles

---

## 6.6 Insights, Heatmaps & Streaks

### Heatmaps
- Daily activity heatmap (tasks, notes, cards)
- Study effort heatmap (future timer integration)

### Streaks
- Configurable daily win condition
- Grace days per month
- Optional streak freeze using earned tokens

### Statistics
- Tasks completed per day/week
- Q2 task completion ratio
- Flashcard backlog and review consistency
- Note creation and linking trends

---

## 7. Security & Privacy

### Encryption
- AES-256-GCM encryption for all stored data
- Key derivation via Argon2id or scrypt
- Per-record encryption (notes, tasks, cards)

### Key storage
- Mobile: Secure Enclave / Keychain
- Web: WebCrypto + user passphrase

### Privacy principles
- No data leaves device by default
- All exports are encrypted
- Telemetry is opt-in only (future)

---

## 8. Functional Requirements

### FR1: Tasks
- Create, edit, complete, delete tasks
- Assign Eisenhower quadrant
- View tasks by Inbox, Daily, Matrix
- Recurrence (basic)

### FR2: Gamification
- Point allocation on completion
- Token balance
- Streak multiplier

### FR3: Notifications
- Local reminders
- Configurable schedules

### FR4: Notes
- Markdown editing
- Backlinks
- Encrypted storage
- Import/export

### FR5: Flashcards (Phase 2)
- CSV import/export
- Media attachments
- SRS scheduling

### FR6: Insights
- Heatmaps
- Streak display
- Basic analytics dashboard

---

## 9. UX Requirements
- Fast capture (<2 seconds to add task)
- Keyboard-first on web
- Touch-optimised on mobile
- Minimal modal usage
- Accessibility-compliant (contrast, text size, screen readers)

---

## 10. Roadmap

### Phase 0 – Foundations
- Monorepo setup
- Core data models
- Encryption and storage primitives

### Phase 1 – MVP
- Task system + Eisenhower Matrix
- Daily planner
- Gamification + streaks
- Notes manager (Markdown + encryption)
- Heatmaps

### Phase 2
- Flashcard system
- Media support
- Advanced analytics

### Phase 3+
- Cross-device encrypted sync
- Collaboration
- Leaderboards (opt-in)
- Monetisation tiers

---

## 11. Risks & Mitigations
| Risk | Mitigation |
|----|----|
| Crypto complexity | Simple passphrase UX, clear recovery warnings |
| Import variability | Ship Obsidian first, Notion later |
| Notification inconsistency | Mobile-first, best-effort web |

---

## 12. Open Questions
- Default daily win condition?
- Task point calibration?
- Flashcard scheduling strictness vs flexibility?
- Sync model (peer-to-peer vs relay server)?

---

**End of PRD**
