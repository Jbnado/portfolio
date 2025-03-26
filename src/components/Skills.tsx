import skills from "@/app/skills.json";
import {
  FaReact,
  FaAngular,
  FaNodeJs,
  FaJava,
  FaAws,
  FaGit,
  FaDocker,
  FaSass,
} from "react-icons/fa";
import {
  SiTypescript,
  SiNextdotjs,
  SiTailwindcss,
  SiStorybook,
  SiNestjs,
  SiSpringboot,
  SiExpress,
  SiMongodb,
  SiRabbitmq,
  SiCypress,
  SiJest,
} from "react-icons/si";
import { CgFileDocument } from "react-icons/cg";
import React from "react";

// Função para mapear o nome do ícone para o componente
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    react: <FaReact className="w-full h-full text-blue-500" />,
    angular: <FaAngular className="w-full h-full text-red-600" />,
    typescript: <SiTypescript className="w-full h-full text-blue-600" />,
    nextjs: <SiNextdotjs className="w-full h-full" />,
    tailwind: <SiTailwindcss className="w-full h-full text-cyan-500" />,
    storybook: <SiStorybook className="w-full h-full text-pink-500" />,
    nodejs: <FaNodeJs className="w-full h-full text-green-600" />,
    nestjs: <SiNestjs className="w-full h-full text-red-600" />,
    java: <FaJava className="w-full h-full text-orange-600" />,
    "spring-boot": <SiSpringboot className="w-full h-full text-green-600" />,
    express: <SiExpress className="w-full h-full" />,
    mongodb: <SiMongodb className="w-full h-full text-green-500" />,
    rabbitmq: <SiRabbitmq className="w-full h-full text-orange-500" />,
    aws: <FaAws className="w-full h-full text-orange-400" />,
    cypress: (
      <SiCypress className="w-full h-full text-gray-700 dark:text-gray-300" />
    ),
    jest: <SiJest className="w-full h-full text-red-500" />,
    git: <FaGit className="w-full h-full text-orange-600" />,
    docker: <FaDocker className="w-full h-full text-blue-500" />,
    cicd: <CgFileDocument className="w-full h-full text-purple-500" />,
    sass: <FaSass className="w-full h-full text-pink-500" />,
  };

  return iconMap[iconName] || <CgFileDocument className="w-full h-full" />;
};

export default function Skills() {
  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-gray-900">
      <h2 className="text-3xl font-bold text-center mb-8">Habilidades</h2>

      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
        Nenhuma habilidade está em 100% pois acredito que estamos sempre
        aprendendo e evoluindo constantemente.
      </p>

      <div className="max-w-4xl mx-auto">
        {skills.map((category) => (
          <div key={category.category} className="mb-10">
            <h3 className="text-xl font-semibold mb-4 text-cyan-700 dark:text-cyan-400">
              {category.category}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category.skills.map((skill) => (
                <div
                  key={skill.name}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 relative flex-shrink-0">
                      {getIconComponent(skill.icon)}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{skill.name}</p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${skill.level}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
