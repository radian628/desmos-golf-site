import {
  Accessor,
  JSXElement,
  Show,
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

export type Variant<
  Union,
  TypeKey extends keyof Union,
  TypeValue extends Union[TypeKey],
> = Union & Record<TypeKey, TypeValue>;

export type TypeVariant<Union extends { type: unknown }, TypeValue> = Variant<
  Union,
  "type",
  TypeValue
>;

export function useFetchDesmosJson(url: () => string) {
  const res = createResource<
    | { type: "pending" | "failure" }
    | {
        data: { title: string; thumbUrl: string };
        type: "success";
      },
    string
  >(
    url,
    async () => {
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
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (handler()) {
        clearInterval(interval);
        resolve();
      }
    });
  });
}

export function NarrowShow<T, IfTrue extends T>(props: {
  data: () => T;
  cond: (t: T) => t is IfTrue;
  true: (t: IfTrue) => JSXElement;
  false: (f: Exclude<T, IfTrue>) => JSXElement;
}) {
  return (
    <Show
      when={props.cond(props.data())}
      fallback={props.false(props.data() as Exclude<T, IfTrue>)}
    >
      {props.true(props.data() as IfTrue)}
    </Show>
  );
}

export type Branch<T, IfTrue extends T> = [
  (t: T) => t is IfTrue,
  (data: IfTrue) => JSXElement,
];

// todo: fix this
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function NarrowMatch<
//   T,
//   U extends T,
//   Branches extends Branch<T, U>[],
// >(props: { data: () => T; branches: Branches }) {
//   return (
//     <Switch>
//       {props.branches.map(([k, v]) => (
//         <Match when={k(props.data())}>{v(props.data())}</Match>
//       ))}
//     </Switch>
//   );
// }
