from django.contrib.auth import get_user_model

from .models import Announcement, Category, Course, Lesson


User = get_user_model()


def ensure_learning_seed_data():
    categories = [
        {
            "name": "Web Development",
            "slug": "web-development",
            "description": "Build modern websites and interactive digital experiences.",
            "icon": "code",
        },
        {
            "name": "React Development",
            "slug": "react-development",
            "description": "Create component-driven frontends with React.",
            "icon": "layers",
        },
        {
            "name": "Python Programming",
            "slug": "python-programming",
            "description": "Automate workflows, power APIs, and solve real problems with Python.",
            "icon": "terminal",
        },
        {
            "name": "AI for Developers",
            "slug": "ai-for-developers",
            "description": "Ship products faster with practical AI-assisted workflows.",
            "icon": "sparkles",
        },
        {
            "name": "UI/UX Design",
            "slug": "ui-ux-design",
            "description": "Design user-centered interfaces with modern product thinking.",
            "icon": "pen-tool",
        },
        {
            "name": "Computer Fundamentals",
            "slug": "computer-fundamentals",
            "description": "Master core digital skills, productivity, and technical confidence.",
            "icon": "monitor",
        },
    ]

    for category in categories:
        Category.objects.update_or_create(slug=category["slug"], defaults=category)

    instructor = User.objects.filter(role="instructor").first() or User.objects.filter(role="admin").first()
    if instructor is None:
        instructor, _ = User.objects.get_or_create(
            email="hub@kedi.dev",
            defaults={
                "username": "kedi-hub",
                "first_name": "KEDI",
                "last_name": "Team",
                "role": "instructor",
            },
        )
        instructor.role = "instructor"
        instructor.username = instructor.username or "kedi-hub"
        instructor.set_unusable_password()
        instructor.save()

    featured_course, _ = Course.objects.update_or_create(
        slug="web-craft-for-ai-developers",
        defaults={
            "title": "WEB CRAFT FOR AI DEVELOPERS",
            "description": (
                "A practical, project-first developer path covering the web stack, AI-assisted "
                "workflows, API integration, and production-ready portfolio builds."
            ),
            "category": Category.objects.get(slug="web-development"),
            "instructor": instructor,
            "difficulty": "intermediate",
            "is_published": True,
        },
    )

    lessons = [
        {
            "title": "HTML & CSS Foundations",
            "slug": "html-css-foundations",
            "order": 1,
            "video_url": "https://www.youtube.com/embed/qz0aGYrrlhU",
            "content": (
                "# HTML & CSS Foundations\n\n"
                "Learn semantic structure, responsive layout thinking, and reusable styling patterns.\n\n"
                "## Outcomes\n"
                "- Build clean page structure\n"
                "- Use flexbox and grid intentionally\n"
                "- Translate design ideas into maintainable UI\n"
            ),
        },
        {
            "title": "JavaScript for Interactive Interfaces",
            "slug": "javascript-for-interactive-interfaces",
            "order": 2,
            "video_url": "https://www.youtube.com/embed/W6NZfCO5SIk",
            "content": (
                "# JavaScript for Interactive Interfaces\n\n"
                "Move from static pages to dynamic user flows with events, state, and async logic.\n\n"
                "## Practice\n"
                "- Build reusable UI interactions\n"
                "- Fetch and render API data\n"
                "- Debug with purpose\n"
            ),
        },
        {
            "title": "React Product Patterns",
            "slug": "react-product-patterns",
            "order": 3,
            "video_url": "https://www.youtube.com/embed/bMknfKXIFA8",
            "content": (
                "# React Product Patterns\n\n"
                "Organize pages, components, and shared state for modern frontend products.\n\n"
                "## You will build\n"
                "- A course dashboard\n"
                "- Reusable card layouts\n"
                "- Navigation and loading states\n"
            ),
        },
        {
            "title": "Python APIs for Builders",
            "slug": "python-apis-for-builders",
            "order": 4,
            "video_url": "https://www.youtube.com/embed/GZvSYJDk-us",
            "content": (
                "# Python APIs for Builders\n\n"
                "Connect your frontend to practical backend services with Python and REST patterns.\n\n"
                "## Focus areas\n"
                "- JSON APIs\n"
                "- Authentication\n"
                "- Project structure for teams\n"
            ),
        },
        {
            "title": "AI-Assisted Coding Workflow",
            "slug": "ai-assisted-coding-workflow",
            "order": 5,
            "video_url": "https://www.youtube.com/embed/j6u5D3G0n3c",
            "content": (
                "# AI-Assisted Coding Workflow\n\n"
                "Use AI to plan, prototype, review, and refine code while staying in control.\n\n"
                "## Workflow\n"
                "- Prompt for architecture options\n"
                "- Iterate with tests and review\n"
                "- Turn AI output into production quality\n"
            ),
        },
        {
            "title": "Real-World Project Sprint",
            "slug": "real-world-project-sprint",
            "order": 6,
            "video_url": "https://www.youtube.com/embed/Ke90Tje7VS0",
            "content": (
                "# Real-World Project Sprint\n\n"
                "Ship a polished developer portfolio project that brings the full course together.\n\n"
                "## Deliverables\n"
                "- Working app flow\n"
                "- Deployment checklist\n"
                "- Certificate-ready capstone submission\n"
            ),
        },
    ]

    for lesson in lessons:
        Lesson.objects.update_or_create(
            course=featured_course,
            order=lesson["order"],
            defaults=lesson,
        )

    Announcement.objects.get_or_create(
        title="Welcome to KEDI Developer Hub",
        defaults={
            "author": instructor,
            "content": (
                "The platform is now focused on coding education, practical projects, "
                "AI-assisted development, and modern web skills."
            ),
            "is_global": True,
        },
    )
