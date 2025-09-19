export interface Exercise {
  name: string;
  reps: string;
  link?: string;
}

export interface Day {
  name: string;
  warmup?: string;
  warmupLink?: string;
  exercises: Exercise[];
  cooldown?: string;
  cooldownLinks?: { [key: string]: string };
}

export interface Variation {
  days: Day[];
}

export const variation1: Variation = {
  days: [
    {
      name: "Segunda-feira: UPPER (Membros Superiores)",
      warmup: "Aquecimento: 10 min cardio leve",
      exercises: [
        { name: "Pull-ups ou Puxada frontal", reps: "4×8-12" },
        { name: "Supino reto com halteres", reps: "4×8-10" },
        { name: "Remada curvada", reps: "4×8-10" },
        { name: "Desenvolvimento com halteres", reps: "3×10-12" },
        { name: "Rosca direta", reps: "3×10-12" },
        { name: "Tríceps na polia", reps: "3×10-12" },
        { name: "Prancha frontal", reps: "3×30-45s" },
        { name: "Esteira", reps: "20 min cardio médio (Apenas se der tempo)" },
      ],
    },
    {
      name: "Terça-feira: LOWER + CORE",
      warmup: "Aquecimento: 10 min bike ou esteira",
      exercises: [
        { name: "Agachamento livre", reps: "4×8-10" },
        { name: "Levantamento terra", reps: "3×8" },
        { name: "Leg press", reps: "3×12-15" },
        { name: "Stiff", reps: "3×10-12" },
        { name: "Panturrilha", reps: "3×15" },
        { name: "Prancha lateral", reps: "3×20-30s cada lado" },
        { name: "Esteira", reps: "20 min cardio médio (Apenas se der tempo)" },
      ],
    },
    {
      name: "Quarta-feira: CARDIO INTENSO + CORE",
      exercises: [
        {
          name: "HIIT",
          reps: "20-25 minutos (Workouts HIIT full body normal or hard)",
          link: "https://darebee.com/workout/types/hiit/focus/full-body/difficulty/hard%7Cnormal.html",
        },
        { name: "Burpees", reps: "4×10-12" },
        { name: "Escalador cruzado", reps: "4×45s" },
        { name: "Abdominais oblíquos", reps: "3×15 cada lado" },
        { name: "Elevação de pernas", reps: "3×15" },
      ],
    },
    {
      name: "Quinta-feira: UPPER B (Variação)",
      warmup: "Aquecimento: 10 min cardio leve",
      exercises: [
        { name: "Supino inclinado", reps: "4×8-10" },
        { name: "Remada unilateral", reps: "4×8-10" },
        { name: "Desenvolvimento militar", reps: "3×10-12" },
        { name: "Puxada alta", reps: "3×10-12" },
        { name: "Rosca martelo", reps: "3×10-12" },
        { name: "Rosca francesa", reps: "3×10-12" },
        { name: "Swimming (exercício Pilates)", reps: "3×12 cada lado" },
      ],
    },
    {
      name: "Sexta-feira",
      warmup: "Aquecimento articular: 8 min (Unbound Workout)",
      warmupLink: "https://darebee.com/workouts/unbound-workout.html",
      exercises: [
        { name: "Agachamento com salto", reps: "4×10" },
        { name: "Swing com kettlebell", reps: "3×15" },
        {
          name: "Prancha com movimento",
          reps: "3×30s (Prancha Alta com Movimentação de Braços e Pernas)",
          link: "https://www.youtube.com/watch?v=TZzSiFnhGck#:~:text=Neste%20tutorial%2C%20explicamos%20a%20t%C3%A9cnica%20correta%20para%20maximizar,PRANCHA%20ALTA%20COM%20MOVIMENTA%C3%87%C3%83O%20DE%20BRA%C3%87OS%20E%20PERNAS%3F",
        },
      ],
      cooldown:
        "Alongamento: 10 min (Shoulder Stretching Workout + Recover & Rebuild Workout + Limitless Workout)",
      cooldownLinks: {
        "Shoulder Stretching Workout":
          "https://darebee.com/workouts/shoulder-stretching-workout.html",
        "Recover & Rebuild Workout":
          "https://darebee.com/workouts/recover-and-rebuild-workout.html",
        "Limitless Workout":
          "https://darebee.com/workouts/limitless-workout.html",
      },
    },
    {
      name: "Sábado (quando der)",
      exercises: [
        { name: "Circundução de ombros", reps: "2×10 cada direção" },
        { name: "Rotação externa com elástico", reps: "2×15" },
        { name: "Alongamento cápsula posterior", reps: "2×30s cada braço" },
        { name: "Mobilidade escapular", reps: "2×10 movimentos" },
        { name: "Desenvolvimento com pegada neutra", reps: "3×10-12" },
        { name: "Elevação frontal alternada", reps: "3×12-15" },
        { name: "Elevação lateral", reps: "4×10-12" },
        { name: "Crucifixo inverso", reps: "4×12-15" },
        { name: "Encolhimento de ombros", reps: "3×12-15" },
        { name: "Esteira", reps: "20/30 minutos (se der tempo)" },
      ],
    },
  ],
};

