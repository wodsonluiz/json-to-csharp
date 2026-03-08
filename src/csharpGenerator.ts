import { InputData, jsonInputForTargetLanguage, quicktype } from "quicktype-core";

export async function generateCSharpClasses(rootName: string, sample: string): Promise<string> {
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

    return result.lines.join("\n");
}