# SWEENEY VAULT — Family Photo Album

## Project Overview

A private family photo album web app where family members can upload photos, leave comments, reactions, and tags. The site is password-protected with a cinematic landing page featuring scattered floating photos.

**Live URL Goal:** `sweeneyvault.vercel.app` or custom domain

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Database:** Supabase (Postgres)
- **Storage:** Supabase Storage
- **Auth:** Supabase Auth (Single Shared Account)
- **Utilities:** `heic2any` (for client-side HEIC conversion)
- **Deployment:** Vercel

---

## Design System

### Theme Philosophy

The design has TWO distinct moods:

1. **Landing Page:** Editorial, minimal, mysterious. Think film archive meets luxury brand. Grid lines, scattered photos, dramatic typography, lots of whitespace.

2. **Inner Pages (Gallery, Modals):** Warm, cozy, inviting. Soft shadows, rounded corners, cream tones, comfortable spacing. Feels like flipping through a physical photo album.

### Color Tokens

```css
:root {
  /* Landing Page (Cool/Editorial) */
  --landing-bg: #FAFAFA;
  --landing-grid: #E5E5E5;
  --landing-text: #1A1A1A;
  --landing-text-muted: #666666;
  
  /* Inner Pages (Warm/Cozy) */
  --inner-bg: #FDF9F3;
  --inner-bg-elevated: #FFFFFF;
  --inner-border: #E8E0D5;
  --inner-text: #2C2416;
  --inner-text-muted: #8B7E6A;
  --inner-accent: #C4A77D;
  --inner-accent-hover: #B8956A;
  
  /* Shared */
  --black: #1A1A1A;
  --white: #FFFFFF;
  --error: #DC2626;
  --success: #16A34A;
  
  /* Shadows (warm-tinted for inner pages) */
  --shadow-sm: 0 1px 2px rgba(44, 36, 22, 0.05);
  --shadow-md: 0 4px 12px rgba(44, 36, 22, 0.08);
  --shadow-lg: 0 12px 40px rgba(44, 36, 22, 0.12);
  --shadow-xl: 0 24px 60px rgba(44, 36, 22, 0.16);
}
```

### Typography

