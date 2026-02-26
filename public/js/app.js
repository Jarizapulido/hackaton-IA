let currentSection = 'ejercicios';
let editingExerciseId = null;
let editingRoutineId = null;
let currentRoutineItems = [];
let editingItemIndex = null;

let workoutQueue = [];
let currentWorkoutIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initExercises();
  initProfile();
  initRoutines();
  initModals();
});

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.dataset.section;
      switchSection(section);
    });
  });
}

function switchSection(section) {
  currentSection = section;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.section === section);
  });
  
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === section);
  });
  
  if (section === 'ejercicios') {
    renderExercises();
  } else if (section === 'rutinas') {
    renderRoutines();
  }
}

function initExercises() {
  const addBtn = document.getElementById('addExerciseBtn');
  const searchInput = document.getElementById('exerciseSearch');
  const muscleFilter = document.getElementById('muscleFilter');
  const saveBtn = document.getElementById('saveExerciseBtn');
  
  addBtn.addEventListener('click', () => {
    editingExerciseId = null;
    document.getElementById('exerciseModalTitle').textContent = 'Nuevo Ejercicio';
    document.getElementById('exerciseForm').reset();
    showModal('exerciseModal');
  });
  
  searchInput.addEventListener('input', () => {
    renderExercises(searchInput.value, muscleFilter.value);
  });
  
  muscleFilter.addEventListener('change', () => {
    renderExercises(searchInput.value, muscleFilter.value);
  });
  
  saveBtn.addEventListener('click', saveExercise);
  
  renderExercises();
}

function renderExercises(search = '', muscle = '') {
  const container = document.getElementById('exercisesList');
  let exercises = window.dataManager.exercises;
  
  if (search) {
    exercises = exercises.filter(e => 
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (muscle) {
    exercises = exercises.filter(e => e.muscleGroup === muscle);
  }
  
  if (exercises.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('🏋️', 'No hay ejercicios', 'Añade tu primer ejercicio'));
    return;
  }
  
  const grouped = {};
  exercises.forEach(ex => {
    if (!grouped[ex.muscleGroup]) {
      grouped[ex.muscleGroup] = [];
    }
    grouped[ex.muscleGroup].push(ex);
  });
  
  container.innerHTML = '';
  
  Object.keys(MUSCLE_LABELS).forEach(muscle => {
    if (grouped[muscle] && (muscle === '' || !muscle || exercises.some(e => e.muscleGroup === muscle))) {
      const muscleExercises = exercises.filter(e => e.muscleGroup === muscle);
      if (muscleExercises.length > 0) {
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `<h3 style="color: var(--primary); margin: 16px 0 8px; font-size: 14px; text-transform: uppercase;">${MUSCLE_LABELS[muscle]}</h3>`;
        
        muscleExercises.forEach(ex => {
          groupDiv.appendChild(createExerciseCard(ex));
        });
        
        container.appendChild(groupDiv);
      }
    }
  });
  
  container.querySelectorAll('.edit-exercise').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      editExercise(id);
    });
  });
  
  container.querySelectorAll('.delete-exercise').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirmDelete('¿Eliminar este ejercicio?')) {
        window.dataManager.deleteExercise(id);
        renderExercises();
      }
    });
  });
}

function editExercise(id) {
  const exercise = window.dataManager.exercises.find(e => e.id === id);
  if (!exercise) return;
  
  editingExerciseId = id;
  document.getElementById('exerciseModalTitle').textContent = 'Editar Ejercicio';
  document.getElementById('exerciseName').value = exercise.name;
  document.getElementById('exerciseMuscle').value = exercise.muscleGroup;
  document.getElementById('exerciseType').value = exercise.defaultType;
  document.getElementById('exerciseValue').value = exercise.defaultValue;
  
  showModal('exerciseModal');
}

function saveExercise() {
  const name = document.getElementById('exerciseName').value.trim();
  const muscleGroup = document.getElementById('exerciseMuscle').value;
  const defaultType = document.getElementById('exerciseType').value;
  const defaultValue = parseInt(document.getElementById('exerciseValue').value);
  
  if (!name || !defaultValue) {
    alert('Por favor, completa todos los campos');
    return;
  }
  
  const exerciseData = {
    name,
    muscleGroup,
    defaultType,
    defaultValue
  };
  
  if (editingExerciseId) {
    window.dataManager.updateExercise(editingExerciseId, exerciseData);
  } else {
    window.dataManager.addExercise(exerciseData);
  }
  
  hideModal('exerciseModal');
  renderExercises();
  renderExercisePicker();
}

