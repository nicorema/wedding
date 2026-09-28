from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
)
from db import delete_photo
from storage import delete_objects


def get_photo_id(path):
    # Path format: /api/admin/photos/{id}
    parts = [p for p in (path or "").split("?")[0].strip("/").split("/") if p]
    if "photos" in parts and parts.index("photos") + 1 < len(parts):
        candidate = parts[parts.index("photos") + 1]
    else:
        candidate = parts[-1] if parts else ""
    return int(candidate) if candidate.isdigit() else None


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_DELETE(self):
        """Rejecting a photo removes its row and its files"""
        try:
            photo_id = get_photo_id(self.path)
            if photo_id is None:
                self._send_json(400, {"error": "Photo ID is required"})
                return

            delete_objects(delete_photo(photo_id))
            self._send_json(200, {"message": "Photo deleted successfully"})
        except ValueError as e:
            self._send_json(404, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_OPTIONS(self):
        self._send_json(200, {})
