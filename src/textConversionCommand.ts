import * as vscode from "vscode";
import * as path from "path";

export interface TextConversion {
    command: string;
    extension: string;
    convert: (json: string, fileStem: string) => string | Promise<string>;
}

export function registerTextConversion(context: vscode.ExtensionContext, conversion: TextConversion): void {
    context.subscriptions.push(vscode.commands.registerCommand(conversion.command, async (uri?: vscode.Uri) => {
        try {
            const editor = vscode.window.activeTextEditor;
            const source = uri ?? editor?.document.uri;
            if (!source) {
                vscode.window.showErrorMessage("No active editor");
                return;
            }
            if (source.scheme === "untitled") {
                vscode.window.showErrorMessage("Save the JSON file before converting");
                return;
            }
            const json = uri
                ? Buffer.from(await vscode.workspace.fs.readFile(source)).toString("utf8")
                : editor!.document.getText(editor!.selection) || editor!.document.getText();
            if (!json.trim()) {
                vscode.window.showErrorMessage("No JSON found");
                return;
            }
            try {
                JSON.parse(json);
            } catch {
                vscode.window.showErrorMessage("Invalid JSON");
                return;
            }
            const stem = path.posix.basename(source.path).replace(/\.json$/i, "");
            const result = await conversion.convert(json, stem);
            const destination = source.with({ path: path.posix.join(path.posix.dirname(source.path), stem + conversion.extension) });
            let exists = true;
            try {
                await vscode.workspace.fs.stat(destination);
            } catch (error) {
                if (!(error instanceof vscode.FileSystemError) || error.code !== "FileNotFound") {
                    throw error;
                }
                exists = false;
            }
            if (exists && await vscode.window.showWarningMessage(
                `${path.posix.basename(destination.path)} already exists. Overwrite?`, "Yes", "No"
            ) !== "Yes") {
                return;
            }
            await vscode.workspace.fs.writeFile(destination, Buffer.from(result, "utf8"));
            await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(destination));
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            vscode.window.showErrorMessage("Conversion failed: " + message);
        }
    }));
}
