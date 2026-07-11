from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from db import get_all_guests, create_guest


def serialize_guest(guest):
    return {
        "id": guest["id"],
        "uuid": str(guest["uuid"]),
        "first_name": guest["first_name"],
        "last_name": guest["last_name"],
        "nickname": guest["nickname"],
        "phone": guest["phone"],
        "companion_names": guest["companion_names"] or [],
        "group_name": guest["group_name"],
        "attending": guest["attending"],
        "allergies": guest["allergies"],
        "link_generated": guest["link_generated"],
        "link_sent": guest["link_sent"],
        "created_at": str(guest["created_at"]),
    }


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            guests = get_all_guests()
            response = [serialize_guest(g) for g in guests]

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
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

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8")) if content_length else {}

            first_name = (data.get("first_name") or "").strip()

            if not first_name:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "first_name is required"}).encode()
                )
                return

            def clean(value):
                value = (value or "").strip()
                return value or None

            companion_names = [
                (name or "").strip() for name in data.get("companion_names", [])
            ]

            attending = data.get("attending")
            if not isinstance(attending, bool):
                attending = None

            new_guest = create_guest(
                first_name=first_name,
                last_name=clean(data.get("last_name")),
                nickname=clean(data.get("nickname")),
                phone=clean(data.get("phone")),
                companion_names=companion_names,
                group_name=clean(data.get("group_name")),
                attending=attending,
                allergies=clean(data.get("allergies")),
                link_generated=bool(data.get("link_generated", False)),
                link_sent=bool(data.get("link_sent", False)),
            )

            self.send_response(201)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(json.dumps(serialize_guest(new_guest)).encode())
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
