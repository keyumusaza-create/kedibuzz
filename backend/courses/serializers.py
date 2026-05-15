from rest_framework import serializers
from .models import Category, Course, Module, Lesson, Enrollment, Certificate, Announcement, Assignment, Submission
from accounts.serializers import UserSerializer

class AssignmentSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = Assignment
        fields = ['id', 'course', 'course_title', 'title', 'description', 'due_date', 'points', 'created_at']

class SubmissionSerializer(serializers.ModelSerializer):
    assignment_title = serializers.ReadOnlyField(source='assignment.title')
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')

    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'assignment_title', 'learner', 'learner_name', 'content', 'status', 'score', 'feedback', 'submitted_at', 'reviewed_at']
        read_only_fields = ['learner', 'status', 'score', 'feedback', 'reviewed_at']



class CategorySerializer(serializers.ModelSerializer):
    course_count = serializers.IntegerField(source='courses.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'course_count']

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'order', 'created_at']

class LessonSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    previous_lesson_id = serializers.SerializerMethodField()
    next_lesson_id = serializers.SerializerMethodField()
    resources = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'module', 'course_title', 'title', 'slug', 'content', 'video_url',
            'order', 'is_preview', 'created_at', 'updated_at',
            'previous_lesson_id', 'next_lesson_id', 'resources', 'is_completed',
        ]

    def _progress_threshold(self, obj):
        total_lessons = max(obj.course.lessons.count(), 1)
        return (obj.order / total_lessons) * 100

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

class CourseSerializer(serializers.ModelSerializer):
    instructor = UserSerializer(read_only=True)
    category_name = serializers.ReadOnlyField(source='category.name')
    lesson_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    instructor_name = serializers.ReadOnlyField(source='instructor.full_name')
    is_enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            'id', 'title', 'slug', 'description', 'thumbnail', 'thumbnail_url',
            'category', 'category_name', 'instructor', 'instructor_name',
            'difficulty', 'is_published', 'created_at', 'updated_at',
            'lesson_count', 'is_enrolled', 'progress',
        ]

    def get_lesson_count(self, obj):
        return obj.lessons.count()

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
    modules = serializers.SerializerMethodField()
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

    def get_modules(self, obj):
        return [lesson.title for lesson in obj.lessons.all()]

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
    course_title = serializers.ReadOnlyField(source='course.title')
    learner_name = serializers.ReadOnlyField(source='learner.get_full_name')
    credential_id = serializers.ReadOnlyField(source='certificate_number')

    class Meta:
        model = Certificate
        fields = [
            'id', 'course', 'course_title', 'learner', 'learner_name',
            'issued_at', 'certificate_number', 'credential_id',
        ]

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = Announcement
        fields = [
            'id', 'course', 'course_title', 'author', 'author_name',
            'title', 'content', 'is_global', 'created_at',
        ]
