/* @refresh reload */
import { render } from "solid-js/web";

import { Show, createSignal, lazy } from "solid-js";

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

const TestRunner = lazy(() => import("./test-runner/TestRunnerPage"));

const [challengeID, setChallengeID] = createSignal("");

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
    </>
  ),
  root!
);
