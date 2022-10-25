import { component$, Slot } from "@builder.io/qwik";
import { Header } from "../components";

export default component$(() => {
  return (
    <>
      <main>
        <Header />
        <section className="wrapper">
          <Slot />
        </section>
      </main>
      <footer>
        <a href="https://qwik.builder.io/" target="_blank">
          Made with ♡ using Qwik by Builder.io
        </a>
      </footer>
    </>
  );
});
