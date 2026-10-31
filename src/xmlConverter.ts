import { parse } from "yaml";

function escapeXml(text: string, attribute = false): string {
    let escaped = "";
    for (const character of text) {
        const code = character.codePointAt(0)!;
        const valid = code === 9 || code === 10 || code === 13 ||
            code >= 0x20 && code <= 0xD7FF || code >= 0xE000 && code <= 0xFFFD || code >= 0x10000 && code <= 0x10FFFF;
        if (!valid) {
            throw new Error("JSON contains a character that XML 1.0 cannot represent");
        }
        switch (character) {
            case "&": escaped += "&amp;"; break;
            case "<": escaped += "&lt;"; break;
            case ">": escaped += "&gt;"; break;
            case '"': escaped += "&quot;"; break;
            case "'": escaped += "&apos;"; break;
            case "\r": escaped += "&#xD;"; break;
            case "\n": escaped += attribute ? "&#xA;" : "\n"; break;
            case "\t": escaped += attribute ? "&#x9;" : "\t"; break;
            default: escaped += character;
        }
    }
    return escaped;
}

function element(name: string, value: unknown, depth: number, attributes = ""): string {
    const indent = "  ".repeat(depth);
    const type = value === null ? "null" : Array.isArray(value) ? "array" : typeof value === "bigint" ? "number" : typeof value;
    const open = `${indent}<${name} type="${type}"${attributes}`;
    if (value === null) {
        return open + " />";
    }
    if (typeof value === "object") {
        const children = Array.isArray(value)
            ? value.map((item, index) => element("item", item, depth + 1, ` index="${index}"`))
            : Object.entries(value).map(([key, child]) => {
                const portableName = /^[A-Za-z_][A-Za-z0-9_.-]*$/.test(key) && !/^xml/i.test(key);
                return element(portableName ? key : "member", child, depth + 1,
                    portableName ? "" : ` name="${escapeXml(key, true)}"`);
            });
        return children.length ? open + ">\n" + children.join("\n") + `\n${indent}</${name}>` : open + " />";
    }
    if (typeof value === "number" && !Number.isFinite(value)) {
        throw new Error("JSON number is outside the supported finite range");
    }
    return open + ">" + escapeXml(String(value)) + `</${name}>`;
}

export function jsonToXml(json: string): string {
    JSON.parse(json); // XML is never parsed; JSON-only input cannot enable DTDs or external entities.
    const value: unknown = parse(json, { schema: "json", intAsBigInt: true, uniqueKeys: false });
    return '<?xml version="1.0" encoding="utf-8"?>\n' + element("json", value, 0) + "\n";
}
