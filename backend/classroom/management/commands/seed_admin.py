from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from classroom.models import UserProfile, Student, StudentProfile


class Command(BaseCommand):
    help = "Seed admin, test instructors, and test students"

    def handle(self, *args, **kwargs):
        # Admin
        admin, created = User.objects.get_or_create(username="admin")
        admin.set_password("admin123")
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        UserProfile.objects.get_or_create(
            user=admin, defaults={"role": "admin"}
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"{'Created' if created else 'Updated'}"
                " superuser: admin / admin123 (role: admin)"
            )
        )

        # Instructors
        instructor_data = [
            ("instructor1", "Instructor", "One"),
            ("instructor2", "Instructor", "Two"),
        ]
        for username, first, last in instructor_data:
            user, created = User.objects.get_or_create(username=username)
            user.set_password("instructor123")
            user.first_name = first
            user.last_name = last
            user.save()
            UserProfile.objects.get_or_create(
                user=user, defaults={"role": "instructor"}
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Updated'}"
                    f" instructor: {username} / instructor123"
                )
            )

        # Students
        student_names = [
            "Alice Johnson",
            "Bob Smith",
            "Carlos Rivera",
            "Diana Chen",
            "Ethan Park",
            "Fiona Murphy",
            "George Kim",
            "Hannah Lee",
            "Ivan Torres",
            "Julia Nguyen",
        ]
        for name in student_names:
            student, created = Student.objects.get_or_create(
                name=name, defaults={"created_by": admin}
            )
            StudentProfile.objects.get_or_create(student=student)
            self.stdout.write(
                self.style.SUCCESS(
                    f"{'Created' if created else 'Exists'} student: {name}"
                )
            )

        self.stdout.write(self.style.SUCCESS("\nSeeding complete."))
