# Dark Mode Implementation

This document details the implementation of the dark mode feature in the Inventory Management System, focusing on the CSS variable system and how it ensures consistent theming across the application.

## Overview

The dark mode functionality is implemented using a class-based approach with Tailwind CSS. A `dark` class is toggled on the `html` element, which then activates a set of CSS variables defined within a `:root` selector and a `html.dark` selector in `client/src/index.css`.

## CSS Variables

All theme-dependent colors and styles are managed through CSS variables. This approach allows for easy modification and ensures consistency across the application. The primary CSS variables are defined in `client/src/index.css`.

### Light Mode Variables (Default)

These variables are defined under the `:root` selector and represent the default light theme colors:

```css
:root {
  --color-bg-primary: #f8f9fa; /* Main background color */
  --color-bg-secondary: #ffffff; /* Secondary background color, e.g., for modals or sidebars */
  --color-text-primary: #212529; /* Primary text color */
  --color-text-secondary: #6c757d; /* Secondary text color, e.g., for muted text */
  --color-card-bg: #ffffff; /* Background color for cards and panels */
  --color-border: #dee2e6; /* Border color for elements */
  --color-accent: #007bff; /* Accent color for primary actions/highlights */
  --color-hover: #e9ecef; /* Hover state background color */
  --color-success: #28a745; /* Success message/icon color */
  --color-success-bg: #d4edda; /* Success background color */
  --color-danger: #dc3545; /* Danger message/icon color */
  --color-danger-bg: #f8d7da; /* Danger background color */
  --color-warning: #ffc107; /* Warning message/icon color */
  --color-warning-bg: #fff3cd; /* Warning background color */
  --color-info: #17a2b8; /* Info message/icon color */
  --color-info-bg: #d1ecf1; /* Info background color */
  --color-report-bg: #f8f9fa; /* Specific background for reports */
  --color-report-text-primary: #212529; /* Primary text for reports */
  --color-report-text-secondary: #6c757d; /* Secondary text for reports */
}
```

### Dark Mode Variables

These variables are defined under the `html.dark` selector and override the light mode variables when dark mode is active:

```css
html.dark {
  --color-bg-primary: #1a202c; /* Dark main background */
  --color-bg-secondary: #2d3748; /* Dark secondary background */
  --color-text-primary: #e2e8f0; /* Light text for dark mode */
  --color-text-secondary: #a0aec0; /* Muted light text for dark mode */
  --color-card-bg: #2d3748; /* Dark card background */
  --color-border: #4a5568; /* Dark border color */
  --color-accent: #63b3ed; /* Lighter accent for dark mode */
  --color-hover: #4a5568; /* Darker hover state */
  --color-success: #48bb78; /* Dark mode success color */
  --color-success-bg: #22543d; /* Dark mode success background */
  --color-danger: #fc8181; /* Dark mode danger color */
  --color-danger-bg: #9b2c2c; /* Dark mode danger background */
  --color-warning: #f6e05e; /* Dark mode warning color */
  --color-warning-bg: #744210; /* Dark mode warning background */
  --color-info: #63b3ed; /* Dark mode info color */
  --color-info-bg: #2a4365; /* Dark mode info background */
  --color-report-bg: #2d3748; /* Dark specific background for reports */
  --color-report-text-primary: var(--color-text-primary); /* Inherit primary text color */
  --color-report-text-secondary: var(--color-text-secondary); /* Inherit secondary text color */
}
```

## Usage in Components

Components should use these CSS variables for styling instead of hardcoded color values. For example:

```css
.my-component {
  background-color: var(--color-card-bg);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}
```

This ensures that when the `dark` class is toggled on the `html` element, the component's styles automatically adapt to the selected theme.

## Adding New Theme-Aware Styles

When adding new components or styles that need to be theme-aware:

1.  **Define new CSS variables** in `client/src/index.css` under both `:root` and `html.dark` selectors if the existing variables are not sufficient. Ensure the dark mode variable provides appropriate contrast.
2.  **Use the CSS variables** in your component's CSS (e.g., `component.css` or inline styles) using the `var()` function.
3.  **Test** the component in both light and dark modes to ensure proper visibility and aesthetic consistency.