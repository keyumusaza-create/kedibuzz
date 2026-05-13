"""
ASGI config for KEDI Developer Hub project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kediscs.settings')

application = get_asgi_application()
