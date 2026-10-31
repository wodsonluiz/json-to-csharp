# Demo capture

`demo.gif` contains real screenshots captured from VS Code 1.140.0 on macOS,
using the Extension Development Host and the bundled extension from protected
main commit `84067a8abd86c97c0b78d8c2d2d587c0cb57e3b7`.

The isolated profile used Dark Modern, no extra extensions, and a synthetic
`employee.json` containing Ada Lovelace, age 36, active true, and C#/TypeScript
skills. No personal workspace, account details, or credentials were recorded.

The actual commands ran in this order: C# Class, C# Record, XML, YAML. Each
command's result was inspected and captured from the editor. Screenshots were
cropped to the editor area, resized to 1280 pixels wide, and encoded into a
21-second looping GIF (about 381 KiB). Frames use short holds so code can be read;
no generated UI, replacement output, or simulated feature behavior was added.

To recapture, build the extension, launch its development host with an isolated
profile and the sample from README.md, then invoke each command from the JSON
editor. Capture both the selected command and its real output. Keep all source
JSON synthetic and inspect every frame for sensitive information before committing.
