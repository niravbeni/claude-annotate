# Claude Writing Mirror

A web application that uses Claude AI to analyze written text and provide real-time visual annotations highlighting strong writing, uncertainties, creative suggestions, and logical discrepancies.

## Features

- **Visual Annotations**: Four types of annotations
  - ❤️ Hearts for strong, authentic writing
  - ≈ Squiggles for uncertainties and suggestions
  - ⭕ Circles for logical discrepancies
- **Interactive Tooltips**: Hover over annotations to see detailed feedback
- **Comment History**: Track all feedback received in your session
- **Browser References**: View source materials for fact-checks
- **Responsive Design**: Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Claude API key from Anthropic

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
The `.env.local` file is already configured with your API key.

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Edit Text**: The editor loads with a default story. You can edit or replace it with your own text (up to 5,000 characters).

2. **Analyze**: Click the blue send arrow button (↑) or press `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows) to analyze your text.
   - **Analysis Time**: Typically takes 8-15 seconds depending on text length
   - A loading spinner will show while Claude is analyzing
   - You'll see a toast notification when complete

3. **View Annotations**: After analysis, your text will display with visual annotations:
   - Hover over annotations to see detailed comments
   - Click the (i) icon in tooltips to view references

4. **Comment History**: Check the right sidebar to see all feedback from your session.

5. **Toggle Annotations**: Use the switch in the header to show/hide annotations while keeping your text visible.

## Keyboard Shortcuts

- `Cmd+Enter` / `Ctrl+Enter`: Analyze text
- `Escape`: Close browser reference modal

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Tooltips**: Tippy.js
- **AI**: Claude Sonnet 4.5 via Anthropic SDK

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/analyze/    # API endpoint for Claude
│   │   ├── layout.tsx      # Root layout
│   │   ├── page.tsx        # Main page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AnalyzeButton.tsx
│   │   ├── AnnotatedText.tsx
│   │   ├── BrowserModal.tsx
│   │   ├── CommentCard.tsx
│   │   ├── CommentSidebar.tsx
│   │   ├── CommentTooltip.tsx
│   │   ├── Header.tsx
│   │   └── TextEditor.tsx
│   └── lib/
│       ├── claude.ts       # Claude API client
│       ├── constants.ts    # App constants
│       └── store.ts        # Zustand store
├── types/
│   └── index.ts           # TypeScript types
└── .env.local             # Environment variables
```

## License

MIT
