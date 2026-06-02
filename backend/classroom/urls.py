from django.urls import path
from classroom.views.auth_views import login, refresh, me
from classroom.views.session_views import (
    create_session, list_sessions, close_session,
)
from classroom.views.attendance_views import bulk_attendance, list_attendance
from classroom.views.student_views import (
    list_students, student_detail,
    get_note, update_note,
    summarize_student_note, student_attendance_trend,
    student_attendance_history, deactivate_student,
)
from classroom.views.admin_views import dashboard

urlpatterns = [
    # Auth
    path("auth/login/", login),
    path("auth/refresh/", refresh),
    path("auth/me/", me),

    # Sessions
    path("sessions/", list_sessions),
    path("sessions/create/", create_session),
    path("sessions/<int:session_id>/close/", close_session),

    # Attendance
    path("sessions/<int:session_id>/attendance/", list_attendance),
    path("sessions/<int:session_id>/attendance/bulk/", bulk_attendance),

    # Students
    path("students/", list_students),
    path("students/<int:student_id>/", student_detail),
    path("students/<int:student_id>/note/", get_note),
    path("students/<int:student_id>/note/update/", update_note),
    path("students/<int:student_id>/attendance/", student_attendance_history),
    path("students/<int:student_id>/deactivate/", deactivate_student),
    path(
        "students/<int:student_id>/summarize-note/",
        summarize_student_note,
    ),
    path(
        "students/<int:student_id>/attendance-trend/",
        student_attendance_trend,
    ),

    # Admin
    path("admin/dashboard/", dashboard),
]
