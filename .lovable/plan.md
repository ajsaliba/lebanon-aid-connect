

## Plan: Make Time/Region Filter Bars Bigger and More Readable

### Changes to `src/components/map/TimeFilterBar.tsx`

Increase sizing across both filter bars:

- **Icons**: `h-3 w-3` → `h-4 w-4`
- **Button text**: `text-[9px]` → `text-[11px]`
- **Button padding**: `px-1.5 py-0.5` → `px-2.5 py-1`
- **Container padding**: `px-1.5 py-1` → `px-2 py-1.5`
- **Gap between buttons**: `gap-0.5` → `gap-1`
- **Outer gap between the two bars**: `gap-1` → `gap-1.5`

Single file change, purely visual.

