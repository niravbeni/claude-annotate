# Typography System

This app uses the Anthropic design system fonts based on the Figma design spec.

## Fonts

### Anthropic Sans (Variable)
**Location:** `public/fonts/AnthropicSans-Variable.ttf`  
**Usage:** UI elements (buttons, labels, sidebar, headers)  
**Weights:** 400 (regular), 600 (bold)

### Anthropic Serif (Variable)
**Location:** `public/fonts/AnthropicSerif-Variable.ttf`  
**Usage:** Editor text and Claude responses (main content)  
**Weights:** 400 (regular), 450 (medium), 650 (bold)

### JetBrains Mono (Variable)
**Location:** `public/fonts/JetBrainsMono-VariableFont_wght.ttf`  
**Usage:** Code blocks and inline code  
**Weights:** 400 (regular), 650-700 (bold)

---

## Typography Classes

### UI Text (Anthropic Sans)

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `.text-ui-display` | 28px | 140% | 400 | Large titles |
| `.text-ui-title` | 28px | 140% | 500 | Section titles |
| `.text-ui-body-large` | 17px | 140% | 400 | Large body text |
| `.text-ui-body-large-bold` | 17px | 140% | 600 | Large bold text |
| `.text-ui-body` | 14px | 140% | 400 | Default body text |
| `.text-ui-body-bold` | 14px | 140% | 600 | Bold body text |
| `.text-ui-body-small` | 13px | 140% | 400 | Small text |
| `.text-ui-body-small-bold` | 13px | 140% | 600 | Small bold text |
| `.text-ui-body-extra-small` | 11px | 140% | 400 | Captions, labels |

### Claude Response Text (Anthropic Serif)

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `.text-claude-title` | 28px | 140% | 450 | Document title |
| `.text-claude-heading` | 24px | 130% | 450 | Section heading |
| `.text-claude-subheading` | 20px | 130% | 650 | Subheading |
| `.text-claude-body` | 17px | 160% | 400 | **Main editor text** |
| `.text-claude-body-italic` | 17px | 160% | 400 | Italic text |
| `.text-claude-body-bold` | 17px | 160% | 650 | Bold text |
| `.text-claude-body-bold-italic` | 17px | 160% | 650 | Bold italic |
| `.text-claude-body-small` | 16px | 150% | 400 | Small body text |
| `.text-claude-body-small-bold` | 16px | 150% | 650 | Small bold text |

### Code Text (JetBrains Mono)

| Class | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `.text-code` | 16px | 150% | 400 | Code blocks |
| `.text-code-bold` | 16px | 150% | 650 | Bold code |
| `.text-code-small` | 14px | 150% | 400 | Inline code |
| `.text-code-small-bold` | 14px | 150% | 650 | Bold inline code |

---

## CSS Variables

```css
--font-sans   /* Anthropic Sans (UI) */
--font-serif  /* Anthropic Serif (Content) */
--font-mono   /* JetBrains Mono (Code) */
```

---

## Usage Examples

### UI Components
```tsx
<h1 className="text-ui-title">Claude Writing Mirror</h1>
<button className="text-ui-body-bold">Analyze</button>
<p className="text-ui-body-small">Character count: 1,234</p>
```

### Editor Content
```tsx
<div className="editor-text text-claude-body">
  {/* User's writing appears here */}
</div>
```

### Tooltips & Comments
```tsx
<div className="text-ui-body-small">
  **Embodied, sensory-rich description**
</div>
```

---

## Reference

Design specs: [Figma - Mobile Design System](https://www.figma.com/design/C2DLOLMkw52eZhLMGGh6HC/%F0%9F%93%B1-Mobile-Design-System-Library--WIP-)

