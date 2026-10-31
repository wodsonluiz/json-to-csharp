import { parse, stringify } from "yaml";

export function jsonToYaml(json: string): string {
    JSON.parse(json); // Accept JSON only, never arbitrary YAML tags or directives.
    const value: unknown = parse(json, { schema: "json", intAsBigInt: true, uniqueKeys: false });
    return stringify(value, { defaultKeyType: "QUOTE_DOUBLE", defaultStringType: "QUOTE_DOUBLE", lineWidth: 0 });
}
