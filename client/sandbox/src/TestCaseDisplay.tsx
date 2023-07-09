import { For, Show, children, createEffect } from "solid-js";
import { DesmosData, TestCase } from "../../../shared/challenge";

import MathQuill from "mathquill-commonjs";
import "mathquill-commonjs/mathquill.css";
import {
  FailedTestCaseOutput,
  serializeDesmosData,
} from "../../../shared/execute-challenge";
const MQ = MathQuill.getInterface(2);

export function StaticMath(props: { latex: () => string }) {
  return (
    <div
      ref={(el) => {
        const mq = MQ.StaticMath(el);
        createEffect(() => {
          mq.latex(props.latex());
        });
      }}
    ></div>
  );
}

export function Bitmap(props: { pixels: () => number[]; width: () => number }) {
  return (
    <canvas
      width={props.width()}
      height={props.pixels().length / 4 / props.width()}
      ref={(el) => {
        const ctx = el.getContext("2d");

        createEffect(() => {
          const arr = new Uint8ClampedArray(props.pixels());
          ctx?.putImageData(new ImageData(arr, props.width()), 0, 0);
        });
      }}
    ></canvas>
  );
}

import "./TestCaseDisplay.css";

export function FailedTestCaseDisplay(props: {
  case: () => FailedTestCaseOutput;
}) {
  return (
    <div class="failed-test-case-display">
      <h3>Inputs</h3>
      <For each={props.case().inputs}>
        {(inp) => (
          <StaticMath
            latex={() => inp.name + "=" + serializeDesmosData(inp.value)}
          ></StaticMath>
        )}
      </For>
      <h3>Screenshot Outputs</h3>
      <div class="screenshot-container">
        <Show when={props.case().screenshot}>
          <div class="screenshot">
            <h4>Reference</h4>
            {
              <Bitmap
                pixels={() => props.case().screenshot?.reference as number[]}
                width={() => props.case().screenshot?.width as number}
              ></Bitmap>
            }
          </div>
          <div class="screenshot">
            <h4>Your Graph</h4>
            {
              <Bitmap
                pixels={() => props.case().screenshot?.test as number[]}
                width={() => props.case().screenshot?.width as number}
              ></Bitmap>
            }
          </div>
        </Show>
      </div>
      <Show when={props.case().outputs}>
        <h3>Expression Outputs</h3>
        <table>
          <thead>
            <tr>
              <th>Reference</th>
              <th>Your Graph</th>
            </tr>
          </thead>
          <tbody>
            <For each={props.case().outputs}>
              {(out) => (
                <tr>
                  <td>
                    <StaticMath
                      latex={() =>
                        out.name + "=" + serializeDesmosData(out.reference)
                      }
                    ></StaticMath>
                  </td>
                  <td>
                    <StaticMath
                      latex={() =>
                        out.name + "=" + serializeDesmosData(out.test)
                      }
                    ></StaticMath>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>
    </div>
  );
}
