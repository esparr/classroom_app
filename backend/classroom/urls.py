from django.urls import path
from classroom.views.auth_views import login, refresh, me

urlpatterns = [
    path("auth/login/", login),
    path("auth/refresh/", refresh),
    path("auth/me/", me),
]
