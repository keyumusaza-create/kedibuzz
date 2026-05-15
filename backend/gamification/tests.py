from django.test import TestCase
from accounts.models import User
from courses.models import Course, Enrollment, Category
from gamification.models import Streak, Certificate

class GamificationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='gamertester', email='g@t.com', password='pwd', role='learner')
        self.category = Category.objects.create(name='testcat', slug='testcat')
        self.instructor = User.objects.create_user(username='inst', email='i@t.com', password='pwd', role='instructor')
        self.course = Course.objects.create(title='Course Uno', instructor=self.instructor, category=self.category, price=0)

    def test_streak_created_on_enrollment(self):
        # Signaling hook triggers on Enrollment
        Enrollment.objects.create(learner=self.user, course=self.course)
        
        streak = Streak.objects.filter(learner=self.user).first()
        self.assertIsNotNone(streak)
        self.assertEqual(streak.current_streak, 1)

    def test_certificate_created_on_completion(self):
        enrollment = Enrollment.objects.create(learner=self.user, course=self.course, is_completed=False, progress=0)
        
        # Now complete the course
        enrollment.is_completed = True
        enrollment.progress = 100
        enrollment.save()
        
        cert = Certificate.objects.filter(learner=self.user, course=self.course).first()
        self.assertIsNotNone(cert)
        self.assertTrue(cert.certificate_id.startswith('CERT-'))
