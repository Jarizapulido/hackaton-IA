const STORAGE_KEYS = {
  EXERCISES: 'fitsurvivor_exercises',
  ROUTINES: 'fitsurvivor_routines',
  PROFILE: 'fitsurvivor_profile'
};

const DEFAULT_EXERCISES = [
  { id: 'ex1', name: 'Press de banca', muscleGroup: 'pecho', defaultType: 'reps', defaultValue: 12 },
  { id: 'ex2', name: 'Flexiones', muscleGroup: 'pecho', defaultType: 'reps', defaultValue: 15 },
  { id: 'ex3', name: 'Press inclinado', muscleGroup: 'pecho', defaultType: 'reps', defaultValue: 10 },
  { id: 'ex4', name: 'Dominadas', muscleGroup: 'espalda', defaultType: 'reps', defaultValue: 8 },
  { id: 'ex5', name: 'Remo con mancuerna', muscleGroup: 'espalda', defaultType: 'reps', defaultValue: 12 },
  { id: 'ex6', name: 'Pull-ups', muscleGroup: 'espalda', defaultType: 'reps', defaultValue: 10 },
  { id: 'ex7', name: 'Sentadillas', muscleGroup: 'piernas', defaultType: 'reps', defaultValue: 12 },
  { id: 'ex8', name: 'Peso muerto', muscleGroup: 'piernas', defaultType: 'reps', defaultValue: 10 },
  { id: 'ex9', name: 'Zancadas', muscleGroup: 'piernas', defaultType: 'reps', defaultValue: 12 },
  { id: 'ex10', name: 'Curl de bíceps', muscleGroup: 'brazos', defaultType: 'reps', defaultValue: 12 },
  { id: 'ex11', name: 'Tríceps en polea', muscleGroup: 'brazos', defaultType: 'reps', defaultValue: 15 },
  { id: 'ex12', name: 'Crunches', muscleGroup: 'core', defaultType: 'reps', defaultValue: 20 },
  { id: 'ex13', name: 'Plancha', muscleGroup: 'core', defaultType: 'time', defaultValue: 60 },
  { id: 'ex14', name: 'Press de hombros', muscleGroup: 'hombros', defaultType: 'reps', defaultValue: 12 },
  { id: 'ex15', name: 'Elevaciones laterales', muscleGroup: 'hombros', defaultType: 'reps', defaultValue: 15 }
];

class DataManager {
  constructor() {
    this.exercises = this.loadExercises();
    this.routines = this.loadRoutines();
    this.profile = this.loadProfile();
  }

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadExercises() {
    const stored = localStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (stored) {
      return JSON.parse(stored);
    }
    this.saveExercises(DEFAULT_EXERCISES);
    return DEFAULT_EXERCISES;
  }

  saveExercises(exercises) {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
    this.exercises = exercises;
  }

  addExercise(exercise) {
    const newExercise = { ...exercise, id: this.generateId() };
    this.exercises.push(newExercise);
    this.saveExercises(this.exercises);
    return newExercise;
  }

  updateExercise(id, updates) {
    const index = this.exercises.findIndex(e => e.id === id);
    if (index !== -1) {
      this.exercises[index] = { ...this.exercises[index], ...updates };
      this.saveExercises(this.exercises);
      return this.exercises[index];
    }
    return null;
  }

  deleteExercise(id) {
    this.exercises = this.exercises.filter(e => e.id !== id);
    this.saveExercises(this.exercises);
  }

  getExercisesByMuscle(muscle) {
    if (!muscle) return this.exercises;
    return this.exercises.filter(e => e.muscleGroup === muscle);
  }

  searchExercises(query) {
    const q = query.toLowerCase();
    return this.exercises.filter(e => 
      e.name.toLowerCase().includes(q) || 
      e.muscleGroup.toLowerCase().includes(q)
    );
  }

  loadRoutines() {
    const stored = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  saveRoutines(routines) {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
    this.routines = routines;
  }

  addRoutine(routine) {
    const newRoutine = { 
      ...routine, 
      id: this.generateId(), 
      createdAt: Date.now() 
    };
    this.routines.push(newRoutine);
    this.saveRoutines(this.routines);
    return newRoutine;
  }

  updateRoutine(id, updates) {
    const index = this.routines.findIndex(r => r.id === id);
    if (index !== -1) {
      this.routines[index] = { ...this.routines[index], ...updates };
      this.saveRoutines(this.routines);
      return this.routines[index];
    }
    return null;
  }

  deleteRoutine(id) {
    this.routines = this.routines.filter(r => r.id !== id);
    this.saveRoutines(this.routines);
  }

  loadProfile() {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      name: '',
      weight: 70,
      height: 175,
      experience: 'beginner',
      goal: 'muscle'
    };
  }

  saveProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    this.profile = profile;
  }
}

window.dataManager = new DataManager();