export const variation2: Variation = {
  days: [
    {
      name: "Segunda-feira: COSTAS + BÍCEPS + CORE",
      warmup: "Aquecimento: 8-10 minutos cárdio leve",
      exercises: [
        { name: "Puxada frontal alta", reps: "4×8-10" },
        { name: "Remada curvada com barra", reps: "4×8-10" },
        { name: "Remada unilateral halter", reps: "3×10-12" },
        { name: "Pulldown (puxada alta pegada fechada)", reps: "3×10-12" },
        { name: "Rosca direta com barra", reps: "3×10-12" },
        { name: "Rosca concentrada", reps: "3×12-15" },
        { name: "Rosca martelo", reps: "3×12-15" },
        { name: "Prancha frontal", reps: "3×45-60s" },
        { name: "Prancha lateral", reps: "2×30s cada lado" },
        { name: "Swimming (Pilates)", reps: "3×12 cada lado" },
      ],
    },
    {
      name: "Terça-feira: FOCO QUADRÍCEPS/GLÚTEOS",
      warmup: "Aquecimento: 8-10 minutos cárdio leve",
      exercises: [
        { name: "Leg Press 45°", reps: "4×12-15 cada perna" },
        { name: "Extensora", reps: "3×15" },
        { name: "Abdutora", reps: "3×15" },
        { name: "Agachamento livre", reps: "4×8-10" },
        { name: "Elevação pélvica", reps: "3×15" },
        { name: "Agachamento búlgaro", reps: "3×12 cada perna" },
        { name: "Panturrilha em pé", reps: "4×15" },
        { name: "Abdominais bicicleta", reps: "3×20 cada lado" },
      ],
    },
    {
      name: "Quarta-feira: PEITO + TRÍCEPS + OMBROS",
      warmup: "Aquecimento: 8-10 minutos cárdio leve",
      exercises: [
        { name: "Supino reto com halteres", reps: "4×8-10" },
        { name: "Supino inclinado", reps: "3×10-12" },
        { name: "Voador (crucifixo)", reps: "3×12-15" },
        {
          name: "Flexão de peito",
          reps: "3×10-15 (se aguentar na última chegar a 20)",
        },
        { name: "Flexão de tríceps (diamante)", reps: "3×10-15" },
        { name: "Tríceps na polia (corda)", reps: "3×10-12" },
        { name: "Tríceps no banco", reps: "3×12-15" },
        { name: "Desenvolvimento com halteres", reps: "3×10-12" },
        { name: "Elevação lateral", reps: "3×12-15" },
      ],
    },
    {
      name: "Quinta-feira: FOCO POSTERIORES/ADUTORES",
      warmup: "Aquecimento: 8-10 minutos cárdio leve",
      exercises: [
        { name: "Levantamento terra", reps: "4×8-10" },
        { name: "Mesa flexora", reps: "3×12-15" },
        { name: "Afundo", reps: "3×12 cada perna" },
        { name: "Adutora", reps: "3×15" },
        { name: "Cadeira flexora unilateral", reps: "3×12 cada perna" },
        { name: "Panturrilha", reps: "4×15" },
        { name: "Prancha com elevação de perna", reps: "3×10 cada" },
      ],
    },
    {
      name: "Sexta-feira",
      warmup: "Aquecimento articular: 8 min (Unbound Workout)",
      exercises: [
        { name: "Agachamento com salto", reps: "4×10" },
        { name: "Swing com kettlebell", reps: "3×15" },
        {
          name: "Prancha com movimento",
          reps: "3×30s (Prancha Alta com Movimentação de Braços e Pernas)",
          link: "https://www.youtube.com/watch?v=TZzSiFnhGck#:~:text=Neste%20tutorial%2C%20explicamos%20a%20t%C3%A9cnica%20correta%20para%20maximizar,PRANCHA%20ALTA%20COM%20MOVIMENTA%C3%87%C3%83O%20DE%20BRA%C3%87OS%20E%20PERNAS%3F",
        },
      ],
      cooldown:
        "Alongamento: 10 min (Shoulder Stretching Workout + Recover & Rebuild Workout + Limitless Workout)",
      cooldownLinks: {
        "Shoulder Stretching Workout":
          "https://darebee.com/workouts/shoulder-stretching-workout.html",
        "Recover & Rebuild Workout":
          "https://darebee.com/workouts/recover-and-rebuild-workout.html",
        "Limitless Workout":
          "https://darebee.com/workouts/limitless-workout.html",
      },
    },
    {
      name: "Sábado (quando der)",
      exercises: [
        { name: "Circundução de ombros", reps: "2×10 cada direção" },
        { name: "Rotação externa com elástico", reps: "2×15" },
        { name: "Alongamento cápsula posterior", reps: "2×30s cada braço" },
        { name: "Mobilidade escapular", reps: "2×10 movimentos" },
        { name: "Desenvolvimento com pegada neutra", reps: "3×10-12" },
        { name: "Elevação frontal alternada", reps: "3×12-15" },
        { name: "Elevação lateral", reps: "4×10-12" },
        { name: "Crucifixo inverso", reps: "4×12-15" },
        { name: "Encolhimento de ombros", reps: "3×12-15" },
        { name: "Esteira", reps: "20/30 minutos (se der tempo)" },
      ],
    },
  ],
};

export function getCurrentVariation(): Variation {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 +
      startOfYear.getDay() +
      1) /
      7
  );
  return weekNumber % 2 === 1 ? variation1 : variation2;
}

export function getTodayWorkout(): Day | null {
  const variation = getCurrentVariation();
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayIndex = today === 0 ? 6 : today - 1; // Adjust to 0 = Monday, 6 = Sunday
  if (dayIndex >= variation.days.length) return null;
  return variation.days[dayIndex];
}