```css
/* Fonts to import from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&display=swap');

:root {
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
}

/* Type Scale */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 2rem;       /* 32px */
--text-4xl: 2.5rem;     /* 40px */
--text-hero: clamp(4rem, 15vw, 12rem); /* Responsive hero text */
```

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-2xl: 24px;
--radius-full: 9999px;
```

### Animation Timing

**CRITICAL: All animations must use these exact easings for consistency and polish.**

```css
/* Easing Functions */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Duration Scale */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
--duration-slower: 600ms;
--duration-slowest: 1000ms;
```

---

## Pages & Routes

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | `LandingPage` | No | Password gate with scattered photos |
| `/home` | `GalleryPage` | Yes | Main photo grid |
| `/slideshow` | `SlideshowPage` | Yes | Fullscreen slideshow mode |

---

## Page Specifications

### 1. Landing Page (`/`)

**Overall Layout:**
- Full viewport height, no scroll
- Subtle grid background (like graph paper)
- Scattered photos floating at various positions
- Giant "SWEENEY VAULT" title center-left
- Password input bar at bottom center

**Grid Background:**
```css
.landing-bg {
  background-color: var(--landing-bg);
  background-image: 
    linear-gradient(var(--landing-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--landing-grid) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

**Scattered Photos Component:**

Photos should appear to float naturally, like polaroids scattered on a table but in space.

Configuration options (make this flexible):
```typescript
interface ScatteredPhotoConfig {
  // If true, fetch random photos from DB. If false, use hardcodedPhotos array
  useRandomPhotos: boolean;
  
  // Only used if useRandomPhotos is false
  hardcodedPhotos?: {
    src: string;
    position: { x: number; y: number }; // percentage from top-left
    rotation: number; // degrees, -15 to 15
    scale: number; // 0.8 to 1.2
    zIndex: number;
  }[];
  
  // Only used if useRandomPhotos is true
  photoCount?: number; // default 6-8
}
```

**CRITICAL ANIMATION — Floating Photos:**

Each scattered photo must have a subtle, continuous floating animation. This is what makes the page feel alive.

```typescript
// Framer Motion variant for each photo
const floatingAnimation = {
  animate: {
    y: [0, -8, 0, 6, 0],
    x: [0, 4, 0, -3, 0],
    rotate: [baseRotation, baseRotation + 1.5, baseRotation, baseRotation - 1, baseRotation],
  },
  transition: {
    duration: randomBetween(6, 10), // Each photo has slightly different timing
    repeat: Infinity,
    ease: "easeInOut",
  }
};
```

**CRITICAL ANIMATION — Photo Entrance:**

When the page loads, photos should NOT all appear at once. They should cascade in with staggered timing.

```typescript
// Stagger children entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    }
  }
};

const photoVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    y: 40,
    rotate: randomBetween(-20, 20),
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    rotate: finalRotation,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // expo out
    }
  }
};
```

**Title Treatment:**

```
SWEENEY
VAULT
```

- Font: `Instrument Serif`
- Size: `clamp(4rem, 15vw, 12rem)`
- Line height: 0.85 (tight)
- Letter-spacing: -0.03em
- Color: var(--landing-text)
- Position: Left side, vertically centered
- The word "VAULT" should be slightly indented or offset for visual interest

**CRITICAL ANIMATION — Title Entrance:**

Title should animate in with a smooth reveal, either:
- Option A: Clip/mask reveal from bottom
- Option B: Letter-by-letter fade with stagger

```typescript
// Option A: Clip reveal
const titleVariants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: { 
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }
  }
};
```

**Password Input:**

Position: Bottom center of viewport, ~20% from bottom
Style: Minimal, like a search bar

```
┌─────────────────────────────────────────────────────────────────┐
│  🔒  enter the super secret password...                         │
└─────────────────────────────────────────────────────────────────┘
```

- Width: min(500px, 80vw)
- Height: 56px
- Background: white
- Border: 1px solid var(--landing-grid)
- Border-radius: var(--radius-full) (pill shape)
- Font: var(--font-body), 16px
- Placeholder color: var(--landing-text-muted)
- Lock icon on left (subtle, muted)
- NO visible submit button — just press Enter

**CRITICAL ANIMATION — Wrong Password:**

When wrong password is entered:
1. Input shakes horizontally (3 quick oscillations)
2. Border flashes red briefly
3. Placeholder text changes to "nope, try again..." then back after 2s

```typescript
const shakeAnimation = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4, ease: "easeInOut" }
};
```

**CRITICAL ANIMATION — Correct Password → Gallery Transition:**

This is the hero moment. Must be smooth and cinematic.

Sequence:
1. Input border turns green briefly (150ms)
2. Scattered photos begin to drift outward and fade (400ms)
3. Title fades out (300ms, starts at 200ms)
4. White flash/fade (200ms)
5. Gallery page fades in from white

```typescript
// Orchestrated exit animation
const exitSequence = async () => {
  // 0. Login successful (Supabase Auth) - handled before animation starts
  
  // 1. Success feedback
  await animate(inputRef, { borderColor: "var(--success)" }, { duration: 0.15 });
  
  // 2. Photos scatter outward
  await animate(photosRef, { 
    scale: 1.1, 
    opacity: 0,
    filter: "blur(8px)"
  }, { duration: 0.4, ease: [0.16, 1, 0.3, 1] });
  
  // 3. Everything fades
  await animate(containerRef, { opacity: 0 }, { duration: 0.3 });
  
  // 4. Navigate
  router.push('/home');
};

```

**Name Prompt (Post-Password):**

After correct password, but BEFORE navigating to gallery, show a quick name prompt:

```
┌────────────────────────────────────────┐
│                                        │
│   Welcome in! What's your name?        │
│                                        │
│   ┌──────────────────────────────┐     │
│   │  Your name                   │     │
│   └──────────────────────────────┘     │
│                                        │
│   [Skip]              [Enter →]        │
│                                        │
└────────────────────────────────────────┘
```

- This modal fades in after password success
- Name is stored in localStorage: `sweeneyVaultUserName`
- "Skip" stores empty string (user will be "Anonymous")
- Both buttons trigger the gallery transition

---

### 2. Gallery Page (`/home`)

**Overall Layout:**
- Warm background: var(--inner-bg)
- Fixed header at top
- Album pills below header (horizontal scroll on mobile)
- Masonry photo grid fills remaining space
- Floating upload FAB on mobile (bottom right)

**Header:**

```
┌────────────────────────────────────────────────────────────────────────────┐
│  SWEENEY VAULT          [Albums ▼]   [Upload +]   [▶ Slideshow]     👤 Mom │
└────────────────────────────────────────────────────────────────────────────┘
```

- Height: 64px
- Background: var(--inner-bg-elevated)
- Border-bottom: 1px solid var(--inner-border)
- Logo: `Instrument Serif`, 24px, left aligned
- Buttons: Ghost style with hover states
- User name: Right side, clickable to change name

**CRITICAL ANIMATION — Header Entrance:**

Header slides down from top on page load:

```typescript
const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }
  }
};
```

**Album Pills:**

Horizontal scrolling row of album filters.

```
[All Photos]  [Christmas 2024]  [Summer Trip]  [Throwbacks]  [+ New Album]
```

- Pill style: 
  - Default: bg transparent, border 1px var(--inner-border), text var(--inner-text-muted)
  - Active: bg var(--inner-accent), border transparent, text white
  - Hover: bg var(--inner-border)
- Height: 36px
- Border-radius: var(--radius-full)
- Font: var(--font-body), 14px, 500 weight
- Gap between pills: 8px
- Horizontal padding: 16px
- Container has horizontal scroll with hidden scrollbar
- "New Album" pill has dashed border and triggers modal

**CRITICAL ANIMATION — Album Switch:**

When switching albums, photos should animate out then in:

```typescript
// Photos exit
const exitAnimation = {
  opacity: 0,
  y: 20,
  scale: 0.95,
  transition: { duration: 0.2, ease: "easeIn" }
};

// New photos enter with stagger
const enterAnimation = {
  opacity: 1,
  y: 0,
  scale: 1,
  transition: { 
    duration: 0.4, 
    ease: [0.16, 1, 0.3, 1],
    staggerChildren: 0.05 
  }
};
```

**Photo Grid:**

Use CSS Grid with masonry-like layout (or actual masonry library).

```css
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 24px;
}

/* On mobile */
@media (max-width: 640px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 12px;
  }
}
```

**Photo Card:**

Each photo in the grid:

```
┌─────────────────────────┐
│                         │
│                         │
│        [PHOTO]          │
│                         │
│                         │
│  ❤️ 5  💬 2             │  ← Reaction/comment badges (bottom-left, inside)
└─────────────────────────┘
```

- Border-radius: var(--radius-lg)
- Overflow: hidden
- Box-shadow: var(--shadow-md)
- Aspect ratio: preserved from original image
- Badges: Semi-transparent dark background, white text, small (12px font)

**CRITICAL ANIMATION — Photo Card Hover:**

On hover (desktop):
1. Scale up slightly (1.02)
2. Shadow increases (var(--shadow-lg))
3. Slight lift effect (translateY -4px)
4. Transition: 250ms ease-out-expo

```typescript
const cardHoverAnimation = {
  scale: 1.02,
  y: -4,
  boxShadow: "0 12px 40px rgba(44, 36, 22, 0.15)",
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] }
};
```

**CRITICAL ANIMATION — Photo Card Entrance (on load):**

Photos should fade in with stagger when gallery loads:

```typescript
const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};
```

**Infinite Scroll or Load More:**

- Prefer infinite scroll for seamless experience
- Show skeleton loaders for incoming photos
- Intersection Observer to trigger loading

---

### 3. Photo Modal

Triggered when clicking any photo card. This is an overlay/portal.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [×]                                                              [⬇ Download]  │
│                                                                                 │
│  [←]                        ┌─────────────────────┐                       [→]  │
│                             │                     │                             │
│                             │                     │                             │
│                             │    LARGE PHOTO      │                             │
│                             │                     │                             │
│                             │                     │                             │
│                             └─────────────────────┘                             │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  REACTIONS    [❤️ 5] [😂 2] [😍 3] [🔥 1] [😢 0] [😮 0]     [+ React]    │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  IN THIS PHOTO    [Mom] [Dad] [Connor] [Grandma]        [+ Tag Someone]  │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │  COMMENTS                                                                 │ │
│  │                                                                           │ │
│  │    Mom • 2 hours ago                                                      │ │
│  │    "I remember this day! So much fun 🥰"                                  │ │
│  │                                                                           │ │
│  │    Dad • 1 hour ago                                                       │ │
│  │    "Classic!"                                                             │ │
│  │                                                                           │ │
│  │  ┌─────────────────────────────────────────────────────────┐  [Post]     │ │
│  │  │  Add a comment...                                       │             │ │
│  │  └─────────────────────────────────────────────────────────┘             │ │
│  └───────────────────────────────────────────────────────────────────────────┘ │
│                                                                                 │
│  Uploaded by Connor • Dec 24, 2024 • Christmas 2024 album                       │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**Modal Backdrop:**
- Background: rgba(0, 0, 0, 0.85)
- Backdrop-filter: blur(8px)
- Click outside to close

**Modal Content Container:**
- Max-width: 1200px
- Max-height: 90vh
- Background: var(--inner-bg-elevated)
- Border-radius: var(--radius-xl)
- Overflow: hidden (scrollable inside)

**CRITICAL ANIMATION — Modal Open:**

```typescript
// Backdrop
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

// Modal content
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: [0.16, 1, 0.3, 1],
      delay: 0.1 
    }
  }
};
```

**CRITICAL ANIMATION — Modal Close:**

```typescript
// Reverse of open, but faster
const modalExitVariants = {
  opacity: 0,
  scale: 0.95,
  y: 10,
  transition: { duration: 0.2, ease: "easeIn" }
};
```

**Navigation Arrows:**
- Position: absolute, centered vertically on each side
- Style: Semi-transparent circles with arrow icons
- Appear on hover (desktop) or always visible (mobile)
- Keyboard support: ← → arrow keys

**CRITICAL ANIMATION — Photo Transition (within modal):**

When navigating between photos:

```typescript
// Photo slides out
const photoExitVariants = {
  exit: (direction) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.2 }
  })
};

// New photo slides in
const photoEnterVariants = {
  initial: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  }
};
```

**Reactions Bar:**
- Horizontal row of emoji buttons
- Each shows emoji + count
- Clicking adds your reaction (toggle)
- Available reactions: ❤️ 😂 😍 🔥 😢 😮

**CRITICAL ANIMATION — Reaction Added:**

When adding a reaction:
1. Emoji pops/bounces (scale 1 → 1.3 → 1)
2. Count increments with number flip animation
3. Brief confetti burst (optional, but delightful)

```typescript
const reactionPopAnimation = {
  scale: [1, 1.4, 1],
  transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } // spring
};
```

**Tags Section:**
- Horizontal row of name pills
- Each pill: bg var(--inner-border), text var(--inner-text), border-radius full
- "Tag Someone" button opens a simple input dropdown
- Clicking existing tag could filter gallery to that person (nice-to-have)

**Comments Section:**
- Scrollable if many comments
- Each comment shows: name, relative time, message
- Comment input at bottom
- Name auto-filled from localStorage (but editable)

**CRITICAL ANIMATION — New Comment:**

When posting a comment:
1. Input clears
2. New comment appears at bottom of list
3. Slides in from bottom with fade

```typescript
const newCommentAnimation = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
};
```

**Download Button:**
- Position: Top right of modal
- Downloads original full-resolution image
- Shows brief "Downloading..." state

**Admin Controls (Delete/Edit):**
- Located in a "..." menu in top right (next to Download)
- Options:
  - **Edit Caption:** Turns caption into input field
  - **Change Album:** Move photo to different album
  - **Delete Photo:** Requires confirmation ("Are you sure? This cannot be undone.")
- Available to all authenticated users (trusted family environment)


---

### 4. Upload Modal

Triggered by Upload button in header or FAB.

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│                           Upload Photos                      [×] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │                                                            │ │
│  │          📁  Drop photos here or click to browse           │ │
│  │                                                            │ │
│  │              Supports JPG, PNG, HEIC up to 20MB            │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  SELECTED (4 photos)                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                           │
│  │ img  │ │ img  │ │ img  │ │ img  │                           │
│  │  ×   │ │  ×   │ │  ×   │ │  ×   │                           │
│  └──────┘ └──────┘ └──────┘ └──────┘                           │
│                                                                  │
│  Album    [Christmas 2024        ▼]    [+ Create New Album]     │
│                                                                  │
│  Caption  [_________________________________] (optional)         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ████████████████████░░░░░░░░░░░░░░  3/4 uploaded         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                    [Cancel]    [Upload 4 Photos] │
└─────────────────────────────────────────────────────────────────┘
```

**Drop Zone:**
- Dashed border: 2px dashed var(--inner-border)
- On drag over: border becomes solid, background tints, scale up slightly
- Height: ~200px
- Click opens file picker
- Accept: image/*

**CRITICAL ANIMATION — Drop Zone Drag Over:**

```typescript
const dropZoneHoverAnimation = {
  scale: 1.02,
  borderStyle: "solid",
  borderColor: "var(--inner-accent)",
  backgroundColor: "rgba(196, 167, 125, 0.1)",
  transition: { duration: 0.2 }
};
```

**Preview Queue:**
- Horizontal scrollable row of thumbnails
- Each thumbnail: 80x80px, border-radius var(--radius-md), object-fit cover
- × button on each to remove
- Shows filename on hover (tooltip)
- **HEIC Conversion:** Automatically converts HEIC files to JPEG on selection before previewing


**CRITICAL ANIMATION — Thumbnail Added:**

```typescript
const thumbnailEnterAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.2, ease: [0.34, 1.56, 0.64, 1] } // spring
};
```

**Album Selector:**
- Dropdown with existing albums
- "Create New Album" option opens inline or separate mini-modal

**Upload Progress:**
- Only shows during active upload
- Progress bar: bg var(--inner-border), fill var(--inner-accent)
- Shows "X/Y uploaded" text
- Animates smoothly (not jumpy)

**CRITICAL ANIMATION — Upload Success:**

After all photos uploaded:
1. Progress bar fills completely
2. Brief checkmark animation
3. Modal closes
4. Toast notification appears
5. New photos appear in grid with entrance animation

---

### 5. Slideshow Page (`/slideshow`)

Fullscreen cinematic photo viewer for TV casting.

**Layout:**
- Fullscreen (100vw × 100vh)
- Black background
- Photo centered, maximized while maintaining aspect ratio
- Controls overlay at bottom (auto-hide after 3s of no mouse movement)

**Controls Bar:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  [←]   [▶ / ⏸]   [→]      [🔀 Shuffle]      12 / 47      [× Exit]            │
│                                                                                 │
│                 Speed:  [Slow]  [Medium]  [Fast]                                │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- Appears on mouse move or tap
- Fades out after 3s of inactivity
- Semi-transparent dark background

**Keyboard Controls:**
- `←` / `→` — Previous / Next
- `Space` — Play / Pause
- `Escape` — Exit slideshow
- `S` — Toggle shuffle

**Auto-Advance Timing:**
- Slow: 8 seconds
- Medium: 5 seconds (default)
- Fast: 3 seconds

**CRITICAL ANIMATION — Photo Transitions:**

Smooth crossfade between photos:

```typescript
const slideshowTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.8, ease: "easeInOut" }
};
```

Alternative: Ken Burns effect (subtle zoom + pan):

```typescript
const kenBurnsAnimation = {
  initial: { scale: 1, x: 0, y: 0 },
  animate: { 
    scale: 1.05, 
    x: randomBetween(-20, 20), 
    y: randomBetween(-20, 20),
    transition: { duration: 8, ease: "linear" }
  }
};
```

**CRITICAL ANIMATION — Controls Fade:**

```typescript
const controlsVariants = {
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hidden: { opacity: 0, y: 20, transition: { duration: 0.5, delay: 0.2 } }
};
```

---

## Database Schema (Supabase)

### Tables

```sql
-- Albums table
CREATE TABLE albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cover_photo_id UUID,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photos table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  caption TEXT,
  uploaded_by TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key for cover photo after photos table exists
