from http.server import BaseHTTPRequestHandler
import json
import sys
import os

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import get_best_score


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            best_score = get_best_score()
            if best_score:
                response = {"bestTime": best_score["time"], "name": best_score["name"]}
            else:
                response = {"bestTime": None}

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
