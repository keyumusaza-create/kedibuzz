"""
WSGI config for KEDI Developer Hub project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'kediscs.settings')

application = get_wsgi_application()
