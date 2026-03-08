import * as vscode from "vscode";
import * as path from "path";
import { parseJsonAndDetermineRoot } from "./jsonParser";
import { generateCSharpClasses } from "./csharpGenerator";
import { extractAndFormatClasses } from "./csharpFormatter";

function pascalCase(name: string): string {
    return name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, c => c.toUpperCase());
}

function formatCSharp(code: string): string {
    const lines = code.split("\n");
    let indent = 0;
    const indentSize = 4;
    const result: string[] = [];

    for (let line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("}")) {
            indent--;
        }

        const currentIndent = Math.max(indent, 0) * indentSize;
        result.push(" ".repeat(currentIndent) + trimmed);

        if (trimmed.endsWith("{")) {
            indent++;
        }
    }

    return result.join("\n");
}

async function jsonToCSharp(json: string, fallbackRoot: string): Promise<string> {
    const { rootName, sample } = await parseJsonAndDetermineRoot(json, fallbackRoot);
    const full = await generateCSharpClasses(rootName, sample);
    return extractAndFormatClasses(full);
}

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand(
        "json-to-csharp.convert",
        async (uri?: vscode.Uri) => {

            let jsonText = "";
            let filePath = "";

            // veio do Explorer (botão direito arquivo)
            if (uri) {
                const data = await vscode.workspace.fs.readFile(uri);
                jsonText = Buffer.from(data).toString("utf8");
                filePath = uri.fsPath;
            } else {
                // veio do editor
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showErrorMessage("No active editor");
                    return;
                }

                jsonText = editor.document.getText(editor.selection);
                if (!jsonText || jsonText.trim().length === 0) {
                    jsonText = editor.document.getText();
                }

                filePath = editor.document.fileName;
            }

            if (!jsonText || jsonText.trim().length === 0) {
                vscode.window.showErrorMessage("No JSON found");
                return;
            }

            // valida JSON
            try {
                JSON.parse(jsonText);
            } catch {
                vscode.window.showErrorMessage("Invalid JSON");
                return;
            }

            const fileName = path.basename(filePath);
            const fallbackRoot = pascalCase(fileName);

            try {
                let csharp = await jsonToCSharp(jsonText, fallbackRoot);
                csharp = formatCSharp(csharp);

                const classMatch = /public class\s+(\w+)/.exec(csharp);
                const className = classMatch ? classMatch[1] : fallbackRoot;

                const dir = path.dirname(filePath);
                const csPath = path.join(dir, className + ".cs");
                const csUri = vscode.Uri.file(csPath);

                // verifica overwrite
                let exists = true;
                try {
                    await vscode.workspace.fs.stat(csUri);
                } catch {
                    exists = false;
                }

                if (exists) {
                    const answer = await vscode.window.showWarningMessage(
                        `${className}.cs already exists. Overwrite?`,
                        "Yes",
                        "No"
                    );
                    if (answer !== "Yes") return;
                }

                await vscode.workspace.fs.writeFile(
                    csUri,
                    Buffer.from(csharp, "utf8")
                );

                const doc = await vscode.workspace.openTextDocument(csUri);
                await vscode.window.showTextDocument(doc);

            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : String(err);
                vscode.window.showErrorMessage("Conversion failed: " + message);
                console.error(err);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}