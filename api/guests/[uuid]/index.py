from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import uuid as uuid_module

# Add parent directory to path to import db module
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
)
from db import get_guest_by_uuid


def extract_uuid(path):
    path_without_query = (path or "").split("?")[0]
    path_parts = [p for p in path_without_query.strip("/").split("/") if p]

    if "guests" in path_parts:
        idx = path_parts.index("guests")
        if idx + 1 < len(path_parts):
            return path_parts[idx + 1]

    return path_parts[-1] if path_parts else None


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            raw_uuid = extract_uuid(self.path)

            try:
                guest_uuid = str(uuid_module.UUID(raw_uuid))
            except (ValueError, TypeError, AttributeError):
                guest_uuid = None

            guest = get_guest_by_uuid(guest_uuid) if guest_uuid else None

            if not guest:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Guest not found"}).encode())
                return

            response = {
                "uuid": str(guest["uuid"]),
                "first_name": guest["first_name"],
                "nickname": guest["nickname"],
                "companion_names": guest["companion_names"] or [],
                "group_name": guest["group_name"],
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
        except Exception as e:
            import traceback

            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            error_info = {
                "error": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc(),
            }
            self.wfile.write(json.dumps(error_info, indent=2).encode())

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
