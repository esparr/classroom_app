from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("instructor", "Instructor"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"


class Student(models.Model):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="students_created",
    )

    def __str__(self):
        return self.name


class StudentProfile(models.Model):
    student = models.OneToOneField(
        Student, on_delete=models.CASCADE, related_name="profile"
    )
    photo = models.ImageField(
        upload_to="student_photos/", null=True, blank=True
    )
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Profile — {self.student.name}"


class StudentNote(models.Model):
    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="notes"
    )
    instructor = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="student_notes"
    )
    content = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "instructor")

    def __str__(self):
        return f"Note on {self.student.name} by {self.instructor.username}"


class Session(models.Model):
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="sessions"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"Session {self.pk} — {self.started_at:%Y-%m-%d %H:%M}"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ("present", "Present"),
        ("absent", "Absent"),
    ]

    student = models.ForeignKey(
        Student, on_delete=models.CASCADE, related_name="attendance_records"
    )
    session = models.ForeignKey(
        Session, on_delete=models.CASCADE, related_name="attendance_records"
    )
    status = models.CharField(
        max_length=10, choices=STATUS_CHOICES, default="present"
    )
    recorded_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="recorded_attendance",
    )

    class Meta:
        unique_together = ("student", "session")

    def __str__(self):
        return f"{self.student.name} — {self.session} — {self.status}"
