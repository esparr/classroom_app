import dspy


class FuzzyNameMatch(dspy.Signature):
    """Match a spoken name against a list of candidate names from the roster."""

    spoken_name: str = dspy.InputField(desc="The name as spoken or written by the instructor")
    candidate_names: str = dspy.InputField(desc="Comma-separated list of known student names")

    best_match: str = dspy.OutputField(desc="The best matching name from the candidate list, or empty string if none")
    confidence: str = dspy.OutputField(desc="Confidence level: 'high', 'medium', or 'low'")
    reasoning: str = dspy.OutputField(desc="Brief explanation of why this match was chosen")
