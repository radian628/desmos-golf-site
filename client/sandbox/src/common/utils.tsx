import {
  Accessor,
  JSX,
  JSXElement,
  createEffect,
  createResource,
  createSignal,
} from "solid-js";
import * as z from "zod";

import "./utils.less";

export function makeObjPropSetter<T, K extends keyof T>(
  obj: () => T,
  setObj: (t: T) => void
): (k: K) => (v: T[K]) => void {
  return function (k) {
    return (v) =>
      setObj({
        ...obj(),
        [k]: v,
      });
  };
}

export function Horizontal(props: { children: JSXElement }) {
  return <div class="horizontal">{props.children}</div>;
}

export function Vertical(props: { children: JSXElement }) {
  return <div class="vertical">{props.children}</div>;
}

export function asyncify<T>(value: () => Promise<T>): Accessor<T | undefined> {
  const sig = createSignal<T | undefined>(undefined);
  const [v, setV] = sig;

  createEffect(() => {
    value().then((t) => {
      setV(() => t);
    });
  });

  return v;
}

export function useFetchDesmosJson(url: () => string) {
  const res = createResource<
    | { type: "pending" | "failure" }
    | {
        data: { title: string };
        type: "success";
      },
    string
  >(
    url,
    async (k, info) => {
      const json = await (
        await fetch(url(), {
          headers: { Accept: "application/json" },
        })
      ).json();

      const parsedJson = z
        .object({
          title: z.string(),
          thumbUrl: z.string(),
        })
        .safeParse(json);

      return parsedJson.success
        ? {
            type: "success",
            data: parsedJson.data,
          }
        : { type: "failure" };
    },
    {
      initialValue: {
        type: "pending",
      },
    }
  );

  return res;
}

export function poll(handler: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    const interval = setInterval(() => {
      if (handler()) {
        clearInterval(interval);
        resolve();
      }
    });
  });
}
