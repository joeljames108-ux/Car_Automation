# Getting Started

Welcome to **Apex Engineer** — a browser-based vehicle design and simulation platform.

## Prerequisites

- **Node.js** v18 or higher
- **npm** v8 or higher

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/apex-engineer.git
cd apex-engineer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── App.tsx               # Main application shell & routing
├── main.tsx              # React entry point
├── index.css             # Global styles (Tailwind + custom utilities)
├── components/           # UI components (one per design module)
│   ├── CommandCenter.tsx  # Dashboard overview
│   ├── EngineDesigner.tsx # Engine configuration
│   ├── VehicleDesigner.tsx# Chassis & drivetrain
│   ├── ExteriorDesigner.tsx
│   ├── AeroLab.tsx        # Aerodynamics wind-tunnel
│   ├── InteriorsDesigner.tsx
│   ├── ManufacturingDesigner.tsx
│   ├── InfotainmentDesigner.tsx
│   ├── RDCenter.tsx       # Research & Development
│   ├── SimulationDashboard.tsx
│   ├── TestingLab.tsx
│   ├── RaceSimulator.tsx  # Full race simulation
│   ├── DetailedStats.tsx  # Performance analytics
│   ├── PressReviews.tsx   # AI-generated press reviews
│   ├── Competitors.tsx    # Competitor analysis
│   ├── StatRail.tsx       # Sidebar stat summary
│   ├── SaveLoadDialog.tsx # Save/Load designs
│   ├── AIAssistant.tsx    # AI co-pilot overlay
│   └── ui/               # Reusable low-level UI primitives
├── sim/                   # Simulation engine (pure logic, no React)
│   ├── types.ts           # All TypeScript interfaces
│   ├── constants.ts       # Default values & lookup tables
│   ├── engine.ts          # Engine physics & simulation
│   ├── race.ts            # Race simulation logic
│   ├── rdEngine.ts        # R&D progression engine
│   ├── rdTypes.ts         # R&D type definitions
│   ├── rdData.ts          # R&D project catalog
│   ├── reviews.ts         # Press review generation
│   ├── electronicsData.ts # Infotainment & electronics data
│   └── competitorTypes.ts # Competitor vehicle definitions
├── state/                 # React context providers
│   ├── DesignContext.tsx   # Vehicle design state + simulation
│   └── RDContext.tsx       # R&D progression state
└── lib/                   # Utility functions
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run docs:dev` | Start the documentation site (this site) |
| `npm run docs:build` | Build the documentation as static HTML |

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **Lucide React** | Icon library |
| **Supabase** | Backend-as-a-service (save/load) |
| **VitePress** | Documentation site |
