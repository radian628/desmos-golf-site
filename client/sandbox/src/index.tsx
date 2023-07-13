/* @refresh reload */
import { render } from "solid-js/web";

import { Show, createEffect, createSignal, lazy } from "solid-js";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

import { Router, Routes, Route } from "@solidjs/router";
import MainPage, { Logo, PageHeader, SmallLogo } from "./main-page/MainPage";
import { Sandbox } from "./sandbox/Sandbox";
import ChallengePage from "./challenge-page/ChallengePage";
import {
  BetterRoute,
  Link,
  SpecialRoutes,
  pathname,
} from "./common/better-router/BetterRoute";
import { LightDarkToggle } from "./common/LightDarkToggle";

const TestRunner = lazy(() => import("./test-runner/TestRunnerPage"));

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
