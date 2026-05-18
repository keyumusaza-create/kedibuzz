from django.db import models
from django.db.models import Q
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import (
    Category, Course, Module, Lesson, Enrollment, Certificate, Announcement, Assignment, Submission, QuizQuestion, QuizAttempt
)
from .bootstrap import ensure_learning_seed_data
from .serializers import (
    CategorySerializer, CourseSerializer, CourseDetailSerializer, ModuleSerializer, LessonSerializer,
    EnrollmentSerializer, CertificateSerializer, AnnouncementSerializer,
    AssignmentSerializer, SubmissionSerializer,
    QuizQuestionSerializer, QuizQuestionDetailSerializer, QuizAttemptSerializer, QuizAnswerSerializer
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
        queryset = Course.objects.select_related('category', 'instructor').prefetch_related('lessons')
        user = self.request.user
        if not user.is_authenticated or user.role == 'learner':
            queryset = queryset.filter(is_published=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(Q(category__slug=category) | Q(category_id=category))
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

    def list(self, request, *args, **kwargs):
        import os, traceback
        logger = __import__('logging').getLogger(__name__)
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            tb = traceback.format_exc()
            backend_dir = os.path.dirname(os.path.dirname(__file__))
            log_path = os.path.join(backend_dir, 'course_view_errors.log')
            try:
                with open(log_path, 'a', encoding='utf-8') as f:
                    f.write(tb + "\n\n")
            except Exception:
                logger.exception('Failed writing error log')
            logger.exception('Unhandled exception in CourseViewSet.list')
            return Response({'detail': 'Internal Server Error', 'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], permission_classes=[IsAdminOrInstructorRole])
    def analytics(self, request, pk=None):
        from django.db.models import Avg, Count, Sum, Q
        course = self.get_object()
        enrollments = Enrollment.objects.filter(course=course)
        total_enrollments = enrollments.count()
        completed = enrollments.filter(is_completed=True).count()
        avg_progress = enrollments.aggregate(Avg('progress'))['progress__avg'] or 0
        submissions = Submission.objects.filter(assignment__course=course)
        pending_submissions = submissions.filter(status='pending').count()
        total_submissions = submissions.count()
        avg_score = submissions.filter(score__isnull=False).aggregate(Avg('score'))['score__avg']
        lesson_count = course.lessons.count()
        assignment_count = course.assignments.count()
        # Weekly enrollment trend (last 7 days)
        from django.utils import timezone
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        weekly_enrollments = enrollments.filter(enrolled_at__gte=week_ago).count()
        recent_activity = []
        recent_subs = submissions.select_related('learner', 'assignment').order_by('-submitted_at')[:5]
        for sub in recent_subs:
            recent_activity.append({
                'user': sub.learner.get_full_name(),
                'action': f'submitted "{sub.assignment.title}"',
                'time': sub.submitted_at.strftime('%d %b %H:%M'),
                'score': sub.score,
                'status': sub.status,
            })
        return Response({
            'course_title': course.title,
            'total_enrollments': total_enrollments,
            'completed_count': completed,
            'completion_rate': round((completed / total_enrollments * 100) if total_enrollments else 0),
            'avg_progress': round(float(avg_progress), 1),
            'pending_submissions': pending_submissions,
            'total_submissions': total_submissions,
            'avg_score': round(float(avg_score), 1) if avg_score else None,
            'lesson_count': lesson_count,
            'assignment_count': assignment_count,
            'weekly_enrollments': weekly_enrollments,
            'recent_activity': recent_activity,
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        from django.utils import timezone
        now = timezone.now()

        if not course.is_published:
            return Response({'detail': 'This course is not available for enrollment yet.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if course.start_date and now < course.start_date:
            return Response({'detail': f'Enrollment opens on {course.start_date.strftime("%d %b %Y")}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if course.end_date and now > course.end_date:
            return Response({'detail': 'Enrollment for this course has closed.'}, status=status.HTTP_400_BAD_REQUEST)

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
        course_id = self.request.query_params.get('course_id')
        queryset = self.queryset.select_related('course')
        user = self.request.user
        if not user.is_authenticated:
            return queryset.none()
        if user.role == 'learner':
            queryset = queryset.filter(
                Q(is_preview=True) | Q(course__enrollments__learner=user)
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
        return Enrollment.objects.filter(learner=self.request.user).select_related('course', 'course__category', 'course__instructor')

    def get_permissions(self):
        return [IsLearnerRole()]

class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CertificateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Certificate.objects.select_related('course', 'learner')
        if getattr(self.request.user, 'role', None) == 'admin':
            return queryset
        return queryset.filter(learner=self.request.user)

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminOrInstructorRole()]

    def get_queryset(self):
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


class QuizQuestionViewSet(viewsets.ModelViewSet):
    """CRUD for quiz questions. Teachers/admins manage questions."""
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminOrInstructorRole()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        lesson_id = self.request.query_params.get('lesson_id')
        queryset = self.queryset.select_related('lesson')
        if lesson_id:
            queryset = queryset.filter(lesson_id=lesson_id)
        return queryset.order_by('order')

    def get_serializer_class(self):
        # For learners, use the safe serializer that hides correct_answer
        user = self.request.user
        if user.is_authenticated and user.role == 'learner':
            return QuizQuestionSerializer
        return QuizQuestionDetailSerializer


class QuizAttemptViewSet(viewsets.ModelViewSet):
    """View and submit quiz attempts."""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        question_id = self.request.query_params.get('question_id')
        lesson_id = self.request.query_params.get('lesson_id')
        queryset = QuizAttempt.objects.filter(learner=user).select_related('question', 'question__lesson')

        if question_id:
            queryset = queryset.filter(question_id=question_id)
        if lesson_id:
            queryset = queryset.filter(question__lesson_id=lesson_id)
        return queryset.order_by('-attempted_at')

    def create(self, request, *args, **kwargs):
        """Submit an answer. Creates or updates the attempt."""
        serializer = QuizAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question_id = request.data.get('question')
        if not question_id:
            return Response({'detail': 'question field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            question = QuizQuestion.objects.get(id=question_id)
        except QuizQuestion.DoesNotExist:
            return Response({'detail': 'Question not found.'}, status=status.HTTP_404_NOT_FOUND)

        selected = serializer.validated_data['answer']
        is_correct = (selected == question.correct_answer)

        attempt, created = QuizAttempt.objects.update_or_create(
            learner=request.user,
            question=question,
            defaults={
                'selected_answer': selected,
                'is_correct': is_correct,
            }
        )

        return Response({
            'id': attempt.id,
            'question': str(question.id),
            'selected_answer': selected,
            'correct_answer': question.correct_answer,
            'is_correct': is_correct,
            'explanation': question.explanation,
            'attempted_at': attempt.attempted_at,
        }, status=status.HTTP_201_OK if created else status.HTTP_200_OK)

    def get_permissions(self):
        return [IsLearnerRole()]
