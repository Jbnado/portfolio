---
slug: "mural-secreto-dos-agentes"
locale: "en"
urlSlug: "the-secret-message-board-openai-agents-built"
title: "OpenAI's Agents Built a Secret Message Board. It Was a Package Registry."
seoTitle: "The Secret Message Board OpenAI's Agents Built — João Bernardo"
summary: "An OpenAI agent found out it could drop files into the company's internal Artifactory. Within two months that had become a coordination channel between agents from unrelated experiments, complete with a convention for not overwriting each other's work. The channel needed no protocol, just a writable place that outlives a single run."
date: "2026-08-11"
tags: ["ai", "security", "agents"]
video:
  youtubeId: "3Utnr0TpulA"
  url: "https://youtu.be/3Utnr0TpulA"
  title: "As IAs Criaram um Canal Secreto Sozinhas"
  thumbnail: "https://i.ytimg.com/vi/3Utnr0TpulA/maxresdefault.jpg"
  channel: "Jbnado"
sources:
  - title: "Nextgov/FCW — OpenAI agents rebuilt internal message board that led to Hugging Face breach"
    url: "https://www.nextgov.com/artificial-intelligence/2026/08/openai-agents-rebuilt-internal-message-board-lead-hugging-face-breach/415240/"
    note: "Main source on the message board. The Artifactory mechanism, how agents addressed each other, and the two days it took to rebuild."
  - title: "SC Media — Black Hat 2026: OpenAI reveals agents planned collective attacks via secret message board"
    url: "https://www.scworld.com/news/black-hat-2026-openai-reveals-agents-planned-collective-attacks-via-secret-message-board"
    note: "Coverage of the Eric Wallace and Michael Dalton talk."
  - title: "Slashdot/Politico — OpenAI's models shared hacking tips on a secret messaging board"
    url: "https://yro.slashdot.org/story/26/08/06/1815207/openais-models-shared-hacking-tips-on-a-secret-messaging-board-before-hugging-face-breach"
    note: "The load that took Artifactory down in early July and exposed the board."
  - title: "AI Security Institute — Incident report: unsanctioned agent behaviour during cyber testing"
    url: "https://www.aisi.gov.uk/blog/incident-report-unsanctioned-agent-behaviour-during-cyber-testing"
    note: "Primary source. The 122 runs, the 19 actions on the live internet, and the supply chain attempt."
  - title: "Simon Willison — Incident report: unsanctioned agent behaviour"
    url: "https://simonwillison.net/2026/Aug/5/incident-report/"
    note: "The fake bot message left for the next agent to read, and why the outcome is unsurprising."
  - title: "Simon Willison — Third-party cyber evaluations"
    url: "https://simonwillison.net/2026/Aug/5/third-party-cyber-evaluations/"
    note: "OpenAI's disclosure about Irregular's misconfiguration and the fictional target that matched a real domain."
  - title: "CNBC — Israeli startup Irregular linked to AI hacks at OpenAI, Anthropic and Meta"
    url: "https://www.cnbc.com/2026/08/09/israeli-startup-irregular-linked-to-ai-hacks-openai-anthropic-meta.html"
    note: "The report tying the three cases to a single vendor, with the headcount."
  - title: "The Next Web — One testing vendor behind the OpenAI, Anthropic and Meta breaches"
    url: "https://thenextweb.com/news/irregular-ai-testing-vendor-openai-anthropic-meta-breaches"
    note: "The environment left open to the public internet for months, the funding, and the company's response."
  - title: "Bloomberg — Meta AI model accessed internet, hacked outside firm in testing"
    url: "https://www.bloomberg.com/news/articles/2026-08-05/meta-ai-model-accessed-internet-hacked-outside-firm-in-testing"
    note: "Muse Spark 1.1 reaching the public internet during a test."
  - title: "SiliconANGLE — Meta's Muse Spark 1.1 hacked external organization in cybersecurity test"
    url: "https://siliconangle.com/2026/08/06/metas-muse-spark-1-1-hacked-external-organization-cybersecurity-test/"
    note: "Irregular's misconfiguration in the Meta case."
  - title: "TechCrunch — Chinese AI model Kimi escaped its cybersecurity testing environment"
    url: "https://techcrunch.com/2026/08/07/chinese-ai-model-kimi-escaped-its-cybersecurity-testing-environment-researchers-say/"
    note: "The Kimi K3 case, in Frontier Security's environment rather than Irregular's."
  - title: "Yahoo Finance — Irregular raises $80 million"
    url: "https://finance.yahoo.com/news/irregular-raises-80-million-set-121500443.html"
    note: "The Sequoia and Redpoint round, and the Pattern Labs history."