ALTER TABLE albums 
ADD CONSTRAINT fk_cover_photo 
FOREIGN KEY (cover_photo_id) REFERENCES photos(id) ON DELETE SET NULL;

-- Reactions table
CREATE TABLE reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate reactions from same user with same emoji on same photo
  UNIQUE(photo_id, user_name, emoji)
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo tags (who's in the photo)
CREATE TABLE photo_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  person_name TEXT NOT NULL,
  tagged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Prevent duplicate tags
  UNIQUE(photo_id, person_name)
);

-- Landing page photos config (optional, for hardcoded positioning)
CREATE TABLE landing_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_path TEXT NOT NULL,
  position_x INTEGER NOT NULL, -- percentage 0-100
  position_y INTEGER NOT NULL, -- percentage 0-100
  rotation INTEGER DEFAULT 0, -- degrees -15 to 15
  scale NUMERIC(3,2) DEFAULT 1.0, -- 0.8 to 1.2
  z_index INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for common queries
CREATE INDEX idx_photos_album ON photos(album_id);
CREATE INDEX idx_reactions_photo ON reactions(photo_id);
CREATE INDEX idx_comments_photo ON comments(photo_id);
CREATE INDEX idx_photo_tags_photo ON photo_tags(photo_id);
CREATE INDEX idx_photos_created ON photos(created_at DESC);
```

### Supabase Storage

Create a bucket called `photos` with the following settings:
- Public bucket: YES (for easy image loading)
- File size limit: 20MB
- Allowed MIME types: image/jpeg, image/png, image/heic, image/webp

### Row Level Security (RLS)

Since this is a family app with a shared password, we'll keep RLS simple:

```sql
-- Enable RLS on all tables
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_photos ENABLE ROW LEVEL SECURITY;

