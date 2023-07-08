import { createEffect, createSignal } from "solid-js";
import { DesmosChallenge } from "../../../shared/challenge";
import { executeChallenge } from "../../../shared/execute-challenge";
import { GraphState } from "@desmodder/graph-state";
import {
  Calc,
  calcObjectToChallengeInterface,
  waitForOnEvaluatorChangesEvents,
} from "../../../shared/challenge-interface";

async function getGraph(link: string): Promise<{ state: GraphState }> {
  return await (
    await fetch(link, { headers: { Accept: "application/json" } })
  ).json();
}

type Desmos = {
  GraphingCalculator: (
    el: HTMLElement,
    options: { graphpaper?: boolean }
  ) => Calc;
  Calculator: any;
};
declare const Desmos: Desmos;

export function TestRunner(props: { testSuite: () => DesmosChallenge }) {
  const [testGraphLink, setTestGraphLink] = createSignal<string>(
    "https://www.desmos.com/calculator/bjdtsz0sbi"
  );

  const [testCalc, setTestCalc] = createSignal<any>();

  const [referenceGraphs, setReferenceGraphs] = createSignal<
    Map<
      string,
      {
        graph: any;
        el: HTMLDivElement;
      }
    >
  >(new Map());

  const initializeGraphState = async () =>
    testCalc()?.setState?.((await getGraph(testGraphLink())).state);

  createEffect(() => {
    initializeGraphState();
  });

  let container: HTMLDivElement;

  return (
    <div>
      <div
        ref={(el) => {
          setTimeout(() => {
            container = el;
            const inner = document.createElement("div");
            inner.style.height = "400px";
            el.appendChild(inner);
            console.log(inner);
            const calc = Desmos.GraphingCalculator(inner, {});
            setTestCalc(calc);
            initializeGraphState();
          });
        }}
      ></div>
      <button
        onClick={async () => {
          const result = executeChallenge(
            {
              referenceGraphs: async (link: string) => {
                const existingGraph = referenceGraphs().get(link);

                if (existingGraph)
                  return calcObjectToChallengeInterface(
                    existingGraph.graph as Calc
                  );

                const state = await getGraph(link);

                if (!state) return;

                const inner = document.createElement("div");
                inner.style.height = "400px";
                container.appendChild(inner);

                const calc = Desmos.GraphingCalculator(inner, {});
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

          console.log("ran tests:", await result);
        }}
      >
        Run Test Suite
      </button>
    </div>
  );
}
