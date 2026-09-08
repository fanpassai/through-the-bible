# Through the Bible — Friday Build Execution Plan

Last updated: September 8, 2026

## North star

Every learner must always know:

1. where they are in the ten-week journey;
2. what they have completed;
3. what they have started;
4. what is pending or locked;
5. what the single best next action is; and
6. how to return to the plan without being sent to the alpine opening.

Lesson 1 is the master architecture for Lessons 2–10. We build the reusable journey system around the complete existing Lesson 1 instead of rebuilding or reducing it.

## Non-negotiable product rules

- The alpine opening appears only at initial entry, sign-out, or deliberate restart.
- After sign-in, app entry always restores the learner to the Journey Home.
- Home uses a pure white canvas and fills the mobile viewport with useful course context.
- The Home primary action resumes the exact unfinished activity.
- The full Week 1–10 journey is visible on every Home visit.
- Tapping a week opens that Week Plan; it never starts an arbitrary activity.
- Every available activity has a durable URL and opens directly at its saved state.
- Completed activities reopen in review mode.
- Pending activities open at their beginning when available.
- Locked activities explain why they are locked and what unlocks them.
- Every activity provides Back to Week, Save and leave, and Continue controls where appropriate.
- No clickable control may use `#`, silently do nothing, or redirect to the alpine opening.
- Progress is derived from saved activity evidence, not hard-coded percentages.
- Visible status never relies on color alone.

## Canonical product structure

### Level 1 — Journey Home

- Current-position card
- Exact Continue action
- Complete two-row Week 1–10 map
- Current week automatically emphasized
- Compact Week progress summary
- Primary navigation

### Level 2 — Week Plan

- Week identity, theme, scope, and progress
- Core lesson subjects
- Required Scripture
- Place
- Fill
- Connect
- Unlock
- Go Deeper devotionals
- State and direct destination for every activity

### Level 3 — Activity experience

- Persistent Week and activity context
- Exact saved resume point
- Activity-specific interaction
- Completion confirmation
- Next activity recommendation
- Reliable return to Week Plan

## Route contract

| Destination | Canonical route |
| --- | --- |
| Journey Home | `/journey` |
| Week Plan | `/weeks/[week]` |
| Story movement | `/weeks/[week]/lesson/movement-[movement]` |
| Lesson subject | `/weeks/[week]/lesson/subject-[subject]` |
| Scripture passage | `/weeks/[week]/scripture/[passage]` |
| Place | `/weeks/[week]/place` |
| Fill question | `/weeks/[week]/fill/[question]` |
| Connect discovery | `/weeks/[week]/connect/[discovery]` |
| Unlock | `/weeks/[week]/unlock` |
| Devotional day | `/weeks/[week]/devotional/[day]` |
| My Bible | `/my-bible` |
| Profile | `/profile` |

Temporary compatibility routes may redirect into this contract while the restored build is migrated. New product behavior must not add more `/?resume=week1` dependencies.

## Progress states

| State | Meaning | Tap behavior |
| --- | --- | --- |
| Completed | Required completion evidence exists | Open in review mode |
| In progress | Activity has saved progress but is unfinished | Resume exact saved point |
| Available | Activity may be started now | Open at the beginning |
| Pending | Visible in the plan but not yet the recommended step | Open if sequencing allows; otherwise show the required prior step |
| Locked | Date, release, or prerequisite prevents entry | Show the unlock reason and requirement |

The Home recommendation is the first incomplete required activity in the approved sequence. The learner may inspect the whole plan without losing the recommended path.

## Week 1 master inventory

### Core lesson — 8 subjects

- [ ] 1. Before anything else, God.
- [ ] 2. God speaks a good world into order.
- [ ] 3. Humanity bears God's image.
- [ ] 4. Humanity receives gifts and a boundary.
- [ ] 5. The serpent begins with a question.
- [ ] 6. Shame becomes hiding and blame.
- [ ] 7. Judgment names what has changed.
- [ ] 8. Promise appears before exile.

