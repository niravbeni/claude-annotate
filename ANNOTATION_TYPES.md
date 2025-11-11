# Annotation Types Guide

Claude Writing Mirror uses **4 types of visual annotations** to provide feedback on your writing:

## 1. ❤️ **Heart - Validation** (Orange)
**Visual Style:** Orange background highlight with a heart emoji (❤️) in the left margin

**Purpose:** Highlights strong, authentic writing where your voice shines through

**Examples:**
- Powerful imagery and vivid descriptions
- Unique perspectives and authentic voice
- Emotional resonance and compelling storytelling
- Concrete, evocative details

**Comment Style:** Bold, confident feedback celebrating what works

---

## 2. ≈ **Squiggle - Uncertainty** (Amber/Yellow)
**Visual Style:** Wavy amber underline

### Two Subtypes:

### 2a. Squiggle with (i) Icon - Fact Check
**Purpose:** Factual claims, quotes, or references that Claude cannot verify or that may be incorrect

**Includes:** 
- Browser reference modal with source material
- Alternative quotes or facts Claude found
- Clickable (i) icon to view the reference

**Comment Style:** Starts with ≈ symbol, uncertain language, exploratory

**Example:** "≈ I couldn't find this exact quote in 'Intermezzo.' Perhaps you were thinking of..."

### 2b. Squiggle without (i) - Creative Suggestion
**Purpose:** Creative alternatives or different perspectives Claude is exploring with you

**Includes:**
- Subjective ideas (not fact-checking)
- Alternative approaches to phrasing
- Creative "what if" suggestions

**Comment Style:** Starts with ≈ symbol, exploratory language

**Example:** "≈ What if it was longer—maybe three months? That extended gap could make the grief land differently."

---

## 3. ⭕ **Circle - Discrepancy** (Red)
**Visual Style:** Red border/outline around problematic text with subtle red background

**Purpose:** Logical inconsistencies, timeline errors, or contradictions within the text

**Examples:**
- Mathematical or date errors
- Internal contradictions
- Timeline inconsistencies
- Logic problems

**Comment Style:** Bold, confident, clear about the error

**Example:** "**These dates don't align.** If she arrived in 1952 at seventeen, she would turn twenty-one in **1956**, not 1954."

---

## Visual Summary

| Type | Symbol | Color | Style | Has Reference? |
|------|--------|-------|-------|----------------|
| **Validation** | ❤️ | Orange (#FF8C42) | Highlight + margin heart | No |
| **Uncertainty (Correction)** | ≈ | Amber (#E9C46A) | Wavy underline | Yes (i) icon |
| **Uncertainty (Suggestion)** | ≈ | Amber (#E9C46A) | Wavy underline | No |
| **Discrepancy** | ⭕ | Red (#E76F51) | Border + background | No |

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