-- Allow read/write access ONLY to authenticated users
-- The "password" on the landing page will trigger a Supabase signInWithPassword
CREATE POLICY "Allow authenticated read" ON albums FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert" ON albums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update" ON albums FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete" ON albums FOR DELETE TO authenticated USING (true);

-- Repeat for all tables:
-- photos, reactions, comments, photo_tags, landing_photos
-- All policies: TO authenticated USING (true) WITH CHECK (true)

```

---

## Environment Variables

```env
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Password (the "super secret password")
NEXT_PUBLIC_VAULT_PASSWORD=your_family_password

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=
```

**Note:** We will create a single "family@sweeneyvault.com" user in Supabase. The password entered on the landing page will be used to log in as this user. This provides real security (RLS) while keeping the UX simple.


---

## Component Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page (/)
│   ├── home/
│   │   └── page.tsx        # Gallery page
│   └── slideshow/
│       └── page.tsx        # Slideshow page
│
├── components/
│   ├── landing/
│   │   ├── ScatteredPhotos.tsx
│   │   ├── FloatingPhoto.tsx
│   │   ├── LandingTitle.tsx
│   │   ├── PasswordInput.tsx
│   │   └── NamePrompt.tsx
│   │
│   ├── gallery/
│   │   ├── Header.tsx
│   │   ├── AlbumPills.tsx
│   │   ├── PhotoGrid.tsx
│   │   └── PhotoCard.tsx
│   │
│   ├── modals/
│   │   ├── PhotoModal.tsx
│   │   ├── UploadModal.tsx
│   │   └── CreateAlbumModal.tsx
│   │
│   ├── photo-modal/
│   │   ├── PhotoViewer.tsx
│   │   ├── ReactionsBar.tsx
│   │   ├── TagsSection.tsx
│   │   ├── CommentsSection.tsx
│   │   └── CommentInput.tsx
│   │
│   ├── upload/
│   │   ├── DropZone.tsx
│   │   ├── PreviewQueue.tsx
│   │   ├── AlbumSelector.tsx
│   │   └── UploadProgress.tsx
│   │
│   ├── slideshow/
│   │   ├── SlideshowViewer.tsx
│   │   └── SlideshowControls.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Toast.tsx
│       └── Skeleton.tsx
│
├── hooks/
│   ├── useAuth.ts          # Supabase Auth (SignIn) + localStorage name

│   ├── usePhotos.ts        # Fetch photos, infinite scroll
│   ├── useAlbums.ts        # Fetch/create albums
│   ├── useUpload.ts        # Handle file uploads
│   └── useKeyboard.ts      # Keyboard shortcuts
│
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── constants.ts        # Reaction emojis, etc.
│   └── utils.ts            # Helper functions
│
├── context/
│   └── AuthContext.tsx     # Auth state provider
│
└── styles/
    └── globals.css         # Tailwind + custom CSS
```

