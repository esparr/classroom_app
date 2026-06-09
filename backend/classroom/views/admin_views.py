from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from classroom.models import Session, Student, AttendanceRecord
from classroom.permissions import IsAdminRole


@api_view(["GET"])
@permission_classes([IsAdminRole])
def dashboard(request):
    total_sessions = Session.objects.count()
    total_students = Student.objects.filter(is_active=True).count()

    # Top 10 attendees by present count
    top_attendees = (
        AttendanceRecord.objects.filter(status="present")
        .values("student__id", "student__name")
        .annotate(sessions_attended=Count("id"))
        .order_by("-sessions_attended")[:10]
    )

    # Students below 50% attendance (minimum 1 session recorded)
    all_students = Student.objects.filter(is_active=True)
    low_attendance = []
    for student in all_students:
        total = student.attendance_records.count()
        if total == 0:
            continue
        present = student.attendance_records.filter(status="present").count()
        pct = present / total * 100
        if pct < 50:
            low_attendance.append(
                {
                    "id": student.id,
                    "name": student.name,
                    "attendance_percentage": round(pct, 1),
                }
            )

    # Per-instructor session counts
    instructor_counts = (
        Session.objects.values("created_by__id", "created_by__username")
        .annotate(session_count=Count("id"))
        .order_by("-session_count")
    )

    return Response(
        {
            "total_sessions": total_sessions,
            "total_students": total_students,
            "top_attendees": list(top_attendees),
            "low_attendance_students": low_attendance,
            "sessions_per_instructor": list(instructor_counts),
        }
    )
