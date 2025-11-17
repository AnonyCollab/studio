# AnonyCollab Design Guidelines

## Overview
This document outlines the design system, color schemas, and styling conventions used in the AnonyCollab social media dashboard. Use this guide to maintain visual consistency when creating new pages or components.

---

## Color Schema

### Dark Theme (Default)
The application primarily uses a modern dark theme with cyan accents.

#### Background Colors
- **Primary Background**: `#0a0e1a` - Deep dark blue-black, used for the main background and navigation
- **Card Background**: `#131823` - Slightly lighter dark blue, used for post cards and content containers
- **Popover Background**: `#1a1f2e` - Mid-tone dark blue, used for dropdowns and popovers
- **Secondary Background**: `#1e293b` - Muted dark slate, used for muted elements and accents

#### Text Colors
- **Primary Text**: `#e5e7eb` - Light gray, used for main body text and headings
- **Secondary Text**: `#94a3b8` - Medium gray, used for descriptions and metadata
- **Muted Text**: `#6b7280` - Darker gray, used for timestamps and less important info

#### Accent Colors
- **Primary Accent**: `#22d3ee` (Cyan/Aqua) - The main brand color used for:
  - Buttons (Create Post, primary actions)
  - Hover states on interactive elements
  - Focused states and rings
  - Links and active states
  - Icon highlights
  
- **Destructive**: `#ef4444` - Red, used for delete actions and error states
- **Success**: Emerald shades (`emerald-500/20` for background, `emerald-300` for text)

#### Badge & Tag Colors
Tags and badges use semi-transparent backgrounds with brighter text for better readability:
- **Purple**: `bg-purple-500/20 text-purple-300 border-purple-500/30`
- **Cyan**: `bg-cyan-500/20 text-cyan-300 border-cyan-500/30`
- **Orange**: `bg-orange-500/20 text-orange-300 border-orange-500/30`
- **Emerald**: `bg-emerald-500/20 text-emerald-300 border-emerald-500/30`
- **Pink**: `bg-pink-500/20 text-pink-300 border-pink-500/30`

#### Borders & Dividers
- **Primary Border**: `rgba(255, 255, 255, 0.1)` or `border-white/10` - Subtle white borders
- **Secondary Border**: `rgba(255, 255, 255, 0.05)` or `border-white/5` - Very subtle dividers
- **Input Background**: `rgba(255, 255, 255, 0.05)` - Transparent white overlay

#### Interactive States
- **Hover Border**: `border-cyan-400/50` - Cyan border at 50% opacity
- **Hover Shadow**: `shadow-[0_0_20px_rgba(34,211,238,0.15)]` - Cyan glow effect
- **Hover Text**: `hover:text-cyan-400` - Bright cyan for interactive text
- **Focus Ring**: `ring-cyan-400` or `#22d3ee` - Cyan outline for keyboard focus

---

### Light Theme
The application also supports a clean light theme with cyan accents.

#### Background Colors
- **Primary Background**: `bg-gray-50` - Light neutral gray
- **Card Background**: `bg-white` - Pure white for cards and containers
- **Popover Background**: `bg-white` - White for dropdowns and popovers

#### Text Colors
- **Primary Text**: `text-gray-900` - Near black for headings and primary content
- **Secondary Text**: `text-gray-600` - Medium gray for descriptions
- **Muted Text**: `text-gray-500` - Lighter gray for timestamps

#### Accent Colors
- **Primary Accent**: `bg-cyan-600` (darker cyan in light mode) - Used for buttons and primary actions
- **Hover Accent**: `hover:bg-cyan-700` - Slightly darker cyan on hover

#### Borders & Dividers
- **Primary Border**: `border-gray-200` - Light gray borders
- **Secondary Border**: `border-gray-100` - Very subtle dividers
- **Input Background**: `bg-gray-100` - Light gray input backgrounds

#### Interactive States
- **Hover Border**: `border-cyan-500/50` - Cyan border at 50% opacity
- **Hover Shadow**: `shadow-lg` - Standard shadow on hover
- **Hover Text**: `hover:text-gray-900` - Dark gray for text hover

---

## Typography

Typography is controlled through CSS custom properties and should NOT be overridden with Tailwind classes unless specifically requested.

### Font Sizes (Do Not Override)
The application uses default typography defined in `styles/globals.css`:
- **Headings (h1-h4)**: Automatically sized based on element type
- **Paragraphs**: Default base size
- **Labels & Buttons**: Default base size with medium weight
- **Inputs**: Default base size

### Font Weights (Do Not Override)
- **Medium**: `font-weight: 500` - Used for headings, labels, buttons
- **Normal**: `font-weight: 400` - Used for body text and inputs

⚠️ **Important**: Do NOT use Tailwind font classes like `text-2xl`, `font-bold`, `leading-none` unless the user specifically requests typography changes.

---

## Component Styling Patterns

### Cards
```tsx
// Dark theme card
className="bg-[#131823] border border-white/10 hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]"

// Light theme card
className="bg-white border border-gray-200 hover:border-cyan-500/50 hover:shadow-lg"
```

### Buttons
```tsx
// Primary button (dark theme)
className="bg-cyan-400 hover:bg-cyan-500 text-white"

// Primary button (light theme)
className="bg-cyan-600 hover:bg-cyan-700 text-white"
```

