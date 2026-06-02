import dspy
from ai.signatures.name_match import FuzzyNameMatch


class FuzzyMatcher(dspy.Module):
    def __init__(self):
        super().__init__()
        self.match = dspy.ChainOfThought(FuzzyNameMatch)

    def forward(self, spoken_name, candidate_names):
        return self.match(spoken_name=spoken_name, candidate_names=candidate_names)
