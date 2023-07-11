import "./MainPage.less";
import { getChallenges, trpc } from "../communication/trpc-setup";
import { For, createEffect, untrack } from "solid-js";
import { ChallengePreview } from "./ChallengePreview";
import { StaticMath } from "../test-runner/TestCaseDisplay";
import DesmosGraph from "./desmos-graph.png";
import Latex from "./latex.txt?raw";
import { A } from "@solidjs/router";

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
            <StaticMath latex={() => Latex}></StaticMath>
            <img src={DesmosGraph}></img>
          </div>
          <div>
            <h1>Desmos Code Golf Site</h1>
            <p>
              Use of the Desmos Graphing Calculator is done with permission from{" "}
              <a href="https://www.desmos.com/">Desmos Studio PBC</a>.
            </p>
            <p>
              Welcome to the Desmos Code Golf Site! Pick a challenge to try
              below or make your own in the <A href="/sandbox">Sandbox</A>:
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
