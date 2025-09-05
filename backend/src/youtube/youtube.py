

from googleapiclient.discovery import build

YOUTUBE_API_KEY = "Add youtube API KEY"  
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


playlist_id = "PL-osiE80TeTt2d9bfVyTiXJA-UTHn6WwU" 


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


videos = get_playlist_videos(playlist_id)
for idx, video in enumerate(videos):
    print(f"{idx+1}. {video['title']} (https://youtu.be/{video['id']})")
