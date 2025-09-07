import re
import random
from googleapiclient.discovery import build
from openai import OpenAI 


YOUTUBE_API_KEY = "YOUR API KEY"  
DEEPSEEK_API_KEY = "YOUR API KEY"


deepseek_client = OpenAI(
    api_key=DEEPSEEK_API_KEY,
    base_url="https://api.deepseek.com/v1", 
)

youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

default_questions = [
    "Write a Python program to reverse a string.",
    "Implement a simple calculator using functions in Python.",
    "Create a Python program to check if a number is prime.",
    "Write a Python program to sort a list of integers.",
    "Implement a Python function to count vowels in a string."
]

default_hints = [
    "Think about using a loop.",
    "Consider Python built-in functions.",
    "Try breaking the problem into smaller steps.",
    "Use a list or string method.",
    "Check conditional statements."
]


def extract_playlist_id(url):
    match = re.search(r"(?:list=)([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    return None

def extract_video_id(url):
    match = re.search(r"(?:v=|youtu\.be/)([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    return None

def get_video_title(video_id):
    request = youtube.videos().list(part="snippet", id=video_id)
    response = request.execute()
    if response["items"]:
        return response["items"][0]["snippet"]["title"]
    return "Untitled Video"

def get_playlist_videos(playlist_id):
    videos = []
    request = youtube.playlistItems().list(
        part="snippet",
        playlistId=playlist_id,
        maxResults=50
    )
    while request:
        response = request.execute()
        for item in response['items']:
            video_id = item['snippet']['resourceId']['videoId']
            title = item['snippet']['title']
            videos.append({'id': video_id, 'title': title})
        request = youtube.playlistItems().list_next(request, response)
    return videos

def ask_deepseek(prompt, model="deepseek-chat"):
    """Sends a prompt to the DeepSeek API and returns the response."""
    try:
        response = deepseek_client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            stream=False
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"An error occurred: {e}"


playlist_or_video_url = input("Enter YouTube Playlist or Video URL: ").strip()

playlist_id = extract_playlist_id(playlist_or_video_url)
if playlist_id:
  
    videos = get_playlist_videos(playlist_id)
else:
 
    video_id = extract_video_id(playlist_or_video_url)
    title = get_video_title(video_id)
    videos = [{'id': video_id, 'title': title}]

print(f"\nTotal Levels: {len(videos)}\n")

for level, video in enumerate(videos, start=1):
    print(f"--- Level {level}: {video['title']} ---")

    try:
        question_prompt = (
            f"Create a programming question based on the video title '{video['title']}'. "
            f"Provide the QUESTION, SOLUTION, and EXPLANATION in this exact format:\n\n"
            f"QUESTION: [your question here]\nSOLUTION: [your solution here]\nEXPLANATION: [your explanation here]"
        )
        
        response_text = ask_deepseek(question_prompt)

     
        q_start = response_text.find("QUESTION:")
        s_start = response_text.find("SOLUTION:")
        e_start = response_text.find("EXPLANATION:")

        if q_start != -1 and s_start != -1 and e_start != -1:
            question = response_text[q_start + len("QUESTION:"):s_start].strip()
            solution = response_text[s_start + len("SOLUTION:"):e_start].strip()
            explanation = response_text[e_start + len("EXPLANATION:"):].strip()
        else:
       
            question = random.choice(default_questions)
            solution = "Refer to Python documentation."
            explanation = "This is a generic coding task."

        print(f"\nQUESTION: {question}\n")
        print(f"SOLUTION (hidden for now)\nEXPLANATION: {explanation}\n")

        user_answer = input("Enter your solution: ").strip()
        
      
        feedback_prompt = (
            f"The original question was: '{question}'\n"
            f"The correct solution: '{solution}'\n"
            f"User solution: '{user_answer}'\n"
            f"Provide feedback on correctness, efficiency, and improvements. "
            f"Be constructive and helpful for learning."
        )
        
        feedback = ask_deepseek(feedback_prompt)
        print(f"\nFeedback: {feedback}\n")

        passed = "correct" in feedback.lower() or "well done" in feedback.lower() or "good" in feedback.lower()
        if passed:
            print("✅ Great job! Moving to next level...\n")
        else:
            print("❌ You need to solve this correctly to unlock the next level.")
            break

    except Exception as e:
        print(f"Error generating question: {e}")
        break

print("Challenge completed! 🎉")