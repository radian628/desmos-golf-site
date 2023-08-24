import { render } from "solid-js/web";
import { TestRunner } from "../test-runner/TestRunner";
import { generateTestSuite } from "../test-runner/TestSuiteGenerator";
import { trpc } from "../communication/trpc-setup";
import { FailedTestCaseOutput } from "../../../../shared/execute-challenge";

declare global {
  interface Window {
    testOutput?: FailedTestCaseOutput[];
    verifyGraph: typeof verifyGraph;
  }
}

export async function verifyGraph(graphLink: string) {
  const challenge = await trpc.challengeData.query(
    Number(window.location.pathname.split("/")[2])
  );

  const testSuite = await generateTestSuite(challenge!.testSuite);

  const testRunner = TestRunner({
    testSuite: () => testSuite!,
    testGraphLink: () => graphLink,
    setTestOutput: (output) => {
      window.testOutput = output;
    },
    setTestGraphLink: () => {},
    setHasRunTests: () => {},
  });

  render(() => testRunner.element, document.body);

  return new Promise((resolve) => {
    testRunner.runTestSuite();
    const interval = setInterval(() => {
      if (window.testOutput) {
        resolve(window.testOutput as FailedTestCaseOutput[]);
        clearInterval(interval);
        delete window.testOutput;
      }
    });
  });
}

window.verifyGraph = verifyGraph;
document.body.classList.toggle("verify-is-ready");
