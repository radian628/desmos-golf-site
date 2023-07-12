import "./MainPage.less";
import { getChallenges, trpc } from "../communication/trpc-setup";
import { For, createEffect, untrack } from "solid-js";
import { ChallengePreview } from "./ChallengePreview";
import { StaticMath } from "../test-runner/TestCaseDisplay";
import DesmosGraph from "./desmos-graph.png";
import Latex from "./latex.txt?raw";
import { Link } from "../common/better-router/BetterRoute";

export function Logo() {
  return <img class="logo" src={DesmosGraph}></img>;
}
export function SmallLogo() {
  return <img class="small-logo" src={DesmosGraph}></img>;
}

export function PageHeader() {
  return (
    <header class="page-header">
      <Link to={() => "/"}>
        <SmallLogo></SmallLogo>
      </Link>
      <h1>Desmos Code Golf Site</h1>
    </header>
  );
}

export default function MainPage(props: {}) {
  const challenges = getChallenges();

  createEffect(() => {
    challenges.challengeIDList();
    untrack(async () => {
      challenges.reload();
      await challenges.loadN(challenges.challengeIDList().length);
      console.log(challenges.challengeList(), challenges.challengeIDList());
    });
  });

  return (
    <>
      <header class="main-header">
        <div style={{ display: "flex", "flex-direction": "column" }}>
          <div
            style={{
              display: "flex",
              "justify-content": "center",
              "align-items": "center",
            }}
          >
            <div
              ref={(el) => {
                setTimeout(() => {
                  if (
                    !matchMedia("(prefers-reduced-motion: no-preference)")
                      .matches
                  )
                    return;
                  for (const e of el.querySelectorAll("*")) {
                    if (e instanceof HTMLElement) {
                      e.style.transform = `translate(${
                        Math.random() * 150 - 75
                      }px, ${Math.random() * 150 - 75}px)`;
                      e.style.opacity = "0";
                      setTimeout(() => {
                        e.style.transition = `transform 0.5s, opacity 0.5s`;
                        e.style.transform = `translate(0px, 0px)`;
                        e.style.opacity = "1";
                      }, 20);
                    }
                  }
                });
              }}
            >
              <StaticMath latex={() => Latex}></StaticMath>
            </div>
            <Logo></Logo>
          </div>
          <div>
            <h1>Desmos Code Golf Site</h1>
            <p>
              Use of the Desmos Graphing Calculator is done with permission from{" "}
              <a href="https://www.desmos.com/">Desmos Studio PBC</a>.
            </p>
            <p>
              Welcome to the Desmos Code Golf Site! Pick a challenge to try
              below or make your own in the{" "}
              <Link to={() => "/sandbox"}>Sandbox</Link>:
            </p>
          </div>
        </div>
      </header>
      <main>
        <For each={Array.from(challenges.challengeList().entries())}>
          {(e) => (
            <ChallengePreview
              challenge={() => e[1]}
              id={() => e[0]}
            ></ChallengePreview>
          )}
        </For>
      </main>
    </>
  );
}
