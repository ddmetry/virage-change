# Reconstruction note

This repository is a public reconstruction made from the uploaded `DESIGN.md`, `AUDIT.md`, `README.md`, `.env.example`, `.gitignore` and `package.json`.

The uploaded package referenced original folders `server/`, `src/`, `scripts/` and `test/`, but those source folders were not present in the supplied files. Therefore this repository recreates the page structure, design system, responsive behavior, motion rules, demo order flow, security headers and admin shell described by the documents; it is not a byte-for-byte copy of an unavailable original codebase.

`AUDIT.md` is preserved as the supplied reference report. Run `npm test`, `npm run build` and `node scripts/audit.cjs` to validate this reconstruction itself.
