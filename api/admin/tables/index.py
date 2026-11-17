from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from db import get_seating, create_seating_table


class handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def _send_error(self, e):
        import traceback

        self._send(
            500,
            {
                "error": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc(),
            },
        )

    def do_GET(self):
        try:
            self._send(200, get_seating())
        except Exception as e:
            self._send_error(e)

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8")) if content_length else {}

            name = (data.get("name") or "").strip()
            if not name:
                self._send(400, {"error": "name is required"})
                return

            table = create_seating_table(
                name, int(data.get("x", 0)), int(data.get("y", 0))
            )
            self._send(201, table)
        except Exception as e:
            self._send_error(e)

    def do_OPTIONS(self):
        self._send(200, {})
