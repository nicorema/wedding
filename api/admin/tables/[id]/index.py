from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
)
from db import update_seating_table, delete_seating_table


def extract_table_id(path):
    path_parts = [p for p in (path or "").split("?")[0].strip("/").split("/") if p]
    if "tables" in path_parts:
        idx = path_parts.index("tables")
        if idx + 1 < len(path_parts) and path_parts[idx + 1].isdigit():
            return int(path_parts[idx + 1])
    return None


class handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS")
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

    def do_PUT(self):
        try:
            table_id = extract_table_id(self.path)
            if table_id is None:
                self._send(400, {"error": "Table ID is required"})
                return

            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8")) if content_length else {}

            name = (data.get("name") or "").strip()
            if not name:
                self._send(400, {"error": "name is required"})
                return

            table = update_seating_table(
                table_id, name, int(data.get("x", 0)), int(data.get("y", 0))
            )
            self._send(200, table)
        except ValueError as e:
            self._send(404, {"error": str(e)})
        except Exception as e:
            self._send_error(e)

    def do_DELETE(self):
        try:
            table_id = extract_table_id(self.path)
            if table_id is None:
                self._send(400, {"error": "Table ID is required"})
                return

            delete_seating_table(table_id)
            self._send(200, {"message": "Table deleted successfully"})
        except ValueError as e:
            self._send(404, {"error": str(e)})
        except Exception as e:
            self._send_error(e)

    def do_OPTIONS(self):
        self._send(200, {})
