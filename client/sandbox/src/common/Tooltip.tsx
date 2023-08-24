import { JSXElement, Show, children, createSignal } from "solid-js";

import "./Tooltip.less";

export function Tooltip(props: {
  contents: () => JSXElement;
  children: JSXElement;
}) {
  const c = children(() => props.children);

  const [tooltipOpen, setTooltipOpen] = createSignal(false);

  return (
    <div
      onMouseEnter={() => {
        setTooltipOpen(true);
      }}
      onMouseLeave={() => {
        setTooltipOpen(false);
      }}
      class="tooltip-container"
    >
      {c()}
      <Show when={tooltipOpen()}>
        <div class="tooltip">{props.contents()}</div>
      </Show>
    </div>
  );
}
