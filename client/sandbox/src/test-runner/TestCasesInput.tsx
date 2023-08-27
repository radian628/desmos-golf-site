import { EditorView, keymap } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
import TestCaseMakerTypeDefs from "./TestCaseMakerTypeDefs.d.ts?raw";
import { oneDark } from "@codemirror/theme-one-dark";
import { colorScheme } from "..";
import { createEffect } from "solid-js";

export async function getTypescript() {
  return (await getTsMorphBootstrap()).ts;
}

let tsMorphBootstrapModule: typeof import("@ts-morph/bootstrap");
export async function getTsMorphBootstrap() {
  if (!tsMorphBootstrapModule)
    tsMorphBootstrapModule = (await import("@ts-morph/bootstrap")).default;
  return tsMorphBootstrapModule;
}

export function TestCasesInput(
  props: {
    code: () => string;
  } & (
    | {
        readonly: true;
      }
    | {
        setCode: (code: string) => void;
        readonly?: boolean;
      }
  )
) {
  return (
    <div
      style={{ "pointer-events": props.readonly ? "none" : "initial" }}
      ref={(el) => {
        const themeConfigCompartment = new Compartment();

        const view = new EditorView({
          state: EditorState.create({
            doc: props.code(),
            extensions: [
              themeConfigCompartment.of([]),
              syntaxHighlighting(defaultHighlightStyle, {
                fallback: true,
              }),
              EditorView.lineWrapping,
              EditorState.readOnly.of(props.readonly ?? false),
              EditorView.theme({
                ".cm-content": {
                  "caret-color": "var(--foreground-color)",
                },
              }),
              keymap.of(defaultKeymap),
              javascript({ typescript: true }),
              EditorView.updateListener.of((view) => {
                const contentsAsString = view.state.doc.toString();
                if (
                  props.readonly !== true &&
                  props.code() !== contentsAsString
                )
                  props.setCode(contentsAsString);
              }),
              props.readonly
                ? []
                : linter(async (view) => {
                    const project = await (
                      await getTsMorphBootstrap()
                    ).createProject({
                      useInMemoryFileSystem: true,
                      compilerOptions: {
                        target: (await getTypescript()).ScriptTarget.ES5,
                      },
                    });

                    project.createSourceFile(
                      "main.ts",
                      view.state.doc.toString()
                    );

                    if (!props.readonly) {
                      project.createSourceFile(
                        "testrunner.d.ts",
                        TestCaseMakerTypeDefs
                      );
                    }
                    const program = project.createProgram();

                    return Promise.all(
                      (await getTypescript())
                        .getPreEmitDiagnostics(program)
                        ?.filter((e) => {
                          return e?.file?.fileName === "/main.ts";
                        })
                        ?.map(async (e) => {
                          return {
                            severity: "error",
                            message: (await getTypescript()).formatDiagnostic(
                              e,
                              {
                                getCanonicalFileName: (f) => f,
                                getCurrentDirectory: () => "/",
                                getNewLine: () => "\n",
                              }
                            ),
                            from: e.start ?? 0,
                            to: (e.start ?? 0) + (e.length ?? 0),
                          } satisfies Diagnostic;
                        }) ?? []
                    );
                  }),
            ],
          }),
          parent: el,
        });

        createEffect(() => {
          view.dispatch({
            effects: themeConfigCompartment.reconfigure(
              colorScheme() === "dark" ? [oneDark] : []
            ),
          });
        });
      }}
    ></div>
  );
}
