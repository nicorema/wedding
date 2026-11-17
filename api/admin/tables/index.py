from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import urllib.parse

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
from db import (
    get_seating,
    create_seating_table,
    setup_seating,
    update_seating_table,
    delete_seating_table,
    set_seats,
)

# All seating endpoints share one function: the Hobby plan caps a deployment
# at 12 serverless functions.
#   GET    /api/admin/tables                seating chart (tables + seats)
#   POST   /api/admin/tables                create a table
#   POST   /api/admin/tables?action=setup   create {table_count} tables
#   PUT    /api/admin/tables?id={id}        rename / move a table
#   PUT    /api/admin/tables?action=seats   save {assignments: [...]}
#   DELETE /api/admin/tables?id={id}        delete a table


class handler(BaseHTTPRequestHandler):
    def _send(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def _send_error(self, e):
        import traceback

        self._send(
            500,
            {
                "error": str(e),
                "type": type(e).__name__,
                "traceback": traceback.format_exc(),
            },
        )

    def _query_param(self, name):
        query = urllib.parse.urlparse(self.path).query
        return urllib.parse.parse_qs(query).get(name, [None])[0]

    def _table_id(self):
        table_id = self._query_param("id") or ""
        return int(table_id) if table_id.isdigit() else None

    def _read_json(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        return json.loads(body.decode("utf-8")) if content_length else {}

    def do_GET(self):
        try:
            self._send(200, get_seating())
        except Exception as e:
            self._send_error(e)

    def do_POST(self):
        try:
            data = self._read_json()

            if self._query_param("action") == "setup":
                table_count = max(1, int(data.get("table_count", 1)))
                self._send(200, setup_seating(table_count))
                return

            name = (data.get("name") or "").strip()
            if not name:
                self._send(400, {"error": "name is required"})
                return

            table = create_seating_table(
                name, int(data.get("x", 0)), int(data.get("y", 0))
            )
            self._send(201, table)
        except Exception as e:
            self._send_error(e)

    def do_PUT(self):
        try:
            data = self._read_json()

            if self._query_param("action") == "seats":
                assignments = data.get("assignments") or []
                if not assignments:
                    self._send(400, {"error": "assignments is required"})
                    return
                self._send(200, set_seats(assignments))
                return

            table_id = self._table_id()
            if table_id is None:
                self._send(400, {"error": "Table ID is required"})
                return

            name = (data.get("name") or "").strip()
            if not name:
                self._send(400, {"error": "name is required"})
                return

            table = update_seating_table(
                table_id, name, int(data.get("x", 0)), int(data.get("y", 0))
            )
            self._send(200, table)
        except ValueError as e:
            self._send(404, {"error": str(e)})
        except Exception as e:
            self._send_error(e)

    def do_DELETE(self):
        try:
            table_id = self._table_id()
            if table_id is None:
                self._send(400, {"error": "Table ID is required"})
                return

            delete_seating_table(table_id)
            self._send(200, {"message": "Table deleted successfully"})
        except ValueError as e:
            self._send(404, {"error": str(e)})
        except Exception as e:
            self._send_error(e)

    def do_OPTIONS(self):
        self._send(200, {})
