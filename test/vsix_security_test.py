import json
import pathlib
import subprocess
import sys
import tempfile
import unittest
import zipfile

CHECKER = pathlib.Path(__file__).resolve().parents[1] / 'scripts' / 'check-vsix.py'


class VsixSecurityTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='json-csharp-vsix-')
        self.addCleanup(self.temp.cleanup)
        self.root = pathlib.Path(self.temp.name)
        self.metadata = dict(publisher='wodson', name='json-to-csharp', version='1.0.6', main='./dist/extension.js')
        (self.root / 'package.json').write_text(json.dumps(self.metadata))
        (self.root / 'dist').mkdir()
        (self.root / 'dist' / 'extension.js').write_bytes(b'approved-bundle')
        self.files = {
            '[Content_Types].xml': b'<Types/>', 'extension.vsixmanifest': b'<Manifest/>',
            'extension/package.json': json.dumps(self.metadata).encode(),
            'extension/readme.md': b'readme-content', 'extension/changelog.md': b'changes',
            'extension/LICENSE.txt': b'MIT', 'extension/icon.png': b'icon',
            'extension/dist/extension.js': b'approved-bundle',
            'extension/docs/demo.gif': b'GIF89a',
        }

    def check(self, files=None, corrupt=False, duplicate=False):
        artifact = self.root / 'extension.vsix'
        with zipfile.ZipFile(artifact, 'w', compression=zipfile.ZIP_STORED) as package:
            for name, content in (files or self.files).items():
                package.writestr(name, content)
            if duplicate:
                import warnings
                with warnings.catch_warnings():
                    warnings.simplefilter('ignore', UserWarning)
                    package.writestr('extension/readme.md', b'duplicate')
        if corrupt:
            artifact.write_bytes(artifact.read_bytes().replace(b'readme-content', b'corrupt-content', 1))
        return subprocess.run([sys.executable, str(CHECKER), str(artifact)], cwd=self.root,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode

    def test_valid_archive(self):
        self.assertEqual(self.check(), 0)

    def test_rejects_sensitive_extra_file(self):
        self.assertNotEqual(self.check({**self.files, 'extension/.env': b'not-a-real-secret'}), 0)

    def test_rejects_replaced_bundle_or_identity(self):
        self.assertNotEqual(self.check({**self.files, 'extension/dist/extension.js': b'tampered'}), 0)
        wrong = {**self.metadata, 'publisher': 'untrusted'}
        self.assertNotEqual(self.check({**self.files, 'extension/package.json': json.dumps(wrong).encode()}), 0)

    def test_rejects_duplicate_case_collision_and_corrupt_content(self):
        self.assertNotEqual(self.check(duplicate=True), 0)
        self.assertNotEqual(self.check({**self.files, 'extension/README.md': b'collision'}), 0)
        self.assertNotEqual(self.check(corrupt=True), 0)