### Inputs
```tsx
// Dark theme input
className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10"

// Light theme input
className="bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-gray-200"
```

### Navigation
```tsx
// Sticky navigation (dark theme)
className="sticky top-0 z-50 bg-[#0a0e1a] border-b border-white/10"

// Sticky navigation (light theme)
className="sticky top-0 z-50 bg-white border-b border-gray-200"
```

### Hover Effects
- **Text hover**: `hover:text-cyan-400` (dark) or `hover:text-cyan-600` (light)
- **Card hover**: Border changes to cyan + subtle glow shadow
- **Icon hover**: Color transition to cyan
- **Scale effect**: `group-hover:scale-105 transition-transform duration-300`

---

## Spacing & Layout

### Grid & Columns
- **Masonry Grid**: 2 columns on desktop (`sm:` breakpoint), 1 column on mobile
- **Split Layout**: 50/50 split when detail panel is open on large screens (`lg:w-1/2`)
- **Gutter**: `20px` spacing between masonry items

### Padding & Margins
- **Container Padding**: `p-6` for main content areas
- **Card Padding**: `p-4` for card content, `p-3` for tag areas
- **Navigation Padding**: `px-6 py-3.5` for top nav
- **Gap Spacing**: `gap-2`, `gap-3`, `gap-4`, `gap-6` commonly used

### Border Radius
- **Default Radius**: `rounded-lg` for cards and containers
- **Full Rounded**: `rounded-full` for avatars and notification badges

---

## Responsive Design

### Breakpoints
- **Mobile**: Default, single column layout
- **Small (`sm:`)**: 2-column masonry grid
- **Medium (`md:`)**: Show full navigation links
- **Large (`lg:`)**: 50/50 split layout for detail panel

### Mobile-Specific Behaviors
- Detail panel becomes a full-screen overlay on mobile/tablet
- Navigation links hide behind hamburger menu on small screens
- Masonry reduces to single column
- Certain text elements hide on mobile (e.g., "Create Post" button shows only icon)

---

## Z-Index Layers
- **Navigation**: `z-50` - Stays above content
- **Detail Panel Overlay**: `z-40` - Backdrop for mobile detail panel
- **Detail Panel**: `z-50` - Detail/Create Post panel on mobile

---

## Animation & Transitions

### Transition Classes
- **Standard**: `transition-all` or `transition-colors` 
- **Transform**: `transition-transform duration-300`
- **Hover Scale**: `group-hover:scale-105`

### Glow Effects
- **Cyan Glow**: `shadow-[0_0_20px_rgba(34,211,238,0.15)]` on card hover
- **Standard Shadow**: `shadow-lg` for light theme

---

## Theme Toggle Implementation

The application supports theme switching between light and dark modes:

```tsx
const [theme, setTheme] = useState<"light" | "dark">("dark");
const isDark = theme === "dark";

// Apply theme class to root container
<div className={`min-h-screen ${theme === "dark" ? "bg-[#0a0e1a]" : "bg-gray-50"}`}>
```

All components should accept a `theme` prop and adjust colors accordingly using the patterns shown above.

---

## Accessibility

### Focus States
- **Focus Ring**: `focus:ring-2 focus:ring-cyan-400` for keyboard navigation
- **Focus Outline**: `focus:outline-none` only when custom focus ring is provided

### Color Contrast
- Ensure text colors meet WCAG contrast requirements
- Use lighter text (`#e5e7eb`) on dark backgrounds
- Use darker text (`text-gray-900`) on light backgrounds

---

## CSS Custom Properties Reference

All CSS variables are defined in `/styles/globals.css`:

```css
:root {
  --background: #0a0e1a;
  --foreground: #e5e7eb;
  --card: #131823;
  --primary: #22d3ee;
  --border: rgba(255, 255, 255, 0.1);
  --radius: 0.5rem;
  /* ... see globals.css for complete list */
}
```

You can reference these using Tailwind's theme colors:
- `bg-background`, `text-foreground`
- `bg-card`, `text-card-foreground`
- `bg-primary`, `text-primary-foreground`
- `border-border`

---

## Best Practices

1. **Never override typography** unless specifically requested by the user
2. **Always provide both light and dark theme styles** when creating components
3. **Use the cyan accent color** (`#22d3ee` dark, `cyan-600` light) for primary actions
4. **Maintain semi-transparent overlays** for borders and backgrounds in dark theme
5. **Use consistent spacing** with Tailwind's spacing scale
6. **Preserve hover effects** with cyan color transitions and subtle glows
7. **Ensure responsive behavior** at all breakpoints
8. **Keep z-index layers** consistent with the established hierarchy

---

## Quick Reference: Common Patterns

### Conditional Theme Classes
```tsx
className={`${isDark ? "dark-classes" : "light-classes"}`}
```

### Interactive Element
```tsx
className="cursor-pointer group hover:border-cyan-400/50 transition-all"
```

### Badge/Tag
```tsx
className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
```

### Divider
```tsx
className={`border-b ${isDark ? "border-white/5" : "border-gray-100"}`}
```

---

## Conclusion

When building new pages or components for AnonyCollab, always:
1. Reference this guide for color choices
2. Maintain the dark theme with cyan accents as the default
3. Support both light and dark themes
4. Follow established spacing and layout patterns
5. Keep interactions consistent with existing components

This ensures a cohesive, professional look across the entire application.