---

## Critical UX Requirements

### Performance

1. **Image Optimization**
   - Use Next.js `<Image>` component for automatic optimization
   - Generate thumbnails on upload (or use Supabase transformations)
   - Lazy load images in grid (native loading="lazy" or Intersection Observer)
   - Blur placeholder for images while loading

2. **Loading States**
   - Skeleton loaders for photo grid (not spinners)
   - Optimistic updates for reactions/comments
   - Progress feedback for uploads

3. **Error Handling**
   - Toast notifications for errors
   - Retry buttons for failed operations
   - Graceful degradation if image fails to load

### Accessibility

1. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Arrow keys in photo modal/slideshow
   - Escape to close modals

2. **Focus Management**
   - Focus trap in modals
   - Return focus to trigger element on modal close
   - Visible focus indicators

3. **Screen Readers**
   - Alt text for images (use caption or "Photo in [album name]")
   - ARIA labels on icon-only buttons
   - Announce dynamic content changes

### Mobile Experience

1. **Touch Interactions**
   - Swipe left/right in photo modal
   - Pull-to-refresh on gallery (optional)
   - Long press on photo for quick reactions (optional)

2. **Responsive Layout**
   - Single column grid on small screens
   - Bottom sheet modals on mobile (optional, but nice)
   - FAB for upload on mobile
   - Thumb-friendly tap targets (min 44px)

