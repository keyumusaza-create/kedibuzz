from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChallengeViewSet, ChallengeCategoryViewSet, ChallengeSubmissionViewSet

router = DefaultRouter()
router.register(r'categories', ChallengeCategoryViewSet)
router.register(r'', ChallengeViewSet)
router.register(r'submissions', ChallengeSubmissionViewSet, basename='challenge-submission')

urlpatterns = [
    path('', include(router.urls)),
]