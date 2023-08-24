/* @refresh reload */
import { render } from "solid-js/web";
import "./verify/Verify";
import { Show, createEffect, createSignal } from "solid-js";

const root = document.getElementById("root");

import MainPage, { PageHeader } from "./main-page/MainPage";
import { Sandbox } from "./sandbox/Sandbox";
import ChallengePage from "./challenge-page/ChallengePage";
import { BetterRoute, pathname } from "./common/better-router/BetterRoute";
import { LightDarkToggle } from "./common/LightDarkToggle";

const [challengeID, setChallengeID] = createSignal("");

let colorSchemeFromLocalStorage = window.localStorage.getItem("colorScheme");

if (colorSchemeFromLocalStorage === null) {
  colorSchemeFromLocalStorage = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches
    ? "dark"
    : "light";
} else {
  colorSchemeFromLocalStorage =
    colorSchemeFromLocalStorage === "light" ? "light" : "dark";
}

export const [colorScheme, setColorScheme] = createSignal<"light" | "dark">(
  colorSchemeFromLocalStorage as "light" | "dark"
);

createEffect(() => {
  window.localStorage.setItem("colorScheme", colorScheme());
  document.body.classList.toggle(
    "dark",
    colorScheme() === "dark" ? true : false
  );
});

render(
  () => (
    <>
      <Show when={pathname() !== "/"}>
        <PageHeader></PageHeader>
      </Show>
      <main>
        <BetterRoute path={() => []}>
          <MainPage></MainPage>
        </BetterRoute>
        <BetterRoute path={() => ["sandbox"]}>
          <Sandbox></Sandbox>
        </BetterRoute>
        <BetterRoute path={() => ["challenge", setChallengeID]} allowMore>
          <ChallengePage challengeID={challengeID}></ChallengePage>
        </BetterRoute>
      </main>
      <LightDarkToggle></LightDarkToggle>
    </>
  ),
  root!
);
