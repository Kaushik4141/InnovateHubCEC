
import requests
import re
import time
import os

try:
    from dotenv import load_dotenv 
except ImportError:  
    load_dotenv = None

if load_dotenv:
    try:
        load_dotenv()
    except Exception:
        pass

API_KEY = os.getenv("API_KEY")



RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
CHECK_INTERVAL = 7200  
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

# ---------------- API CALL ----------------
def get_opportunities(query: str, num_pages: int = 1):
    url = f"https://{RAPIDAPI_HOST}/search"
    headers = {
        "X-RapidAPI-Key": API_KEY.strip(),
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    params = {
        "query": query,
        "page": "1",
        "num_pages": str(num_pages)
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
        "full stack developer",
        "backend developer",
        "frontend developer",
        "software engineer",
        
    ]

    while True:
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
                location = "India" or "india"
                employment_type = item.get("job_employment_type", "N/A")
                remote = "Yes" if item.get("job_is_remote", False) else "No"
                date_posted = (item.get("job_posted_at_datetime_utc") or "N/A")[:10]
                salary_info = item.get("job_salary") or {}
                salary = salary_info.get("salary", "Not specified")
                description = item.get("job_description", "")
                url = item.get("job_apply_link", item.get("job_google_link", "#"))

                extracted = extract_details_from_description(description)


                
                
                print(f"🏢 Company: {company}")
                print(f"🎯 Role: {job_title}")
                print(f"📍 Location: {location}")
                print(f"🕒 Type: {employment_type}")
                print(f"🌐 Remote: {remote}")
                print(f"💰 CTC: {salary}")
                print(f"📅 Posted on: {date_posted}")
                print(f"📌 Expected Skills: {', '.join(extracted['expected_skills']) or 'Not specified'}")
                print(f"✨ Good to Have: {', '.join(extracted['good_to_have']) or 'Not specified'}")
                print(f"📚 Topics: {', '.join(extracted['topics']) or 'Not specified'}")
                print(f"🔍 Buzzwords: {', '.join(extracted['buzzwords']) or 'None'}")
                print(f"🏁 Rounds: {extracted['rounds'] or 'Not specified'}")
                print(f"🎯 Cutoff: {extracted['cutoff'] or 'Not specified'}")
                print(f"🔗 Apply: {url}")
                print("-" * 40)

        print(f"⏳ Waiting {CHECK_INTERVAL/3600} hours before next check...")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    run_job_checker()
# add it to mongodb    
# import requests
# import re
# import time
# import os
# from dotenv import load_dotenv
# from pymongo import MongoClient

# # Load environment variables
# load_dotenv()
# API_KEY = os.getenv("API_KEY")

# # MongoDB connection (use .env to hide credentials)
# MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://<username>:<password>@cluster.mongodb.net/")
# client = MongoClient(MONGO_URI)
# db = client["innovatehub"]
# jobs_collection = db["jobs"]

# RAPIDAPI_HOST = "jsearch.p.rapidapi.com"
# CHECK_INTERVAL = 7200  # every 2 hours
# SEEN_JOB_IDS = set()

# # ---------------- EXTRACTOR ----------------
# def extract_details_from_description(desc):
#     details = {
#         "expected_skills": [],
#         "good_to_have": [],
#         "buzzwords": [],
#         "rounds": None,
#         "cutoff": None,
#         "topics": []
#     }

#     if not desc:
#         return details

#     skills_keywords = [
#         "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "Go", "Ruby", "PHP", "Swift", "Kotlin", "R",
#         "React", "Angular", "Vue", "Next.js", "Node.js", "Express", "HTML", "CSS", "Bootstrap", "Tailwind",
#         "SQL", "MySQL", "PostgreSQL", "MongoDB", "NoSQL", "Oracle", "Redis",
#         "Machine Learning", "Deep Learning", "AI", "TensorFlow", "Keras", "PyTorch",
#         "AWS", "Azure", "Google Cloud",
#         "Docker", "Kubernetes", "Terraform", "Jenkins", "CI/CD"
#     ]
#     good_to_have_keywords = ["Leadership", "Communication", "Teamwork", "Problem-solving", "Git"]
#     topics_keywords = ["Data Structures", "Algorithms", "OOP", "Database", "Cloud Computing"]

#     details["expected_skills"] = [skill for skill in skills_keywords if skill.lower() in desc.lower()]
#     details["good_to_have"] = [skill for skill in good_to_have_keywords if skill.lower() in desc.lower()]
#     details["topics"] = [topic for topic in topics_keywords if topic.lower() in desc.lower()]

#     buzzword_candidates = re.findall(r'\b[A-Z][a-zA-Z0-9]+\b', desc)
#     details["buzzwords"] = list(set(buzzword_candidates) - set(details["expected_skills"]))

#     rounds_match = re.search(r"(\d+)\s+rounds?", desc, re.IGNORECASE)
#     if rounds_match:
#         details["rounds"] = rounds_match.group(1)

#     cutoff_match = re.search(r"(\d+%|\d+\.\d+ CGPA)", desc, re.IGNORECASE)
#     if cutoff_match:
#         details["cutoff"] = cutoff_match.group(1)

#     return details

# # ---------------- API CALL ----------------
# def get_opportunities(query: str, num_pages: int = 1):
#     url = f"https://{RAPIDAPI_HOST}/search"
#     headers = {
#         "X-RapidAPI-Key": API_KEY.strip(),
#         "X-RapidAPI-Host": RAPIDAPI_HOST
#     }
#     params = {
#         "query": query,
#         "page": "1",
#         "num_pages": str(num_pages)
#     }
#     try:
#         response = requests.get(url, headers=headers, params=params)
#         response.raise_for_status()
#         return response.json().get("data", [])
#     except Exception as e:
#         print(f"❌ Error: {e}")
#         return []

# # ---------------- MAIN ----------------
# def run_job_checker():
#     queries = [
#         "full stack developer",
#         "backend developer",
#         "frontend developer",
#         "software engineer",
#     ]

#     while True:
#         for query in queries:
#             print(f"\n🔍 Checking for new jobs with query: {query}\n")
#             jobs = get_opportunities(query)

#             if not jobs:
#                 print("No results found.")
#                 continue

#             for item in jobs:
#                 job_id = item.get("job_id")
#                 if job_id in SEEN_JOB_IDS:
#                     continue
#                 SEEN_JOB_IDS.add(job_id)

#                 job_title = item.get("job_title", "N/A")
#                 company = item.get("employer_name", "N/A")
#                 location = item.get("job_country", "N/A")
#                 employment_type = item.get("job_employment_type", "N/A")
#                 remote = "Yes" if item.get("job_is_remote", False) else "No"
#                 date_posted = (item.get("job_posted_at_datetime_utc") or "N/A")[:10]
#                 salary_info = item.get("job_salary") or {}
#                 salary = salary_info.get("salary", "Not specified")
#                 description = item.get("job_description", "")
#                 url = item.get("job_apply_link", item.get("job_google_link", "#"))

#                 extracted = extract_details_from_description(description)

#                 # Print job
#                 print(f"🏢 Company: {company}")
#                 print(f"🎯 Role: {job_title}")
#                 print(f"📍 Location: {location}")
#                 print(f"🕒 Type: {employment_type}")
#                 print(f"🌐 Remote: {remote}")
#                 print(f"💰 CTC: {salary}")
#                 print(f"📅 Posted on: {date_posted}")
#                 print(f"📌 Expected Skills: {', '.join(extracted['expected_skills']) or 'Not specified'}")
#                 print(f"✨ Good to Have: {', '.join(extracted['good_to_have']) or 'Not specified'}")
#                 print(f"📚 Topics: {', '.join(extracted['topics']) or 'Not specified'}")
#                 print(f"🔍 Buzzwords: {', '.join(extracted['buzzwords']) or 'None'}")
#                 print(f"🏁 Rounds: {extracted['rounds'] or 'Not specified'}")
#                 print(f"🎯 Cutoff: {extracted['cutoff'] or 'Not specified'}")
#                 print(f"🔗 Apply: {url}")
#                 print("-" * 40)

#                 # ✅ Insert into MongoDB
#                 jobs_collection.insert_one({
#                     "job_id": job_id,
#                     "title": job_title,
#                     "company": company,
#                     "location": location,
#                     "employment_type": employment_type,
#                     "remote": remote,
#                     "salary": salary,
#                     "posted_on": date_posted,
#                     "skills": extracted["expected_skills"],
#                     "good_to_have": extracted["good_to_have"],
#                     "topics": extracted["topics"],
#                     "buzzwords": extracted["buzzwords"],
#                     "rounds": extracted["rounds"],
#                     "cutoff": extracted["cutoff"],
#                     "apply_link": url,
#                     "description": description
#                 })

#                 print("✅ Job inserted into MongoDB\n")

#         print(f"⏳ Waiting {CHECK_INTERVAL/3600} hours before next check...")
#         time.sleep(CHECK_INTERVAL)

# if __name__ == "__main__":
#     run_job_checker()

