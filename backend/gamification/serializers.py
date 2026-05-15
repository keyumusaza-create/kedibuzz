from rest_framework import serializers
from .models import Badge, Achievement, LearnerAchievement, Streak


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'points_required']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'name', 'description', 'achievement_type', 'points', 'icon']


class LearnerAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = LearnerAchievement
        fields = ['id', 'achievement', 'earned_at']


class StreakSerializer(serializers.ModelSerializer):
    class Meta:
        model = Streak
        fields = ['current_streak', 'longest_streak', 'last_activity']