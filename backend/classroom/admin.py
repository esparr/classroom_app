from django.contrib import admin
from .models import UserProfile, Student, StudentProfile, StudentNote, Session, AttendanceRecord


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role",)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("name", "is_active", "created_by", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("student",)
    search_fields = ("student__name",)


@admin.register(StudentNote)
class StudentNoteAdmin(admin.ModelAdmin):
    list_display = ("student", "instructor", "updated_at")
    search_fields = ("student__name", "instructor__username")


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ("pk", "created_by", "started_at", "ended_at", "description")
    list_filter = ("created_by",)


@admin.register(AttendanceRecord)
class AttendanceRecordAdmin(admin.ModelAdmin):
    list_display = ("student", "session", "status", "recorded_by")
    list_filter = ("status",)
    search_fields = ("student__name",)
