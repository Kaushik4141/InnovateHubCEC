try:
    import requests  # type: ignore
except ImportError:
    print("[JobScraper] Python package 'requests' not found. Skipping job scraper. Install via: pip install requests")
    raise SystemExit(0)

import re
import time
import os
import json
try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:
    load_dotenv = None

if load_dotenv:
    try:
        load_dotenv()
    except Exception:
        pass

API_KEY = (os.getenv("API_KEY") or "").strip()
BACKEND_URL = (os.getenv("BACKEND_URL") or "http://localhost:8000").rstrip("/")
if not API_KEY:
    print("[JobScraper] Missing API_KEY in environment. Set API_KEY or add it to backend/.env. Skipping job scraper.")
    raise SystemExit(0)
RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
CHECK_INTERVAL = 7200  

SEEN_JOB_IDS = set()


def push_to_backend(items):
    if not items:
        print("[JobScraper] No items to push.")
        return
    if not API_KEY:
        print("[JobScraper] API_KEY not set. Skipping push.")
        return
    url = f"{BACKEND_URL}/api/v1/opportunities/bulk"
    try:
        resp = requests.post(
            url,
            json={"items": items},
            headers={"X-Internal-Token": API_KEY, "Content-Type": "application/json"},
            timeout=30,
        )
        try:
            data = resp.json()
        except Exception:
            data = {"raw": resp.text}
        print(f"[JobScraper] Push result: {resp.status_code} -> {data}")
    except Exception as e:
        print(f"[JobScraper] Failed to push opportunities: {e}")


# ---------------- API CALL ----------------

def extract_details_from_description(desc):
    details = {
        "expected_skills": [],
        "good_to_have": [],
        "buzzwords": [],
        "rounds": None,
        "cutoff": None,
        "topics": []
    }

    if not desc:
        return details

    skills_keywords = [
        "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Ruby", "PHP", "Swift", "Kotlin", "R",
        "React", "Angular", "Vue", "Next.js", "Node.js", "Express", "HTML", "CSS", "Bootstrap", "Tailwind",
        "SQL", "MySQL", "PostgreSQL", "MongoDB", "NoSQL", "Oracle", "Redis",
        "Machine Learning", "Deep Learning", "AI", "TensorFlow", "Keras", "PyTorch",
        "AWS", "Azure", "Google Cloud",
        "Docker", "Kubernetes", "Terraform", "Jenkins", "CI/CD"
    ]
    good_to_have_keywords = ["Leadership", "Communication", "Teamwork", "Problem-solving", "Git"]
    topics_keywords = ["Data Structures", "Algorithms", "OOP", "Database", "Cloud Computing"]

    details["expected_skills"] = [skill for skill in skills_keywords if skill.lower() in desc.lower()]
    details["good_to_have"] = [skill for skill in good_to_have_keywords if skill.lower() in desc.lower()]
    details["topics"] = [topic for topic in topics_keywords if topic.lower() in desc.lower()]

    buzzword_candidates = re.findall(r'\b[A-Z][a-zA-Z0-9]+\b', desc)
    details["buzzwords"] = list(set(buzzword_candidates) - set(details["expected_skills"]))

    rounds_match = re.search(r"(\d+)\s+rounds?", desc, re.IGNORECASE)
    if rounds_match:
        details["rounds"] = rounds_match.group(1)

    cutoff_match = re.search(r"(\d+%|\d+\.\d+ CGPA)", desc, re.IGNORECASE)
    if cutoff_match:
        details["cutoff"] = cutoff_match.group(1)

    return details


# ---------------- API CALL ----------------
def get_opportunities(query: str, num_pages: int = 1, location: str = "India"):
    url = f"https://{RAPIDAPI_HOST}/search"
    headers = {
        "X-RapidAPI-Key": API_KEY.strip(),
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {
        "query": query,
        "page": "1",
        "num_pages": str(num_pages),
        "location": location
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json().get("data", [])
    except Exception as e:
        print(f"❌ Error: {e}")
        return []



def run_job_checker():
    queries = [
    "full stack developer fresher",
    # "backend developer fresher",
    # "frontend developer fresher",
    "software engineer fresher",
    "internship",
    # "graduate trainee",
    "entry level developer"
]


    jobs_data = []
    internships_data = []

    for query in queries:
        print(f"\n🔍 Checking for new jobs with query: {query}\n")
        jobs = get_opportunities(query)

        if not jobs:
            print("No results found.")
            continue

        for item in jobs:
            job_id = item.get("job_id")
            if job_id in SEEN_JOB_IDS:
                continue
            SEEN_JOB_IDS.add(job_id)

            job_title = item.get("job_title", "N/A")
            company = item.get("employer_name", "N/A")
            location = item.get("job_country", "N/A")
            employment_type = item.get("job_employment_type", "N/A")
            remote = "Yes" if item.get("job_is_remote", False) else "No"
            date_posted = (item.get("job_posted_at_datetime_utc") or "N/A")[:10]
            salary_info = item.get("job_salary") or {}
            salary = salary_info.get("salary", "Not specified")
            description = item.get("job_description", "")
            # Clean and truncate description
            description = re.sub(r'\s+', ' ', description).strip()  # Remove extra whitespace
            description = description[:2000] if len(description) > 2000 else description  # Truncate to 2000 chars
            url = item.get("job_apply_link", item.get("job_google_link", "#"))

            extracted = extract_details_from_description(description)

            record = {
                "job_id": job_id,
                "title": job_title,
                "company": company,
                "location": location,
                "employment_type": employment_type,
                "remote": remote,
                "salary": salary,
                "posted_on": date_posted,
                "skills": extracted["expected_skills"],
                "good_to_have": extracted["good_to_have"],
                "topics": extracted["topics"],
                "buzzwords": extracted["buzzwords"],
                "rounds": extracted["rounds"],
                "cutoff": extracted["cutoff"],
                "apply_link": url,
                "description": description
            }

            if employment_type.lower() == "internship":
                internships_data.append(record)
            else:
                jobs_data.append(record)

            print(f"✅ Added: {job_title} @ {company}")

   
    # Combine all items
    items = jobs_data + internships_data
    
    # Send data in smaller batches with delay
    BATCH_SIZE = 5
    for i in range(0, len(items), BATCH_SIZE):
        
        batch = items[i:i + BATCH_SIZE]
        print(f"[JobScraper] Pushing batch {i//BATCH_SIZE + 1} of {(len(items) + BATCH_SIZE - 1)//BATCH_SIZE}")
        push_to_backend(batch)
        time.sleep(2)  # Add delay between batches


if __name__ == "__main__":
    run_job_checker()