3. **Mobile Viewport**
   - Handle iOS Safari address bar (100dvh)
   - Prevent scroll when modal open
   - Handle keyboard on input focus

---

## Animation Checklist

Before shipping, verify ALL of these animations are working smoothly:

### Landing Page
- [ ] Photos fade in with stagger on load
- [ ] Each photo has continuous subtle float animation
- [ ] Title reveals with clip or letter animation
- [ ] Password input appears with fade
- [ ] Wrong password triggers shake
- [ ] Correct password triggers orchestrated exit sequence
- [ ] Name prompt modal fades in
- [ ] Transition to gallery is smooth

### Gallery Page
- [ ] Header slides down on load
- [ ] Album pills are horizontally scrollable
- [ ] Photo grid items fade in with stagger
- [ ] Photo cards scale up on hover
- [ ] Switching albums animates photos out/in
- [ ] Infinite scroll loads smoothly with skeletons

### Photo Modal
- [ ] Modal backdrop fades in
- [ ] Modal content scales/fades in
- [ ] Photo navigation slides photos left/right
- [ ] Reactions pop on click
- [ ] New comments slide in
- [ ] Modal closes with reverse animation
- [ ] Keyboard navigation works

### Upload Modal
- [ ] Drop zone responds to drag over
- [ ] Thumbnails pop in when added
- [ ] Progress bar animates smoothly
- [ ] Success state animates
- [ ] New photos appear in grid after upload

