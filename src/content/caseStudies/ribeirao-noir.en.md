---
slug: "ribeirao-noir"
locale: "en"
title: "Ribeirão Noir"
summary: "Noir investigative game set in 1950s Ribeirão Preto, Brazil, starring Dandara, built as a tool for antiracist education. I handled all the development in Godot, from the data-driven narrative engine to the dice and save systems, with a SOLID architecture. Validated by three PhD academics and launched at the International Book Fair."
highlights:
  - { value: "9", label: "Ribeirão locations to investigate" }
  - { value: "6", label: "endings decided by your evidence" }
  - { value: "3", label: "PhDs validated it · USP, Metodista, UFTM" }
meta:
  - { label: "ROLE", value: "Developer (solo)" }
  - { label: "TYPE", value: "Project" }
  - { label: "PERIOD", value: "2025" }
  - { label: "STACK", value: "Godot · GDScript" }
---

The game's protagonist is Dandara. A Black investigator, in 1950s Ribeirão Preto, chasing whoever stole the statue of São Sebastião to free an innocent man. And she isn't there by chance. Ribeirão Noir is a game of antiracist education, made to help schools comply with laws 10.639 and 11.645, which made teaching Afro-Brazilian and Indigenous history and culture mandatory. Putting a Black woman as the protagonist, with historical agency, in a country where IBGE data show Black people are 87.8% of the deaths from police intervention, isn't a script detail. It's the point of the game.

Ribeirão Noir was made by a team. The narrative, the art, and the design came from Ramon and the production by Palimpsesto Produções. I handled the development, so it's the engineering behind the game that I write about here, the engine that interprets the narrative, the dice system, the save, the architecture. It was six months, funded by the Paulo Gustavo Law, and the work became my thesis, on applying SOLID and design patterns to a game that carries social weight.

## It's a real investigation

Ribeirão Noir is a text-based narrative RPG. You pick one of three professions, detective, journalist, or lawyer, and each opens a different way to investigate. You move through nine locations in 1950s Ribeirão Preto, most of them genuinely historical, like the Theatro Pedro II, Praça XV, the Palacete Camilo de Mattos, and the Choperia Pinguim, each with its own history instead of a generic backdrop. You talk to 32 characters, gather clues, and in the end you name the culprit. There are six possible endings, and which one you reach depends on the evidence you managed to gather along the way.

What ties it all together is the system underneath, and it has three pieces worth telling. How the narrative is made of data and not code, how the risk of each choice is resolved on the dice, and how the game remembers everything you did.

## The narrative is data, not code

If I had written the story inside the code, Ramon couldn't write or change anything without calling me, and I'd become the bottleneck of the whole project. So the entire narrative lives in JSON. It's 17 files, almost 27 thousand lines, one per act and per location, and the code just interprets.

Each file is a graph of nodes. A node carries the lines of that moment, the choice options (each pointing to the next node, some with a condition to appear), a dice-roll block, and the possible outcomes, split into total success, partial success, and failure.

The interpreter loads the act's file, starts at the initial node, and draws each line, each choice, and each roll, following the links from one node to the next. When you pick an option, an effects engine applies that node's modifiers, which take or give life, adjust a stance, unlock a new location, hand over a clue, or introduce a character. Adding a new mechanic, a profession, an item, a behavior, means writing in the JSON, not touching the core. That's how the game grows without the team becoming a hostage to the code.

## Dice, stance, and risk

The heart of the RPG is the roll. It's two six-sided dice, and the result isn't just luck. Several modifiers get added to the sum of the two dice, and the total falls into one of three bands, total success, partial success, or failure.

The part I find elegant is how the stance enters that math. Your choices keep defining you across four stances, reckless, wise, prudent, and evasive, and each roll calls for one of them. On a wise check, it's your wise stance that weighs on the dice. Which is to say, who you decided to be changes what you're able to do. And the modifiers only count if you actually have them. A skill only adds if it matches your profession, an item only adds if you're carrying it, a character only adds if you know them.

Life ties the risk together. You start with 10 life, and you can reroll when you fail, but each new attempt costs 1 life, and it locks when you get near zero. Insisting has a price. Hitting zero opens the game-over ending. It's a system that's simple to state and creates real tension when you decide whether to risk one more.

## The save is a transcript, not a checkpoint

Most games save a return point. Ribeirão Noir saves the whole playthrough, move by move. In JSON, on disk, it keeps three things, Dandara's sheet, the current position in the narrative, and the complete history of what happened.

The sheet keeps exactly what matters. Life, profession, the four stances, which clues you found and where, the locations visited and unlocked, items, and the people you met. But the trick is the history. It's a list of narrative moments, and each moment holds the dialogue boxes with the right type (the heroine's speech, her thought, a character, the narrator, a roll). When you reload, the game doesn't drop you at a dry checkpoint. It rebuilds on screen every box you had already seen, the whole run of the investigation. And it saves continuously, on every rendered line, so there's no way to lose progress.

## SOLID, with an honest scar

The architecture was the focus of the thesis, with the idea of applying SOLID for real, not for show. A central autoload holds the game state, but it doesn't save anything on its own. It delegates to a save class, which delegates to a history class, which delegates to the narrative moments. Each one handles a single thing. Communication between screens goes through a global signal bus, where the emitter and the listener never know each other. When Dandara takes damage, the character emits a signal, and the life bar, the game over, and the on-screen warning react on their own, with nobody calling anybody. The interface is composed, not inherited. The item, character, and notebook screens are components assembled and wired on the fly, not subclasses of a giant tree.

And here comes the honest part, documented in the thesis instead of hidden. The main scene, the one that interprets the acts, went over a thousand lines. It accumulates responsibilities that, in an ideal world, would live in separate classes. It was a conscious deadline choice. Splitting everything up properly would have eaten time I didn't have to ship the game in six months. It works, but it's a single-responsibility violation, and I'd rather call it a scar than pretend it isn't there. It was the most real lesson of the project. In professional life you balance the ideal architecture with deadline, budget, and what you can actually ship.

## The craft details

Beyond the core, there was care for the experience. The game exports to web and Android, with the layout adapting to touch and to the phone's portrait. And accessibility is a real system, not a lone button, with a font scale that propagates through a signal to every widget on screen, and captions for the audio clues.

## The team, the feat, and the validation

A game of antiracist education only becomes a real tool if people who understand the subject say it works. Three PhDs reviewed and recommended it: Sérgio de Souza, a post-doc in the Sociology of Education at USP, who recognized it as an instrument of antiracist education; José Lages, a PhD from Metodista, who validated it as heritage education, for re-signifying Ribeirão's real historical sites; and Marcelo Silva, a PhD in Social History and a lecturer in the History degree at UFTM, who mapped the game to the 9th-grade BNCC skills and coined the idea of "epistemic worlds", environments where the player simulates social roles and internalizes the ways of thinking of that context. Alongside the game came a teaching booklet, "Racism and Misogyny at Play: what does Dandara teach us?", because, as we acknowledged, playing alone doesn't guarantee impact without classroom mediation.

The game was launched at the International Book Fair, it's free, and it carries the "No AI" tag, with no art or text generated by AI.

I started programming because I loved games and wanted to understand how they were made. Helping make one that's good for something turned out better than I expected. As the teaching material puts it, the idea isn't "play and learn", it's play, reflect, and debate, so that digital technology serves ends of liberation and social transformation.
