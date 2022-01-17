"use strict"

function between(beginning, end, number) {
	return beginning <= number && number <= end
}

class BaseSequencer {
	constructor() {
		this._segmentIndex = -1
	}
	currentSegment() {
		return this.segments[this.segmentIndex()]
	}
	currentBeginning() {
		return this.currentSegment()[0]
	}
	previous() {
		this.segmentIndex(this.segmentIndex() - 1)
	}
	next() {
		this.segmentIndex(this.segmentIndex() + 1)
	}
	segmentIndex(value) {
		if (value === undefined)
			return this._segmentIndex
		else {
			this._segmentIndex = value
			this.currentTime =
				this.segmentIndex() >= this.segments.length
					? this.duration
					: this.currentBeginning()
		}
	}
}

class MediaElementSequencer extends BaseSequencer {
	constructor(segments, mediaElement) {
		super()
		this.segments = segments
		this.mediaElement = mediaElement
	}
	get currentTime() {
		return this.mediaElement.currentTime
	}
	set currentTime(value) {
		this.mediaElement.currentTime = value
	}
	get duration() {
		return this.mediaElement.duration
	}
	play() {
		this.mediaElement.play()
	}
	pause() {
		this.mediaElement.pause()
	}
	connect() {
		const sequencer = this
		this._eventListener = function (e) {
			if (sequencer.segmentIndex() >= sequencer.segments.length)
				return
			if (sequencer.segmentIndex() == -1) {
				sequencer.next()
				return
			}
			const [beginning, end] = sequencer.currentSegment()
			const isBetween = between(beginning, end, sequencer.currentTime)
			if (!isBetween)
				sequencer.next()
		}
		this.mediaElement.addEventListener("timeupdate", this._eventListener)
	}
	disconnect() {
		this.mediaElement.removeEventListener("timeupdate", this._eventListener)
		this._eventListener = undefined
	}
}

class TwitchPlayerSequencer extends BaseSequencer {
	constructor(segments, player) {
		super()
		this.segments = segments
		this.player = player
		this.videoTime = 0
	}
	connect() {
		const sequencer = this
		function timeupdate() {
			if (sequencer.segmentIndex() >= sequencer.segments.length)
				return
			if (sequencer.segmentIndex() == -1) {
				sequencer.next()
				return
			}
			const [beginning, end] = sequencer.currentSegment()
			const isBetween = between(beginning, end, sequencer.currentTime)
			if (!isBetween)
				sequencer.next()
		}
		function updateTime() {
			const oldTime = sequencer.videoTime
			sequencer.videoTime = sequencer.currentTime
			if (sequencer.videoTime !== oldTime)
				timeupdate()
		}
		this.intervalId = setInterval(updateTime, 100)
	}
	disconnect() {
		clearInterval(this.intervalId)
		this.intervalId = undefined
		this.videoTime = 0
	}
	play() {
		this.player.play()
	}
	pause() {
		this.player.pause()
	}
	get currentTime() {
		return this.player.getCurrentTime()
	}
	set currentTime(value) {
		this.player.seek(value)
	}
	get duration() {
		return this.player.getDuration()
	}
}

const data = JSON.parse(document.getElementById("segments").innerText)
const { site, segments } = data

let sequencer

switch (site) {
	case "twitch":
		const embed = new Twitch.Player("twitch-embed", {
			width: "100%",
			height: "auto",
			parent: ["steadfast-consumption.supersonichub1.repl.co"],
			video: data["video_id"],
			muted: true,
			autoplay: false
		})
		sequencer = new TwitchPlayerSequencer(segments, embed)
}

sequencer.connect()
