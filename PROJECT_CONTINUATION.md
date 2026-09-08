# Through the Bible — Project Continuation

## Current milestone

- Date: September 8, 2026
- Goal: Complete the Friday Lesson 1 experience by making Home a true continuity hub instead of a path back to the alpine opening.
- Protected baseline branch: `approved-restoration-2026-09-07`
- Protected baseline commit: `e4461290f361b760b89645e4b1f3f26c5089dbd4`
- Working branch: `friday-lesson1-launch-2026-09-07`
- Status: Homepage continuity pass implemented locally and build-verified; awaiting user preview review and approval.

## Approved product state that must be preserved

- Alpine opening/sign-in experience
- Home
- Today
- Lesson Overview with the scrolling fix
- Scripture Reader and its approved selection/study behavior
- Existing Lesson 1 content, artwork, state, activities and completion rules
- No wholesale redesign or substitution of earlier/rogue visual directions

## Changes in the current review checkpoint

The Lesson Overview already writes a `resume=week1` navigation target. The restored root route ignored that target and always rendered the opening experience.

The root route now detects `resume=week1`, opens the existing `WeekOne` experience, and gives Lesson 1 a return path to the restored Lesson Overview. The ordinary `/` route still renders the approved alpine opening.

The Home screen now:

- uses a pure white page canvas instead of the off-white paper color;
- shows Week 1 and real saved Lesson 1 progress instead of hard-coded Week 3 data;
- uses an additional useful Week 1 snapshot to remove the bare lower-page gap;
- resumes the exact unfinished Lesson 1 step from the main button;
- opens Genesis 1:3–31 in the Scripture Reader from Daily Reading;
- opens the current Go Deeper day from Devotional;
- opens My Study with saved notes, questions and marked Scripture from Review and My Bible;
- opens the course plan from Today and the lesson overview from Study; and
- opens a new functional Profile/account-and-sync screen from the avatar and Profile navigation.

The My Bible and Profile destinations were also corrected in the Today and Lesson Overview bottom navigation. No clickable Home action is left as `#` or routed to the alpine opening.

## Home interaction map

| Home action | Destination |
| --- | --- |
| Avatar / Profile | `/design-lock/profile` |
| Begin / Continue Lesson 1 | Exact saved resume target in `/?resume=week1` |
| Daily Reading | `/design-lock/reader?reference=Genesis%201%3A3%E2%80%9331` |
| Devotional | Current Go Deeper day in `/?resume=week1` |
| Review | `/?resume=week1&study=open` |
| View plan / Today | `/design-lock/today` |
| Study | `/design-lock/lesson` |
| My Bible | `/?resume=week1&study=open` |

## Verification

- `npm ci`: passed
- `npm run build`: passed
- Next.js compilation and TypeScript validation: passed
- Routes preserved: `/`, `/design-lock/entry`, `/design-lock/home`, `/design-lock/today`, `/design-lock/lesson`, `/design-lock/reader`
- Route added: `/design-lock/profile`
- `git diff --check`: passed

## Immediate next action

Publish the new review checkpoint to the existing protected preview. Verify Home at mobile height, every Home destination, My Study opening directly, exact Lesson 1 resume, and the new Profile/account screen. Apply the user's review before declaring this approved.

## Approval protocol

After user approval:

1. Record the approved commit SHA and preview URL in this file.
2. Create a permanent Git checkpoint/branch.
3. Create a complete source archive from that exact commit.
4. Save both the source archive and this continuation file for the next chat.
5. State the approved baseline and next action in the final chat note.
