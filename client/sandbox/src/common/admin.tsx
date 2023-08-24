import { JSX, Show } from "solid-js";

function parseQueryString(str: string) {
  return new Map(
    str
      .slice(1)
      .split("&")
      .map(
        (s) =>
          s
            .split("=")
            .slice(0, 2)
            .map((s) => decodeURIComponent(s)) as [string, string]
      )
  );
}

export function isAdmin() {
  return parseQueryString(window.location.search).has("isAdmin");
}

export function AdminOnly(props: {
  children: JSX.Element | JSX.Element[] | string;
}) {
  return <Show when={isAdmin()}>{props.children}</Show>;
}
