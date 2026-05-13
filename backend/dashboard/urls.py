from django.urls import path
from .views import (
    AdminDashboardView, InstructorDashboardView, LearnerDashboardView,
    NotificationsView, AnnouncementsView, SearchView,
)

urlpatterns = [
    path('admin/',          AdminDashboardView.as_view(),   name='admin-dashboard'),
    path('instructor/',     InstructorDashboardView.as_view(), name='instructor-dashboard'),
    path('learner/',        LearnerDashboardView.as_view(), name='learner-dashboard'),
    path('notifications/',  NotificationsView.as_view(),    name='notifications'),
    path('announcements/',  AnnouncementsView.as_view(),    name='announcements'),
    path('search/',         SearchView.as_view(),           name='search'),
]
