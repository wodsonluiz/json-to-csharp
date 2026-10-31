# JSON → XML mapping

The conversion writes `filename.xml` beside saved JSON after validation and
confirms overwrite. It does not read or interpret XML, DTDs, entities, files,
schemas or remote resources. Data is serialized, never used as markup.

Every document has one `<json>` root and an XML 1.0 UTF-8 declaration. Every node
has a `type` attribute: `object`, `array`, `string`, `number`, `boolean` or `null`.

| JSON | XML representation |
| --- | --- |
| Object | One child element per own property, in JavaScript property enumeration order |
| Portable property name | Its name, matching `[A-Za-z_][A-Za-z0-9_.-]*` and not beginning with `xml` (case-insensitive) |
| Other property name | `<member name="original key" type="…">`; the original key is escaped, not discarded |
| Array | Ordered `<item index="0" type="…">` children |
| Primitive | Escaped text inside its typed element |
| Null | A self-closing element with `type="null"` |
| Empty object/array/string | Distinguished by `type`, including when there is no text |

Keys named `member`, `item` or `name` remain unambiguous: a parent's type identifies
objects versus arrays, and a `name` attribute overrides only a fallback member's
element name. No JSON key becomes an XML attribute except the escaped `name`
metadata on fallback members; `xmlns` and colon-containing names cannot introduce
namespaces. Newline/tab/carriage-return characters in keys are encoded as numeric
character references so XML attribute normalization cannot change them.

`&`, `<`, `>`, quotes and apostrophes are escaped. Carriage returns in string
values use numeric references to preserve them. Characters that XML 1.0 cannot
represent (including NUL and unpaired UTF-16 surrogates) cause an error before any
output is written; they are never silently removed. Integers retain their exact
literal values; floating-point numbers follow JavaScript number semantics and
non-finite results are rejected. JSON text is validated before the JSON-schema
YAML parser is used to retain large integers; arbitrary YAML input is rejected.

Example:

```json
{"employee":{"name":"Ada & Grace","skills":["C#","XML"]}}
```

```xml
<?xml version="1.0" encoding="utf-8"?>
<json type="object">
  <employee type="object">
    <name type="string">Ada &amp; Grace</name>
    <skills type="array">
      <item type="string" index="0">C#</item>
      <item type="string" index="1">XML</item>
    </skills>
  </employee>
</json>
```
