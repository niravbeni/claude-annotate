# Annotation Types Guide

Claude Writing Mirror uses **4 types of visual annotations** to provide feedback on your writing:

## 1. 🧡 **Heart - Validation** (Claude Orange)
**Visual Style:** Soft orange background highlight with a filled heart icon (♥) as superscript at the end

**Purpose:** Highlights strong, authentic writing where your voice shines through

**Examples:**
- Powerful imagery and vivid descriptions
- Unique perspectives and authentic voice
- Emotional resonance and compelling storytelling
- Concrete, evocative details

**Comment Style:** Bold, confident feedback celebrating what works

**Browser Reference:** NO - Heart annotations never include reference links

---

## 2. ≈ **Squiggle - Uncertainty** (Claude Orange)
**Visual Style:** Wavy Claude orange underline

### Two Subtypes:

### 2a. Squiggle - Fact Check (squiggle-correction)
**Purpose:** Factual claims, quotes, or references that Claude cannot verify or that may be incorrect

**Includes:** 
- Browser reference modal with source material when found
- Alternative quotes or facts Claude discovered
- Clickable (i) icon to view the reference

**Comment Style:** Starts with ≈ symbol, uncertain language, exploratory

**Example:** "≈ I couldn't find this exact quote in 'Intermezzo.' Perhaps you were thinking of..."

**Browser Reference:** YES - Shows source material and alternative facts

### 2b. Squiggle - Creative Suggestion (squiggle-suggestion)
**Purpose:** Creative alternatives or different perspectives Claude is exploring with you

**Includes:**
- Subjective ideas (not fact-checking)
- Alternative approaches to phrasing
- Creative "what if" suggestions
- May include reference if helpful

**Comment Style:** Starts with ≈ symbol, exploratory language

**Example:** "≈ What if it was longer—maybe three months? That extended gap could make the grief land differently."

**Browser Reference:** SOMETIMES - Included when helpful for context

---

## 3. ⭕ **Circle - Discrepancy** (Red)
**Visual Style:** Sketchy hand-drawn red circle around problematic text (behind the text)

**Purpose:** Logical inconsistencies, timeline errors, or contradictions within the text

**Examples:**
- Mathematical or date errors
- Internal contradictions
- Timeline inconsistencies
- Logic problems

**Comment Style:** Bold, confident, clear about the error

**Example:** "**These dates don't align.** If she arrived in 1952 at seventeen, she would turn twenty-one in **1956**, not 1954."

**Browser Reference:** YES - Shows the correct fact or timeline with source

---

## Visual Summary

| Type | Symbol | Color | Style | Has Reference? |
|------|--------|-------|-------|----------------|
| **Validation** | ♥ | Claude Orange (#C6613F) | Highlight + filled heart icon | NO |
| **Uncertainty (Correction)** | ≈ | Claude Orange (#C6613F) | Wavy underline | YES (i) icon |
| **Uncertainty (Suggestion)** | ≈ | Claude Orange (#C6613F) | Wavy underline | SOMETIMES |
| **Discrepancy** | ⭕ | Red (#E76F51) | Sketchy hand-drawn circle | YES (with correct fact) |

---

## Comment Tone

### Certain Comments (Heart, Circle)
- Use **bold** words to show confidence
- Direct and clear feedback
- Celebrate strengths or identify clear issues

### Uncertain Comments (Squiggle)
- Start with ≈ symbol
- Use exploratory, collaborative language
- Invite dialogue rather than dictate changes
- Phrases like "Perhaps," "I couldn't find," "What if," "Not sure"

---

## How to Use

1. **Hover** over any annotation to see Claude's detailed comment
2. **Click (i) icon** in tooltip (if present) to view source references
3. **Toggle** annotations on/off with the switch in the header
4. **Check sidebar** for complete history of all comments

