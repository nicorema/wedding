from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import uuid

# Add parent directory to path to import storage module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from storage import create_signed_upload_url


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def do_POST(self):
        try:
            photo_id = uuid.uuid4().hex
            path = f"uploads/{photo_id}.jpg"
            thumb_path = f"uploads/{photo_id}_thumb.jpg"

            self._send_json(
                200,
                {
                    "path": path,
                    "thumb_path": thumb_path,
                    "upload_url": create_signed_upload_url(path),
                    "thumb_upload_url": create_signed_upload_url(thumb_path),
                },
            )
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_OPTIONS(self):
        self._send_json(200, {})
