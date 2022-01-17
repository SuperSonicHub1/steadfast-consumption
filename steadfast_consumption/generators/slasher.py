from datetime import timedelta
from functools import lru_cache
from typing import Optional
from slasher import Slasher
from .common import simplify_segments

def slasher_to_segments(s: Slasher) -> Optional[list]:
	if s.intervals:
		return simplify_segments([[start, start + s.duration.total_seconds()] for start in s.intervals])

@lru_cache
def slasher_from_twitch_id(video_id: int, **kwargs) -> Slasher:
	return Slasher.from_url(f"https://www.twitch.tv/videos/{video_id}", **kwargs)

@lru_cache
def twitch_filter(video_id: int, multiplier: float = 2.0):
	s = slasher_from_twitch_id(video_id)
	s = s.filter(multiplier)
	return (
		s.chat.title,
		{
			"site": "twitch",
			"segments": slasher_to_segments(s),
			"video_id": video_id,
		},
	)

@lru_cache
def twitch_top(video_id: int, segments: int = 10):
	s = slasher_from_twitch_id(video_id, duration=timedelta(minutes=1))
	s = s.top(segments)
	return (
		s.chat.title,
		{
			"site": "twitch",
			"segments": slasher_to_segments(s),
			"video_id": video_id,
		},
	)
