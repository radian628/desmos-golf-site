import { createEffect, createSignal } from "solid-js";
import { DesmosChallenge } from "../../../../shared/challenge";
import {
  FailedTestCaseOutput,
  executeChallenge,
} from "../../../../shared/execute-challenge";
import { GraphState } from "@desmodder/graph-state";
import {
  Calc,
  calcObjectToChallengeInterface,
  waitForSync,
} from "../../../../shared/challenge-interface";
import "./TestRunner.css";
import { poll } from "../common/utils";

async function getGraph(
  link: string
): Promise<{ state: GraphState } | undefined> {
  try {
    return await (
      await fetch(link, { headers: { Accept: "application/json" } })
    ).json();
  } catch {
    return undefined;
  }
}

function getDesmos() {
  return new Promise<typeof Desmos>((resolve) => {
    const interval = setInterval(() => {
      if (window.Desmos) {
        clearInterval(interval);
        resolve(window.Desmos);
      }
    });
  });
}

export function TestRunner(props: {
  testSuite: () => DesmosChallenge;
  testGraphLink: () => string;
  setTestGraphLink: (l: string) => void;
  setTestOutput: (o: FailedTestCaseOutput[]) => void;
  setHasRunTests: (t: boolean) => void;
}) {
  const [testCalc, setTestCalc] = createSignal<Desmos.Calculator>();

  const [referenceGraphs, setReferenceGraphs] = createSignal<
    Map<
      string,
      {
        graph: Desmos.Calculator;
        el: HTMLDivElement;
      }
    >
  >(new Map());

  const initializeGraphState = async () =>
    testCalc()?.setState?.((await getGraph(props.testGraphLink()))?.state);

  createEffect(() => {
    initializeGraphState();
  });

  let container: HTMLDivElement;

  let ready = false;

  return {
    element: (
      <div>
        <div
          class="test-graphs-container"
          ref={(el) => {
            setTimeout(async () => {
              container = el;
              const inner = document.createElement("div");
              inner.style.height = "400px";
              inner.style.width = "400px";
              el.appendChild(inner);
              const calc = (await getDesmos()).GraphingCalculator(inner, {});
              setTestCalc(calc);
              initializeGraphState();
              ready = true;
            });
          }}
        ></div>
      </div>
    ),
    runTestSuite: async () => {
      await poll(() => ready);

      // remove all reference graphs
      for (const [, rg] of referenceGraphs().entries()) {
        rg.graph.destroy();
        rg.el.parentElement?.removeChild(rg.el);
      }
      // reset test graph state
      await initializeGraphState();

      setReferenceGraphs(new Map());

      const result = executeChallenge(
        {
          referenceGraphs: async (link: string | undefined) => {
            if (!link) return;

            const existingGraph = referenceGraphs().get(link);

            if (existingGraph)
              return calcObjectToChallengeInterface(
                existingGraph.graph as Calc
              );

            const state = await getGraph(link);

            if (!state) return;

            const inner = document.createElement("div");
            inner.style.height = "400px";
            inner.style.width = "400px";
            container.appendChild(inner);

            const calc = (await getDesmos()).GraphingCalculator(inner, {});
            calc.setState(state.state);
            await waitForSync(calc as Calc);

            setReferenceGraphs(
              new Map([
                ...referenceGraphs(),
                [
                  link,
                  {
                    graph: calc,
                    el: inner,
                  },
                ],
              ])
            );

            return calcObjectToChallengeInterface(calc as Calc);
          },
          testGraph: calcObjectToChallengeInterface(testCalc() as Calc),
        },
        props.testSuite()
      );

      props.setTestOutput(await result);
      props.setHasRunTests(true);
    },
  };
}
