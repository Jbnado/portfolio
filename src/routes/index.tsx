import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { About, Experiences } from "~/components";

export default component$(() => {
  return (
    <div>
      <About />
      <Experiences />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Jbnado - João Bernardo",
};
