import { FaLaptopCode, FaGlobeAmericas } from "react-icons/fa";
import { MdPerson, MdSchool } from "react-icons/md";

export default function About() {
  return (
    <section className="py-12 px-4" id="sobre">
      <h2 className="text-3xl font-bold text-center mb-8">Sobre Mim</h2>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="space-y-6">
          <div className="flex items-start">
            <MdPerson className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Quem sou</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Desenvolvedor Full Stack com 3+ anos de experiência liderando
                projetos web complexos. Apaixonado por criar soluções escaláveis
                usando tecnologias modernas e boas práticas de arquitetura de
                software.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <MdSchool className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Formação</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">FATEC Ribeirão Preto</span>
                <br />
                Tecnólogo em Análise e Desenvolvimento de Sistemas
                <br />
                2019 - 2025 (Previsão de conclusão)
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <FaLaptopCode className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Especialidades</h3>
              <p className="text-gray-700 dark:text-gray-300">
                • Arquitetura de microserviços com Java Spring Boot e Node.js
                <br />
                • Sistemas distribuídos usando AWS e RabbitMQ
                <br />
                • Front-end moderno com React, Angular e Storybook
                <br />
                • Qualidade de código com Cypress e testes automatizados
                <br />• Mentoria de desenvolvedores juniores e gestão técnica
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <FaGlobeAmericas className="w-6 h-6 text-cyan-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Idiomas</h3>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">Português:</span> Nativo
                <br />
                <span className="font-medium">Inglês:</span> Avançado
                <br />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
