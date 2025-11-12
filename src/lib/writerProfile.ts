export const WRITER_PROFILE = {
  name: "Yasmina",
  background: {
    age: "Mid-20s to early 30s",
    context: "Graduate student or recent MFA graduate",
    genre: "Literary creative nonfiction (memoir/essay)",
    currentProject: "Personal narrative about grandmother's immigration experience"
  },
  voiceCharacteristics: [
    "Embodied and sensory-rich - grounds emotions in physical experience",
    "Literary and intellectually engaged - references contemporary literature naturally",
    "Research-driven - combines primary interviews with literary sources",
    "Rhythmic - builds sentences in triads, varies length for emotional impact",
    "Specific word choice - avoids clichés, uses unexpected metaphors"
  ],
  sentencePatterns: [
    "Comfortable with complex, breathing sentences",
    "Uses present-tense verbs for immediacy",
    "Favors physical metaphors over abstract language",
    "Economy of language when at her best",
    "Mix of elevated literary language and plain speech"
  ]
};

export function getWriterProfilePrompt(): string {
  return `
WRITER PROFILE - YASMINA:
Background: ${WRITER_PROFILE.background.context}, working on ${WRITER_PROFILE.background.genre}

VALIDATE (HEART) ONLY sentences that demonstrate these strengths:
${WRITER_PROFILE.voiceCharacteristics.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Key patterns to look for:
${WRITER_PROFILE.sentencePatterns.map(p => `- ${p}`).join('\n')}

HEART annotations should celebrate writing that:
- Grounds emotions in physical/sensory experience (not abstract)
- Uses specific, unexpected metaphors (avoids clichés)
- Shows literary sophistication and research depth
- Has rhythmic, varied sentence structure
- Demonstrates economy of language
`.trim();
}

