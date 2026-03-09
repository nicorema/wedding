from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
)
from db import delete_message


class handler(BaseHTTPRequestHandler):
    def do_DELETE(self):
        try:
            # Extract message_id from path (strip query string - Vercel/some clients may send ?...)
            # Path format: /api/admin/messages/{id} or /admin/messages/{id} or just /{id}
            path_without_query = (self.path or "").split("?")[0]
            path_parts = [p for p in path_without_query.strip("/").split("/") if p]
            message_id = None

            # Strategy 1: Find the index of 'messages' and get the next part as ID
            if "messages" in path_parts:
                msg_index = path_parts.index("messages")
                if msg_index + 1 < len(path_parts):
                    try:
                        message_id = int(path_parts[msg_index + 1])
                    except (ValueError, IndexError):
                        pass

            # Strategy 2: Try to get ID from the last part of path if it's a number
            if message_id is None:
                try:
                    last_part = path_parts[-1] if path_parts else None
                    if last_part:
                        # In case of trailing query or segment like "1" only
                        id_str = last_part.split("?")[0].strip()
                        if id_str.isdigit():
                            message_id = int(id_str)
                except (ValueError, IndexError):
                    pass

            # Strategy 3: Try to find any numeric part that could be an ID
            if message_id is None:
                for part in reversed(path_parts):
                    try:
                        potential_id = int(part)
                        if potential_id > 0:  # Valid ID should be positive
                            message_id = potential_id
                            break
                    except (ValueError, TypeError):
                        continue

            if message_id is None:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Message ID is required"}).encode()
                )
                return

            delete_message(message_id)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "DELETE, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()
            self.wfile.write(
                json.dumps({"message": "Message deleted successfully"}).encode()
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
        self.send_header("Access-Control-Allow-Methods", "DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
