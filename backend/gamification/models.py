import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class Badge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=50, default='award')
    points_required = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('course_complete', 'Course Completed'),
        ('challenge_solved', 'Challenge Solved'),
        ('streak_days', 'Streak Days'),
        ('points_earned', 'Points Earned'),
        ('forum_post', 'Forum Post'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    achievement_type = models.CharField(max_length=30, choices=ACHIEVEMENT_TYPES)
    points = models.IntegerField(default=10)
    icon = models.CharField(max_length=50, default='star')

    def __str__(self):
        return self.name


class LearnerAchievement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    learner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('learner', 'achievement')

    def __str__(self):
        return f"{self.learner.email} - {self.achievement.name}"


class Streak(models.Model):
    learner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='streak')
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_activity = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.learner.email}'s streak"