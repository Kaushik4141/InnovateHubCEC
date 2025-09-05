import os
import re
import random
from googleapiclient.discovery import build
import google.generativeai as genai


YOUTUBE_API_KEY = "your api"  
GEMINI_API_KEY = "your api"


genai.configure(api_key=GEMINI_API_KEY)


youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)

default_questions = [
    "Write a Python program to reverse a string.",
    "Implement a simple calculator using functions in Python.",
    "Create a Python program to check if a number is prime.",
    "Write a Python program to sort a list of integers.",
    "Implement a Python function to count vowels in a string."
]


def extract_playlist_id(url):
    match = re.search(r"(?:list=)([a-zA-Z0-9_-]+)", url)
    if match:
        return match.group(1)
    return None

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

def generate_question_with_gemini(concept):
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        chat = model.start_chat()

        question_prompt = (
            f"As a helpful coding tutor, create a simple, beginner-level Python coding question "
            f"related to the concept of '{concept}'. "
            f"Also, provide the correct solution and a brief explanation in this format:\n\n"
            f"QUESTION: [The coding question]\n\n"
            f"SOLUTION: [The correct code solution]\n\n"
            f"EXPLANATION: [A brief explanation of the solution]"
        )

        response = chat.send_message(question_prompt)
        response_text = response.text

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

        return question, solution, explanation, chat
    except Exception as e:
        print(f"Error generating question: {e}")
        return random.choice(default_questions), "Refer to Python docs.", "Generic task.", None

def analyze_user_answer(chat, question, solution, user_answer):
    try:
        analysis_prompt = (
            f"The original question was: '{question}'\n"
            f"The correct solution was: '{solution}'\n"
            f"The user's provided solution is: '{user_answer}'\n\n"
            f"Analyze the user's solution. Provide feedback on its correctness, efficiency, and best practices. "
            f"Explain any errors or potential improvements. Be encouraging and helpful."
        )
        analysis_response = chat.send_message(analysis_prompt)
        return analysis_response.text
    except Exception as e:
        return f"Error analyzing answer: {e}"


if __name__ == "__main__":
    playlist_url = input("Enter YouTube Playlist URL: ").strip()
    playlist_id = extract_playlist_id(playlist_url)
    if not playlist_id:
        print("❌ Invalid playlist URL")
        exit()

    videos = get_playlist_videos(playlist_id)
    print(f"\nTotal Levels: {len(videos)}\n")

    for level, video in enumerate(videos, start=1):
        print(f"--- Level {level}: {video['title']} ---")

     
        question, solution, explanation, chat = generate_question_with_gemini(video['title'])

        print(f"\nQUESTION: {question}\n")
        print(f"SOLUTION (hidden from user for now)\nEXPLANATION: {explanation}\n")

        user_answer = input("Enter your solution: ").strip()
        if chat:
            feedback = analyze_user_answer(chat, question, solution, user_answer)
            print(f"\nFeedback: {feedback}\n")
            
            passed = "correct" in feedback.lower() or "well done" in feedback.lower()
            if not passed:
                print("You need to solve this correctly to unlock the next level.")
                break
        else:
            print("AI chat not available. Moving to next level anyway.\n")