### Slideshow
- [ ] Photos crossfade smoothly
- [ ] Controls fade in/out based on activity
- [ ] Ken Burns effect (if implemented) is subtle
- [ ] Speed changes affect transition timing

---

## Testing Checklist

### Functional Testing
- [ ] Password gate works (blocks incorrect, allows correct)
- [ ] Name is saved to localStorage
- [ ] Photos load from Supabase
- [ ] Albums can be created and switched
- [ ] Photos can be uploaded
- [ ] Reactions can be added/toggled
- [ ] Comments can be posted
- [ ] Tags can be added
- [ ] Photo modal navigation works
- [ ] Download button works
- [ ] Slideshow plays correctly
- [ ] Works on mobile Safari
- [ ] Works on Chrome
- [ ] Works on Firefox

### Edge Cases
- [ ] Empty state (no photos yet)
- [ ] Very long caption/comment text
- [ ] Many reactions on one photo
- [ ] Large number of photos (100+)
- [ ] Slow network (loading states)
- [ ] Failed upload (error state)
- [ ] Rapid clicking (no double submissions)

---

## Deployment Checklist

1. **Supabase Setup**
   - [ ] Create project
   - [ ] Run SQL schema
   - [ ] Create storage bucket
   - [ ] Set storage policies
   - [ ] Get anon key and URL

