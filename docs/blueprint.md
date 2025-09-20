# **App Name**: School Companion

## Core Features:

- Curriculum-Locked Q&A: A 'Learn' chat that answers questions based on curated CBSE notes stored in Firestore. Uses a server-side AI tool to classify prompts, retrieve tagged notes, and generate grounded answers, citing source IDs (chapter/concept). If no match is found, the AI provides friendly in-scope suggestions.
- Math Explainer: A dedicated input to parse math problems (e.g., comparing fractions), returning stepwise reasoning, highlighting general rules, and offering a 3-question practice quiz generated from a seeded bank.
- Offline Translation: A 'Translate' tab for English <-> Kannada using on-device translation only. The Kannada model is downloaded on first use. Features a small phrasebook of classroom phrases and works fully offline.
- Progress Tracking: Local device-only view showing chapters practiced, streak (last 7 days), and top 3 suggested next concepts. Includes a 'Reset local data' option.
- Guardrails and Refusal Logic: Classification tool which classifies prompts and implement rules based on syllabus mapping to decline requests which are out of scope.

## Style Guidelines:

- Primary color: Calm blue (#64B5F6) evoking trust and knowledge.
- Background color: Light blue (#E3F2FD), a desaturated version of the primary, creates a clean and calm learning environment.
- Accent color: Soft green (#A5D6A7), analogous to blue, for positive feedback and highlighting important information.
- Body and headline font: 'PT Sans' for headlines or body text; combining modernity and approachability, ensuring legibility for students.
- Simple, clear icons for tabs and features, reinforcing ease of navigation.
- Clean, intuitive layout with clear visual hierarchy to minimize distractions and facilitate learning.
- Subtle animations for transitions and feedback, enhancing user experience without being intrusive.