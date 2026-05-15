import uuid
from django.db import models
from django.conf import settings


class ChallengeCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Challenge Categories"

    def __str__(self):
        return self.name


class Challenge(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.ForeignKey(ChallengeCategory, on_delete=models.SET_NULL, null=True, related_name='challenges')
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='medium')
    points = models.IntegerField(default=100)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class ChallengeTestCase(models.Model):
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.JSONField(help_text="Input data for the test case")
    expected_output = models.JSONField(help_text="Expected output for the test case")
    is_hidden = models.BooleanField(default=True, help_text="Hidden tests are not shown to users")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Test case for {self.challenge.title}"


class ChallengeSubmission(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, related_name='submissions')
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='challenge_submissions')
    code = models.TextField()
    language = models.CharField(max_length=50, default='python')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    score = models.IntegerField(null=True, blank=True)
    output = models.TextField(blank=True)
    error_message = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.learner.email} - {self.challenge.title}"