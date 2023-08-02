import { component$ } from "@builder.io/qwik";
import { experiences } from "./constants/data";
import "./experiences-styles.css";

export default component$(() => {
  return (
    <section id="experiences" className="text-gray-400 bg-gray-900 body-font">
      <div className="container px-5 py-10 mx-auto text-center lg:px-40">
        <div className="flex flex-col w-full mb-20">
          <h1
            className="sm:text-4xl text-3xl font-medium title-font mb-4 text-white"
            id="experiences"
          >
            See all my experience as a developer
          </h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
            I've had the privilege of working with some great companies in the
            past, where I learned valuable software development skills and built
            successful applications.
          </p>
        </div>
        <div className="flex items-center justify-center flex-wrap gap-8 -m-4">
          {experiences.map((experience) => (
            <div className="card">
              <img alt="gallery" src={experience.image} />
              <div className="card__content">
                <h1 className="card__title">{experience.title}</h1>
                <p className="card__role">{experience.role}</p>
                <a href={experience.link} target="_blank" className="card__btn">
                  Learn More
                </a>
              </div>
            </div>

            // <a
            //   href={experience.link}
            //   key={experience.image}
            //   className="sm:w-1/2 w-100 p-4"
            //   target="_blank"
            // >
            //   <div className="flex relative">

            //     <div className="px-8 py-10 relative z-10 w-full border-4 border-gray-800 bg-gray-900 opacity-0 hover:opacity-100">
            //       <h2 className="tracking-widest text-sm title-font font-medium text-[#ea4ca4] mb-1">
            //         {experience.role}
            //       </h2>
            //       <h1 className="title-font text-lg font-medium text-white mb-3">
            //         {experience.title}
            //       </h1>
            //       <p className="leading-relaxed">{experience.description}</p>
            //     </div>
            //   </div>
            // </a>
          ))}
        </div>
      </div>
    </section>
  );
});
