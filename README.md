# FitSurvivor

**FitSurvivor** es una aplicación web de entrenamiento con un Roguelike integrado estilo Vampire Survivors.

## Qué hacer para ejecutarlo

### 1. Instalar Bun (runtime de JavaScript)

```bash
# En Linux/Mac:
curl -fsSL https://bun.sh/install | bash

# O si tienes problemas, con npm:
npm install -g bun
```

### 2. Descargar el proyecto

Clona el repositorio o descarga los archivos a tu ordenador.

```bash
git clone https://github.com/jarizapulido/hackaton-IA
```

### 3. Instalar dependencias e iniciar

```bash
# Instalar dependencias
bun install

# Iniciar el servidor
bun run dev
```

### 4. Abrir en el navegador

Ve a: **http://localhost:3000**

---

## Características

- **Gestión de ejercicios**: Biblioteca de ejercicios organizados por grupo muscular
- **Creación de rutinas**: Construye tus propias rutinas con series, repeticiones y descansos
- **Seguimiento de progreso**: Interfaz visual durante el entrenamiento
- **Juego Roguelike**: Durante los descansos (30+ segundos) puedes jugar un minijuego donde:
  - Te mueves con el ratón
  - Disparas automáticamente al enemigo más cercano
  - Eliges mejoras entre descansos
  - Las mejoras se acumulan durante toda la rutina
  - Botón para saltar descanso cuando quieras

---

## Cómo usar el juego

1. Crea una rutina con ejercicios y descansos de al menos 30 segundos
2. Inicia la rutina
3. Cuando llegue un descanso, pulsa "🎮 Jugar y Completar"
4. Elige una mejora al inicio
5. Sobrevive el tiempo de descanso
6. Elige otra mejora al final (o salta el descanso)
7. Continúa con el siguiente ejercicio


<!-- El juego no funciona del todo debido a que me he vuelto a quedar sin poder usar tokens, cuando pueda volver a usar seguire, he conseguido que al menos se pueda jugar pero no puedes continuar con las rutinas, si esto de la IA esta muy chulo y creo que te puede ayudar a ir muy rapido pero estoy teniendo problemas que si lo hubiese hecho yo 
se solucionarian en un momento en lugar de rezar a que la IA lo entienda y salga bien, ademas de que haria falta nivelar el juego.

Al final he podido añadir esa funcionalidad con un solo prompt, le he repetido todo y esta vez si lo ha hecho bien. --> 
