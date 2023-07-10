import { TestCasesInput } from "../TestCasesInput";
import "./TestCaseMakerDocs.less";

export function TestCaseMakerDocs() {
  return (
    <div class="test-case-maker-docs">
      <header>
        <h1>
          Docs <span style="font-size: 0.5em">(Hover to Expand)</span>
        </h1>
      </header>
      <h2>Helper Types</h2>
      <p>List of valid Desmos data types.</p>
      <TestCasesInput
        code={() => `type DataType =
  | "number"
  | "point"
  | "color"
  | "polygon"
  | "number-list"
  | "point-list"
  | "color-list"
  | "polygon-list";`}
        readonly
      ></TestCasesInput>
      <p>
        This type shows what data you'll need to enter for an instance of a
        given type. For instance, if you wanted to enter an input value for a{" "}
        <code>"point-list"</code>, you would need an expression of type{" "}
        <code>[number, number][]</code>.
      </p>
      <TestCasesInput
        readonly
        code={() => `
type MapTypeToData = {
  number: number;
  point: [number, number];
  color: [number, number, number];
  polygon: [number, number][];
  "number-list": number[];
  "point-list": [number, number][];
  "color-list": [number, number, number][];
  "polygon-list": [number, number][][];
};`}
      ></TestCasesInput>
      <h2>
        <code>test</code>
      </h2>
      <p>
        The function <code>test</code> runs tests on a graph based on a
        reference graph. That is, output from all tests from this graph will be
        compared against output from the reference. Its argument is structured
        as follows:
      </p>
      <TestCasesInput
        code={() => `function test<
  InputTypes extends readonly DataType[]
>(settings: TestSettings<InputTypes>): void

  type TestSettings = {
  // A link to the reference graph. 
  reference: string; 

  // If enabled, tests will run the ticker until it can no longer run.
  ticker?: boolean; // Default false

  // A list of input types. Must be declared "as const"
  inputTypes: InputTypes; 
  
  // Each test case is an array of DesmosData.
  // Note that these are type-checked more strongly in the editor.
  inputs: DesmosData[][]; 

  // Set this property to enable screenshot testing.
  screenshot?: {
    // Graph bounds on the X-axis.
    rangeX?: [number, number]; // Default [-10, 10]

    // Graph bounds on the Y-axis.
    rangeY?: [number, number]; // Default [-10, 10]

    // Screenshot pixel resolution.
    resolution?: [number, number]; // Default [512, 512]

    // If the test differs from the reference by this proportion,
    // then the test will fail.
    threshold?: number; // Default 0.001
  }

  // The size of this array determines the number of expression outputs.
  // The "threshold" property determines how precise the test graph has to be.
  outputs?: { threshold: number }[]
}`}
        readonly
      ></TestCasesInput>
      <h2>
        <code>directTest</code>
      </h2>
      <p>
        To perform tests without a reference graph, use the function{" "}
        <code>directTest</code>.
      </p>

      <TestCasesInput
        code={() => `function directTest<
  InputTypes extends readonly DataType[],
  OutputTypes extends readonly DataType[],
>(settings: TestSettings<InputTypes, OutputTypes>): void

type TestDirectSettings<InputTypes, OutputTypes> = {
  // If enabled, tests will run the ticker until it can no longer run.
  ticker?: boolean; // Default false

  // A list of input types. Must be declared "as const"
  inputTypes: InputTypes; 
  
  // A list of output types. Must be declared "as const"
  outputTypes: OutputTypes;

  testCases: {

    // Inputs and outputs for this test case.
    // Type safety is stricter in the actual editor.
    in: DesmosData[];
    out: { 
      data: DesmosData; 
      
      // If expected and actual output differs by more than this much,
      // the test will be considered failed.
      threshold?: number; // Default 0

    }[];
  }[]
}`}
        readonly
      ></TestCasesInput>
    </div>
  );
}
