import type { Component } from "solid-js";
import { TestRunner } from "./TestRunner";

const App: Component = () => {
  return (
    <>
      <h1>Hello world!!!!</h1>
      <TestRunner
        testSuite={() => ({
          testCases: [-10, -8, -6, -4, -2, 1, 2, 4, 6, 8, 10].map((n) => {
            return {
              referenceGraphLink:
                "https://www.desmos.com/calculator/nswkvhym4k",
              useTicker: false,
              input: [
                {
                  type: "number",
                  value: n,
                },
              ],
              expectedOutput: {
                type: "reference",
                thresholds: [0.01],
              },
            };
          }),
        })}
      ></TestRunner>
    </>
  );
};

export default App;
