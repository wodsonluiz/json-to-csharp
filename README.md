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
