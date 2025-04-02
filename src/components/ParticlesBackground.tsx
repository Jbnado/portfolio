"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return init ? (
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 60,
        particles: {
          color: {
            value: [
              "#00FFFF",
              "#008B8B",
              "#E0FFFF",
              "#008080",
              "#40E0D0",
              "#7DF9FF",
              "#0D98BA",
            ],
          },
          links: {
            color: "#00FFFF",
            distance: 100,
            enable: true,
            opacity: 0.3,
            width: 1,
            triangles: {
              enable: true,
              opacity: 0.2,
            },
          },
          move: {
            enable: true,
            outModes: {
              default: "bounce",
            },
            speed: 1,
            straight: false,
            direction: "none",
            random: false,
          },
          number: {
            value: 200,
            density: {
              enable: true,
            },
          },
          opacity: {
            value: 0.3,
            animation: {
              enable: true,
              speed: 1,
              sync: false,
            },
          },
          shape: {
            type: ["triangle", "hexagon"],
          },
          size: {
            value: { min: 3, max: 5 },
            animation: {
              enable: true,
              speed: 2,
              sync: false,
            },
          },
        },
        detectRetina: true,
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
            onClick: {
              enable: true,
              mode: "push",
            },
            resize: {
              enable: true,
            },
          },
          modes: {
            grab: {
              distance: 150,
              links: {
                opacity: 0.3,
              },
            },
            push: {
              quantity: 2,
            },
          },
        },
      }}
      className="absolute inset-0 -z-10"
    />
  ) : null;
}
