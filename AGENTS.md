<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Environment

- This project uses Nix (via `flake.nix`) and direnv (`.envrc`) for a reproducible dev environment. Always ensure the Nix shell is active before running `pnpm dev`, `pnpm build`, or any other project commands.

## How we build

- Follow the phased build plan in `docs/plans/build-plan.md`. Work through it step by step — do not skip ahead.
- Explain each step as you go: what you're doing, why, and which Next.js concept it demonstrates. The user needs to fully understand every piece so they can explain it themselves in a video review.
- Wait for the user to verify and confirm before moving to the next step.
- Keep changes small and reviewable — one logical chunk at a time.
- Never commit code before the user has inspected and approved it. Always wait for explicit confirmation before committing.
- Commit frequently after each meaningful step. Vercel reviewers will look at the git history to confirm the project was built incrementally, not all at once.
- After pushing changes, always give the user a URL to verify the result. Use the production URL (https://vercel-daily-news-ten.vercel.app) or suggest `pnpm dev` on localhost.
