import requests
import re
import os
from dotenv import load_dotenv


load_dotenv()
API_KEY = (os.getenv("API_KEY") or "").strip()
if not API_KEY:
    print("❌ Missing API_KEY in .env file")
    raise SystemExit(0)

RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
SEEN_JOB_IDS = set()


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



def get_opportunities(query: str, num_pages: int = 1, location: str = "India"):
    url = f"https://{RAPIDAPI_HOST}/search"
    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {
        "query": query,
        "page": "1",
        "num_pages": str(num_pages),
        "country": "in",  
        "location": location
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        jobs = data.get("data", [])
        print(f"📊 API returned {len(jobs)} jobs for query='{query}' in location='{location}'")
        return jobs
    except Exception as e:
        print(f"❌ Error fetching jobs: {e}")
        return []



def run_job_checker():
    queries = ["full stack developer"]

    for query in queries:
        print(f"\n🔍 Searching jobs for: {query}\n")
        jobs = get_opportunities(query, num_pages=1, location="India")

        if not jobs:
            print("⚠️ No results found.")
            continue

        for item in jobs:
            job_id = item.get("job_id")
            if job_id in SEEN_JOB_IDS:
                continue
            SEEN_JOB_IDS.add(job_id)

            job_title = item.get("job_title", "N/A")
            company = item.get("employer_name", "N/A")
            location = item.get("job_country", "N/A")
            remote = "Yes" if item.get("job_is_remote", False) else "No"
            apply_link = item.get("job_apply_link", item.get("job_google_link", "#"))

            print(f"✅ {job_title} @ {company}")
            print(f"   📍 Location: {location} | Remote: {remote}")
            print(f"   🔗 Apply here: {apply_link}\n")


if __name__ == "__main__":
    run_job_checker()
