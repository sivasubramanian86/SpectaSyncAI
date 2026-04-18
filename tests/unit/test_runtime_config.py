from unittest.mock import patch

from fastapi.testclient import TestClient

from api.main import app


client = TestClient(app)


def test_runtime_config_js_uses_firebase_env():
    env = {
        "FIREBASE_API_KEY": "api-key",
        "FIREBASE_AUTH_DOMAIN": "project.firebaseapp.com",
        "FIREBASE_PROJECT_ID": "spectasync-prod",
        "FIREBASE_STORAGE_BUCKET": "spectasync-prod.appspot.com",
        "FIREBASE_MESSAGING_SENDER_ID": "123456789",
        "FIREBASE_APP_ID": "1:123456789:web:abcdef",
        "FIREBASE_MEASUREMENT_ID": "G-TEST123",
        "FIREBASE_DATABASE_URL": "https://spectasync-prod-default-rtdb.firebaseio.com",
    }

    with patch.dict("os.environ", env, clear=False):
        response = client.get("/v1/runtime-config.js")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/javascript")
    assert '"firebaseConfigured": true' in response.text
    assert '"apiKey": "api-key"' in response.text


def test_runtime_config_js_handles_missing_firebase_env():
    with patch.dict("os.environ", {}, clear=True):
        response = client.get("/v1/runtime-config.js")

    assert response.status_code == 200
    assert '"firebaseConfigured": false' in response.text
