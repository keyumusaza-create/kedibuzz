from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
import datetime

from courses.models import Enrollment, Lesson, Certificate
from challenges.models import ChallengeSubmission
from .models import Streak, Achievement, LearnerAchievement

def update_streak(user):
    # Logic to update learner's Streak object
    streak, created = Streak.objects.get_or_create(learner=user)
    today = timezone.now().date()
    
    if created or not streak.last_activity:
        streak.current_streak = 1
        streak.last_activity = today
        streak.save()
        return

    # If already active today, do nothing
    if streak.last_activity == today:
        return

    # If active exactly yesterday, increment streak
    if streak.last_activity == today - datetime.timedelta(days=1):
        streak.current_streak += 1
        if streak.current_streak > streak.longest_streak:
            streak.longest_streak = streak.current_streak
    else:
        # Streak broken
        streak.current_streak = 1
    
    streak.last_activity = today
    streak.save()

@receiver(post_save, sender=Enrollment)
def track_enrollment_streak(sender, instance, **kwargs):
    if instance.learner:
        update_streak(instance.learner)

@receiver(post_save, sender=ChallengeSubmission)
def track_challenge_streak(sender, instance, **kwargs):
    if instance.learner:
        update_streak(instance.learner)

@receiver(post_save, sender=Enrollment)
def check_course_completion_certificate(sender, instance, **kwargs):
    if instance.is_completed and instance.progress >= 100:
        # Issue a certificate
        Certificate.objects.get_or_create(
            learner=instance.learner,
            course=instance.course,
            defaults={'certificate_id': f"CERT-{instance.learner.id}-{instance.course.id}"}
        )
