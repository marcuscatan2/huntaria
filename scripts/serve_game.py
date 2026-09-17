"""Local game server with fresh entry scripts; never reads browser saves."""
from __future__ import annotations

import argparse
import hashlib
import io
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
REFERENCE = re.compile(r'''((?:src|href)=["'])([^"']+)(["'])''')


def version_entry(source: str, root: Path) -> bytes:
    """Content-based URLs bypass previously cached, unversioned JS and CSS."""
    root = root.resolve()

    def replace(match):
        url = urlsplit(match[2])
        if url.scheme or url.netloc or Path(url.path).suffix not in ('.js', '.css'):
            return match[0]
        path = (root / url.path.lstrip('/')).resolve()
        if not path.is_relative_to(root) or not path.is_file():
            return match[0]
        digest = hashlib.sha256(path.read_bytes()).hexdigest()[:16]
        query = [(k, v) for k, v in parse_qsl(url.query) if k != 'v'] + [('v', digest)]
        return match[1] + urlunsplit(url._replace(query=urlencode(query))) + match[3]

    return REFERENCE.sub(replace, source).encode('utf-8')


class GameHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = Path(self.translate_path(self.path))
        if path.is_dir():
            path = path / 'index.html'
        root = Path(self.directory).resolve()
        if path.resolve() == root / 'index.html' and path.is_file():
            # Ignore old If-Modified-Since headers: dependencies may have changed
            # even when index.html itself has not been edited.
            body = version_entry(path.read_text(encoding='utf-8-sig'), root)
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            return io.BytesIO(body)
        return super().send_head()

    def end_headers(self):
        path = urlsplit(self.path).path
        if path.endswith('/') or Path(path).suffix in ('.html', '.js', '.css'):
            self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    args = parser.parse_args()
    with ThreadingHTTPServer(('127.0.0.1', args.port), partial(GameHandler, directory=str(ROOT))) as server:
        print(f'Play: http://127.0.0.1:{args.port}/', flush=True)
        print(f'Test: http://127.0.0.1:{args.port}/?test=1', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == '__main__':
    main()
