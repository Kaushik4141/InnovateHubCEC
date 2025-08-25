from flask import Flask, jsonify
import json

app = Flask(__name__)

@app.route("/")
def home():
    return {
        "message": "Welcome to the CEC Hub API 🚀",
        "endpoints": {
            "jobs": "/jobs",
            "internships": "/internships"
        }
    }

@app.route("/jobs")
def get_jobs():
    with open("jobs.json", "r") as f:
        jobs = json.load(f)
    return jsonify(jobs)

@app.route("/internships")
def get_internships():
    with open("internships.json", "r") as f:
        internships = json.load(f)
    return jsonify(internships)

if __name__ == "__main__":
    app.run(debug=True)