function initProfile() {
  const form = document.getElementById('profileForm');
  const profile = window.dataManager.profile;
  
  document.getElementById('profileName').value = profile.name || '';
  document.getElementById('profileWeight').value = profile.weight || '';
  document.getElementById('profileHeight').value = profile.height || '';
  document.getElementById('profileExperience').value = profile.experience || 'beginner';
  document.getElementById('profileGoal').value = profile.goal || 'muscle';
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const profileData = {
      name: document.getElementById('profileName').value.trim(),
      weight: parseFloat(document.getElementById('profileWeight').value),
      height: parseInt(document.getElementById('profileHeight').value),
      experience: document.getElementById('profileExperience').value,
      goal: document.getElementById('profileGoal').value
    };
    
    window.dataManager.saveProfile(profileData);
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '✓ Guardado';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

function initRoutines() {
  const createBtn = document.getElementById('createRoutineBtn');
  const saveBtn = document.getElementById('saveRoutineBtn');
  
  createBtn.addEventListener('click', () => {
    editingRoutineId = null;
    currentRoutineItems = [];
    document.getElementById('routineEditorTitle').textContent = 'Nueva Rutina';
    document.getElementById('routineName').value = '';
    document.getElementById('routineDescription').value = '';
    renderRoutineItems();
    renderExercisePicker();
    showModal('routineEditor');
  });
  
  saveBtn.addEventListener('click', saveRoutine);
  
  renderRoutines();
}

function renderRoutines() {
  const container = document.getElementById('routinesList');
  const routines = window.dataManager.routines;
  
  if (routines.length === 0) {
    container.innerHTML = '';
    container.appendChild(createEmptyState('📋', 'Sin rutinas', 'Crea tu primera rutina de entrenamiento'));
    return;
  }
  
  container.innerHTML = '';
  routines.forEach(routine => {
    container.appendChild(createRoutineCard(routine));
  });
  
  container.querySelectorAll('.start-routine').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      startWorkout(id);
    });
  });
  
  container.querySelectorAll('.edit-routine').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      editRoutine(id);
    });
  });
  
  container.querySelectorAll('.delete-routine').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirmDelete('¿Eliminar esta rutina?')) {
        window.dataManager.deleteRoutine(id);
        renderRoutines();
      }
    });
  });
}

function editRoutine(id) {
  const routine = window.dataManager.routines.find(r => r.id === id);
  if (!routine) return;
  
  editingRoutineId = id;
  currentRoutineItems = JSON.parse(JSON.stringify(routine.exercises));
  document.getElementById('routineEditorTitle').textContent = 'Editar Rutina';
  document.getElementById('routineName').value = routine.name;
  document.getElementById('routineDescription').value = routine.description || '';
  renderRoutineItems();
  renderExercisePicker();
  showModal('routineEditor');
}

function renderExercisePicker() {
  const container = document.getElementById('exercisePicker');
  const exercises = window.dataManager.exercises;
  
  container.innerHTML = '';
  exercises.forEach(ex => {
    container.appendChild(createExercisePickerItem(ex));
  });
  
  container.querySelectorAll('.picker-item').forEach(item => {
    item.addEventListener('click', () => {
      const exerciseId = item.dataset.id;
      addExerciseToRoutine(exerciseId);
    });
  });
}

function addExerciseToRoutine(exerciseId) {
  const exercise = window.dataManager.exercises.find(e => e.id === exerciseId);
  if (!exercise) return;
  
  const routineItem = {
    exerciseId: exerciseId,
    series: 3,
    type: exercise.defaultType,
    value: exercise.defaultValue,
    isRest: false,
    skippable: false
  };
  
  currentRoutineItems.push(routineItem);
  renderRoutineItems();
}

function addRestToRoutine() {
  const restItem = {
    isRest: true,
    duration: 60,
    skippable: true
  };
  
  currentRoutineItems.push(restItem);
  renderRoutineItems();
}

function renderRoutineItems() {
  const container = document.getElementById('routineExercises');
  
  if (currentRoutineItems.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Selecciona ejercicios de la izquierda</p></div>';
    return;
  }
  
  container.innerHTML = '';
  
  currentRoutineItems.forEach((item, index) => {
    let exerciseName = 'Descanso';
    if (!item.isRest) {
      const exercise = window.dataManager.exercises.find(e => e.id === item.exerciseId);
      exerciseName = exercise ? exercise.name : 'Ejercicio';
    }
    
    const div = document.createElement('div');
    div.className = `routine-item ${item.isRest ? 'rest' : ''}`;
    div.innerHTML = `
      <span class="drag-handle">⋮⋮</span>
      <div class="routine-item-content">
        <div class="routine-item-name">${exerciseName}</div>
        <div class="routine-item-details">${item.isRest ? `${item.duration}s` : `${item.series}x${item.value} ${item.type === 'reps' ? 'rep' : 's'}`}</div>
      </div>
      <label class="checkbox-label">
        <input type="checkbox" ${item.skippable ? 'checked' : ''} data-index="${index}">
        Saltable
      </label>
      <div class="routine-item-actions">
        <button class="edit-item" data-index="${index}">⚙️</button>
        <button class="delete-item" data-index="${index}">🗑️</button>
      </div>
    `;
    
    container.appendChild(div);
  });
  
  container.querySelectorAll('.delete-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      currentRoutineItems.splice(index, 1);
      renderRoutineItems();
    });
  });
  
  container.querySelectorAll('.edit-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      showItemEditor(index);
    });
  });
  
  container.querySelectorAll('.checkbox-label input').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const index = parseInt(checkbox.dataset.index);
      currentRoutineItems[index].skippable = checkbox.checked;
    });
  });
  
  let addBtn = container.querySelector('.add-item-btn');
  if (!addBtn) {
    addBtn = document.createElement('button');
    addBtn.className = 'add-item-btn';
    addBtn.textContent = '+ Añadir descanso';
    addBtn.addEventListener('click', addRestToRoutine);
    container.appendChild(addBtn);
  }
}

