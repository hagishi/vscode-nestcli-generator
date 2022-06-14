// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { promisify } from "util";
import { exec as _exec } from "child_process";
const exec = promisify(_exec);

type CMDQuickPickItem = vscode.QuickPickItem & {
  cmd: string;
};

async function openFile(filename: string) {
  try {
    const doc = await vscode.workspace.openTextDocument(filename);
    // // let doc = await workspace.openTextDocument(this.artisanRoot + '/' + filename)
    vscode.window.showTextDocument(doc);
  } catch (e) {
    // console.log(e.message)
  }
}

const cmdList: [string, string, string][] = [
  ["application", "application", "Generate a new application workspace"],
  ["class", "cl", "Generate a new class"],
  ["configuration", "config", "Generate a CLI configuration file"],
  ["controller", "co", "Generate a controller declaration"],
  ["decorator", "d", "Generate a custom decorator"],
  ["filter", "f", "Generate a filter declaration"],
  ["gateway", "ga", "Generate a gateway declaration"],
  ["guard", "gu", "Generate a guard declaration"],
  ["interceptor", "in", "Generate an interceptor declaration"],
  ["interface", "interface", "Generate an interface"],
  ["middleware", "mi", "Generate a middleware declaration"],
  ["module", "mo", "Generate a module declaration"],
  ["pipe", "pi", "Generate a pipe declaration"],
  ["provider", "pr", "Generate a provider declaration"],
  ["resolver", "r", "Generate a GraphQL resolver declaration"],
  ["service", "s", "Generate a service declaration"],
  ["library", "lib", "Generate a new library within a monorepo"],
  ["sub-app", "app", "Generate a new application within a monorepo"],
  ["resource", "res", "Generate a new CRUD resource"],
];

const items: CMDQuickPickItem[] = cmdList.map((v) => {
  return { label: v[0], cmd: v[1], description: v[2] };
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand("nest.generator", () => {
    const rootDir = vscode.workspace.rootPath || "";
    const NEST_GENERATE_CMD = `${rootDir}/node_modules/.bin/nest g`;
    vscode.window.showQuickPick<CMDQuickPickItem>(items).then(async (c) => {
      if (!c) {
        return;
      }
      vscode.window
        .showInputBox({ placeHolder: "input name" })
        .then(async (v) => {
          if (c?.cmd && v) {
            const gen = `${NEST_GENERATE_CMD} ${c.cmd} ${v}`;
            const { stdout, stderr } = await exec(`cd ${rootDir} && ${gen}`);
            // console.log(gen, stdout);
            const filters = stdout.split("\n").filter((line) => {
              const ka = line.trim();
              return /create/i.test(ka) && !/(spec|test)/i.test(ka);
            });
            if (filters.length > 0) {
              const file = filters[0].trim();
              const k = file.match(/\s(?<source>.*\.(ts|js))/i);
              const result = k?.groups?.source || "";
              openFile(`${vscode.workspace.rootPath}/${result}`);
            }
          }
          // console.log(c?.cmd, v);
        });
    });
  });

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
