import difflib
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from classroom.models import Session, Student, AttendanceRecord
from classroom.serializers import AttendanceRecordSerializer
from classroom.permissions import IsInstructorOrAdmin


def _fuzzy_match(name, roster):
    """Return the best-matching Student for name, or None if below cutoff."""
    name_map = {s.name.lower(): s for s in roster}
    matches = difflib.get_close_matches(name.lower(), name_map.keys(), n=1, cutoff=0.7)
    return name_map[matches[0]] if matches else None


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def bulk_attendance(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    names = request.data.get("names", [])
    if not isinstance(names, list):
        return Response({"detail": "'names' must be a list of strings."}, status=status.HTTP_400_BAD_REQUEST)

    roster = list(Student.objects.filter(is_active=True))
    matched, created_students = [], []

    for name in names:
        student = _fuzzy_match(name, roster)
        if student:
            matched.append(student.name)
        else:
            student = Student.objects.create(name=name, created_by=request.user)
            roster.append(student)
            created_students.append(student.name)

        AttendanceRecord.objects.update_or_create(
            student=student,
            session=session,
            defaults={"status": "present", "recorded_by": request.user},
        )

    all_records = AttendanceRecord.objects.filter(session=session).select_related("student", "recorded_by")
    return Response({
        "matched": matched,
        "created": created_students,
        "attendance": AttendanceRecordSerializer(all_records, many=True).data,
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def list_attendance(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    records = AttendanceRecord.objects.filter(session=session).select_related("student", "recorded_by")
    return Response(AttendanceRecordSerializer(records, many=True).data)
