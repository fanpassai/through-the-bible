# Through the Bible — Project Continuation

## Current milestone

- Date: September 7, 2026
- Goal: Make the complete existing Lesson 1 reachable from the restored app for Friday review and launch preparation.
- Protected baseline branch: `approved-restoration-2026-09-07`
- Protected baseline commit: `e4461290f361b760b89645e4b1f3f26c5089dbd4`
- Working branch: `friday-lesson1-launch-2026-09-07`
- Status: Implemented locally; awaiting preview review and user approval.

## Approved product state that must be preserved

- Alpine opening/sign-in experience
- Home
- Today
- Lesson Overview with the scrolling fix
- Scripture Reader and its approved selection/study behavior
- Existing Lesson 1 content, artwork, state, activities and completion rules
- No wholesale redesign or substitution of earlier/rogue visual directions

## Change in this milestone

The Lesson Overview already writes a `resume=week1` navigation target. The restored root route ignored that target and always rendered the opening experience.

The root route now detects `resume=week1`, opens the existing `WeekOne` experience, and gives Lesson 1 a return path to the restored Lesson Overview. The ordinary `/` route still renders the approved alpine opening.

## Verification

- `npm ci`: passed
- `npm run build`: passed
- Next.js compilation and TypeScript validation: passed
- Routes preserved: `/`, `/design-lock/entry`, `/design-lock/home`, `/design-lock/today`, `/design-lock/lesson`, `/design-lock/reader`

## Immediate next action

Publish the working branch as a protected preview. Verify on mobile that selecting each of the eight Lesson 1 subjects opens the correct existing Lesson 1 state, that returning goes to the Lesson Overview, and that saved progress resumes correctly.

## Approval protocol

After user approval:

1. Record the approved commit SHA and preview URL in this file.
2. Create a permanent Git checkpoint/branch.
3. Create a complete source archive from that exact commit.
4. Save both the source archive and this continuation file for the next chat.
5. State the approved baseline and next action in the final chat note.
