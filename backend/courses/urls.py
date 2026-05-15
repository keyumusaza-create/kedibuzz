from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, CourseViewSet, LessonViewSet, 
    EnrollmentViewSet, CertificateViewSet, AnnouncementViewSet,
    AssignmentViewSet, SubmissionViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'list', CourseViewSet)
router.register(r'lessons', LessonViewSet)
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'announcements', AnnouncementViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'submissions', SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
