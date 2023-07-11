import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { Diagnostic, linter } from "@codemirror/lint";
import * as ts from "typescript";
import { createProject } from "@ts-morph/bootstrap";
import TestCaseMakerTypeDefs from "./TestCaseMakerTypeDefs.d.ts?raw";
import { generateTestSuite } from "./TestSuiteGenerator";

function getTypescriptCompilerHost(view: EditorView): ts.CompilerHost {
  return {
    getSourceFile: (fileName, languageVersion, onError) => {
      return ts.createSourceFile(
        "index.ts",
        view.state.doc.toString(),
        languageVersion
      );
    },
    getDefaultLibFileName: (opts) => "index.ts",
    writeFile: () => {},
    getCurrentDirectory: () => "/",
    getCanonicalFileName: (name) => name,
    useCaseSensitiveFileNames: () => false,
    getNewLine: () => "\n",
    fileExists: () => true,
    readFile: (filename: string) => {
      return view.state.doc.toString();
    },
  };
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
              syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
              keymap.of(defaultKeymap),
              javascript({ typescript: true }),
              EditorView.updateListener.of((view) => {
                if (props.readonly !== true)
                  props.setCode(view.state.doc.toString());
              }),
              props.readonly
                ? []
                : linter(async (view) => {
                    // const host: ts.CompilerHost = getTypescriptCompilerHost(view);

                    // const prog = ts.createProgram({
                    //   rootNames: ["index.ts"],
                    //   options: {
                    //     strict: true,
                    //     lib: ["dom", "es2020"],
                    //     target: ts.ScriptTarget.ESNext,
                    //   },
                    //   host,
                    // });

                    const project = await createProject({
                      useInMemoryFileSystem: true,
                      compilerOptions: {
                        target: ts.ScriptTarget.ES5,
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

                    return (
                      ts
                        .getPreEmitDiagnostics(program)
                        ?.filter((e) => {
                          return e?.file?.fileName === "/main.ts";
                        })
                        ?.map((e) => {
                          return {
                            severity: "error",
                            message: ts.formatDiagnostic(e, {
                              getCanonicalFileName: (f) => f,
                              getCurrentDirectory: () => "/",
                              getNewLine: () => "\n",
                            }),
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
