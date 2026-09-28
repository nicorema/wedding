from http.server import BaseHTTPRequestHandler
import json
import sys
import os
import uuid
import urllib.parse

# Add parent directory to path to import db module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from db import (
    get_photos_by_status,
    create_photo,
    approve_photo,
    delete_photo,
    reorder_photos,
)
from storage import (
    create_signed_upload_url,
    delete_objects,
    serialize_photo,
    is_valid_upload_path,
)

# All photo endpoints share one function: the Hobby plan caps a deployment at
# 12 serverless functions.
#   GET    /api/photos                     approved photos (gallery)
#   GET    /api/photos?status=Pending      photos waiting for review (Manager)
#   POST   /api/photos?action=upload-url   signed URLs to upload a photo + thumb
#   POST   /api/photos                     register an uploaded photo
#   PUT    /api/photos?id={id}             approve
#   PUT    /api/photos?action=reorder      set gallery order from {ids: [...]}
#   DELETE /api/photos?id={id}             reject (deletes row and files)


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())

    def _query_param(self, name):
        query = urllib.parse.urlparse(self.path).query
        return urllib.parse.parse_qs(query).get(name, [None])[0]

    def _photo_id(self):
        photo_id = self._query_param("id") or ""
        return int(photo_id) if photo_id.isdigit() else None

    def do_GET(self):
        try:
            status = self._query_param("status") or "Approved"
            if status not in ("Approved", "Pending"):
                self._send_json(400, {"error": "Invalid status"})
                return

            photos = get_photos_by_status(status)
            self._send_json(200, [serialize_photo(photo) for photo in photos])
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_POST(self):
        try:
            if self._query_param("action") == "upload-url":
                photo_id = uuid.uuid4().hex
                path = f"uploads/{photo_id}.jpg"
                thumb_path = f"uploads/{photo_id}_thumb.jpg"
                self._send_json(
                    200,
                    {
                        "path": path,
                        "thumb_path": thumb_path,
                        "upload_url": create_signed_upload_url(path),
                        "thumb_upload_url": create_signed_upload_url(thumb_path),
                    },
                )
                return

            content_length = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(content_length).decode("utf-8") or "{}")
            path = data.get("path")
            thumb_path = data.get("thumb_path")

            if not (is_valid_upload_path(path) and is_valid_upload_path(thumb_path)):
                self._send_json(400, {"error": "Invalid photo paths"})
                return

            photo = create_photo(path, thumb_path, "Pending")
            self._send_json(201, serialize_photo(photo))
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_PUT(self):
        try:
            if self._query_param("action") == "reorder":
                content_length = int(self.headers.get("Content-Length", 0))
                data = json.loads(
                    self.rfile.read(content_length).decode("utf-8") or "{}"
                )
                ids = data.get("ids")
                if not (
                    isinstance(ids, list) and all(isinstance(i, int) for i in ids)
                ):
                    self._send_json(400, {"error": "ids must be a list of integers"})
                    return

                reorder_photos(ids)
                self._send_json(200, {"message": "Gallery order saved"})
                return

            photo_id = self._photo_id()
            if photo_id is None:
                self._send_json(400, {"error": "Photo ID is required"})
                return

            approve_photo(photo_id)
            self._send_json(200, {"message": "Photo approved"})
        except ValueError as e:
            self._send_json(404, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_DELETE(self):
        try:
            photo_id = self._photo_id()
            if photo_id is None:
                self._send_json(400, {"error": "Photo ID is required"})
                return

            delete_objects(delete_photo(photo_id))
            self._send_json(200, {"message": "Photo deleted successfully"})
        except ValueError as e:
            self._send_json(404, {"error": str(e)})
        except Exception as e:
            self._send_json(500, {"error": str(e), "type": type(e).__name__})

    def do_OPTIONS(self):
        self._send_json(200, {})
