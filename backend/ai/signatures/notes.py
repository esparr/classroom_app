import dspy


class SummarizeNote(dspy.Signature):
    """Summarize instructor notes about a student into a concise summary."""

    raw_notes: str = dspy.InputField(
        desc="Raw instructor notes about a student"
    )

    summary: str = dspy.OutputField(
        desc="A concise 2-3 sentence summary of the notes"
    )
    key_points: str = dspy.OutputField(
        desc="Comma-separated list of key points from the notes"
    )
