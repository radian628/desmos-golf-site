type InputType =
  | "number"
  | "point"
  | "color"
  | "polygon"
  | "number-list"
  | "point-list"
  | "color-list"
  | "polygon-list";

type InputInstance = {
  number: number;
  point: [number, number];
  color: [number, number, number];
  polygon: [number, number][];
  "number-list": number[];
  "point-list": [number, number][];
  "color-list": [number, number, number][];
  "polygon-list": [number, number][][];
};

type InputTypesToInstance<T extends readonly InputType[]> = T extends readonly [
  infer First extends InputType,
  ...infer Rest extends readonly InputType[],
]
  ? readonly [InputInstance[First], ...InputTypesToInstance<Rest>]
  : readonly [];

type HasScreenshotOutput = {
  screenshot: {
    rangeX?: [number, number];
    rangeY?: [number, number];
    resolution?: [number, number];
    threshold?: number;
  };
  outputs?: undefined;
};

type HasExpressionOutput = {
  outputs: { threshold: number }[];
  screenshot?: undefined;
};

declare function test<Inputs extends readonly InputType[]>(
  settings: {
    reference: string;
    inputTypes: Inputs;
    inputs: InputTypesToInstance<Inputs>[];
    ticker?: boolean;
  } & (
    | HasExpressionOutput
    | HasScreenshotOutput
    | {
        screenshot: HasScreenshotOutput["screenshot"];
        outputs: HasExpressionOutput["outputs"];
      }
  )
): void;

type WithThreshold<T> = {
  data: T;
  threshold?: number;
};

type WithThresholdArray<A extends readonly any[]> = A extends readonly [
  infer Start,
  ...infer Rest extends readonly any[],
]
  ? [WithThreshold<Start>, ...WithThresholdArray<Rest>]
  : [];

declare function directTest<
  Inputs extends readonly InputType[],
  Outputs extends readonly InputType[],
>(settings: {
  ticker?: boolean;
  inputTypes: Inputs;
  outputTypes: Outputs;
  testCases: {
    in: InputTypesToInstance<Inputs>;
    out: WithThresholdArray<InputTypesToInstance<Outputs>>;
  }[];
}): void;
