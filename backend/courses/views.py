from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Category, Course, Module, Lesson, Enrollment, Certificate, Announcement, Assignment, Submission
)
from .bootstrap import ensure_learning_seed_data
from .serializers import (
    CategorySerializer, CourseSerializer, CourseDetailSerializer, ModuleSerializer, LessonSerializer,
    EnrollmentSerializer, CertificateSerializer, AnnouncementSerializer,
    AssignmentSerializer, SubmissionSerializer
)


class IsAdminOrInstructorRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {'admin', 'instructor'}
        )


class IsLearnerRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'learner')


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ensure_learning_seed_data()
        return Category.objects.all().order_by('name')

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        if self.action == 'enroll':
            return [IsLearnerRole()]
        return [IsAdminOrInstructorRole()]

    def get_queryset(self):
        ensure_learning_seed_data()
        queryset = Course.objects.select_related('category', 'instructor').prefetch_related('lessons')
        user = self.request.user
        if not user.is_authenticated or user.role == 'learner':
            queryset = queryset.filter(is_published=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(models.Q(category__slug=category) | models.Q(category_id=category))
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search)
        return queryset.order_by('-created_at')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        if not course.is_published:
            return Response({'detail': 'This course is not available for enrollment yet.'}, status=status.HTTP_400_BAD_REQUEST)
        enrollment, created = Enrollment.objects.get_or_create(
            learner=request.user,
            course=course
        )
        if not created:
            return Response({'detail': 'Already enrolled', 'enrollment': EnrollmentSerializer(enrollment, context={'request': request}).data}, status=status.HTTP_200_OK)
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)

class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrInstructorRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        course_id = self.request.query_params.get('course_id')
        queryset = self.queryset.select_related('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset.order_by('order')

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrInstructorRole()]
        if self.action == 'complete':
            return [IsLearnerRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        ensure_learning_seed_data()
        course_id = self.request.query_params.get('course_id')
        queryset = self.queryset.select_related('course')
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.role == 'learner':
            queryset = queryset.filter(
                models.Q(is_preview=True) | models.Q(course__enrollments__learner=user)
            ).distinct()
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        return queryset

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        if request.user.role != 'learner':
            return Response({'detail': 'Only learners can record lesson completion.'}, status=status.HTTP_403_FORBIDDEN)
        enrollment, _ = Enrollment.objects.get_or_create(learner=request.user, course=lesson.course)
        total_lessons = max(lesson.course.lessons.count(), 1)
        progress = round((lesson.order / total_lessons) * 100, 2)
        certificate_earned = False
        if progress > float(enrollment.progress):
            enrollment.progress = progress
        if progress >= 100:
            enrollment.is_completed = True
            if not enrollment.completed_at:
                from django.utils import timezone
                enrollment.completed_at = timezone.now()
            certificate, created = Certificate.objects.get_or_create(
                enrollment=enrollment,
                defaults={
                    'learner': request.user,
                    'course': lesson.course,
                    'certificate_number': f'KDH-{str(enrollment.id).split("-")[0].upper()}',
                },
            )
            certificate_earned = created
        enrollment.save()
        serializer = self.get_serializer(lesson)
        response_data = serializer.data
        response_data['certificate_earned'] = certificate_earned
        if certificate_earned:
            from .serializers import CertificateSerializer
            response_data['certificate'] = CertificateSerializer(certificate).data
        return Response(response_data)

class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'head', 'options']

    def get_queryset(self):
        ensure_learning_seed_data()
        return Enrollment.objects.filter(learner=self.request.user).select_related('course', 'course__category', 'course__instructor')

    def get_permissions(self):
        return [IsLearnerRole()]

class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Certificate.objects.filter(learner=self.request.user).select_related('course', 'learner')

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminOrInstructorRole()]

    def get_queryset(self):
        ensure_learning_seed_data()
        course_id = self.request.query_params.get('course_id')
        queryset = self.queryset
        if self.request.user.role in {'admin', 'instructor'}:
            queryset = queryset.all()
        else:
            queryset = queryset.filter(is_global=True)
        if course_id:
            return queryset.filter(course_id=course_id).order_by('-created_at')
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrInstructorRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        ensure_learning_seed_data()
        course_id = self.request.query_params.get('course_id')
        queryset = self.queryset.select_related('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
            
        user = self.request.user
        if user.role == 'learner':
            # Learners see assignments for enrolled courses
            queryset = queryset.filter(course__enrollments__learner=user)
        return queryset.distinct().order_by('-created_at')

class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.select_related('assignment', 'learner')
        if user.role == 'learner':
            return queryset.filter(learner=user).order_by('-submitted_at')
        if user.role == 'instructor':
            return queryset.filter(assignment__course__instructor=user).order_by('-submitted_at')
        return queryset.order_by('-submitted_at')

    def perform_create(self, serializer):
        serializer.save(learner=self.request.user)

