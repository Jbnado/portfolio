"use client";

import { useState, useEffect } from "react";
import {
  getCurrentVariation,
  getTodayWorkout,
  getNextWorkoutDay,
  getExerciseProgress,
  getDayProgress,
  getProgress,
  updateExerciseProgress,
  type Day,
  type Exercise,
} from "@/lib/treino";
import PageTransition, { FadeInUp } from "@/components/PageTransition";
import Navbar from "@/components/Navbar";

function ExerciseItem({
  exercise,
  dayIndex,
}: {
  exercise: Exercise;
  dayIndex: number;
}) {
  const [weight, setWeight] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const progress = getExerciseProgress(dayIndex, exercise.name);
    if (progress) {
      setWeight(progress.weight || "");
      setCompleted(progress.completed);
    }
  }, [dayIndex, exercise.name]);

  const handleWeightChange = (newWeight: string) => {
    setWeight(newWeight);
    updateExerciseProgress(dayIndex, exercise.name, newWeight);
  };

  const handleCompletionToggle = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    updateExerciseProgress(dayIndex, exercise.name, weight, newCompleted);
  };

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    exercise.name + " exercício"
  )}`;

  return (
    <div
      className={`p-3 rounded-lg border-2 transition-colors ${
        completed
          ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600"
          : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          {exercise.link ? (
            <a
              href={exercise.link}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-cyan-600 dark:text-cyan-400 hover:underline"
            >
              {exercise.name}
            </a>
          ) : (
            <h4 className="font-medium text-gray-900 dark:text-white">
              {exercise.name}
            </h4>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {exercise.reps}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            title="Pesquisar no Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </a>
          <button
            onClick={handleCompletionToggle}
            className={`p-2 rounded-full transition-colors ${
              completed
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-500"
            }`}
            title={
              completed ? "Marcar como não concluído" : "Marcar como concluído"
            }
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">
          Peso:
        </label>
        <input
          type="text"
          value={weight}
          onChange={(e) => handleWeightChange(e.target.value)}
          placeholder="kg"
          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}

function renderTextWithLinks(text: string, links?: { [key: string]: string }) {
  if (!links) return text;

  let result = text;
  Object.entries(links).forEach(([name, url]) => {
    const regex = new RegExp(`(${name})`, "g");
    result = result.replace(
      regex,
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-cyan-600 dark:text-cyan-400 hover:underline">$1</a>`
    );
  });

  return <span dangerouslySetInnerHTML={{ __html: result }} />;
}

function DayCard({
  day,
  isToday = false,
  dayIndex,
}: {
  day: Day;
  isToday?: boolean;
  dayIndex: number;
}) {
  const [dayCompleted, setDayCompleted] = useState(false);

  useEffect(() => {
    const progress = getDayProgress(dayIndex);
    setDayCompleted(progress?.completed || false);
  }, [dayIndex]);

  return (
    <FadeInUp>
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 ${
          isToday ? "ring-2 ring-cyan-500" : ""
        } ${dayCompleted ? "border-l-4 border-green-500" : ""}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {day.name}
          </h3>
          {dayCompleted && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="text-sm font-medium">Concluído</span>
            </div>
          )}
        </div>
        {day.warmup && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
            {day.warmupLink
              ? renderTextWithLinks(day.warmup, {
                  "Unbound Workout": day.warmupLink,
                })
              : day.warmup}
          </p>
        )}
        <div className="space-y-3">
          {day.exercises.map((exercise, index) => (
            <ExerciseItem key={index} exercise={exercise} dayIndex={dayIndex} />
          ))}
        </div>
        {day.cooldown && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 italic">
            {day.cooldownLinks
              ? renderTextWithLinks(day.cooldown, day.cooldownLinks)
              : day.cooldown}
          </p>
        )}
      </div>
    </FadeInUp>
  );
}

export default function TreinoPage() {
  const [showTodayWorkout, setShowTodayWorkout] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Calculate weekly progress - sempre chamado, independente da autenticação
  const [weeklyProgress, setWeeklyProgress] = useState({
    completed: 0,
    total: 5,
  });

  const correctPassword = "treino2025";

  useEffect(() => {
    const authStatus = localStorage.getItem("treino-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    const progress = getProgress();
    const today = new Date().toDateString();
    const weekProgress = progress.filter((p) => p.date === today);
    const completedDays = weekProgress.filter((p) => p.completed).length;
    setWeeklyProgress({ completed: completedDays, total: 5 });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("treino-auth", "true");
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("treino-auth");
    setPassword("");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Acesso Restrito
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Digite a senha para acessar o gerenciador de treino
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
              required
            />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  const currentVariation = getCurrentVariation();
  const todayWorkout = getTodayWorkout();
  const currentDayIndex = getNextWorkoutDay();

  return (
    <PageTransition>
      <Navbar />
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <FadeInUp>
            <div className="text-center mb-12">
              <div className="flex justify-between items-center mb-4">
                <div></div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  Gerenciador de Treino
                </h1>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Sair
                </button>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Programa ABCDE - Upper/Lower Focado na Natação
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-8">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Progresso Semanal
                </h4>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                    {weeklyProgress.completed}/{weeklyProgress.total}
                  </div>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-cyan-600 dark:bg-cyan-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (weeklyProgress.completed / weeklyProgress.total) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(
                      (weeklyProgress.completed / weeklyProgress.total) * 100
                    )}
                    % concluído
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowTodayWorkout(!showTodayWorkout)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
              >
                {showTodayWorkout
                  ? "Ocultar Treino de Hoje"
                  : "Ver Treino de Hoje"}
              </button>
            </div>
          </FadeInUp>

          {showTodayWorkout && (
            <FadeInUp>
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
                  Treino de Hoje
                </h2>
                <div className="max-w-2xl mx-auto">
                  {todayWorkout ? (
                    <DayCard
                      day={todayWorkout}
                      isToday={true}
                      dayIndex={currentDayIndex}
                    />
                  ) : (
                    <div className="bg-green-100 dark:bg-green-900 rounded-xl shadow-lg p-8 text-center">
                      <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-4">
                        🛋️ Dia de Descanso
                      </h3>
                      <p className="text-green-700 dark:text-green-300">
                        Aproveite para recuperar e preparar para a próxima
                        semana!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </FadeInUp>
          )}

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Programa ABCDE - Semana Atual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentVariation.days.map((day, index) => (
                <DayCard key={index} day={day} dayIndex={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
