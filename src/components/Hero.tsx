import Image from "next/image";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 p-6">
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-cyan-500 hover:scale-105 transition-transform">
        <Image
          src="/images/sorrindo.jpg"
          alt="João Bernardo"
          fill
          className="object-cover scale-130"
          priority
        />
      </div>

      <div className="text-center md:text-left space-y-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
          João Bernardo
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Full Stack Developer
        </p>

        <div className="flex justify-center md:justify-start gap-4">
          <a
            href="/Bernardo-CV.pdf"
            download
            className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Baixar CV
          </a>
          <div className="flex gap-3">
            <SocialIcon
              url="https://www.linkedin.com/in/jbnado"
              icon={<FaLinkedin className="w-6 h-6" />}
            />
            <SocialIcon
              url="https://github.com/Jbnado"
              icon={<FaGithub className="w-6 h-6" />}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialIcon({ url, icon }: { url: string; icon: React.ReactNode }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors"
    >
      <span className="sr-only">{url.split(".")[1]}</span>
      {icon}
    </a>
  );
}
