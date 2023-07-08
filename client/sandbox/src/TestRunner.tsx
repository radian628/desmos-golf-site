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

export function TestRunner(props: { testSuite: () => DesmosChallenge }) {
  const [testGraphLink, setTestGraphLink] = createSignal<string>(
    "https://www.desmos.com/calculator/bjdtsz0sbi"
  );

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

  const [testsFailed, setTestsFailed] = createSignal<
    DesmosChallenge["testCases"]
  >([]);

  const initializeGraphState = async () =>
    testCalc()?.setState?.((await getGraph(testGraphLink())).state);

  createEffect(() => {
    initializeGraphState();
  });

  let container: HTMLDivElement;

  return (
    <div>
      <button
        onClick={async () => {
          // remove all reference graphs
          for (const [link, rg] of referenceGraphs().entries()) {
            rg.graph.destroy();
            rg.el.parentElement.removeChild(rg.el);
          }
          // reset test graph state
          await initializeGraphState();

          setReferenceGraphs(new Map());

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
                inner.style.width = "400px";
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

          setTestsFailed(
            (await result).map((idx) => props.testSuite().testCases[idx])
          );
        }}
      >
        Run Test Suite
      </button>
      <label>Test This Graph: </label>
      <input
        value={testGraphLink()}
        onInput={(e) => {
          setTestGraphLink(e.target.value);
        }}
        style={{ width: "400px" }}
      ></input>
      <div
        style={{ display: "flex", "flex-wrap": "wrap" }}
        ref={(el) => {
          setTimeout(() => {
            container = el;
            const inner = document.createElement("div");
            inner.style.height = "400px";
            inner.style.width = "400px";
            el.appendChild(inner);
            console.log(inner);
            const calc = Desmos.GraphingCalculator(inner, {});
            setTestCalc(calc);
            initializeGraphState();
          });
        }}
      ></div>
      <h2>
        {testsFailed().length} out of {props.testSuite().testCases.length} Tests
        Failed:
      </h2>
      <code>{JSON.stringify(testsFailed())}</code>
    </div>
  );
}
