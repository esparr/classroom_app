from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


def _role(user):
    return user.profile.role if hasattr(user, "profile") else None


@api_view(["POST"])
def login(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "role": _role(user),
        }
    )


@api_view(["POST"])
def refresh(request):
    token = request.data.get("refresh")
    if not token:
        return Response(
            {"detail": "Refresh token required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    try:
        refresh_token = RefreshToken(token)
        return Response({"access": str(refresh_token.access_token)})
    except Exception:
        return Response(
            {"detail": "Invalid or expired token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response(
        {
            "id": user.id,
            "username": user.username,
            "role": _role(user),
        }
    )
