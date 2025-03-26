import Image from "next/image";
import experiences from "@/app/experience.json";

export default function Experience() {
  return (
    <section className="py-12 px-4">
      <h2 className="text-3xl font-bold text-center mb-8">
        Experiência Profissional
      </h2>

      <div className="max-w-4xl mx-auto space-y-8">
        {experiences.map((exp) => (
          <div
            key={exp.company}
            className="group p-6 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-cyan-500 transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{exp.company}</h3>
                <p className="text-gray-600 dark:text-gray-400">{exp.role}</p>
                <p className="text-sm text-cyan-600">{exp.period}</p>
              </div>

              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src={`/images/logos/${exp.logo}`}
                  alt={exp.company}
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
            </div>

            <ul className="mt-4 space-y-2">
              {exp.highlights.map((highlight, i) => (
                <li
                  key={i}
                  className="flex items-start before:content-['▹'] before:text-cyan-500 before:mr-2"
                >
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
