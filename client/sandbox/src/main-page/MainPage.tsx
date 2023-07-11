import "./MainPage.less";
import { getChallenges, trpc } from "../communication/trpc-setup";
import { For, createEffect, untrack } from "solid-js";
import { ChallengePreview } from "./ChallengePreview";

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
        <h1>Desmos Code Golf Site</h1>
        <p>
          Use of the Desmos Graphing Calculator is done with permission from{" "}
          <a href="https://www.desmos.com/">Desmos Studio PBC</a>.
        </p>
        <p>
          Welcome to the Desmos Code Golf Site! Pick a challenge to try below or
          make your own in the <a href="/sandbox">Sandbox</a>:
        </p>
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