### Required Scripture — 8 passages

- [ ] Genesis 1:3–31
- [ ] Genesis 1:26–28
- [ ] Genesis 2:15–17
- [ ] Genesis 3:1–7
- [ ] Genesis 3:14–19
- [ ] Genesis 3:22–24
- [ ] Genesis 3:15
- [ ] 1 John 3:8

### Course work

- [ ] Place — 6 movements
- [ ] Fill — 10 guided questions
- [ ] Connect — 4 discoveries
- [ ] Unlock — teach the story back

### Go Deeper — 7 devotionals

- [ ] Day 1 — Formed before filled.
- [ ] Day 2 — The garden needed hands.
- [ ] Day 3 — Named before broken.
- [ ] Day 4 — Which voice sounds true?
- [ ] Day 5 — Where are you?
- [ ] Day 6 — Buried is not dead.
- [ ] Day 7 — The beginning belongs to Christ.

## Ten-week coverage ledger

| Week | Plan record | Content | Routes | Progress | UX review |
| --- | --- | --- | --- | --- | --- |
| 01 | Complete | Existing complete content preserved | Contract complete; UI migration in progress | Compatibility adapter complete | Preview review pending |
| 02 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 03 | Complete placeholder | Existing material must be inventoried before use | Contract complete | Locked | Pending |
| 04 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 05 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 06 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 07 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 08 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 09 | Complete placeholder | Pending content | Contract complete | Locked | Pending |
| 10 | Complete placeholder | Pending content | Contract complete | Locked | Pending |

Weeks 2–10 receive structural records in the first foundation milestone so they can never be omitted. Unknown titles or content remain explicitly pending; they are not invented.

## Build sequence and definition of done

### Milestone 0 — Product contract and tracker

- [x] Freeze the three-level information architecture.
- [x] Freeze the route contract.
- [x] Freeze progress-state meanings and tap behavior.
- [x] Record the complete Week 1 inventory.
- [x] Record all ten weeks in the coverage ledger.
- [x] Define the milestone and approval protocol.

### Milestone 1 — Journey foundation

- [x] Create one typed course manifest for Weeks 1–10.
- [x] Populate the full Week 1 manifest from existing data.
- [x] Add explicit placeholders for Weeks 2–10.
- [x] Create one progress resolver for completed, in-progress, available, pending, and locked.
- [x] Create one route builder for every activity type.
- [x] Add compatibility migration for current Week 1 browser progress.
- [x] Add a contract check proving every manifest activity has a valid destination.

Definition of done: one source of truth can answer where every week and activity appears, what its state is, and where a tap goes.

### Milestone 2 — Journey Home

- [x] Replace the free-roaming Home layout.
- [x] Add the current-position and exact Continue card.
- [x] Add the complete two-row Week 1–10 map.
- [x] Add status labels that do not depend on color.
- [x] Add the useful lower progress summary on pure white.
- [x] Remove competing first-session actions.
- [ ] Verify new, returning, and Week-complete Home states.

Preview review on September 8 rejected the first visual pass: typography felt changed and rushed, the compact utility grid lacked an elite image-led experience, and most destinations did not provide meaningful continuity. The corrective pass restores the established Geist/Nimbus editorial system, replaces the utility cells with cinematic week cards, and connects Home to the complete Week 1 plan and canonical activity routes.

Definition of done: on every app open, a learner can state their current week, current activity, progress, and next action without navigating elsewhere.

### Milestone 3 — Reusable Week Plan

- [x] Build one Week Plan from the course manifest.
- [x] Show every lesson subject, Scripture passage, activity, and devotional.
- [x] Show exact status and progress for each row.
- [x] Make completed, in-progress, and available rows directly actionable.
- [x] Give pending and locked rows honest explanatory behavior.
- [x] Populate the complete Week 1 plan.
- [x] Confirm Weeks 2–10 render structurally without invented content.
- [ ] Complete user visual and interaction review of the Week 1 plan.

