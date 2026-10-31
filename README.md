# JSON to C# DTO Generator

Convert JSON files into clean C# DTO classes directly inside Visual Studio Code.

This extension generates minimal C# classes (DTOs) from JSON with proper formatting and saves them automatically in the same folder as the source JSON file.

---

## ✨ Features

* Convert JSON to clean C# DTO classes
* Detect root object automatically
* Generate properly formatted C# code (4-space indentation)
* Remove Quicktype helpers, converters, and attributes
* Save `.cs` file automatically next to the JSON file
* Overwrite confirmation if file already exists
* Works from Command Palette, Editor, or Explorer context menu

---

## 🚀 Usage

### Method 1 — Command Palette

1. Open a JSON file
2. Press `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux)
3. Run **Convert JSON to C# Class**

---

### Method 2 — Editor Context Menu

1. Open a JSON file in the editor
2. Right-click inside the editor
3. Click **Convert JSON to C# Class**

---

### Method 3 — Explorer Context Menu

1. Right-click a `.json` file in the Explorer
2. Click **Convert JSON to C# Class**

---

## 📄 Output

Given this JSON:

```json
{
  "employee": {
    "name": "John",
    "salary": 56000,
    "married": true
  }
}
```

The extension generates:

```csharp
public class Employee
{
    public string Name { get; set; }
    public long Salary { get; set; }
    public bool Married { get; set; }
}
```

The file is saved automatically as:

```
Employee.cs
```

in the same directory as the source JSON file.

---

## 🧠 Smart Behavior

* If the JSON has a single root property, that property name becomes the class name
* If not, the JSON filename is used
* Only DTO classes are generated (no serialization helpers)
* Duplicate or helper classes are removed
* Code is automatically formatted

---

## 📦 Requirements

No external tools required.
Everything runs locally inside VS Code.

---

## 🛠 Extension Settings

Currently no configurable settings.
Future versions may include namespace and record support.

---

## 💡 Example Workflow

1. Receive JSON from API or backend
2. Save as `employee.json`
3. Right-click → Convert JSON to C# Class
4. Use generated `Employee.cs` in your .NET project

---

## 🧩 Why this extension?

Many JSON → C# tools generate large files with converters and attributes.
This extension focuses on **clean DTO generation only**, ideal for:

* ASP.NET models
* DTOs
* API contracts
* Domain classes

---

## 📄 License

MIT

---

## 👤 Author

Wodson Correia

## Support and official links

- [Report a bug or request a feature](https://github.com/wodsonluiz/json-to-csharp/issues)
- [Support guide](SUPPORT.md)
- [Source code](https://github.com/wodsonluiz/json-to-csharp)
- [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=wodson.json-to-csharp)
- [Publisher website](https://wodson.net/projects)

The Marketplace publisher ID is `wodson`; the extension ID is `wodson.json-to-csharp`.

## JSON to YAML

Run **Convert JSON to YAML** from the Command Palette or a JSON editor/Explorer
context menu. The extension writes `filename.yml` beside the saved JSON source,
keeping objects, arrays, primitive values and nesting. Strings are quoted to avoid
implicit YAML type changes; integer values are preserved without precision loss.
Existing output requires overwrite confirmation. No input is sent to a server.

## JSON to C# Record

Run **Convert JSON to C# Record** to write `filename.record.cs`. Records use C# 9
`init` properties, nullable annotations and the same Quicktype naming/type inference
as Class conversion. Nested DTOs are records too; collections retain their inferred
element types. Optional or null values are nullable; heterogeneous values use
`object`. Top-level arrays and primitives are represented by a named record with a
`Value` property. Non-null reference properties use `default!` for initialization.
Choose Class or Record for a given DTO type in your C# project to avoid duplicate
type declarations. The existing Class command and its output are unchanged.

## JSON to XML

Run **Convert JSON to XML** to write `filename.xml`. Objects, arrays and primitives
use a deterministic typed mapping beneath one `json` root. Invalid or reserved
element names are preserved in escaped `name` attributes. Text cannot inject XML
markup, DTDs or entities, and invalid XML 1.0 characters are rejected before saving.
See the [mapping and examples](docs/xml-mapping.md) for the complete contract.
