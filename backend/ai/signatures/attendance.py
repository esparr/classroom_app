import dspy


class AttendanceTrend(dspy.Signature):
    """Analyze a student's attendance history and identify trends or concerns."""

    attendance_records: str = dspy.InputField(
        desc="Attendance history as a string, e.g. 'Session 1: present, Session 2: absent, Session 3: present'"
    )

    trend_summary: str = dspy.OutputField(desc="A plain-language summary of the student's attendance trend")
    concern_flag: str = dspy.OutputField(desc="Concern level: 'none', 'low', 'medium', or 'high'")
