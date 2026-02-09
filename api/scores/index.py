from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import create_score, get_all_scores


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            data = json.loads(body.decode("utf-8"))

            if not data:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "No data provided"}).encode())
                return

            name = data.get("name")
            time = data.get("time")

            if not name or time is None:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Name and time are required"}).encode()
                )
                return

            # Validate that time is a positive number
            try:
                time = int(time)
                if time < 0:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(
                        json.dumps({"error": "Time must be a positive number"}).encode()
                    )
                    return
            except (ValueError, TypeError):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(
                    json.dumps({"error": "Time must be a valid number"}).encode()
                )
                return

            score = create_score(name, time)
            response = {
                "id": score["id"],
                "name": score["name"],
                "time": score["time"],
                "created_at": str(score["created_at"]),
            }

            self.send_response(201)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
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
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
