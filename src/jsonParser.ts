function pascalCase(name: string): string {
    return name
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
        .replace(/^[a-z]/, c => c.toUpperCase());
}

export async function parseJsonAndDetermineRoot(json: string, fallbackRoot: string): Promise<{ rootName: string; sample: string }> {
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

    return { rootName, sample };
}