const MUSCLE_LABELS = {
  pecho: 'Pecho',
  espalda: 'Espalda',
  piernas: 'Piernas',
  brazos: 'Brazos',
  core: 'Core',
  hombros: 'Hombros'
};

const EXPERIENCE_LABELS = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
};

const GOAL_LABELS = {
  muscle: 'Ganar Músculo',
  weight_loss: 'Perder Peso',
  endurance: 'Resistencia'
};

function createExerciseCard(exercise) {
  const card = document.createElement('div');
  card.className = 'exercise-card';
  card.dataset.id = exercise.id;
  
  const typeLabel = exercise.defaultType === 'reps' 
    ? `${exercise.defaultValue} repeticiones` 
    : `${exercise.defaultValue} segundos`;
  
  card.innerHTML = `
    <div class="exercise-card-header">
      <span class="exercise-name">${exercise.name}</span>
      <span class="muscle-badge ${exercise.muscleGroup}">${MUSCLE_LABELS[exercise.muscleGroup]}</span>
    </div>
    <div class="exercise-type">${typeLabel}</div>
    <div class="exercise-actions">
      <button class="btn btn-secondary btn-small edit-exercise" data-id="${exercise.id}">Editar</button>
      <button class="btn btn-danger btn-small delete-exercise" data-id="${exercise.id}">Eliminar</button>
    </div>
  `;
  
  return card;
}

function createExercisePickerItem(exercise) {
  const item = document.createElement('div');
  item.className = 'picker-item';
  item.dataset.id = exercise.id;
  
  item.innerHTML = `
    <div>
      <div class="picker-item-name">${exercise.name}</div>
      <div class="picker-item-muscle">${MUSCLE_LABELS[exercise.muscleGroup]}</div>
    </div>
    <span>+</span>
  `;
  
  return item;
}

function createRoutineItem(item, index, exerciseName) {
  const div = document.createElement('div');
  div.className = `routine-item ${item.isRest ? 'rest' : ''}`;
  div.dataset.index = index;
  
  if (item.isRest) {
    div.innerHTML = `
      <span class="drag-handle">⋮⋮</span>
      <div class="routine-item-content">
        <div class="routine-item-name">Descanso</div>
        <div class="routine-item-details">${item.duration} segundos</div>
      </div>
      <div class="routine-item-actions">
        <button class="edit-item" title="Editar">⚙️</button>
        <button class="delete-item" title="Eliminar">🗑️</button>
      </div>
    `;
  } else {
    const detail = item.type === 'reps' 
      ? `${item.series} x ${item.value} reps` 
      : `${item.series} x ${item.value}s`;
    
    div.innerHTML = `
      <span class="drag-handle">⋮⋮</span>
      <div class="routine-item-content">
        <div class="routine-item-name">${exerciseName}</div>
        <div class="routine-item-details">${detail}</div>
      </div>
      <div class="routine-item-actions">
        <button class="edit-item" title="Editar">⚙️</button>
        <button class="delete-item" title="Eliminar">🗑️</button>
      </div>
    `;
  }
  
  return div;
}

function createRoutineCard(routine) {
  const exerciseCount = routine.exercises.filter(e => !e.isRest).length;
  const totalDuration = routine.exercises.reduce((acc, e) => {
    if (e.isRest) return acc + (e.duration || 0);
    return acc + ((e.value || 0) * (e.series || 1));
  }, 0);
  
  const card = document.createElement('div');
  card.className = 'routine-card';
  card.dataset.id = routine.id;
  
  card.innerHTML = `
    <div class="routine-card-header">
      <span class="routine-card-name">${routine.name}</span>
      <span class="exercise-type">${exerciseCount} ejercicios</span>
    </div>
    <p class="routine-card-description">${routine.description || 'Sin descripción'}</p>
    <div class="routine-card-stats">
      <span>⏱️ ~${Math.round(totalDuration / 60)} min</span>
      <span>🔄 ${routine.exercises.length} items</span>
    </div>
    <div class="routine-card-actions">
      <button class="btn btn-primary btn-small start-routine" data-id="${routine.id}">Iniciar</button>
      <button class="btn btn-secondary btn-small edit-routine" data-id="${routine.id}">Editar</button>
      <button class="btn btn-danger btn-small delete-routine" data-id="${routine.id}">Eliminar</button>
    </div>
  `;
  
  return card;
}

function createEmptyState(icon, title, message) {
  const div = document.createElement('div');
  div.className = 'empty-state';
  div.innerHTML = `
    <div class="empty-state-icon">${icon}</div>
    <h3>${title}</h3>
    <p>${message}</p>
  `;
  return div;
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function confirmDelete(message = '¿Estás seguro de que quieres eliminar esto?') {
  return confirm(message);
}
