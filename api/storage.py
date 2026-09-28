import os
import json
import urllib.request

BUCKET = "photos"


def get_supabase_url():
    """Derives the project URL from the DB host (db.<ref>.supabase.co)"""
    host = os.environ.get("SUPABASE_DB_HOST", "")
    if not (host.startswith("db.") and host.endswith(".supabase.co")):
        raise ValueError("SUPABASE_DB_HOST must look like db.<ref>.supabase.co")
    return f"https://{host[len('db.'):]}"


def _storage_request(method, path, body=None):
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not key:
        raise ValueError("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")

    request = urllib.request.Request(
        f"{get_supabase_url()}/storage/v1{path}",
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read().decode() or "null")


def create_signed_upload_url(object_path):
    """Returns a URL the browser can PUT the file to directly (valid 2 hours)"""
    data = _storage_request("POST", f"/object/upload/sign/{BUCKET}/{object_path}")
    return f"{get_supabase_url()}/storage/v1{data['url']}"


def delete_objects(object_paths):
    _storage_request("DELETE", f"/object/{BUCKET}", {"prefixes": object_paths})


def get_public_url(object_path):
    return f"{get_supabase_url()}/storage/v1/object/public/{BUCKET}/{object_path}"


def serialize_photo(photo):
    return {
        "id": photo["id"],
        "url": get_public_url(photo["path"]),
        "thumb_url": get_public_url(photo["thumb_path"]),
        "created_at": str(photo["created_at"]),
    }


def is_valid_upload_path(object_path):
    """Only accept paths minted by the upload-url endpoint"""
    return (
        isinstance(object_path, str)
        and object_path.startswith("uploads/")
        and object_path.endswith(".jpg")
        and ".." not in object_path
    )
