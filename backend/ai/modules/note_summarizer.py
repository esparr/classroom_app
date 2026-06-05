import dspy
from ai.signatures.notes import SummarizeNote


class NoteSummarizer(dspy.Module):
    def __init__(self):
        super().__init__()
        self.summarize = dspy.ChainOfThought(SummarizeNote)

    def forward(self, raw_notes):
        return self.summarize(raw_notes=raw_notes)