function showItemEditor(index) {
  const item = currentRoutineItems[index];
  if (!item) return;
  
  if (item.isRest) {
    const duration = prompt('Duración del descanso (segundos):', item.duration || 60);
    if (duration !== null) {
      const val = parseInt(duration);
      if (!isNaN(val) && val > 0) {
        item.duration = val;
        renderRoutineItems();
      }
    }
  } else {
    const series = prompt('Series:', item.series || 3);
    const value = prompt(item.type === 'reps' ? 'Repeticiones:' : 'Duración (segundos):', item.value || 10);
    
    if (series !== null && value !== null) {
      const s = parseInt(series);
      const v = parseInt(value);
      if (!isNaN(s) && s > 0) item.series = s;
      if (!isNaN(v) && v > 0) item.value = v;
      renderRoutineItems();
    }
  }
}

function saveRoutine() {
  const name = document.getElementById('routineName').value.trim();
  const description = document.getElementById('routineDescription').value.trim();
  
  if (!name) {
    alert('Por favor, ingresa un nombre para la rutina');
    return;
  }
  
  if (currentRoutineItems.length === 0) {
    alert('La rutina debe tener al menos un ejercicio');
    return;
  }
  
  const routineData = {
    name,
    description,
    exercises: currentRoutineItems
  };
  
  if (editingRoutineId) {
    window.dataManager.updateRoutine(editingRoutineId, routineData);
  } else {
    window.dataManager.addRoutine(routineData);
  }
  
  hideModal('routineEditor');
  renderRoutines();
}

function startWorkout(routineId) {
  const routine = window.dataManager.routines.find(r => r.id === routineId);
  if (!routine || routine.exercises.length === 0) {
    alert('Esta rutina no tiene ejercicios');
    return;
  }
  
  workoutQueue = [];
  routine.exercises.forEach((item, index) => {
    if (item.isRest) {
      workoutQueue.push({ ...item, originalIndex: index });
    } else {
      for (let s = 0; s < item.series; s++) {
        workoutQueue.push({
          ...item,
          seriesIndex: s + 1,
          originalIndex: index
        });
      }
    }
  });
  
  currentWorkoutIndex = 0;
  
  document.getElementById('workoutTitle').textContent = `Rutina: ${routine.name}`;
  showModal('workoutModal');
  updateWorkoutDisplay();
}

function updateWorkoutDisplay() {
  const current = workoutQueue[currentWorkoutIndex];
  const total = workoutQueue.length;
  
  const progress = ((currentWorkoutIndex / total) * 100);
  document.getElementById('workoutProgress').style.width = `${progress}%`;
  document.getElementById('workoutProgressText').textContent = `${currentWorkoutIndex + 1} / ${total}`;
  
  if (current.isRest) {
    document.getElementById('currentExerciseName').textContent = '⏱️ Descanso';
    document.getElementById('currentExerciseSeries').textContent = `${current.duration} segundos`;
    document.getElementById('currentExerciseReps').textContent = current.skippable ? 'Saltable' : 'Obligatorio';
  } else {
    const exercise = window.dataManager.exercises.find(e => e.id === current.exerciseId);
    document.getElementById('currentExerciseName').textContent = exercise ? exercise.name : 'Ejercicio';
    document.getElementById('currentExerciseSeries').textContent = `Serie ${current.seriesIndex} / ${current.series}`;
    document.getElementById('currentExerciseReps').textContent = current.type === 'reps' 
      ? `${current.value} repeticiones` 
      : `${current.value} segundos`;
  }
}

document.getElementById('completeExerciseBtn').addEventListener('click', () => {
  currentWorkoutIndex++;
  if (currentWorkoutIndex >= workoutQueue.length) {
    finishWorkout();
  } else {
    updateWorkoutDisplay();
  }
});

document.getElementById('skipExerciseBtn').addEventListener('click', () => {
  currentWorkoutIndex++;
  if (currentWorkoutIndex >= workoutQueue.length) {
    finishWorkout();
  } else {
    updateWorkoutDisplay();
  }
});

function finishWorkout() {
  hideModal('workoutModal');
  alert('¡Enhorabuena! Has completado la rutina 🎉');
}

function initModals() {
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });
  
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}