Definition of done: the Week 1 plan is a complete, trustworthy table of contents and progress record.

### Milestone 4 — Durable activity navigation

- [x] Create permanent route handlers for all Week 1 activity types.
- [x] Deep-link each of the 8 lesson subjects.
- [x] Deep-link each of the 8 required passages.
- [x] Deep-link Place, 10 Fill questions, 4 Connect discoveries, and Unlock.
- [x] Deep-link all 7 devotional days.
- [ ] Preserve exact progress after refresh and app reopening.
- [ ] Add Back to Week and reliable Continue behavior.
- [ ] Retire generic resume routing after migration is verified.

Definition of done: every Week 1 row opens the correct content, and refresh/back/reopen never returns the learner to the alpine opening.

### Milestone 5 — Complete experience verification

- [ ] First entry: alpine → sign-in → Journey Home.
- [ ] New learner: Home → Week 1 → Subject 1.
- [ ] Resume learner: app open → exact saved activity.
- [ ] Completed activity: reopen in review mode.
- [ ] Pending and locked behavior is understandable.
- [ ] Scripture tap opens the approved reader interaction.
- [ ] Highlights, underlines, notes, questions, and bookmarks persist.
- [ ] Place, Fill, Connect, Unlock, and devotional completion persist.
- [ ] Week progress and Home recommendation update correctly.
- [ ] Mobile layout has no bare lower gap, clipping, or dead controls.
- [ ] Production build and TypeScript pass.

Definition of done: every approved Week 1 path works end to end on the protected preview.

### Milestone 6 — Friday review and approval

- [ ] Publish the protected preview without changing production.
- [ ] User reviews the Journey Home, Week 1 plan, and every activity type.
- [ ] Record requested corrections in this file before implementation.
- [ ] Receive explicit approval.
- [ ] Record the approved Git commit and preview URL.
- [ ] Create the exact source archive.
- [ ] Update `PROJECT_CONTINUATION.md`.
- [ ] Leave the final approved handoff note for the next chat.

## Working protocol

1. Only one milestone may be active at a time.
2. Before coding, mark its checklist items and acceptance criteria here.
3. Build the smallest complete slice that satisfies the milestone.
4. Run the production build and route/contract checks.
5. Commit a named checkpoint.
6. Update this plan and `PROJECT_CONTINUATION.md`.
7. Publish only when the user asks for the preview.
8. Do not mark a milestone approved until the user explicitly approves it.
9. After approval, archive the exact approved commit and continuation file.

## Current position

- Active milestone: Milestone 2 correction and Milestone 3 preview review
- Last local product checkpoint before Milestone 1: `4f6ec4a`
- Hosted equivalent before this plan: `881ed0ccd78605c8b658e5996911816b41f90e2a`
- Protected preview branch: `friday-lesson1-launch-2026-09-07`
- Production: untouched
- Milestone 1 verification: 10 weeks, 43 Week 1 activities, 56 permanent routes; course contract and production build passed.
- Journey Home implementation: complete locally and production-build verified. It is driven by the manifest and progress resolver, shows the exact legacy-compatible Continue target, exposes the two-row Week 1–10 map, and gives Weeks 2–10 honest locked destinations.
- Protected Journey implementation commit: `d71760e0c16027d8d84b62c0c05926f1dc35ae32`; both Vercel preview checks passed.
- User rejected that first Journey visual pass because the typography, cleanliness, imagery and destinations did not reach the approved standard.
- Corrective implementation: image-led Home, established Geist/Nimbus typography, cinematic Week 1–10 cards, complete Week 1 Plan, canonical activity launch gateway, and designed prerequisite/locked behavior.
- Next action: publish the corrective preview and review Home, Week 1 Plan, activity launches and locked-week previews on mobile.
