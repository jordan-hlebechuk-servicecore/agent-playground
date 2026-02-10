# Architecture Guidelines

## Overview

This document outlines the folder and component architecture standards for this project. These standards ensure code discoverability, maintainability, and consistency across the codebase.

## High-Level Folder Architecture

### Root `/components` Folder

- Contains **ONLY** reusable, generic, or utility components
- Organized into descriptive subfolders based on component type:
  - `/buttons`
  - `/containers`
  - `/cards`
  - `/inputs`
  - `/displays`
  - etc.

### Location-Specific Components

- Components specific to a single page, view, or container live in a `/components` folder **within that location**
- **Never** place location-specific components in the root `/components` folder

### Example Structure

**Avoid this:**

```
app/
    ├── components/
    │   ├── Accordion (unused generic component)
    │   ├── ActionCard (generic component)
    │   ├── Account/ (all specific to containers/Account)
    │   │   └── Plan/
    │   │       ├── BrokerPlus
    │   │       ├── PartnerProgram
    │   │       └── PlanAddOns
    │   ├── AccountCompany (specific to containers/Account)
    │   ├── AccountAddOnSettings (specific to containers/Account)
    │   ├── Address (generic component)
    │   └── AddressCard (generic component)
    └── containers/
        └── Account/
            └── index.jsx
```

**Follow this:**

```
app/
    ├── components/
    │   ├── Cards/
    │   │   ├── ActionCard/
    │   │   ├── AddressCard/
    │   │   └── index.ts (exports all card components)
    │   └── Displays/
    │       ├── Address/
    │       └── index.ts (exports all display components)
    └── containers/
        └── Account/
            ├── components/
            │   ├── Plan/
            │   │   ├── BrokerPlus/
            │   │   ├── PartnerProgram/
            │   │   ├── PlanAddOns/
            │   │   └── index.ts (exports all Plan subcomponents)
            │   ├── Company/
            │   ├── AddOnSettings/
            │   ├── TrainingSettings/
            │   └── index.ts (exports all Account subcomponents)
            └── index.jsx
```

## Component-Level Architecture

Each component folder follows a uniform structure:

### Standard Component Structure

```
ExampleComponent/
    ├── components/ (subcomponents that should NOT be exported from main folder)
    │   ├── ExampleComponentButton.tsx (simple subcomponent)
    │   ├── ExampleComponentForm/ (complex subcomponent with its own folder)
    │   │   ├── ExampleComponentForm.tsx
    │   │   ├── useExampleComponentForm.ts
    │   │   ├── types.ts
    │   │   ├── __tests__/
    │   │   └── index.ts
    │   └── index.ts (exports all subcomponents for internal use)
    ├── __tests__/ (all test files for the component)
    ├── ExampleComponent.tsx (main component file - primarily JSX)
    ├── useExampleComponent.ts (custom hook containing component logic)
    ├── constants.ts (large constant values)
    ├── utils.ts (utility methods used within the component)
    ├── types.ts (TypeScript interfaces and types)
    ├── context/ (optional - for components needing context provider)
    ├── README.md (optional - for complex components)
    └── index.ts (single export point - ONLY exports the main component)
```

### File Naming Conventions

- **Main component file:** `ComponentName.tsx` (matches folder name)
- **Custom hook:** `useComponentName.ts`
- **Subcomponents:** `ComponentNameSubcomponent.tsx` (prefixed with parent name)
- **Index file:** `index.ts` (exports only the main component, not subcomponents)

### Separation of Concerns

- **ComponentName.tsx**: Contains primarily JSX/UI structure, minimal logic
- **useComponentName.ts**: Contains component logic, state management, and methods
- **types.ts**: All TypeScript interfaces and type definitions
- **constants.ts**: Large constant values and configuration
- **utils.ts**: Reusable utility functions specific to the component
- **/components**: Subcomponents that are implementation details (not exported)

## Key Principles

1. **Reusable vs. Specific**: If a component is used in only one location, it belongs in that location's `/components` folder
2. **Single Export Point**: Each component folder has one `index.ts` that exports only the main component
3. **No Nested Exports**: Subcomponents in the `/components` subfolder should not be exported from the parent component
4. **Descriptive Organization**: Root components are organized by type (Cards, Inputs, Displays, etc.)
5. **Consistent Structure**: Every component follows the same internal folder structure for predictability

## When Creating or Modifying Components

- ✅ Place generic/reusable components in root `/components` with appropriate subfolder
- ✅ Place location-specific components in that location's `/components` folder
- ✅ Follow the standard component structure for all new components
- ✅ Use descriptive file names that match the component/folder name
- ✅ Separate logic (hooks) from presentation (JSX)
- ❌ Don't put location-specific components in root `/components`
- ❌ Don't use generic `index.tsx` for component files
- ❌ Don't export subcomponents from the main component's index
- ❌ Don't mix logic and JSX in a single large file
