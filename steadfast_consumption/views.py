from flask import Blueprint, render_template, abort, request
from . import generators

views = Blueprint("views", __name__, url_prefix="/")

@views.route('/')
def index():
	return render_template("index.html")

@views.route('/twitch/filter')
def twitch_filter():
	video_id = request.args.get("video_id")
	multiplier = request.args.get("multiplier")

	try:
		video_id = int(video_id)
		multiplier = float(multiplier)
	except (ValueError, TypeError):
		abort(400)

	title, data = generators.twitch_filter(video_id, multiplier)
	if not data["segments"]:
		# https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/422
		abort(422)

	return render_template("player.html", title=title, data=data, type="Twitch Filter")
