from django.contrib.auth import get_user_model
from .models import Category

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
