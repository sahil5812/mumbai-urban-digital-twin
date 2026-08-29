import sys
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import uvicorn

if __name__ == "__main__":
    print(f"Starting Mumbai Digital Twin from: {CURRENT_DIR}")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
