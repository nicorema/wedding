from flask import Flask, request, jsonify
from flask_cors import CORS
from database import (
    init_db,
    get_best_score,
    create_score,
    get_all_scores,
    get_approved_messages,
    create_message,
    get_all_messages,
    get_pending_messages,
    update_message_status,
    delete_message,
)
import os

app = Flask(__name__)

# Configure CORS to allow requests from frontend
# In production, allow all origins (you can restrict this to your frontend URL)
FRONTEND_URL = os.environ.get("FRONTEND_URL")
is_production = os.environ.get("RENDER") or os.environ.get("PRODUCTION")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://192.168.1.3:5173",
]

# Add production frontend URL if provided
if FRONTEND_URL:
    allowed_origins.append(FRONTEND_URL)

# In production, allow all origins if FRONTEND_URL is not set (for flexibility)
# You can restrict this by setting FRONTEND_URL environment variable
cors_origins = "*" if (is_production and not FRONTEND_URL) else allowed_origins

CORS(
    app,
    resources={
        r"/api/*": {
            "origins": cors_origins,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)

# Initialize database on startup
init_db()


# Add request logging middleware
@app.before_request
def log_request_info():
    print(f"\n=== Request: {request.method} {request.path} ===")
    print(f"Headers: {dict(request.headers)}")
    if request.is_json:
        print(f"JSON Body: {request.get_json()}")


@app.after_request
def log_response_info(response):
    print(f"Response: {response.status_code}")
    return response


@app.route("/api/scores/best", methods=["GET"])
def get_best_time():
    """Gets the best time (lowest score)"""
    try:
        best_score = get_best_score()
        if best_score:
            return (
                jsonify({"bestTime": best_score["time"], "name": best_score["name"]}),
                200,
            )
        else:
            return jsonify({"bestTime": None}), 200
    except Exception as e:
        print(f"Error in get_best_time: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/scores", methods=["POST"])
def submit_score():
    """Creates a new score"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name")
        time = data.get("time")

        if not name or time is None:
            return jsonify({"error": "Name and time are required"}), 400

        # Validate that time is a positive number
        try:
            time = int(time)
            if time < 0:
                return jsonify({"error": "Time must be a positive number"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Time must be a valid number"}), 400

        score = create_score(name, time)
        return (
            jsonify(
                {
                    "id": score["id"],
                    "name": score["name"],
                    "time": score["time"],
                    "created_at": score["created_at"],
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/messages", methods=["GET"])
def get_messages():
    """Gets only messages with Approved status"""
    try:
        messages = get_approved_messages()
        return jsonify(messages), 200
    except Exception as e:
        print(f"Error in get_messages: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/messages", methods=["POST"])
def submit_message():
    """Creates a new message with Pending status"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name")
        message = data.get("message")

        if not name or not message:
            return jsonify({"error": "Name and message are required"}), 400

        # Validate that name and message are not empty
        if not name.strip() or not message.strip():
            return jsonify({"error": "Name and message cannot be empty"}), 400

        new_message = create_message(name.strip(), message.strip())
        return (
            jsonify(
                {
                    "id": new_message["id"],
                    "name": new_message["name"],
                    "message": new_message["message"],
                    "status": new_message["status"],
                    "created_at": new_message["created_at"],
                }
            ),
            201,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/scores", methods=["GET"])
def get_all_scores_endpoint():
    """Gets all scores for ranking (admin only)"""
    try:
        scores = get_all_scores()
        return jsonify(scores), 200
    except Exception as e:
        print(f"Error in get_all_scores_endpoint: {str(e)}")
        import traceback

        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/messages/pending", methods=["GET"])
def get_pending_messages_endpoint():
    """Gets all pending messages (admin only)"""
    try:
        messages = get_pending_messages()
        return jsonify(messages), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/messages/<int:message_id>/status", methods=["PUT"])
def update_message_status_endpoint(message_id):
    """Updates the status of a message (admin only)"""
    try:
        data = request.get_json()
        status = data.get("status")

        if not status:
            return jsonify({"error": "Status is required"}), 400

        valid_statuses = ["Pending", "Approved", "Denied"]
        if status not in valid_statuses:
            return jsonify({"error": f"Status must be one of {valid_statuses}"}), 400

        updated_message = update_message_status(message_id, status)
        return jsonify(updated_message), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/messages/<int:message_id>", methods=["DELETE"])
def delete_message_endpoint(message_id):
    """Deletes a message (admin only)"""
    try:
        delete_message(message_id)
        return jsonify({"message": "Message deleted successfully"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health_check():
    """Endpoint to verify that the server is running"""
    return jsonify({"status": "ok", "message": "Backend is running"}), 200


if __name__ == "__main__":
    port = int(
        os.environ.get("PORT", 5001)
    )  # Changed to 5001 to avoid conflict with AirPlay on macOS
    print(f"Starting Flask server on http://0.0.0.0:{port}")
    print(f"API endpoints available at http://localhost:{port}/api/")
    app.run(debug=True, host="0.0.0.0", port=port)
