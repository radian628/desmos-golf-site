import { For, createEffect, createSignal } from "solid-js";
import { DesmosChallenge } from "../../../../shared/challenge";
import {
  FailedTestCaseOutput,
  executeChallenge,
} from "../../../../shared/execute-challenge";
import { GraphState } from "@desmodder/graph-state";
import {
  Calc,
  calcObjectToChallengeInterface,
  waitForOnEvaluatorChangesEvents,
} from "../../../../shared/challenge-interface";
import "./TestRunner.css";

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
  return new Promise<typeof Desmos>((resolve, reject) => {
    const interval = setInterval(() => {
      if (window.Desmos) {
        console.log("desmos is loaded");
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
  console.log("current state of desmso", window.Desmos);

  const [testCalc, setTestCalc] = createSignal<any>();

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
            });
          }}
        ></div>
      </div>
    ),
    runTestSuite: async () => {
      console.log("test suite", props.testSuite());

      // remove all reference graphs
      for (const [link, rg] of referenceGraphs().entries()) {
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
            await waitForOnEvaluatorChangesEvents(calc as Calc, 1);

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
