# Content Folder

This folder contains reference content files for the Claude Writing Mirror app.

## Files

### `default-text.md`

A markdown reference copy of the default text that appears in the editor.

**Note:** The actual default text used by the app is in:
```
src/lib/defaultText.ts
```

**To change the default text:**
1. Open `src/lib/defaultText.ts`
2. Edit the text between the backticks
3. Save the file
4. Changes appear immediately (with hot reload)

**Why a separate `.ts` file?**
- Works in Next.js client-side code (no `fs` module needed)
- Hot reload support (instant updates)
- TypeScript syntax highlighting

## Adding More Content Files

You can add additional `.md` files here as reference examples:
- `example-academic.md`
- `example-creative.md`
- `example-technical.md`

To use them, copy their content into `src/lib/defaultText.ts`.

