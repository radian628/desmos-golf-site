import { createEffect, createSignal } from "solid-js";

export function delayedEffect<In, Out>(
  delay: () => number,
  getter: () => In,
  callback: () => Out
) {
  const [time, setTime] = createSignal(Date.now());

  const [intervalHandle, setIntervalHandle] =
    createSignal<ReturnType<typeof setInterval>>();

  const [output, setOutput] = createSignal<Out>(callback());

  const intervalFn = () => {
    if (Date.now() - time() > delay()) {
      if (intervalHandle() !== undefined) {
        clearInterval(intervalHandle());
        setOutput(() => callback());
      }
    }
  };

  createEffect(() => {
    getter();
    setTime(Date.now());
    setIntervalHandle(setInterval(intervalFn, 0));
  });

  return output;
}

export function delayChangesTo<T>(delay: () => number, getter: () => T) {
  return delayedEffect(delay, getter, getter);
}
