from django.contrib import admin

from .models import Announcement, Category, Certificate, Course, Enrollment, Lesson


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'icon']
    search_fields = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    ordering = ['order']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'instructor', 'difficulty', 'is_published', 'updated_at']
    list_filter = ['difficulty', 'is_published', 'category']
    search_fields = ['title', 'description', 'instructor__email', 'instructor__username']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'is_preview', 'updated_at']
    list_filter = ['is_preview', 'course']
    search_fields = ['title', 'course__title']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['learner', 'course', 'progress', 'is_completed', 'enrolled_at']
    list_filter = ['is_completed', 'course']
    search_fields = ['learner__email', 'learner__username', 'course__title']


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['certificate_number', 'learner', 'course', 'issued_at']
    search_fields = ['certificate_number', 'learner__email', 'course__title']


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'course', 'is_global', 'created_at']
    list_filter = ['is_global', 'course']
    search_fields = ['title', 'content', 'author__email']