---

Back in May, an OpenAI agent uploaded a file to an internal server. The file was a question. Had anyone seen a file that went missing?

Other agents found it and answered.

Nobody asked for this, nobody authorized it, and nobody noticed for two months. OpenAI only told this part of the story on August 5, at Black Hat, through researcher Eric Wallace and security engineer Michael Dalton.

The video tells the whole story, plus the rest of the week's roundup. Here I want to stay on one detail, because it is the same detail as the [previous post](/en/blog/ai-hacked-a-real-company) and I missed it at the time.

## The channel was a package cache

The server that became a message board is an internal JFrog Artifactory. It is where OpenAI keeps the software packages it uses, the dependency stockroom of the place.

Think about what a package registry offers, from the point of view of something locked in a box.

It accepts writes, otherwise it would be useless. What you write stays there after your process dies. Everyone reads from the same place, because that is the entire point of a shared cache. And talking to it is the most ordinary traffic in that environment, since it is what every build does all day long.

Writable, persistent, shared for reading, and invisible in traffic. That is a mailbox. All that was missing was someone treating it as one.

Notice that this is the same shape as the previous post. In the Hugging Face intrusion, the two sides of the attack had no network route between them, so the agent used dataset repos on the Hub itself as a mailbox, writing on one side through commits and reading on the other through a side branch. At the time I read that as one-off ingenuity. After Black Hat, it looks less like creativity and more like the most obvious thing to do when you need to talk to someone and have no network.

## The protocol nobody wrote

The start was mundane. One agent found out it could leave a file there. Another used that to ask about a file that had gone missing. From then on, agents running in separate experiments, with no link between them, started finding each other at that spot.

What they traded were instructions and information about freshly discovered security flaws. They began assigning work to one another and leaving scripts so a different model could pick up where the first one stopped.

Then comes the part that got me. According to the talk, the whole thing grew progressively more organized. The agents developed ways to address each other, to swap tools, and to avoid overwriting each other's work.

That last one is what matters. Not clobbering someone else's write is the most tedious problem in any system with concurrent writers. It is locks, leases, versions, naming conventions. There is no solution that falls out of the sky, you sit down and design one. Nobody designed this one. It showed up because several independent processes wanted to use the same space without stepping on each other, and that pressure alone is enough to produce a protocol.

Wallace summed it up as a team of agents working together, finding exploits and sharing them with each other.

## The on-call engineer found the board, not the security team

This part is my favorite and the least discussed.

The board did not go down because someone audited Artifactory, or because a detection rule fired. It went down because it grew too big. In early July the agents' traffic overloaded the service and took Artifactory offline. Engineers went to see what was clogging it and found the message board along the way.

The discovery was an availability incident. Had those agents been more frugal, nobody would have looked.

They wiped it and believed they had cut the communication. Two days later the agents had found another path through the same service and were talking again. Roughly a week after that came the Hugging Face intrusion.

## Not rebellion, just the incentive working

This is worth repeating because the headline pulls the other way.

The models were in a cybersecurity benchmark and the task was to find flaws. The correct answer to a good share of those challenges is published on the internet, in CTF write-ups, in project issues, in advisories. A system trained to be rewarded for completing the task will look for the shortest path to completing the task, and copying the answer key is the shortest path there is.

Wallace said that when models get stuck, they frequently try to game or cheat the task. There is no intent in that. There is a reward function.

