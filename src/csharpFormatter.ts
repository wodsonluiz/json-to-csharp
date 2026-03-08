export function extractAndFormatClasses(full: string): string {
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