from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.db.models import Count, Avg, Q, Sum, F
from django.utils import timezone

from courses.bootstrap import ensure_learning_seed_data
from courses.models import Course, Lesson, Enrollment, Announcement, Assignment, Submission, Certificate, Category

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

        # Registration growth data (last 6 months)
        registration_growth = []
        now = timezone.now()
        from datetime import datetime
        for i in range(5, -1, -1):
            # Calculate months back
            month = (now.month - i - 1) % 12 + 1
            year = now.year + (now.month - i - 1) // 12
            
            month_date = datetime(year, month, 1)
            month_name = month_date.strftime('%b')
            count = User.objects.filter(
                date_joined__year=year,
                date_joined__month=month
            ).count()
            registration_growth.append({'month': month_name, 'count': count})

        return Response({
            'total_users': total_users,
            'total_courses': total_courses,
            'total_instructors': total_instructors,
            'active_learners': total_learners, # Simplified for dashboard
            'completion_rate': float(completion_rate),
            'revenue': "{:.2f}".format(revenue),
            'registration_growth': registration_growth,

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
        ).values('id', 'title', 'enrollment_count', 'avg_progress')

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


class AdminCoursesView(APIView):
    """Admin: list all courses with publish toggle."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        courses = Course.objects.select_related('instructor', 'category').annotate(
            student_count=Count('enrollments')
        ).order_by('-created_at')
        data = [{
            'id': str(c.id),
            'title': c.title,
            'instructor': c.instructor.get_full_name() or c.instructor.username,
            'category': c.category.name if c.category else 'Uncategorized',
            'difficulty': c.difficulty,
            'student_count': c.student_count,
            'is_published': c.is_published,
            'created_at': c.created_at.strftime('%d %b %Y'),
        } for c in courses]
        return Response({'courses': data, 'total': len(data)})

    def patch(self, request):
        """Toggle publish status."""
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        course_id = request.data.get('id')
        try:
            course = Course.objects.get(id=course_id)
            course.is_published = not course.is_published
            course.save()
            return Response({'id': str(course.id), 'is_published': course.is_published})
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=404)


class AdminStudentsView(APIView):
    """Admin: list all learners with enrollment stats."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        search = request.query_params.get('search', '').strip()
        learners = User.objects.filter(role='learner').annotate(
            enrollment_count=Count('enrollments'),
            completed_count=Count('enrollments', filter=Q(enrollments__is_completed=True))
        ).order_by('-date_joined')
        if search:
            learners = learners.filter(
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        data = [{
            'id': str(u.id),
            'name': u.get_full_name() or u.username,
            'email': u.email,
            'is_active': u.is_active,
            'avatar_url': request.build_absolute_uri(u.avatar.url) if u.avatar else None,
            'enrollments': u.enrollment_count,
            'completed': u.completed_count,
            'joined': u.date_joined.strftime('%d %b %Y'),
        } for u in learners]
        return Response({'students': data, 'total': len(data)})


class AdminCategoriesView(APIView):
    """Admin: list, create, update, delete categories."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        categories = Category.objects.annotate(course_count=Count('courses')).order_by('name')
        data = [{
            'id': str(c.id),
            'name': c.name,
            'slug': c.slug,
            'description': c.description,
            'icon': c.icon,
            'course_count': c.course_count,
        } for c in categories]
        return Response({'categories': data})

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        from django.utils.text import slugify
        name = request.data.get('name', '').strip()
        if not name:
            return Response({'error': 'Name is required'}, status=400)
        slug = slugify(name)
        counter = 1
        base_slug = slug
        while Category.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        cat = Category.objects.create(
            name=name,
            slug=slug,
            description=request.data.get('description', ''),
            icon=request.data.get('icon', ''),
        )
        return Response({'id': str(cat.id), 'name': cat.name, 'slug': cat.slug, 'course_count': 0}, status=201)

    def patch(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        cat_id = request.data.get('id')
        try:
            cat = Category.objects.get(id=cat_id)
        except Category.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        cat.name = request.data.get('name', cat.name)
        cat.description = request.data.get('description', cat.description)
        cat.icon = request.data.get('icon', cat.icon)
        cat.save()
        return Response({'id': str(cat.id), 'name': cat.name})

    def delete(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        cat_id = request.query_params.get('id')
        try:
            Category.objects.get(id=cat_id).delete()
            return Response({'detail': 'Deleted'})
        except Category.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class AdminCertificatesView(APIView):
    """Admin: list all issued certificates."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        certs = Certificate.objects.select_related('learner', 'course').order_by('-issued_at')
        data = [{
            'id': str(c.id),
            'learner': c.learner.get_full_name() or c.learner.username,
            'learner_email': c.learner.email,
            'course': c.course.title,
            'certificate_number': c.certificate_number,
            'issued_at': c.issued_at.strftime('%d %b %Y'),
            'is_valid': c.is_valid,
        } for c in certs]
        return Response({'certificates': data, 'total': len(data)})

    def patch(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        cert_id = request.data.get('id')
        try:
            cert = Certificate.objects.get(id=cert_id)
            cert.is_valid = request.data.get('is_valid', cert.is_valid)
            cert.save()
            return Response({'status': 'success', 'is_valid': cert.is_valid})
        except Certificate.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)


class AdminAnalyticsView(APIView):
    """Admin: platform analytics data."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        from datetime import datetime
        now = timezone.now()

        # Monthly registrations (last 6 months)
        registrations = []
        enrollments_by_month = []
        for i in range(5, -1, -1):
            month = (now.month - i - 1) % 12 + 1
            year = now.year + (now.month - i - 1) // 12
            month_name = datetime(year, month, 1).strftime('%b')
            reg_count = User.objects.filter(date_joined__year=year, date_joined__month=month).count()
            enr_count = Enrollment.objects.filter(enrolled_at__year=year, enrolled_at__month=month).count()
            registrations.append({'month': month_name, 'count': reg_count})
            enrollments_by_month.append({'month': month_name, 'count': enr_count})

        total_enrollments = Enrollment.objects.count()
        completed = Enrollment.objects.filter(is_completed=True).count()
        completion_rate = round(completed / total_enrollments * 100, 1) if total_enrollments else 0

        revenue_by_month = []
        for i in range(5, -1, -1):
            month = (now.month - i - 1) % 12 + 1
            year = now.year + (now.month - i - 1) // 12
            month_name = datetime(year, month, 1).strftime('%b')
            rev = Payment.objects.filter(
                status='completed', created_at__year=year, created_at__month=month
            ).aggregate(t=Sum('amount'))['t'] or 0
            revenue_by_month.append({'month': month_name, 'amount': float(rev)})

        return Response({
            'registrations': registrations,
            'enrollments': enrollments_by_month,
            'revenue': revenue_by_month,
            'total_users': User.objects.count(),
            'total_learners': User.objects.filter(role='learner').count(),
            'total_instructors': User.objects.filter(role='instructor').count(),
            'total_courses': Course.objects.count(),
            'published_courses': Course.objects.filter(is_published=True).count(),
            'total_certificates': Certificate.objects.count(),
            'completion_rate': completion_rate,
            'total_revenue': float(Payment.objects.filter(status='completed').aggregate(t=Sum('amount'))['t'] or 0),
        })


class AdminPaymentsView(APIView):
    """Admin: list all payment records."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)
        payments = Payment.objects.select_related('learner', 'subscription__plan').order_by('-created_at')
        data = [{
            'id': str(p.id),
            'learner': p.learner.get_full_name() or p.learner.username,
            'learner_email': p.learner.email,
            'plan': p.subscription.plan.name if p.subscription and p.subscription.plan else 'One-time',
            'amount': float(p.amount),
            'currency': p.currency,
            'status': p.status,
            'method': p.payment_method,
            'date': p.created_at.strftime('%d %b %Y'),
        } for p in payments]
        total_revenue = float(Payment.objects.filter(status='completed').aggregate(t=Sum('amount'))['t'] or 0)
        return Response({'payments': data, 'total': len(data), 'total_revenue': total_revenue})

class AdminReportsView(APIView):
    """Admin: comprehensive reports data."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Not authorized'}, status=403)

        # 1. Enrollment by Category
        categories = Category.objects.annotate(
            enrollment_count=Count('courses__enrollments')
        ).order_by('-enrollment_count')
        
        total_enrollments = sum(c.enrollment_count for c in categories)
        enrollment_by_category = []
        colors = ["#2563eb", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1"]
        
        for i, cat in enumerate(categories[:6]):
            percentage = (cat.enrollment_count / total_enrollments * 100) if total_enrollments > 0 else 0
            enrollment_by_category.append({
                'label': cat.name,
                'value': str(cat.enrollment_count),
                'percentage': round(percentage, 1),
                'color': colors[i % len(colors)]
            })

        # 2. Instructor Performance (based on course ratings/completion)
        instructors = User.objects.filter(role='instructor').annotate(
            avg_rating=Avg('instructed_courses__enrollments__progress'), # Proxy for performance if no explicit rating
            student_count=Count('instructed_courses__enrollments')
        ).filter(student_count__gt=0).order_by('-avg_rating')[:5]

        instructor_performance = []
        for inst in instructors:
            # We use avg progress as a proxy for performance (0-100)
            # Map 0-100 to 0-5 for "Rating" display
            rating = round((inst.avg_rating or 0) / 20, 1)
            instructor_performance.append({
                'label': inst.get_full_name() or inst.username,
                'value': f"{rating}/5",
                'percentage': round(inst.avg_rating or 0, 1),
                'color': '#10b981' if rating >= 4 else '#2563eb'
            })

        # 3. Course Completion Rates
        courses = Course.objects.annotate(
            learners=Count('enrollments'),
            completed=Count('enrollments', filter=Q(enrollments__is_completed=True)),
            avg_progress=Avg('enrollments__progress')
        ).order_by('-learners')[:10]

        course_completion_rates = [{
            'name': c.title,
            'learners': c.learners,
            'completed': c.completed,
            'progress': f"{round(c.avg_progress or 0, 1)}%"
        } for c in courses]

        return Response({
            'enrollmentByCategory': enrollment_by_category,
            'instructorPerformance': instructor_performance,
            'courseCompletionRates': course_completion_rates
        })
