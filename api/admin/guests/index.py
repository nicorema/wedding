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
        "first_name": guest["first_name"],
        "last_name": guest["last_name"],
        "nickname": guest["nickname"],
        "phone": guest["phone"],
        "has_companion": guest["has_companion"],
        "companion_name": guest["companion_name"],
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

            new_guest = create_guest(
                first_name=first_name,
                last_name=clean(data.get("last_name")),
                nickname=clean(data.get("nickname")),
                phone=clean(data.get("phone")),
                has_companion=bool(data.get("has_companion", False)),
                companion_name=clean(data.get("companion_name")),
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
