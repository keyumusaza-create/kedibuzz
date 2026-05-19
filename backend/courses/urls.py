from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, CourseViewSet, ModuleViewSet, LessonViewSet, 
    EnrollmentViewSet, CertificateViewSet, AnnouncementViewSet,
    AssignmentViewSet, SubmissionViewSet,
    QuizQuestionViewSet, QuizAttemptViewSet, LessonResourceViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'list', CourseViewSet)
router.register(r'modules', ModuleViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'announcements', AnnouncementViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)
router.register(r'quiz-questions', QuizQuestionViewSet, basename='quiz-question')
router.register(r'quiz-attempts', QuizAttemptViewSet, basename='quiz-attempt')
router.register(r'lesson-resources', LessonResourceViewSet, basename='lesson-resource')

urlpatterns = [
    path('', include(router.urls)),
]
