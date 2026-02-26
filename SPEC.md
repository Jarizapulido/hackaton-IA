# FitSurvivor - Specification

## Project Overview
- **Name**: FitSurvivor
- **Type**: Web Application (Fitness Routine Manager + Game)
- **Core Functionality**: Create customizable workout routines with a built-in roguelike mini-game
- **Target Users**: Fitness enthusiasts who want gamified workout experiences

## Tech Stack
- **Runtime**: Bun
- **Backend**: Bun.serve with file-based routing (public folder)
- **Frontend**: Vanilla JS with modular structure
- **Storage**: LocalStorage (for MVP)

## UI/UX Specification

### Layout Structure
- **Navigation**: Sidebar with 3 main sections (Ejercicios, Perfil, Rutinas)
- **Main Content**: Dynamic area based on selected section
- **Responsive**: Mobile-first, collapsible sidebar on small screens

### Visual Design

#### Color Palette
- **Background**: `#0a0a0f` (deep dark)
- **Surface**: `#12121a` (card backgrounds)
- **Surface Elevated**: `#1a1a24` (hover states)
- **Primary**: `#00ff88` (neon green - accent)
- **Secondary**: `#ff3366` (pink - for actions)
- **Tertiary**: `#6366f1` (indigo - for info)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#8888aa`
- **Border**: `#2a2a3a`

#### Typography
- **Font Family**: 'Orbitron' for headings, 'Rajdhani' for body (futuristic/sporty)
- **Headings**: 24px-32px, bold, uppercase
- **Body**: 14px-16px, regular
- **Labels**: 12px, medium, uppercase

#### Spacing
- **Base unit**: 8px
- **Card padding**: 16px-24px
- **Section gaps**: 24px

#### Visual Effects
- **Cards**: Subtle glow on hover (`box-shadow: 0 0 20px rgba(0,255,136,0.1)`)
- **Buttons**: Neon glow effect on hover
- **Transitions**: 200ms ease-out for all interactions

### Components

#### Sidebar Navigation
- Logo at top
- 3 nav items with icons
- Active state: neon green left border + glow

#### Exercise Card
- Muscle group badge (color-coded)
- Exercise name
- Type indicator (reps/time)
- Actions: Edit, Delete

#### Profile Form
- Input fields with floating labels
- Save button with loading state

#### Routine Builder
- Drag-and-drop interface for exercises
- Series/reps/time inputs
- Rest period configuration
- Preview panel

## Functionality Specification

### 1. Exercise Management (Ejercicios)
- **View exercises**: List grouped by muscle groups (Pecho, Espalda, Piernas, Brazos, Core, Hombros)
- **Add exercise**: Name, muscle group, default type (reps/time), default value
- **Edit exercise**: Modify any field
- **Delete exercise**: With confirmation
- **Search/filter**: By name or muscle group

### 2. User Profile (Perfil)
- **Fields**:
  - Name (text)
  - Weight (number, kg)
  - Height (number, cm)
  - Experience level (Beginner/Intermediate/Advanced)
  - Goal (Muscle Gain/Weight Loss/Endurance)
- **Save**: Persist to localStorage
- **Load on startup**: Auto-fill form if data exists

### 3. Routine Management (Rutinas)
- **Create routine**: Name, description
- **Add exercises**: Select from library, set series (1-10), reps (1-50) OR duration (seconds)
- **Add rest**: Rest periods between exercises (seconds)
- **Exercise packs**: Group multiple exercises as a "pack" (do all in sequence)
- **Skip functionality**: Mark exercises/rest as skippable
- **Reorder**: Drag to reorder exercises
- **Delete routine**: With confirmation
- **Start routine**: Begin workout session (prepares for game mode)

### Data Models

```typescript
interface Exercise {
  id: string;
  name: string;
  muscleGroup: 'pecho' | 'espalda' | 'piernas' | 'brazos' | 'core' | 'hombros';
  defaultType: 'reps' | 'time';
  defaultValue: number;
}

interface RoutineExercise {
  exerciseId: string;
  series: number;
  type: 'reps' | 'time';
  value: number;
  isRest: boolean;
  restDuration?: number;
  skippable: boolean;
  isPack?: boolean;
  packExercises?: RoutineExercise[];
}

interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: RoutineExercise[];
  createdAt: number;
}

interface UserProfile {
  name: string;
  weight: number;
  height: number;
  experience: 'beginner' | 'intermediate' | 'advanced';
  goal: 'muscle' | 'weight_loss' | 'endurance';
}
```

## Acceptance Criteria

### Exercises
- [ ] Can view all exercises grouped by muscle
- [ ] Can add new exercise with all fields
- [ ] Can edit existing exercise
- [ ] Can delete exercise
- [ ] Search filters work correctly

### Profile
- [ ] All profile fields are editable
- [ ] Data persists after page reload
- [ ] Form validation works

### Routines
- [ ] Can create new routine with name
- [ ] Can add exercises to routine
- [ ] Can add rest periods
- [ ] Can set reps or time for each exercise
- [ ] Can mark items as skippable
- [ ] Can reorder exercises
- [ ] Can delete routine
- [ ] Can start routine (shows workout view)
