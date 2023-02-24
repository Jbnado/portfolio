import { component$, useStylesScoped$ } from "@builder.io/qwik";
import styles from "./header.css?inline";

export default component$(() => {
  useStylesScoped$(styles);

  return (
    <header className="bg-gray-800 ">
      <div class="logo">
        <a href="https://jbnado.dev/">Jbnado</a>
      </div>
      <nav>
        <ul>
          <li>
            <a href="mailto:me@jbnado.dev?subject=Regarding%20your%20portfolio">
              Contact me
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
});
