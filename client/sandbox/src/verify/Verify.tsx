import { render } from "solid-js/web";
import { useFetchDesmosJson } from "../common/utils";
import { TestRunner } from "../test-runner/TestRunner";
import { generateTestSuite } from "../test-runner/TestSuiteGenerator";
import { trpc } from "../communication/trpc-setup";
import { FailedTestCaseOutput } from "../../../../shared/execute-challenge";

export async function verifyGraph(graphLink: string) {
  const graph = useFetchDesmosJson(() => graphLink);

  const challenge = await trpc.challengeData.query(
    Number(window.location.pathname.split("/")[2])
  );

  const testSuite = await generateTestSuite(challenge!.testSuite);

  const testRunner = TestRunner({
    testSuite: () => testSuite!,
    testGraphLink: () => graphLink,
    setTestOutput: (output) => {
      (window as any).testOutput = output;
    },
    setTestGraphLink: (tgl) => {},
    setHasRunTests: () => {},
  });

  render(() => testRunner.element, document.body);

  return new Promise((resolve, reject) => {
    testRunner.runTestSuite();
    const interval = setInterval(() => {
      if ((window as any).testOutput) {
        resolve((window as any).testOutput as FailedTestCaseOutput[]);
        clearInterval(interval);
        delete (window as any).testOutput;
      }
    });
  });
}

(window as any).verifyGraph = verifyGraph;
document.body.classList.toggle("verify-is-ready");
