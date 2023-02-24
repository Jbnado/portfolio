import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <section id="about">
      <div className="container mx-auto flex px-10 py-20 md:flex-row flex-col items-center">
        <div className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center">
          <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-[#ea4ca4]">
            Hi, I'm João Bernardo.
            <br className="hidden lg:inline-block" />I love to build amazing
            apps.
          </h1>
          <p className="mb-8 leading-relaxed">
            I'm constantly seeking to improve my skills and knowledge in
            different programming languages and frameworks such as JavaScript,
            Node, React, and Python and enjoy taking on challenging projects
            that require creative problem-solving. I value teamwork, attention
            to detail, and producing high-quality work that adheres to industry
            standards. I look forward to contributing my skills and expertise to
            innovative software development projects in the future
          </p>
          <div className="flex justify-center">
            <a
              href="mailto:me@jbnado.dev?subject=Regarding%20your%20portfolio"
              className="inline-flex text-white bg-[#ea4ca4] border-0 py-2 px-6 focus:outline-none hover:bg-[#de057f] rounded text-lg"
            >
              Contact Me
            </a>
            <a
              href="#projects"
              className="ml-4 inline-flex text-gray-400 bg-gray-800 border-0 py-2 px-6 focus:outline-none hover:bg-gray-700 hover:text-white rounded text-lg"
            >
              See My Experience
            </a>
          </div>
        </div>
      </div>
    </section>
  );
});
