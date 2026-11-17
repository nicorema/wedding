from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from db import setup_seating


class handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8")) if content_length else {}

            table_count = max(1, int(data.get("table_count", 1)))
            self._send(200, setup_seating(table_count))
        except Exception as e:
            import traceback

            self._send(
                500,
                {
                    "error": str(e),
                    "type": type(e).__name__,
                    "traceback": traceback.format_exc(),
                },
            )

    def do_OPTIONS(self):
        self._send(200, {})
