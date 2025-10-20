# Next.js Starter Template

This project is a Next.js starter template configured with TypeScript, ESLint, Prettier, Tailwind CSS, and more. It provides a modular structure to build scalable and maintainable applications.

## Table of Contents

- [Next.js Starter Template](#nextjs-starter-template)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Key Folders](#key-folders)
  - [Configuration](#configuration)
- [ESLint and Prettier](#eslint-and-prettier)
- [Tailwind CSS](#tailwind-css)
- [Environment Variables](#environment-variables)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/next-js-starter.git
   cd next-js-starter```

2. Install dependencies:
   ```npm install```

## Commands
The following commands help manage the development, building, linting, and formatting of the project.
- npm run dev: Starts the development server at http://localhost:3000.
- npm run build: Builds the application for production in the .next folder.
- npm start: Starts the application in production mode (requires npm run build).
- npm run lint: Runs ESLint to check for linting issues.
- npm run lint:fix: Runs ESLint with --fix to automatically fix some issues.
- npm run format: Formats the project files using Prettier.
- npm run lint:fix:format: Runs both lint fixing and formatting in one command.

## Project Structure
  The project is organized as follows:

```
.
├── app                     # Application pages and root layout
│   ├── example             # Example page
│   │   └── page.tsx        # Example page component
│   ├── favicon.ico         # Favicon for the app
│   ├── fonts               # Custom fonts
│   │   ├── GeistMonoVF.woff
│   │   └── GeistVF.woff
│   ├── globals.css         # Global CSS file
│   ├── layout.tsx          # Main layout file
│   └── page.tsx            # Root page component
├── components              # Reusable components
│   ├── layout              # Layout components
│   │   ├── footer
│   │   │   └── index.tsx   # Footer component
│   │   ├── header
│   │   │   └── index.tsx   # Header component
│   │   └── layout.tsx      # Main layout component
│   ├── screens             # Page-specific components
│   │   └── example-screen
│   │       └── index.tsx   # Example screen component
│   ├── shared              # Shared components
│   │   ├── custom-button
│   │   │   └── index.tsx   # Custom button component
│   │   ├── locale-switcher
│   │   │   └── index.tsx   # Locale switcher component
│   │   └── locale-switcher-select
│   │       └── LocaleSwitcherSelect.tsx
│   └── ui                  # Basic UI components
│       ├── container
│       │   └── index.tsx   # Container component
│       └── shadcn
│           └── select.tsx  # Select component using shadcn
├── components.json         # Component configuration
├── hooks                   # Custom hooks
│   └── useHook.ts          # Example custom hook
├── lib                     # Library and utility files
│   ├── locale.ts           # Locale functions
│   └── utils.ts            # Utility functions
├── messages                # Localization messages
│   ├── en.json             # English messages
│   └── ru.json             # Russian messages
├── next.config.mjs         # Next.js configuration
├── plugins                 # Plugins
│   └── i18n                # i18n (internationalization) configuration
│       ├── config.ts
│       └── request.ts
├── postcss.config.mjs      # PostCSS configuration
├── providers               # Context and provider components
│   └── provider.tsx        # Main provider
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Key Folders
- app: Contains the main Next.js pages and application layout files.
- components: Houses reusable components, divided into layout, screen-specific, shared, and UI components.
- hooks: Contains custom React hooks.
- lib: Utility functions and helper files.
- messages: JSON files for localization (e.g., en.json, ru.json).
- plugins: Configurations for additional plugins, such as i18n.
- providers: Components that provide context or global state to the app.

## Configuration
# ESLint and Prettier
The project uses ESLint for linting and Prettier for code formatting. Configuration files:

- .eslintrc.json: Configures ESLint rules and plugins for TypeScript, React, and Prettier.
- .prettierrc: Configures Prettier for consistent code formatting.

# Tailwind CSS
Tailwind CSS is used for styling. The configuration can be modified in tailwind.config.ts to extend the theme, add plugins, or set up additional styles.

# Environment Variables
You can add environment-specific variables in a .env.local file, which should be ignored by Git for security:
```# .env.local```

**This template provides a well-organized, scalable structure to kickstart your Next.js projects with TypeScript, Tailwind CSS, ESLint, and Prettier. Happy coding!**
