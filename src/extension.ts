import * as vscode from "vscode";
import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage
} from "quicktype-core";

async function jsonToCSharp(json: string, fallbackRoot: string): Promise<string> {
    const parsed = JSON.parse(json);

    let rootName = fallbackRoot;
    let sample = json;

    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const keys = Object.keys(parsed);
        if (keys.length === 1) {
            rootName = pascalCase(keys[0]);
            sample = JSON.stringify(parsed[keys[0]], null, 2);
        }
    }

    const jsonInput = jsonInputForTargetLanguage("csharp");

    await jsonInput.addSource({
        name: rootName,
        samples: [sample]
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    const result = await quicktype({
        inputData,
        lang: "csharp",
        rendererOptions: {
            "just-types": "true"
        }
    });

    const full = result.lines.join("\n");

    // --- EXTRAÇÃO SEGURA DE CLASSES ---
    const classes: string[] = [];
    const seen = new Set<string>();

    const classHeader = /public partial class\s+(\w+)/g;
    let match;

    while ((match = classHeader.exec(full)) !== null) {
        const name = match[1];
        if (seen.has(name)) continue;

        seen.add(name);

        let start = match.index;
        let braceIndex = full.indexOf("{", start);
        if (braceIndex === -1) continue;

        let depth = 0;
        let end = braceIndex;

        for (let i = braceIndex; i < full.length; i++) {
            if (full[i] === "{") depth++;
            if (full[i] === "}") depth--;

            if (depth === 0) {
                end = i + 1;
                break;
            }
        }

        let cls = full.substring(start, end);

        cls = cls.replace(/partial\s+/g, "");
        cls = cls.replace(/\[JsonProperty[^\]]*\]\s*/g, "").trim();

        classes.push(cls);
    }

    return classes.join("\n\n");
}

function pascalCase(name: string): string {
    return name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, c => c.toUpperCase());
}

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand(
        "json-to-csharp.convert",
        async () => {

            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No active editor");
                return;
            }

            let jsonText = editor.document.getText(editor.selection);
            if (!jsonText || jsonText.trim().length === 0) {
                jsonText = editor.document.getText();
            }

            if (!jsonText || jsonText.trim().length === 0) {
                vscode.window.showErrorMessage("No JSON found");
                return;
            }

            try {
                JSON.parse(jsonText);
            } catch {
                vscode.window.showErrorMessage("Invalid JSON");
                return;
            }

            const fileName = editor.document.fileName.split(/[\\/]/).pop() || "Root";
            const rootName = pascalCase(fileName);

            try {
                const csharp = await jsonToCSharp(jsonText, rootName);

                const doc = await vscode.workspace.openTextDocument({
                    content: csharp,
                    language: "csharp"
                });

                vscode.window.showTextDocument(doc);

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