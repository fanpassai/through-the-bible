# Through the Bible — Project Continuation

## Current milestone

- Date: September 8, 2026
- Goal: Complete the Friday Lesson 1 experience by making Home a true continuity hub instead of a path back to the alpine opening.
- Protected baseline branch: `approved-restoration-2026-09-07`
- Protected baseline commit: `e4461290f361b760b89645e4b1f3f26c5089dbd4`
- Working branch: `friday-lesson1-launch-2026-09-07`
- Status: Journey foundation and the new Journey Home are build-verified and published to the protected preview; awaiting user review and approval.

## Governing execution plan

`PRODUCT_BUILD_PLAN.md` is now the source of truth for the ten-week information architecture, route contract, progress states, complete Week 1 inventory, build milestones, definitions of done, verification checklist, and approval/archive protocol.

The user approved the product direction: combine a guided exact next step with a complete Week 1–10 journey map. Tapping a week opens its full Week Plan. Tapping an available activity opens that exact activity and state. We must replace generic resume routing with durable activity URLs and must not return learners to the alpine opening during normal app use.

Milestone 1 — Journey foundation is complete locally. The typed manifest contains Weeks 1–10, including explicit Week 2–10 placeholders and the complete Week 1 inventory: 4 editorial movements, 8 lesson subjects, 8 required passages, Place with 6 movements, 10 Fill questions, 4 Connect discoveries, Unlock with 4 teach-back steps, and 7 devotionals.

The foundation also contains the five-state progress resolver, legacy Week 1 progress migration, permanent route builder, and automated contract check. Verification passed with 10 weeks, 43 activities, and 56 permanent routes; the Next.js production build and TypeScript passed.

Active milestone: Milestone 2 — Journey Home preview review. The visible Journey Home is built from the new manifest and progress resolver. The existing Week 1 player still uses its compatibility resume route until Milestone 4; do not add new generic resume dependencies.

## Approved product state that must be preserved

- Alpine opening/sign-in experience
- Home
- Today
- Lesson Overview with the scrolling fix
- Scripture Reader and its approved selection/study behavior
- Existing Lesson 1 content, artwork, state, activities and completion rules
- No wholesale redesign or substitution of earlier/rogue visual directions

## Changes in the current Journey checkpoint

The Lesson Overview already writes a `resume=week1` navigation target. The restored root route ignored that target and always rendered the opening experience.

The root route now detects `resume=week1`, opens the existing `WeekOne` experience, and gives Lesson 1 a return path to the restored Lesson Overview. The ordinary `/` route still renders the approved alpine opening.

The new canonical `/journey` Home screen now:

- uses a pure white, full-height course canvas;
- shows real saved Week 1 progress and the exact next activity;
- has one clear Begin/Continue/Review action using the existing Week 1 resume adapter;
- shows all ten weeks in a two-row status map on every visit;
- makes every week tappable through the canonical route builder;
- opens Week 1 through the preserved Lesson Overview compatibility route;
- gives Weeks 2–10 honest locked pages explaining that no content will be invented or skipped;
- summarizes the complete current-week inventory so the lower page remains useful; and
- hides secondary navigation until the learner has started, reducing first-session wandering.

`/design-lock/home` now redirects to `/journey`. Entry, Today, Lesson Overview, and Profile return paths now point to the Journey Home. No Journey Home control uses `#` or returns to the alpine opening.

## Home interaction map

| Home action | Destination |
| --- | --- |
| Avatar / Profile | `/design-lock/profile` |
| Begin / Continue / Review Week 1 | Exact saved resume target in `/?resume=week1` through the compatibility adapter |
| Week 1 card or plan | `/weeks/1`, currently redirected to the preserved Lesson Overview |
| Weeks 2–10 | `/weeks/2` through `/weeks/10`, each rendering its explicit locked placeholder |
| Today | `/design-lock/today` |
| My Bible | Existing saved-study view in `/?resume=week1&study=open` |

## Verification

- `npm test`: passed
- Course contract: passed — 10 weeks, 43 activities, 56 permanent routes
- Next.js compilation and TypeScript validation: passed
- Static generation: `/weeks/1` through `/weeks/10` passed
- Routes added: `/journey`, `/weeks/[week]`
- `git diff --check`: passed

## Immediate next action

The user should review the Journey Home at mobile height, first-session focus, all ten week destinations, and exact Lesson 1 resume. After approval, begin Milestone 3: the complete manifest-driven Week Plan.

## Current protected preview checkpoint

- Journey implementation commit: `d71760e0c16027d8d84b62c0c05926f1dc35ae32`
- Preview branch: `friday-lesson1-launch-2026-09-07`
- Direct review route: `https://through-the-bible-git-friday-lesson1-118efa-fanpassais-projects.vercel.app/journey`
- Vercel status: both configured preview deployments passed
- Production: untouched

## Approval protocol

After user approval:

1. Record the approved commit SHA and preview URL in this file.
2. Create a permanent Git checkpoint/branch.
3. Create a complete source archive from that exact commit.
4. Save both the source archive and this continuation file for the next chat.
5. State the approved baseline and next action in the final chat note.
