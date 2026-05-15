from rest_framework import viewsets, permissions
from .models import Badge, Achievement, LearnerAchievement, Streak
from .serializers import BadgeSerializer, AchievementSerializer, LearnerAchievementSerializer, StreakSerializer


class BadgeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [permissions.IsAuthenticated]


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]


class LearnerAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LearnerAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LearnerAchievement.objects.filter(learner=self.request.user).select_related('achievement')


class StreakViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = StreakSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Streak.objects.filter(learner=self.request.user)