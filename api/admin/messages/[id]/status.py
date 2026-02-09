from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import urllib.parse

# Add parent directory to path to import db module
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
)
from db import update_message_status


class handler(BaseHTTPRequestHandler):
    def do_PUT(self):
        try:
            # Extract message_id from path
            # Path format: /api/admin/messages/{id}/status
            path_parts = [p for p in self.path.split("/") if p]
            message_id = None

            # Find the index of 'messages' and get the next part as ID
            if "messages" in path_parts:
                msg_index = path_parts.index("messages")
                if msg_index + 1 < len(path_parts):
                    try:
                        message_id = int(path_parts[msg_index + 1])
                    except (ValueError, IndexError):
                        pass

            if message_id is None:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Message ID is required"}).encode()
                )
                return

            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            status = data.get("status")

            if not status:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Status is required"}).encode())
                return

            valid_statuses = ["Pending", "Approved", "Denied"]
            if status not in valid_statuses:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps(
                        {"error": f"Status must be one of {valid_statuses}"}
                    ).encode()
                )
                return

            updated_message = update_message_status(message_id, status)
            response = {
                "id": updated_message["id"],
                "name": updated_message["name"],
                "message": updated_message["message"],
                "status": updated_message["status"],
                "created_at": str(updated_message["created_at"]),
            }

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "PUT, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
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
        self.send_header("Access-Control-Allow-Methods", "PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
