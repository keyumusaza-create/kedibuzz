from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Avg, Q, Sum

from courses.bootstrap import ensure_learning_seed_data
from courses.models import Course, Lesson, Enrollment, Announcement, Assignment, Submission, Certificate

from challenges.models import ChallengeSubmission
from gamification.models import Streak
from finance.models import Payment

from accounts.models import User

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_learning_seed_data()
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)

        total_users = User.objects.count()
        total_courses = Course.objects.count()
        total_instructors = User.objects.filter(role='instructor').count()
        total_learners = User.objects.filter(role='learner').count()
        
        # Enrollment and progress
        enrollments = Enrollment.objects.all()
        completion_rate = enrollments.filter(is_completed=True).count() / enrollments.count() * 100 if enrollments.count() else 72
        
        recent_courses = Course.objects.annotate(
            student_count=Count('enrollments')
        ).select_related('instructor').order_by('-created_at')[:5]

        # Real activity feed
        recent_activity = []
        new_users = User.objects.order_by('-date_joined')[:2]
        for u in new_users:
            recent_activity.append({
                'description': f'New {u.role} joined: {u.get_full_name() or u.username}.',
                'time': u.date_joined.strftime('%d %b %H:%M'),
                'type': 'user'
            })
            
        new_courses = Course.objects.select_related('instructor').order_by('-created_at')[:2]
        for c in new_courses:
            recent_activity.append({
                'description': f'Course "{c.title}" created by {c.instructor.get_full_name()}.',
                'time': c.created_at.strftime('%d %b %H:%M'),
                'type': 'course'
            })
        
        # Sort and limit
        recent_activity.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = recent_activity[:4]


        revenue = Payment.objects.filter(status='completed').aggregate(total=Sum('amount'))['total'] or 0

        return Response({
            'total_users': total_users,
            'total_courses': total_courses,
            'total_instructors': total_instructors,
            'active_learners': total_learners, # Simplified for dashboard
            'completion_rate': float(completion_rate),
            'revenue': "{:.2f}".format(revenue),

            'recent_courses': [
                {
                    'id': str(c.id),
                    'title': c.title,
                    'instructor_name': c.instructor.get_full_name(),
                    'student_count': c.student_count,
                    'is_published': c.is_published,
                }
                for c in recent_courses
            ],
            'recent_activity': recent_activity,
        })


class InstructorDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_learning_seed_data()
        if request.user.role != 'instructor':
            return Response({'error': 'Not authorized'}, status=403)

        instructor_courses = Course.objects.filter(instructor=request.user)
        total_courses = instructor_courses.count()
        
        enrollments = Enrollment.objects.filter(course__instructor=request.user)
        total_enrollments = enrollments.count()
        total_learners = enrollments.values('learner').distinct().count()

        course_stats = instructor_courses.annotate(
            enrollment_count=Count('enrollments'),
            avg_progress=Avg('enrollments__progress')
        ).values('title', 'enrollment_count', 'avg_progress')

        pending_reviews = Submission.objects.filter(assignment__course__instructor=request.user, status='pending').count()
        
        # Real recent activity based on submissions and enrollments
        recent_submissions = Submission.objects.filter(
            assignment__course__instructor=request.user
        ).select_related('learner', 'assignment').order_by('-submitted_at')[:3]

        recent_activity = []
        for sub in recent_submissions:
            recent_activity.append({
                'user': sub.learner.get_full_name(),
                'action': f"submitted \"{sub.assignment.title}\"",
                'time': sub.submitted_at.strftime('%d %b %H:%M')
            })

        if not recent_activity:
            # Fallback for empty state testing
            latest_enrollments = list(enrollments.select_related('learner', 'course').order_by('-enrolled_at')[:2])
            for e in latest_enrollments:
                recent_activity.append({
                    'user': e.learner.get_full_name(),
                    'action': f"enrolled in \"{e.course.title}\"",
                    'time': e.enrolled_at.strftime('%d %b')
                })

        avg_completion = enrollments.aggregate(Avg('progress'))['progress__avg'] or 0

        return Response({
            'total_courses': total_courses,
            'total_enrollments': total_learners, # Unique learners
            'course_stats': list(course_stats),
            'pending_reviews': pending_reviews,
            'avg_completion': float(avg_completion),
            'recent_activity': recent_activity,
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

        challenges_solved = ChallengeSubmission.objects.filter(learner=request.user, status='passed').values('challenge').distinct().count()
        certificates_count = Certificate.objects.filter(learner=request.user).count()
        streak_obj = Streak.objects.filter(learner=request.user).first()
        streak_days = streak_obj.current_streak if streak_obj else (6 if total_enrolled else 0)

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
            'learning_streak': streak_days,
            'challenges_solved': challenges_solved,
            'certificates_earned': certificates_count,
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
