"""
URL configuration for KEDI Developer Hub project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import HttpResponse
from django.views.generic import TemplateView

urlpatterns = [
    path('api/health/', lambda r: HttpResponse('ok', content_type='text/plain')),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/messages/', include('messaging.urls')),
    path('api/community/', include('community.urls')),
    path('api/challenges/', include('challenges.urls')),
    path('api/gamification/', include('gamification.urls')),
    path('api/finance/', include('finance.urls')),
    # Catch-all to serve React app
    path('', TemplateView.as_view(template_name='index.html'), name='index'),
    path('<path:path>', TemplateView.as_view(template_name='index.html')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
