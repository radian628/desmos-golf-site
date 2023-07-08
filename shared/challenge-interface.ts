import { DesmosData } from "./challenge";

type GraphState = {};

export type ChallengeInterface = {
  setExpressionLatex: (id: string, latex: string) => Promise<void>;
  getState: () => Promise<GraphState>;
  getScreenshotBitmap: () => number[];
  getExpressionValue: (id: string) => Promise<DesmosData>;
  resetGraph: () => Promise<void>;
};
