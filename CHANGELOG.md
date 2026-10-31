# Change Log

## [1.1.0] — 2026-10-31

### Added

- JSON to YAML conversion with preserved nesting, quoted strings and exact integer literals.
- C# 9 record generation with init properties, nullable types, nested records and collections.
- JSON to XML conversion with a documented typed mapping, escaped content and safe names.
- All new commands in the Command Palette and JSON editor/Explorer context menus, with overwrite confirmation.
- An English README with generated examples and a real 21-second VS Code demonstration.
- Conversion, bundled-command, XML round-trip and actual C# compilation tests.

### Changed

- Update Marketplace display name and description to reflect all four conversion formats.
- Preserve existing C# Class conversion behavior and extension identity.
- Publish only the tested VSIX through protected GitHub OIDC Trusted Publishing.

### Security

- Build, lint, 27 tests, CodeQL, source/history/package secret scanning, dependency policy and VSIX integrity/content checks gate publication.
- No High/Critical or production dependency findings at release preparation. The existing scoped minimatch development-only exception remains in force until 2026-11-30; see SECURITY.md.


- Add official publisher links and a support guide.
- Declare the existing MIT license, publisher website, and issue tracker in package metadata.

## Published releases

The extension was first published on March 1, 2026. Release versions and dates
are available in the [Marketplace version history](https://marketplace.visualstudio.com/items?itemName=wodson.json-to-csharp&ssr=false#version-history).
Implementation history is available in the [repository commits](https://github.com/wodsonluiz/json-to-csharp/commits/main/).
