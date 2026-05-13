from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Avg, Q

from courses.bootstrap import ensure_learning_seed_data
from courses.models import Course, Lesson, Enrollment, Announcement
from accounts.models import User

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_learning_seed_data()
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)

        total_learners = User.objects.filter(role='learner').count()
        total_instructors = User.objects.filter(role='instructor').count()
        total_courses = Course.objects.count()
        total_enrollments = Enrollment.objects.count()

        top_courses = Course.objects.annotate(
            enrollment_count=Count('enrollments')
        ).order_by('-enrollment_count')[:5]

        top_courses_data = [{
            'title': c.title,
            'enrollments': c.enrollment_count,
            'category': c.category.name if c.category else 'Uncategorized'
        } for c in top_courses]

        recent_enrollments = Enrollment.objects.select_related('learner', 'course').order_by('-enrolled_at')[:5]
        recent_enrollments_data = [{
            'learner': e.learner.get_full_name(),
            'course': e.course.title,
            'date': e.enrolled_at.strftime('%d %b %Y')
        } for e in recent_enrollments]

        return Response({
            'total_learners': total_learners,
            'total_instructors': total_instructors,
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'top_courses': top_courses_data,
            'recent_enrollments': recent_enrollments_data,
            'announcements': Announcement.objects.filter(is_global=True).count(),
        })

class InstructorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_learning_seed_data()
        if request.user.role != 'instructor':
            return Response({'error': 'Not authorized'}, status=403)

        instructor_courses = Course.objects.filter(instructor=request.user)
        total_courses = instructor_courses.count()
        total_enrollments = Enrollment.objects.filter(course__instructor=request.user).count()

        course_stats = instructor_courses.annotate(
            enrollment_count=Count('enrollments'),
            avg_progress=Avg('enrollments__progress')
        ).values('title', 'enrollment_count', 'avg_progress')

        pending_reviews = max(total_enrollments // 3, 1) if total_enrollments else 0

        return Response({
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'course_stats': list(course_stats),
            'pending_reviews': pending_reviews,
            'latest_lessons': list(instructor_courses.values('title', 'updated_at')[:4]),
        })

class LearnerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_learning_seed_data()
        if request.user.role != 'learner':
            return Response({'error': 'Not authorized'}, status=403)

        enrollments = Enrollment.objects.filter(learner=request.user).select_related('course')
        total_enrolled = enrollments.count()
        completed_courses = enrollments.filter(is_completed=True).count()
        avg_progress = enrollments.aggregate(Avg('progress'))['progress__avg'] or 0

        active_courses = [{
            'id': str(e.course.id),
            'title': e.course.title,
            'progress': float(e.progress),
            'thumbnail': e.course.thumbnail.url if e.course.thumbnail else None,
            'category_name': e.course.category.name if e.course.category else 'Developer Training',
        } for e in enrollments.filter(is_completed=False)[:3]]

        recent_lessons = []
        for enrollment in enrollments[:3]:
            lessons = enrollment.course.lessons.all()[:2]
            for lesson in lessons:
                recent_lessons.append({
                    'id': str(lesson.id),
                    'title': lesson.title,
                    'course_title': enrollment.course.title,
                })

        announcements = Announcement.objects.filter(Q(is_global=True) | Q(course__enrollments__learner=request.user)).distinct().order_by('-created_at')[:4]

        return Response({
            'total_enrolled': total_enrolled,
            'completed_courses': completed_courses,
            'avg_progress': float(avg_progress),
            'active_courses': active_courses,
            'recent_lessons': recent_lessons[:4],
            'upcoming_tasks': [
                {'title': 'Ship your responsive landing page', 'due': 'This week'},
                {'title': 'Complete the AI workflow quiz', 'due': 'Next session'},
            ],
            'learning_streak': 6 if total_enrolled else 0,
            'announcements': [
                {
                    'id': str(a.id),
                    'title': a.title,
                    'content': a.content,
                    'date': a.created_at.strftime('%d %b %Y'),
                }
                for a in announcements
            ],
        })

class AnnouncementsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_learning_seed_data()
        announcements = Announcement.objects.filter(
            Q(is_global=True) | Q(course__enrollments__learner=request.user)
        ).distinct().order_by('-created_at')[:10]

        data = [{
            'id': str(a.id),
            'title': a.title,
            'content': a.content,
            'author': a.author.get_full_name(),
            'date': a.created_at.strftime('%d %b %Y')
        } for a in announcements]

        return Response({'announcements': data})

# Other legacy views can be simplified or removed as needed by the frontend rebrand.
class NotificationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        ensure_learning_seed_data()
        notifications = Announcement.objects.filter(is_global=True).order_by('-created_at')[:5]
        return Response({
            'notifications': [
                {
                    'id': str(notification.id),
                    'title': notification.title,
                    'body': notification.content,
                    'time': notification.created_at.strftime('%d %b'),
                    'read': False,
                    'type': 'announcement',
                }
                for notification in notifications
            ],
            'unread_count': notifications.count(),
        })

class SearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        ensure_learning_seed_data()
        query = request.query_params.get('q', '').strip()
        if len(query) < 2:
            return Response({'results': []})

        course_results = Course.objects.filter(title__icontains=query)[:4]
        lesson_results = Lesson.objects.filter(title__icontains=query)[:4]
        announcement_results = Announcement.objects.filter(title__icontains=query)[:2]

        results = [
            {
                'type': 'course',
                'title': course.title,
                'subtitle': course.category.name if course.category else 'Course',
                'url': f'/courses/{course.id}',
            }
            for course in course_results
        ] + [
            {
                'type': 'lesson',
                'title': lesson.title,
                'subtitle': lesson.course.title,
                'url': f'/lessons/{lesson.id}',
            }
            for lesson in lesson_results
        ] + [
            {
                'type': 'announcement',
                'title': announcement.title,
                'subtitle': 'Platform update',
                'url': '/announcements',
            }
            for announcement in announcement_results
        ]
        return Response({'results': results[:8]})
