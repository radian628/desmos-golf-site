import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
import TestCaseMakerTypeDefs from "./TestCaseMakerTypeDefs.d.ts?raw";
import { generateTestSuite } from "./TestSuiteGenerator";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";

let typescriptModule: typeof import("typescript");
async function getTypescript() {
  if (!typescriptModule) typescriptModule = await import("typescript");
  return typescriptModule;
}

let tsMorphBootstrapModule: typeof import("@ts-morph/bootstrap");
async function getTsMorphBootstrap() {
  if (!tsMorphBootstrapModule)
    tsMorphBootstrapModule = await import("@ts-morph/bootstrap");
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
        const view = new EditorView({
          state: EditorState.create({
            doc: props.code(),
            extensions: [
              EditorView.lineWrapping,
              EditorState.readOnly.of(props.readonly ?? false),
              EditorView.theme({
                ".cm-content": {
                  "caret-color": "var(--foreground-color)",
                },
              }),
              syntaxHighlighting(
                matchMedia("(prefers-color-scheme: dark)").matches
                  ? oneDarkHighlightStyle
                  : defaultHighlightStyle,
                { fallback: true }
              ),
              keymap.of(defaultKeymap),
              javascript({ typescript: true }),
              EditorView.updateListener.of((view) => {
                if (props.readonly !== true)
                  props.setCode(view.state.doc.toString());
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

                    const testfn = <T,>(t: T) => t;

                    const mainFile = project.createSourceFile(
                      "main.ts",
                      view.state.doc.toString()
                    );

                    if (!props.readonly) {
                      const testRunnerTypeDefs = project.createSourceFile(
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
      }}
    ></div>
  );
}
