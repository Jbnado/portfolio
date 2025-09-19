"use client";

import { useState, useEffect } from "react";
import {
  variation1,
  variation2,
  getCurrentVariation,
  getTodayWorkout,
  type Day,
  type Exercise,
} from "@/lib/treino";
import PageTransition, { FadeInUp } from "@/components/PageTransition";
import Navbar from "@/components/Navbar";

function ExerciseItem({ exercise }: { exercise: Exercise }) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    exercise.name + " exercício"
  )}`;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
      <a
        href={searchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-2 p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        title="Pesquisar no Google"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      </a>
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

function DayCard({ day, isToday = false }: { day: Day; isToday?: boolean }) {
  return (
    <FadeInUp>
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 ${
          isToday ? "ring-2 ring-cyan-500" : ""
        }`}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {day.name}
        </h3>
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
            <ExerciseItem key={index} exercise={exercise} />
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

  const correctPassword = "treino2025";

  useEffect(() => {
    const authStatus = localStorage.getItem("treino-auth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
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
  const isVariation1 = currentVariation === variation1;

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
                Semana atual:{" "}
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  Variação {isVariation1 ? "1" : "2"}
                </span>
              </p>
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
                    <DayCard day={todayWorkout} isToday={true} />
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
              Variação {isVariation1 ? "1" : "2"} - Semana Atual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentVariation.days.map((day, index) => (
                <DayCard key={index} day={day} />
              ))}
            </div>
          </div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              Variação {isVariation1 ? "2" : "1"} - Próxima Semana
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(isVariation1 ? variation2 : variation1).days.map(
                (day, index) => (
                  <DayCard key={index} day={day} />
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
