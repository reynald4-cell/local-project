# Mangrove Field Guide

A Vite + React + Express application for identifying mangrove species, assessing ecosystem health, and supporting field research in coastal environments.

## Overview

This project helps researchers, guides, and restoration teams:

- identify mangrove species from field notes and photos
- assess mangrove ecosystem health from local observations
- track geo-tagged field observations and restoration data
- organize research around tree tags, species records, and kayak trail monitoring
- use Gemini-powered AI to support rapid field diagnosis

## Tech Stack

- React + TypeScript
- Vite
- Express server
- Tailwind CSS
- Google Gemini API

## Features

- AI-assisted species identification for common Philippine mangrove species
- Health diagnostics for salinity, canopy, erosion, and wildlife indicators
- Offline-friendly observation tracking
- QR-based tree tag lookup and research logging
- Restoration project and species reference views
- Mobile-friendly coastal field experience

## Project Structure

```text
.
├── src/                 # React app source
├── public/              # Static assets
├── dist/                # Production build output
├── server.ts            # Express + Gemini integration
├── index.html           # Vite entry point
├── package.json         # Scripts and dependencies
├── tsconfig.json        # TypeScript config
├── vite.config.ts       # Vite config
├── .env.local           # Local environment variables
├── .gitignore
├── bun.lock
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A valid Google Gemini API key

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create or update `.env.local` with your Gemini key:

```env
GEMINI_API_KEY=your_api_key_here
PORT=3000
GEMINI_MODEL=gemini-2.5-flash
```

### Run locally

```bash
npm run dev
```

The app will start in development mode and serve the frontend and API locally.

## Available Scripts

```bash
npm run dev      # Start the app in development mode
npm run build    # Build the production bundle
npm run start    # Run the built server
npm run preview  # Preview the production frontend
npm run lint     # Type-check the project
```

## Notes

This repository is structured as a starter project for a coastal mangrove field guide and can be adapted for custom species data, region-specific research, or deployment to a production host.

## License

This project does not include a license file yet. Add one if you plan to publish or share the repository publicly.

## Next Improvements

- add a proper project license
- document the field data schema
- add CI checks and automated tests
- add deployment instructions for hosting providers
- add screenshots or a demo section
