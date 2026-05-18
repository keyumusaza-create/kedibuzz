from django.urls import path
from .views import (
    AdminDashboardView, InstructorDashboardView, LearnerDashboardView,
    NotificationsView, AnnouncementsView, SearchView,
    AdminCoursesView, AdminStudentsView, AdminCategoriesView,
    AdminCertificatesView, AdminAnalyticsView, AdminPaymentsView,
    AdminReportsView,
)

urlpatterns = [
    path('admin/',                  AdminDashboardView.as_view(),      name='admin-dashboard'),
    path('admin/courses/',          AdminCoursesView.as_view(),        name='admin-courses'),
    path('admin/students/',         AdminStudentsView.as_view(),       name='admin-students'),
    path('admin/categories/',       AdminCategoriesView.as_view(),     name='admin-categories'),
    path('admin/certificates/',     AdminCertificatesView.as_view(),   name='admin-certificates'),
    path('admin/analytics/',        AdminAnalyticsView.as_view(),      name='admin-analytics'),
    path('admin/payments/',         AdminPaymentsView.as_view(),       name='admin-payments'),
    path('admin/reports/',          AdminReportsView.as_view(),        name='admin-reports'),
    path('instructor/',             InstructorDashboardView.as_view(), name='instructor-dashboard'),
    path('learner/',                LearnerDashboardView.as_view(),    name='learner-dashboard'),
    path('notifications/',          NotificationsView.as_view(),       name='notifications'),
    path('announcements/',          AnnouncementsView.as_view(),       name='announcements'),
    path('search/',                 SearchView.as_view(),              name='search'),
]
