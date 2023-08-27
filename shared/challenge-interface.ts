import { DesmosData } from "./challenge";
import { GraphState } from "@desmodder/graph-state";

export type ScreenshotSettings = {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  widthInPixels: number;
  heightInPixels: number;
};

export type ChallengeInterface = {
  setExpressionLatex: (id: string, latex: string) => Promise<void>;
  getState: () => Promise<GraphState>;
  getScreenshotBitmap: (
    screenshotSettings: ScreenshotSettings
  ) => Promise<number[]>;
  getExpressionValue: (id: string) => Promise<DesmosData | undefined>;
  resetGraph: () => Promise<void>;
  doTickerStep: () => Promise<boolean>;
  uriToBitmap: (uri: string) => Promise<number[]>;
};

export type ChallengeInterfaces = {
  testGraph: ChallengeInterface;
  referenceGraphs: (
    referenceLink: string | undefined
  ) => Promise<ChallengeInterface | undefined>;
};

export enum DesmosDataTypes {
  Number = 1,
  Point = 3,
  Color = 14,
  Polygon = 16,
  NumberList = 7,
  PointList = 9,
  ColorList = 15,
  PolygonList = 17,
}

export type DesmosEvent =
  | {
      type: "on-evaluator-changes";
    }
  | {
      type: "tick-ticker";
      time: number;
    };

export type ItemModel = {
  formula?: {
    typed_constant_value: {
      valueType: DesmosDataTypes;
      value: number | number[] | number[][];
    };
  };
};

export type Calc = {
  controller: {
    getTicker: () => {
      formula: {
        handler: "maybe-valid" | "empty" | "error";
      };
    };
    dispatcher: {
      register: (handler: (evt: DesmosEvent) => void) => string;
      unregister: (handle: string) => void;
    };
    dispatch: (evt: DesmosEvent) => void;
    getAllItemModels: () => ItemModel[];
    getItemModel: (id: string) => ItemModel | undefined;
  };
  getState: () => GraphState;
  setExpression: (expr: { id: string; latex: string }) => void;
} & Desmos.Calculator;

export async function waitForOnEvaluatorChangesEvents(calc: Calc, n: number) {
  let evaluatorChangesCounter = 0;
  const dispatcher = calc.controller.dispatcher.register((evt) => {
    if (evt.type === "on-evaluator-changes") evaluatorChangesCounter++;
  });

  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (evaluatorChangesCounter >= n) {
        calc.controller.dispatcher.unregister(dispatcher);
        clearInterval(interval);
        resolve();
      }
    });
  });
}

export function calcObjectToChallengeInterface(calc: Calc): ChallengeInterface {
  let time = 0;

  const originalGraphState = calc.getState();

  async function uriToBitmap(uri: string): Promise<number[]> {
    // dataurl -> blob -> ImageBitmap
    const imgBlob = await (await fetch(uri)).blob();
    const bmp = await createImageBitmap(imgBlob);

    // draw to canvas to get raw image data
    const canvas = new OffscreenCanvas(bmp.width, bmp.height);
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(bmp, 0, 0);

    // return image data
    return Array.from(
      ctx?.getImageData(0, 0, bmp.width, bmp.height).data ?? []
    );
  }

  return {
    async doTickerStep() {
      // count # of "on-evaluator-changes" events
      let evaluatorChangesCounter = 0;
      const dispatcher = calc.controller.dispatcher.register((evt) => {
        if (evt.type === "on-evaluator-changes") evaluatorChangesCounter++;
      });
      calc.controller.dispatch({ type: "tick-ticker", time: time++ });
      return new Promise<boolean>((resolve) => {
        // keep polling until ticker step is completed
        const interval = setInterval(() => {
          // ticker succeeded once two on-evaluator-changes events are detected
          const tickerTickCertainSuccess = evaluatorChangesCounter >= 2;

          // ticker failed once ticker is no longer "maybe-valid"
          const tickerTickCertainFailure =
            calc.controller.getTicker().formula.handler !== "maybe-valid";

          // if neither is true, just wait for the next time
          if (!tickerTickCertainFailure && !tickerTickCertainFailure) return;

          if (tickerTickCertainFailure || tickerTickCertainSuccess) {
            resolve(tickerTickCertainFailure ? false : true);
            clearInterval(interval);
            calc.controller.dispatcher.unregister(dispatcher);
          }
        });
      });
    },

    async getState() {
      return calc.getState();
    },

    async setExpressionLatex(id: string, latex: string) {
      calc.setExpression({ id, latex });
      await waitForOnEvaluatorChangesEvents(calc, 1);
    },

    async getScreenshotBitmap(opts) {
      // take screenshot
      const screenshot = await new Promise<string>((resolve) => {
        calc.asyncScreenshot(
          {
            mathBounds: {
              left: opts.xmin,
              right: opts.xmax,
              top: opts.ymax,
              bottom: opts.ymin,
            },

            width: opts.widthInPixels,
            height: opts.heightInPixels,
          },
          (img) => {
            resolve(img);
          }
        );
      });

      return uriToBitmap(screenshot);
    },

    uriToBitmap,

    async resetGraph() {
      calc.setState(originalGraphState);
      await waitForOnEvaluatorChangesEvents(calc, 1);
    },

    async getExpressionValue(id) {
      const value =
        calc.controller.getItemModel(id)?.formula?.typed_constant_value;
      if (!value) return;

      const type = {
        [DesmosDataTypes.Number]: "number",
        [DesmosDataTypes.Point]: "point",
        [DesmosDataTypes.Color]: "color",
        [DesmosDataTypes.Polygon]: "polygon",
        [DesmosDataTypes.NumberList]: "number-list",
        [DesmosDataTypes.PointList]: "point-list",
        [DesmosDataTypes.ColorList]: "color-list",
        [DesmosDataTypes.PolygonList]: "polygon-list",
      }[value.valueType];

      if (!type) return undefined;

      return {
        type,
        value: value.value,
      } as DesmosData;
    },
  };
}
