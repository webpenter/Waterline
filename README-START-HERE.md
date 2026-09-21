# Handover pack — two portals

Four files. Two projects. Read this page first, it takes two minutes.

---

## The files

| File | What it is |
|---|---|
| `WATERLINE-Waterfront-Portal-Spec-v2.1.pdf` | Complete build brief for **Portal 1** — a global portal listing only properties with direct water access. 26 pages. |
| `waterline-design-preview.html` | Interface design preview for Portal 1. Open it in a browser. |
| `LAWRENCE-Private-Collection-Spec-v2.pdf` | Complete build brief for **Portal 2** — Lawrence Private Collection, trophy property from €20M with a members' off-market section. 28 pages. |
| `lawrence-design-preview.html` | Interface design preview for Portal 2. Open it in a browser. |

The two projects are independent. Build one at a time. They share the same stack and the same structure, so the second one is roughly 40 % faster than the first — but **do not try to share code between them before both are live**; the abstractions are not yet earned.

---

## How these documents are meant to be used

Each PDF is written to be executed, not interpreted. In particular:

- **§22 of each spec contains ready-to-paste Cursor prompts, in build order.** Paste one, review the diff, run the acceptance criteria at the end of that prompt, commit, move to the next. Do not skip ahead and do not merge two prompts into one.
- **§1 of each spec tells you how to set up the repository for AI-assisted work** — it contains the full text of the `CLAUDE.md` file to create before writing any feature code, plus the Cursor rules file and the `DECISIONS.md` convention. Do this first; it is what keeps a long AI-assisted build coherent.
- **§21 answers every product question in advance** (45 decisions for Waterline, 48 for Lawrence), with defaults that are safe and reversible. Follow them. If you deviate, log it in `DECISIONS.md` rather than asking.
- **§13 tells you where every piece of content comes from** — photography, geodata, market figures, fonts, the logo recipe, editorial copy, translations, legal text, and the demo inventory generator. Nothing in the build waits on the client.
- **§1.5 lists the only things that genuinely require the client.** Four items for Lawrence, six for Waterline, and none of them block development.

The client's explicit instruction: **get to 90–100 % complete before involving them.** The documents are written so that is possible.

---

## The design previews

Open the `.html` files directly in a browser — no server, no build step, no dependencies. They show the key screens of each site at production fidelity.

Two things to understand about them:

1. **The photography is not photography.** Images are tonal gradients standing in for the licensed imagery the demo-data generator pulls automatically (spec §13.2). Do not chase the gradients; chase the layout, the hierarchy, the type scale, the spacing and the colour, all of which are real and match the tokens in §9.2 / §10.2.
2. **The fonts are the free stand-ins named in §13.3** — Playfair Display for Waterline's display face, Cormorant Garamond for Lawrence, Inter for body text on both. If a paid licence is bought later, it is a one-line change in the tokens file.

You can lift proportions and structure from these previews directly. They are a reference, not a codebase.

---

## Suggested first week

1. Read §0, §1, §2, §6 and §21 of the spec you are starting with. Skim the rest.
2. Open the design preview on a phone and on a desktop.
3. Create the repo, then `CLAUDE.md`, the Cursor rules file and `DECISIONS.md` from §1.1.
4. Run Prompt 1. Confirm CI is green before going further — the quality gates are what make the remaining prompts safe to run quickly.
5. Continue through the prompts in order.

Performance budgets in both specs are acceptance criteria, not aspirations. They are enforced in CI on purpose: it is far cheaper to hold the line from Prompt 1 than to recover it at the end.
