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
BACKEND_URL = (os.getenv("BACKEND_URL") or os.getenv("API_BASE_URL") ).rstrip("/")
SCRAPER_TOKEN = (os.getenv("SCRAPER_TOKEN") or "").strip()


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


def _compose_description(item: dict) -> str:
    """Build a human-readable description from raw fields."""
    description = item.get("job_description") or ""
    if description:
        return description
    highlights = item.get("job_highlights") or {}
    quals = highlights.get("Qualifications") or []
    resp = highlights.get("Responsibilities") or []
    lines = []
    if quals:
        lines.append("Qualifications:")
        lines.extend(quals)
        lines.append("")
    if resp:
        lines.append("Responsibilities:")
        lines.extend(resp)
    return "\n".join(lines).strip()


def build_opportunity(item: dict) -> dict:
    """Map RapidAPI job item to our Opportunity schema payload."""
    job_id = item.get("job_id")
    title = item.get("job_title", "N/A")
    company = item.get("employer_name", "N/A")
    city = item.get("job_city") or ""
    country = item.get("job_country") or ""
    location = ", ".join([p for p in [city, country] if p]) or (item.get("job_country") or "N/A")
    employment_type = item.get("job_employment_type") or item.get("job_employment_type")
    remote = "Yes" if item.get("job_is_remote", False) else "No"
    apply_link = item.get("job_apply_link") or item.get("job_google_link") or "#"
    posted_on = item.get("job_posted_at_datetime_utc") or item.get("job_posted_at_timestamp")
    salary = None
    if item.get("job_min_salary") or item.get("job_max_salary"):
        currency = item.get("job_salary_currency") or ""
        min_s = item.get("job_min_salary")
        max_s = item.get("job_max_salary")
        # Format like: 50000-80000 USD (if available)
        left = str(min_s) if min_s is not None else ""
        right = str(max_s) if max_s is not None else ""
        range_part = f"{left}-{right}".strip("-")
        salary = (range_part + (f" {currency}" if currency else "")).strip()

    description = _compose_description(item)
    details = extract_details_from_description(description or "")

    return {
        "job_id": job_id,
        "title": title,
        "company": company,
        "location": location,
        "employment_type": employment_type,
        "remote": remote,
        "salary": salary,
        "posted_on": posted_on,
        "skills": details.get("expected_skills", []),
        "good_to_have": details.get("good_to_have", []),
        "topics": details.get("topics", []),
        "buzzwords": details.get("buzzwords", []),
        "rounds": details.get("rounds"),
        "cutoff": details.get("cutoff"),
        "apply_link": apply_link,
        "description": description,
    }


def send_to_backend(items: list) -> bool:
    """Bulk upsert opportunities into the Node backend."""
    if not items:
        print("ℹ️ No new items to send to backend.")
        return True
    if not SCRAPER_TOKEN:
        print("⚠️ SCRAPER_TOKEN missing in .env; skipping POST to backend.")
        return False
    url = f"{BACKEND_URL}/api/v1/opportunities/bulk"
    try:
        resp = requests.post(
            url,
            json={"items": items},
            headers={
                "X-Internal-Token": SCRAPER_TOKEN,
                "Content-Type": "application/json",
            },
            timeout=30,
        )
        ok = 200 <= resp.status_code < 300
        preview = resp.text[:300].replace("\n", " ")
        print(f"⬆️ Sent {len(items)} items to backend -> {resp.status_code} {preview}")
        return ok
    except Exception as e:
        print(f"❌ Error posting to backend: {e}")
        return False


def run_job_checker():
    queries = ["full stack developer"]

    for query in queries:
        print(f"\n🔍 Searching jobs for: {query}\n")
        jobs = get_opportunities(query, num_pages=1, location="India")

        if not jobs:
            print("⚠️ No results found.")
            continue

        items_to_send = []
        for item in jobs:
            job_id = item.get("job_id")
            if not job_id or job_id in SEEN_JOB_IDS:
                continue
            SEEN_JOB_IDS.add(job_id)

            # Pretty print to terminal
            job_title = item.get("job_title", "N/A")
            company = item.get("employer_name", "N/A")
            loc_city = item.get("job_city") or ""
            loc_country = item.get("job_country") or "N/A"
            loc_display = ", ".join([p for p in [loc_city, loc_country] if p]) or loc_country
            remote = "Yes" if item.get("job_is_remote", False) else "No"
            apply_link = item.get("job_apply_link") or item.get("job_google_link") or "#"

            # print(f"✅ {job_title} @ {company}")
            # print(f"   📍 Location: {loc_display} | Remote: {remote}")
            # print(f"   🔗 Apply here: {apply_link}\n")

          
            mapped = build_opportunity(item)
            if mapped.get("job_id"):
                items_to_send.append(mapped)

   
        if items_to_send:
            ok = send_to_backend(items_to_send)
            if not ok:
                print("⚠️ Backend upsert failed; items were not persisted.")


if __name__ == "__main__":
    run_job_checker()
