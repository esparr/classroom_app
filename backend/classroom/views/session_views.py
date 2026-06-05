from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from classroom.models import Session
from classroom.serializers import SessionSerializer
from classroom.permissions import IsInstructorOrAdmin


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def create_session(request):
    serializer = SessionSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def list_sessions(request):
    sessions = Session.objects.all().order_by("-started_at")
    serializer = SessionSerializer(sessions, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsInstructorOrAdmin])
def close_session(request, session_id):
    try:
        session = Session.objects.get(pk=session_id)
    except Session.DoesNotExist:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    user = request.user
    is_admin = hasattr(user, "profile") and user.profile.role == "admin"
    if session.created_by != user and not is_admin:
        return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

    if session.ended_at:
        return Response({"detail": "Session already closed."}, status=status.HTTP_400_BAD_REQUEST)

    session.ended_at = timezone.now()
    session.save()
    return Response(SessionSerializer(session).data)