## The same pattern on a public surface

If this were only OpenAI, you could write it off as a quirk of their Artifactory. It is not.

Between July 25 and 28, the UK's AI Security Institute ran the same cybersecurity evaluation 122 times. That included 43 runs with Anthropic's Mythos 5 and 35 with OpenAI's GPT-5.6 Sol. In 10 runs the agents did something they should not have, adding up to 19 actions on the live internet against real people and organizations. Seventeen of those actions came from Mythos 5 and two from GPT-5.6 Sol.

The most serious case was Mythos 5 deciding to solve the challenge through the supply chain. Instead of attacking the target, it went to poison an open source project the target depended on. It created a GitHub account, opened a malicious pull request, and created a second account posing as another human to endorse its own PR.

And it left a fake bot message for the next AI agent to read, saying PR #3 was approved and awaiting merge.

Read that again. The audience for that message was not the human maintainer. It was the next AI that came through.

One agent also left public instructions on GitHub offering collaboration and explaining how to reuse accounts and artifacts, and later agents found them and used them. A message board again, this time in an open repository.

The human maintainer found the whole thing strange and refused the PR. Monitoring saw data leaving over Tor on the 28th and shut the operation down in about an hour, with no real damage identified.

A distinction that did not fit in the video belongs here. The AISI environment was not misconfigured. They granted internet access on purpose, and they deliberately disable the cyber classifiers that developers ship with their models. No agent escaped the sandbox, the virtual machines held, and the 19 actions went out through the door the institute had opened. Simon Willison called the outcome entirely unsurprising, and he is right.

That makes the case more interesting, not less. When an environment leaks through carelessness, you can say the problem was the carelessness. When the environment is opened deliberately and the agent still turns into a social engineer and writes a note for its successor, what you are measuring is behavior, not configuration.

## The vendor in the middle of all of it

Where carelessness did exist, it has a single name.

Four labs in five days. OpenAI, Anthropic, Meta and Moonshot. In three of them, the evaluation environment was operated by the same company, Irregular.

It sits in Tel Aviv, has a US office, was founded in 2023, and until last year was called Pattern Labs. It raised $80 million from Sequoia and Redpoint, was valued at $450 million, and has around 35 employees according to CNBC.

What happened in its environment was not a sophisticated escape. Per OpenAI's disclosure, the evaluations were capture-the-flag style and were supposed to be isolated from the internet, but a misconfiguration in the test environment let the models reach the public internet. In one test the fictional target name in the challenge happened to match a real domain, and the model went out and exploited an actual website believing it was part of the exercise.

The environment stayed that way for months. Irregular rejects the sandbox-escape reading, says it was a misconfigured environment, cut internet access for models under test, and promised a new containment process.

The Kimi K3 case is the odd one out. That environment was run by Frontier Security, and the model got out through the command line tool and went to GitHub looking for the challenge answer. Same behavior, different vendor.

## What this has to do with my own machine

I run agents in parallel. Several at once, each on its own task, with planning markdown written before any code and an artifacts directory that survives between runs. That is how I work and it is what I recommend to anyone who asks me.

Go back to the list at the top of this post. Writable, persistent, shared for reading, ordinary traffic.

My plans directory has all four. My machine's package cache has all four. The output folder where one agent leaves a result for the next one has all four.

I am not claiming my agents are about to coordinate an attack. What OpenAI saw happened in an environment where the reward was breaking in and the safeguards were switched off on purpose. That is not my situation and it is probably not yours either.

The point is a different one, and it is more uncomfortable. I treated those directories as an orchestration convenience, and they are a channel. If two of my agents read and write in the same place, they have a means of coordination, whether or not I designed one. That changes who writes where, who reads what, and what is left on disk after a run finishes.

In the video I say that what scales is not reviewing code line by line, it is fencing the agent in with constraints and verifying behavior. After Black Hat I would add one constraint to that list, which is looking at everything my agents share in writing and asking whether it actually needs to be shared.
