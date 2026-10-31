import {
    ClassProperty, ClassType, getOptionValues, InputData, jsonInputForTargetLanguage,
    quicktype, RenderContext, Sourcelike, Type, UnionType
} from "quicktype-core";
import { CSharpRenderer, CSharpTargetLanguage, cSharpOptions } from "quicktype-core/dist/language/CSharp";
import { Name } from "quicktype-core/dist/Naming";
import { AccessModifier, isValueType } from "quicktype-core/dist/language/CSharp/utils";
import { parseJsonAndDetermineRoot } from "./jsonParser";

function allowsNull(type: Type): boolean {
    return type.kind === "null" || type.kind === "any" ||
        type instanceof UnionType && [...type.members].some(member => member.kind === "null");
}

class RecordRenderer extends CSharpRenderer {
    protected needNamespace(): boolean { return false; }
    protected unionNeedsName(): boolean { return false; }
    protected emitDefaultLeadingComments(): void { this.emitLine("#nullable enable"); }

    protected csType(type: Type): Sourcelike {
        if (type.kind === "null" || type.kind === "any") {
            return "object?";
        }
        if (type instanceof UnionType) {
            const members = [...type.members].filter(member => member.kind !== "null");
            if (members.length === 1) {
                return allowsNull(type) ? this.nullableCSType(members[0]) : this.csType(members[0]);
            }
            return allowsNull(type) ? "object?" : "object";
        }
        return super.csType(type);
    }

    protected nullableCSType(type: Type): Sourcelike {
        return allowsNull(type) ? this.csType(type) : [this.csType(type), "?"];
    }

    protected propertyDefinition(property: ClassProperty, name: Name, _class: ClassType, _jsonName: string): Sourcelike {
        const nullable = property.isOptional || allowsNull(property.type);
        const type = property.isOptional ? this.nullableCSType(property.type) : this.csType(property.type);
        const initializer = !nullable && (property.type instanceof UnionType || !isValueType(property.type)) ? " = default!;" : "";
        return ["public ", type, " ", name, " { get; init; }", initializer];
    }

    protected emitType(description: string[] | undefined, access: AccessModifier, declaration: Sourcelike,
        name: Sourcelike, base: Sourcelike | undefined, emit: () => void): void {
        super.emitType(description, access, declaration === "partial class" ? "record" : declaration, name, base, emit);
    }
}

class RecordLanguage extends CSharpTargetLanguage {
    protected makeRenderer(context: RenderContext): CSharpRenderer {
        return new RecordRenderer(this, context, getOptionValues(cSharpOptions, { features: "just-types" }));
    }
}

export async function generateCSharpRecords(json: string, fallbackRoot: string): Promise<string> {
    const { rootName, sample } = await parseJsonAndDetermineRoot(json, fallbackRoot);
    const parsed: unknown = JSON.parse(sample);
    // A named DTO is still useful for top-level collections and primitive values.
    const recordSample = parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
        ? sample : `{ "value": ${sample} }`;
    const input = jsonInputForTargetLanguage("csharp");
    await input.addSource({ name: rootName, samples: [recordSample] });
    const data = new InputData();
    data.addInput(input);
    const result = await quicktype({ inputData: data, lang: new RecordLanguage() });
    return result.lines.join("\n") + "\n";
}
