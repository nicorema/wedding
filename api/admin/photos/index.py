from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from db import get_photos_by_status, create_photo
from storage import serialize_photo, is_valid_upload_path


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_GET(self):
        """Pending photos waiting for review"""
        try:
            photos = get_photos_by_status("Pending")
            self._send_json(200, [serialize_photo(photo) for photo in photos])
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_POST(self):
        """Photos uploaded from the Manager skip review"""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(content_length).decode("utf-8") or "{}")
            path = data.get("path")
            thumb_path = data.get("thumb_path")

            if not (is_valid_upload_path(path) and is_valid_upload_path(thumb_path)):
                self._send_json(400, {"error": "Invalid photo paths"})
                return

            photo = create_photo(path, thumb_path, "Approved")
            self._send_json(201, serialize_photo(photo))
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_OPTIONS(self):
        self._send_json(200, {})
