from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Category, Course, Module, Lesson, Enrollment, Certificate, Announcement, Assignment, Submission, QuizQuestion, QuizAttempt
from accounts.serializers import UserSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_title', 'title', 'description', 'due_date', 'points', 'created_at']

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

class SubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.SerializerMethodField()
    learner_name = serializers.SerializerMethodField()

    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'assignment_title', 'learner', 'learner_name', 'content', 'status', 'score', 'feedback', 'submitted_at', 'reviewed_at']
        read_only_fields = ['learner', 'status', 'score', 'feedback', 'reviewed_at']

    def get_assignment_title(self, obj):
        return obj.assignment.title if obj.assignment else None

    def get_learner_name(self, obj):
        return obj.learner.get_full_name() if obj.learner else None



class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'course_count']


class LessonSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()
    previous_lesson_id = serializers.SerializerMethodField()
    next_lesson_id = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    module_is_available = serializers.SerializerMethodField()
    module_available_at = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'module', 'course_title', 'title', 'slug', 'content', 'video_url',
            'order', 'is_preview', 'require_video', 'require_resources', 'created_at', 'updated_at',
            'previous_lesson_id', 'next_lesson_id', 'resources', 'is_completed',
            'module_is_available', 'module_available_at',
        ]

    def get_module_is_available(self, obj):
        if not obj.module:
            return True
        # Reuse ModuleSerializer logic ideally, but for simplicity here:
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        if user == obj.course.instructor:
            return True
        enrollment = Enrollment.objects.filter(learner=user, course=obj.course).first()
        if not enrollment:
            return False
        release_date = enrollment.enrolled_at + timedelta(days=obj.module.drip_delay_days)
        return timezone.now() >= release_date

    def get_module_available_at(self, obj):
        if not obj.module:
            return None
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None
        enrollment = Enrollment.objects.filter(learner=user, course=obj.course).first()
        if not enrollment:
            return None
        return enrollment.enrolled_at + timedelta(days=obj.module.drip_delay_days)

    def _progress_threshold(self, obj):
        total_lessons = max(obj.course.lessons.count(), 1)
        return (obj.order / total_lessons) * 100

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def get_previous_lesson_id(self, obj):
        lesson = obj.course.lessons.filter(order__lt=obj.order).order_by('-order').first()
        return str(lesson.id) if lesson else None

    def get_next_lesson_id(self, obj):
        lesson = obj.course.lessons.filter(order__gt=obj.order).order_by('order').first()
        return str(lesson.id) if lesson else None

    def get_resources(self, obj):
        return [
            {"label": "Lesson Notes", "type": "markdown"},
            {"label": "Starter Files", "type": "zip"},
            {"label": "Reference Cheatsheet", "type": "pdf"},
        ]

    def get_is_completed(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated or user.role != 'learner':
            return False
        enrollment = Enrollment.objects.filter(learner=user, course=obj.course).first()
        return bool(enrollment and float(enrollment.progress) >= self._progress_threshold(obj))

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    is_available = serializers.SerializerMethodField()
    available_at = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'order', 'drip_delay_days', 'is_available', 'available_at', 'lessons', 'created_at']

    def get_is_available(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        
        # Instructors see everything in their own course
        if user == obj.course.instructor:
            return True
            
        enrollment = Enrollment.objects.filter(learner=user, course=obj.course).first()
        if not enrollment:
            return False
            
        release_date = enrollment.enrolled_at + timedelta(days=obj.drip_delay_days)
        return timezone.now() >= release_date

    def get_available_at(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None
            
        enrollment = Enrollment.objects.filter(learner=user, course=obj.course).first()
        if not enrollment:
            return None
            
        return enrollment.enrolled_at + timedelta(days=obj.drip_delay_days)

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category_name = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'thumbnail', 'thumbnail_url',
            'category', 'category_name', 'instructor', 'instructor_name',
            'difficulty', 'is_published', 'start_date', 'end_date', 'created_at', 'updated_at',
            'lesson_count', 'is_enrolled', 'progress',
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

    def get_instructor_name(self, obj):
        return obj.instructor.get_full_name() if obj.instructor else None

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail:
            return None
        request = self.context.get('request')
        return request.build_absolute_uri(obj.thumbnail.url) if request else obj.thumbnail.url

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return Enrollment.objects.filter(learner=user, course=obj).exists()

    def get_progress(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return 0
        enrollment = Enrollment.objects.filter(learner=user, course=obj).first()
        return float(enrollment.progress) if enrollment else 0


class CourseDetailSerializer(CourseSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    outcomes = serializers.SerializerMethodField()
    tools = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)
    estimated_duration = serializers.SerializerMethodField()

    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + [
            'lessons', 'outcomes', 'tools', 'modules', 'estimated_duration',
        ]

    def get_outcomes(self, obj):
        return [
            'Build responsive interfaces with modern HTML, CSS, and JavaScript.',
            'Create React experiences with reusable components and stateful flows.',
            'Integrate Python-powered APIs into real product workflows.',
            'Use AI-assisted development methods without losing engineering quality.',
        ]

    def get_tools(self, obj):
        return ['HTML', 'CSS', 'JavaScript', 'React', 'Python', 'REST APIs', 'AI Coding Assistants']

    def get_estimated_duration(self, obj):
        lesson_count = obj.lessons.count()
        return f'{max(lesson_count * 45, 120)} minutes'

class EnrollmentSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'learner', 'course', 'course_details', 'enrolled_at',
            'progress', 'is_completed', 'completed_at',
        ]

class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.SerializerMethodField()
    learner_name = serializers.SerializerMethodField()
    credential_id = serializers.SerializerMethodField()
    verification_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = [
            'id', 'course', 'course_title', 'learner', 'learner_name',
            'issued_at', 'certificate_number', 'credential_id', 'verification_url',
        ]

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None

    def get_learner_name(self, obj):
        return obj.learner.get_full_name() if obj.learner else None

    def get_credential_id(self, obj):
        return obj.certificate_number

    def get_verification_url(self, obj):
        request = self.context.get('request')
        if request:
            base_url = f"{request.scheme}://{request.get_host()}"
            return f"{base_url}/verify/{obj.certificate_number}"
        return f"https://kediscs.app/verify/{obj.certificate_number}"

class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializes quiz question for learners (without exposing correct_answer)."""
    learner_answer = serializers.SerializerMethodField()
    learner_is_correct = serializers.SerializerMethodField()

    class Meta:
        model = QuizQuestion
        fields = ['id', 'lesson', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'order', 'explanation', 'learner_answer', 'learner_is_correct']

    def get_learner_answer(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            try:
                attempt = QuizAttempt.objects.get(learner=user, question=obj)
                return attempt.selected_answer
            except QuizAttempt.DoesNotExist:
                return None
        return None

    def get_learner_is_correct(self, obj):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if user and user.is_authenticated:
            try:
                attempt = QuizAttempt.objects.get(learner=user, question=obj)
                return attempt.is_correct
            except QuizAttempt.DoesNotExist:
                return None
        return None


class QuizAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAttempt
        fields = ['id', 'learner', 'question', 'selected_answer', 'is_correct', 'attempted_at']
        read_only_fields = ['learner', 'is_correct']


class QuizAnswerSerializer(serializers.Serializer):
    """Used for submitting an answer to a single quiz question."""
    answer = serializers.ChoiceField(choices=['A', 'B', 'C', 'D'])


class QuizQuestionDetailSerializer(serializers.ModelSerializer):
    """Used for instructor/admin CRUD - includes correct_answer."""
    class Meta:
        model = QuizQuestion
        fields = '__all__'


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    course_title = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = [
            'id', 'course', 'course_title', 'author', 'author_name',
            'title', 'content', 'is_global', 'created_at',
        ]

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else None

    def get_course_title(self, obj):
        return obj.course.title if obj.course else None