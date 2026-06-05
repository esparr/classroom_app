import dspy
from ai.signatures.attendance import AttendanceTrend


class AttendanceTrendAnalyzer(dspy.Module):
    def __init__(self):
        super().__init__()
        self.analyze = dspy.ChainOfThought(AttendanceTrend)

    def forward(self, attendance_records):
        return self.analyze(attendance_records=attendance_records)
