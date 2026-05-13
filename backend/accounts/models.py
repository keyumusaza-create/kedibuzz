import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for KEDI Developer Hub."""

    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('instructor', 'Instructor'),
        ('learner', 'Learner'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='learner')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='accounts_user_groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='accounts_user_permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',
    )


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    @property
    def full_name(self):
        return self.get_full_name()


class InstructorProfile(models.Model):
    """Instructor profile with additional information."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='instructor_profile')
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    qualification = models.CharField(max_length=200, blank=True, null=True)
    hire_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'instructor_profiles'

    def __str__(self):
        return f"Instructor: {self.user.get_full_name()}"


class LearnerProfile(models.Model):
    """Learner profile with additional information."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='learner_profile')
    learner_code = models.CharField(max_length=50, unique=True, blank=True, null=True, db_column='student_id')
    date_of_birth = models.DateField(blank=True, null=True)
    guardian_name = models.CharField(max_length=200, blank=True, null=True, db_column='parent_name')
    guardian_phone = models.CharField(max_length=20, blank=True, null=True, db_column='parent_phone')
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'learner_profiles'

    def __str__(self):
        return f"Learner: {self.user.get_full_name()}"
