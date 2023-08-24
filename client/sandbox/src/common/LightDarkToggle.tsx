import { colorScheme, setColorScheme } from "..";

import "./LightDarkToggle.less";

export function LightDarkToggle() {
  return (
    <button
      class="light-dark-toggle"
      onClick={() => {
        setColorScheme(colorScheme() === "dark" ? "light" : "dark");
      }}
    >
      {colorScheme() === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
