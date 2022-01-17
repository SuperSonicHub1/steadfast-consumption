def between(start, end, value):
	return start <= value and value <= end

def simplify_segments(segments):
	"""
	Stops stuttering through connecting adjacent segments.
	[[1, 2], [2, 3]] => [[1, 3]]
	"""
	new_segments = []
	for ((start, end), (second_start, second_end)) in zip(segments,
segments[1:]):
		if new_segments and between(*new_segments[-1], start):
			continue
		if end == second_start:
			new_segment = [start, second_end]
		else:
			new_segment = [start, end]
		new_segments.append(new_segment)
	# Handle last segment
	if new_segments[-1][1] == segments[-1][0]:
		new_segments[-1][1] = segments[-1][1]
	return new_segments

