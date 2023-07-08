type DesmosDataNumber = {
  type: "number";
  value: number;
};

type DesmosDataPoint = {
  type: "point";
  value: [number, number];
};

type DesmosDataColor = {
  type: "color";
  value: [number, number, number]; // rgb triplet
};

type DesmosDataPolygon = {
  type: "polygon";
  value: [number, number][];
};

type NoListDesmosData =
  | DesmosDataNumber
  | DesmosDataPoint
  | DesmosDataColor
  | DesmosDataPolygon;

type DesmosData =
  | NoListDesmosData
  | { type: "number-list"; value: number[] }
  | { type: "point-list"; value: [number, number][] }
  | { type: "color-list"; value: [number, number, number][] }
  | { type: "polygon-list"; value: [number, number][][] };

type TestCase = {
  // input for this test case
  input: DesmosData[];

  // if true, runs the ticker until it no longer runs
  // only then does it compare against outputs and takes a screenshot
  useTicker: boolean;

  // expected expression output from the last N expressions for this test case
  expectedOutput?: // get expected output from data
  | {
        type: "data";
        value: DesmosData[];
      }
    // get expected output by running this test case on a reference graph
    | {
        type: "reference";
        graph: string;
      };

  screenshot?: {
    // graphpaper bounds
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;

    // width in pixels (height scales to match based on graphpaper bounds)
    // maybe change depending on what's intuitive or what desmos actually supports
    widthInPixels: number;

    // if reference and submission differ by under this proportion, this test case passes
    invalidSubmissionThreshold: number;

    expectedOutput: // get expected output from a URI (like a link or a data: URI)
    | {
          type: "uri";
          value: string;
        }
      // get expected screenshot contents by running this test case on a reference graph
      // this could be useful if there are many test cases and it'd be prohibitively expensive
      // to store them explicitly
      | {
          type: "reference";
          graph: string;
        };
  };
};

type DesmosChallenge = {
  testCases: TestCase[];
};
