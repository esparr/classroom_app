from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from classroom.models import Student, StudentNote, AttendanceRecord
from classroom.serializers import StudentSerializer, StudentNoteSerializer
from classroom.permissions import IsInstructorOrAdmin


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def list_students(request):
    students = Student.objects.filter(is_active=True)
    search = request.query_params.get("search")
    if search:
        students = students.filter(name__icontains=search)
    return Response(StudentSerializer(students, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def student_detail(request, student_id):
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    total = AttendanceRecord.objects.filter(student=student).count()
    present = AttendanceRecord.objects.filter(student=student, status="present").count()
    attendance_pct = round(present / total * 100, 1) if total else 0

    data = StudentSerializer(student).data
    data["attendance_summary"] = {
        "total_sessions": total,
        "sessions_present": present,
        "attendance_percentage": attendance_pct,
    }
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def get_note(request, student_id):
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    note = StudentNote.objects.filter(student=student, instructor=request.user).first()
    if not note:
        return Response({"content": "", "updated_at": None})
    return Response(StudentNoteSerializer(note).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def update_note(request, student_id):
    try:
        student = Student.objects.get(pk=student_id)
    except Student.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    note, _ = StudentNote.objects.get_or_create(student=student, instructor=request.user)
    serializer = StudentNoteSerializer(note, data=request.data, partial=True, context={"request": request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
