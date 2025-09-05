# 

from googleapiclient.discovery import build
import random


YOUTUBE_API_KEY = "add your key"  
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


default_questions = [
    "Write a Python program to reverse a string.",
    "Implement a simple calculator using functions in Python.",
    "Create a Python program to check if a number is prime.",
    "Write a Python program to sort a list of integers.",
    "Implement a Python function to count vowels in a string."
]


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

def generate_question(title):
   
    keywords = title.split()[:5] 
    question = f"Write a Python program demonstrating the concept: {' '.join(keywords)}"
    return question


if __name__ == "__main__":
    playlist_id = input("Enter YouTube Playlist ID: ").strip()
    videos = get_playlist_videos(playlist_id)

    print(f"\nTotal Levels: {len(videos)}\n")
    for level, video in enumerate(videos, start=1):
       
        if random.random() < 0.3:  
            question = random.choice(default_questions)
        else:
            question = generate_question(video['title'])

        print(f"Level {level}: {question}\n")
        print("-" * 50)
