from rest_framework import serializers
from .models import (
    Student,
    StudentProfile,
    StudentNote,
    Session,
    AttendanceRecord,
)


class StudentSerializer(serializers.ModelSerializer):
    total_sessions_attended = serializers.SerializerMethodField()

    class Meta:
        model = Student
        fields = [
            "id",
            "name",
            "is_active",
            "created_at",
            "created_by",
            "total_sessions_attended",
        ]
        read_only_fields = ["created_at", "created_by"]

    def get_total_sessions_attended(self, obj):
        return obj.attendance_records.filter(status="present").count()


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ["photo", "bio"]


class StudentNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentNote
        fields = ["content", "updated_at"]
        read_only_fields = ["updated_at"]

    def create(self, validated_data):
        validated_data["instructor"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop("instructor", None)
        return super().update(instance, validated_data)


class SessionSerializer(serializers.ModelSerializer):
    attendance_count = serializers.SerializerMethodField()

    class Meta:
        model = Session
        fields = [
            "id",
            "created_by",
            "started_at",
            "ended_at",
            "description",
            "attendance_count",
        ]
        read_only_fields = ["created_by", "started_at"]

    def get_attendance_count(self, obj):
        return obj.attendance_records.filter(status="present").count()


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    recorded_by_username = serializers.CharField(
        source="recorded_by.username", read_only=True, default=None
    )

    class Meta:
        model = AttendanceRecord
        fields = ["id", "student_name", "status", "recorded_by_username"]
