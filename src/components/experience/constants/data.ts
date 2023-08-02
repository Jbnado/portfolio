interface IExperience {
  title: string;
  role: string;
  description: string;
  image: string;
  link: string;
}

export const experiences: Array<IExperience> = [
  {
    title: "Take & Go",
    role: "FrontEnd Developer",
    description: "",
    image: "take-and-go.png",
    link: "https://takeandgoapp.com/",
  },
  {
    title: "Authorify",
    role: "FullStack Developer",
    description: "",
    image: "authorify.png",
    link: "https://authorify.com/",
  },
  {
    title: "Target Sistemas",
    role: "Trainee FullStack Developer",
    description: "",
    image: "target-sistemas.svg",
    link: "https://targetsistemas.com.br/",
  },
];