2. **Vercel Setup**
   - [ ] Connect GitHub repo
   - [ ] Add environment variables
   - [ ] Configure domain (optional)
   - [ ] Deploy

3. **Post-Deploy**
   - [ ] Test password on production
   - [ ] Upload a few test photos
   - [ ] Test on mobile device
   - [ ] Share with family!

---

## Nice-to-Have Features (V2)

If time permits or for future enhancement:

1. **Toast Notifications** — Feedback for all actions
2. **"This Day in History"** — Photos from same date in past years  
3. **Random Photo Button** — "Show me a random memory"
4. **Photo Zoom/Pan** — For high-res image inspection
5. **Export Album as ZIP** — Download entire albums
6. **QR Code Generator** — Easy sharing at gatherings
7. **Video Support** — Upload and play videos
8. **Guest Book** — Text-only memories/stories section
9. **Search** — By caption, tag, or date
10. **Admin Mode** — Delete photos, manage albums (with separate password)

---

## Summary

This spec defines a complete family photo album application with:
- Cinematic password-protected landing page
- Warm, inviting gallery experience
- Full photo interaction (reactions, comments, tags)
- Easy upload flow
- TV-friendly slideshow mode
- Buttery smooth animations throughout

The key to making this feel premium is **consistency in animations** and **attention to micro-interactions**. Every hover, click, and transition should feel intentional and polished.

Good luck and Merry Christmas! 🎄