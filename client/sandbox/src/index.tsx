/* @refresh reload */
import { render } from "solid-js/web";

import { lazy } from "solid-js";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

import { Router, Routes, Route } from "@solidjs/router";
import MainPage from "./main-page/MainPage";
import { Sandbox } from "./sandbox/Sandbox";
import ChallengePage from "./challenge-page/ChallengePage";

const TestRunner = lazy(() => import("./test-runner/TestRunnerPage"));

render(
  () => (
    <Router>
      <Routes>
        <Route path="/" component={MainPage}></Route>
        <Route path="/sandbox" component={Sandbox}></Route>
        <Route
          path="/challenge/:challengeID/*"
          component={ChallengePage}
        ></Route>
      </Routes>
    </Router>
  ),
  root!
);
