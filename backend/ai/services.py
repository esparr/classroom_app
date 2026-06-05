from ai.modules.fuzzy_matcher import FuzzyMatcher
from ai.modules.note_summarizer import NoteSummarizer
from ai.modules.attendance_trend import AttendanceTrendAnalyzer

_fuzzy_matcher = FuzzyMatcher()
_note_summarizer = NoteSummarizer()
_attendance_trend = AttendanceTrendAnalyzer()


def match_name(spoken_name: str, candidate_names: list[str]) -> dict:
    candidates = ", ".join(candidate_names)
    result = _fuzzy_matcher(spoken_name=spoken_name, candidate_names=candidates)
    return {
        "best_match": result.best_match,
        "confidence": result.confidence,
        "reasoning": result.reasoning,
    }


def summarize_note(note_content: str) -> dict:
    result = _note_summarizer(raw_notes=note_content)
    return {
        "summary": result.summary,
        "key_points": [kp.strip() for kp in result.key_points.split(",") if kp.strip()],
    }


def get_attendance_trend(records_list: list[dict]) -> dict:
    records_str = ", ".join(
        f"Session {r.get('session', i + 1)}: {r.get('status', 'unknown')}"
        for i, r in enumerate(records_list)
    )
    result = _attendance_trend(attendance_records=records_str)
    return {
        "trend_summary": result.trend_summary,
        "concern_flag": result.concern_flag,
    }
