"""Fail closed on unexpected package contents; scan extracted content separately with Gitleaks."""
import json
import pathlib
import sys
import zipfile

allowed = {
    '[Content_Types].xml', 'extension.vsixmanifest',
    'extension/package.json', 'extension/readme.md', 'extension/changelog.md',
    'extension/LICENSE.txt', 'extension/icon.png', 'extension/dist/extension.js',
    'extension/docs/demo.gif',
}
with zipfile.ZipFile(sys.argv[1]) as package:
    names = package.namelist()
    assert len(names) == len(set(names)), 'Duplicate archive entries'
    assert set(names) == allowed, 'Unexpected or missing VSIX files: ' + str(names)
    assert all(not info.is_dir() and info.file_size < 20_000_000 for info in package.infolist()), 'Invalid VSIX entry'
    assert package.testzip() is None, 'Corrupt archive entry'
    metadata = json.loads(package.read('extension/package.json'))
    source = json.loads(pathlib.Path('package.json').read_text())
    assert (metadata['publisher'], metadata['name'], metadata['version'], metadata['main']) == ('wodson', 'json-to-csharp', source['version'], './dist/extension.js')
    assert package.read('extension/dist/extension.js') == pathlib.Path('dist/extension.js').read_bytes(), 'Bundle mismatch'
print('VSIX content allowlist and identity verified:', len(names), 'files')
