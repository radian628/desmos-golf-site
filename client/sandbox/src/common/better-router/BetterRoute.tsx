import {
  JSX,
  Show,
  children,
  createContext,
  createSignal,
  useContext,
} from "solid-js";
import "./BetterRoute.less";

export enum SpecialRoutes {
  Any,
}

export const RouteBaseContext = createContext<() => number>(() => 1);

export function checkIfRouteMatches(
  pathMatcher: RoutePathMatcher,
  base: number,
  allowMore: boolean | undefined,
  pathname: string
) {
  const pathSplit = pathname.split("/").slice(base);
  console.log(pathMatcher, pathSplit);
  if (pathSplit[pathSplit.length - 1] === "") pathSplit.pop();
  if (pathSplit.length !== pathMatcher.length && !allowMore) return false;
  for (let i = 0; i < pathMatcher.length; i++) {
    const pathSegment = pathSplit[i];
    if (!pathSegment) return false;
    const pathMatcherSegment = pathMatcher[i];
    if (typeof pathMatcherSegment === "string") {
      if (pathSegment !== pathMatcher[i]) return false;
    } else if (typeof pathMatcherSegment === "function") {
      pathMatcherSegment(pathSegment);
    }
  }
  return true;
}

export type RoutePathMatcher = (
  | string
  | ((s: string) => void)
  | SpecialRoutes
)[];

export const [pathname, setPathname] = createSignal(window.location.pathname);

setInterval(() => {
  if (pathname() !== window.location.pathname) {
    setPathname(window.location.pathname);
  }
});

export function BetterRoute(props: {
  path: () => RoutePathMatcher;
  children: string | JSX.Element | JSX.Element[];
  allowMore?: boolean;
}) {
  const routeBaseAmount = useContext(RouteBaseContext);

  console.log("route base amount", routeBaseAmount());

  return (
    <Show
      when={checkIfRouteMatches(
        props.path(),
        routeBaseAmount(),
        props.allowMore,
        pathname()
      )}
    >
      <RouteBaseContext.Provider
        value={() => routeBaseAmount() + props.path().length}
      >
        {props.children}
      </RouteBaseContext.Provider>
    </Show>
  );
}

export function Link(props: {
  to: () => string;
  children: string | JSX.Element | JSX.Element[];
  isButton?: boolean;
}) {
  const c = children(() => props.children);

  return (
    <Show
      when={
        !props.isButton ||
        !(pathname().split("/").pop() || "").startsWith(props.to())
      }
      fallback={<span class="selected-better-route-link">{c()}</span>}
    >
      <a
        class="better-route-link"
        onClick={(e) => {
          window.history.pushState(undefined, "", props.to());
          e.preventDefault();
        }}
        href={props.to()}
      >
        {c()}
      </a>
    </Show>
  );
}
