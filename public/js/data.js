const STORAGE_KEYS = {
  USERS: 'fitsurvivor_users',
  CURRENT_USER: 'fitsurvivor_current_user'
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

function generateDefaultExercisesWithIds() {
  return DEFAULT_EXERCISES.map((ex, i) => ({
    ...ex,
    id: 'default_' + (i + 1),
    isDefault: true
  }));
}

class DataManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = this.getCurrentUserId();
    this.currentUser = this.getCurrentUser();
  }

  generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  loadUsers() {
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  saveUsers() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(this.users));
  }

  getCurrentUserId() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  }

  setCurrentUserId(userId) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
    this.currentUserId = userId;
    this.currentUser = this.getCurrentUser();
  }

  getCurrentUser() {
    if (!this.currentUserId) return null;
    return this.users.find(u => u.id === this.currentUserId) || null;
  }

  createUser(name) {
    const defaultExercises = generateDefaultExercisesWithIds();
    const newUser = {
      id: this.generateId(),
      name: name,
      profile: {
        weight: 70,
        height: 175,
        experience: 'beginner',
        goal: 'muscle'
      },
      exercises: defaultExercises,
      routines: [],
      createdAt: Date.now()
    };
    this.users.push(newUser);
    this.saveUsers();
    return newUser;
  }

  updateUser(userId, updates) {
    const index = this.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      this.users[index] = { ...this.users[index], ...updates };
      this.saveUsers();
      if (userId === this.currentUserId) {
        this.currentUser = this.users[index];
      }
      return this.users[index];
    }
    return null;
  }

  deleteUser(userId) {
    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();
    if (userId === this.currentUserId) {
      if (this.users.length > 0) {
        this.setCurrentUserId(this.users[0].id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        this.currentUserId = null;
        this.currentUser = null;
      }
    }
  }

  get exercises() {
    return this.currentUser?.exercises || [];
  }

  get routines() {
    return this.currentUser?.routines || [];
  }

  get profile() {
    return this.currentUser?.profile || {
      weight: 70,
      height: 175,
      experience: 'beginner',
      goal: 'muscle'
    };
  }

  saveProfile(profile) {
    if (!this.currentUserId) return;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex !== -1) {
      this.users[userIndex].profile = profile;
      this.saveUsers();
      this.currentUser = this.users[userIndex];
    }
  }

  addExercise(exercise) {
    if (!this.currentUserId) return null;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return null;
    
    const newExercise = { ...exercise, id: this.generateId(), isDefault: false };
    this.users[userIndex].exercises.push(newExercise);
    this.saveUsers();
    return newExercise;
  }

  updateExercise(id, updates) {
    if (!this.currentUserId) return null;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return null;
    
    const exIndex = this.users[userIndex].exercises.findIndex(e => e.id === id);
    if (exIndex !== -1) {
      this.users[userIndex].exercises[exIndex] = { 
        ...this.users[userIndex].exercises[exIndex], 
        ...updates 
      };
      this.saveUsers();
      return this.users[userIndex].exercises[exIndex];
    }
    return null;
  }

  deleteExercise(id) {
    if (!this.currentUserId) return;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return;
    
    this.users[userIndex].exercises = this.users[userIndex].exercises.filter(e => e.id !== id);
    this.saveUsers();
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

  addRoutine(routine) {
    if (!this.currentUserId) return null;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return null;
    
    const newRoutine = { 
      ...routine, 
      id: this.generateId(), 
      createdAt: Date.now() 
    };
    this.users[userIndex].routines.push(newRoutine);
    this.saveUsers();
    return newRoutine;
  }

  updateRoutine(id, updates) {
    if (!this.currentUserId) return null;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return null;
    
    const routineIndex = this.users[userIndex].routines.findIndex(r => r.id === id);
    if (routineIndex !== -1) {
      this.users[userIndex].routines[routineIndex] = { 
        ...this.users[userIndex].routines[routineIndex], 
        ...updates 
      };
      this.saveUsers();
      return this.users[userIndex].routines[routineIndex];
    }
    return null;
  }

  deleteRoutine(id) {
    if (!this.currentUserId) return;
    const userIndex = this.users.findIndex(u => u.id === this.currentUserId);
    if (userIndex === -1) return;
    
    this.users[userIndex].routines = this.users[userIndex].routines.filter(r => r.id !== id);
    this.saveUsers();
  }
}

window.dataManager = new DataManager();
