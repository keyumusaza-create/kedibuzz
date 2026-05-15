import os
import django

# Setup django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kediscs.settings')
django.setup()

from accounts.models import User
from courses.models import Category, Course, Module, Lesson, Assignment
from challenges.models import Challenge, ChallengeCategory
from finance.models import SubscriptionPlan

print("Clearing existing data...")
User.objects.all().delete()
Category.objects.all().delete()
Course.objects.all().delete()
ChallengeCategory.objects.all().delete()
SubscriptionPlan.objects.all().delete()

print("Creating core users...")
admin = User.objects.create_superuser('admin', 'admin@kedi.com', 'password123', role='admin', first_name='System', last_name='Admin')
instructor = User.objects.create_user('instructor', 'instructor@kedi.com', 'password123', role='instructor', first_name='Jane', last_name='Doe')
learner = User.objects.create_user('learner', 'learner@kedi.com', 'password123', role='learner', first_name='John', last_name='Smith')

print("Creating Categories & Courses...")
cat_web = Category.objects.create(name='Web Development', slug='web-development')
cat_ai = Category.objects.create(name='Artificial Intelligence', slug='artificial-intelligence')

course1 = Course.objects.create(
    title='Fullstack Next.js Bootcamp',
    slug='fullstack-nextjs-bootcamp',
    description='A comprehensive guide to building modern apps with Next.js.',
    category=cat_web,
    instructor=instructor,
    difficulty='intermediate',
    is_published=True
)
mod1 = Module.objects.create(course=course1, title='Introduction', order=1)
Lesson.objects.create(course=course1, module=mod1, title='What is Next.js?', slug='what-is-nextjs', content='Next.js is a React framework...', order=1)

Course.objects.create(
    title='Machine Learning Fundamentals',
    slug='ml-fundamentals',
    description='Learn the basics of Machine Learning using Python.',
    category=cat_ai,
    instructor=instructor,
    difficulty='beginner',
    is_published=True
)

Assignment.objects.create(
    course=course1, title='Build a Personal Portfolio', description='Use Next.js to build a personal portfolio.', due_date=None
)

print("Creating Challenges & SubPlans...")
ccat = ChallengeCategory.objects.create(name='Algorithms', slug='algorithms')
Challenge.objects.create(
    title='Two Sum',
    slug='two-sum',
    difficulty='easy',
    description='Given an array of integers, return indices of the two numbers such that they add up to a specific target.',
    category=ccat,
    points=10
)

SubscriptionPlan.objects.create(name='Monthly Pro', duration_days=30, price=19.99, is_active=True, features='{"features": ["All Courses", "Pro Challenges"]}')
SubscriptionPlan.objects.create(name='Yearly Pro', duration_days=365, price=199.99, is_active=True, features='{"features": ["All Courses", "Pro Challenges", "Priority Support"]}')

print("✅ Database successfully seeded!")
print("Admin: admin@kedi.com / password123")
print("Instructor: instructor@kedi.com / password123")
print("Learner: learner@kedi.com / password123")
