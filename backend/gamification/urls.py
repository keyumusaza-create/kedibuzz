from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BadgeViewSet, AchievementViewSet, LearnerAchievementViewSet, StreakViewSet

router = DefaultRouter()
router.register(r'badges', BadgeViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'my-achievements', LearnerAchievementViewSet, basename='my-achievements')
router.register(r'streak', StreakViewSet, basename='streak')

urlpatterns = [
    path('', include(router.urls)),
]