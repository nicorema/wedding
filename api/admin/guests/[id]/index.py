from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
)
from db import delete_guest, update_guest


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


def extract_guest_id(path):
    path_without_query = (path or "").split("?")[0]
    path_parts = [p for p in path_without_query.strip("/").split("/") if p]

    if "guests" in path_parts:
        idx = path_parts.index("guests")
        if idx + 1 < len(path_parts):
            try:
                return int(path_parts[idx + 1])
            except (ValueError, IndexError):
                pass

    if path_parts:
        last_part = (path_parts[-1] or "").split("?")[0].strip()
        if last_part.isdigit():
            return int(last_part)

    return None


class handler(BaseHTTPRequestHandler):
    def do_PUT(self):
        try:
            guest_id = extract_guest_id(self.path)

            if guest_id is None:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Guest ID is required"}).encode())
                return

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

            updated_guest = update_guest(
                guest_id,
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

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS")
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

    def do_DELETE(self):
        try:
            guest_id = extract_guest_id(self.path)

            if guest_id is None:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Guest ID is required"}).encode())
                return

            delete_guest(guest_id)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(
                json.dumps({"message": "Guest deleted successfully"}).encode()
            )
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
        self.send_header("Access-Control-Allow-Methods", "PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
