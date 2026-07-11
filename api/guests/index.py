from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import uuid as uuid_module
import urllib.parse

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import get_guest_by_uuid, update_guest_rsvp


def serialize_guest(guest):
    return {
        "uuid": str(guest["uuid"]),
        "first_name": guest["first_name"],
        "nickname": guest["nickname"],
        "companion_names": guest["companion_names"] or [],
        "group_name": guest["group_name"],
        "attending": guest["attending"],
        "allergies": guest["allergies"],
    }


def parse_uuid(raw_uuid):
    try:
        return str(uuid_module.UUID(raw_uuid))
    except (ValueError, TypeError, AttributeError):
        return None


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            parsed = urllib.parse.urlparse(self.path)
            query = urllib.parse.parse_qs(parsed.query)
            raw_uuid = (query.get("uuid") or [None])[0]
            guest_uuid = parse_uuid(raw_uuid)

            guest = get_guest_by_uuid(guest_uuid) if guest_uuid else None

            if not guest:
                self.send_response(404)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Guest not found"}).encode())
                return

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(json.dumps(serialize_guest(guest)).encode())
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

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8")) if content_length else {}

            guest_uuid = parse_uuid(data.get("uuid"))

            if not guest_uuid:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Valid uuid is required"}).encode())
                return

            attending = data.get("attending")
            if not isinstance(attending, bool):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "attending must be true or false"}).encode()
                )
                return

            allergies = (data.get("allergies") or "").strip() or None

            companion_names = data.get("companion_names")
            if companion_names is not None:
                companion_names = [
                    (name or "").strip() for name in companion_names
                ]

            updated_guest = update_guest_rsvp(
                guest_uuid, attending, allergies, companion_names
            )

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(json.dumps(serialize_guest(updated_guest)).encode())
        except ValueError as e:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
