from django.contrib import admin
from .models import Challenge, ChallengeCategory, ChallengeTestCase, ChallengeSubmission


@admin.register(ChallengeCategory)
class ChallengeCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'difficulty', 'points', 'is_published']
    list_filter = ['category', 'difficulty', 'is_published']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(ChallengeTestCase)
class ChallengeTestCaseAdmin(admin.ModelAdmin):
    list_display = ['challenge', 'is_hidden', 'order']
    list_filter = ['is_hidden']


@admin.register(ChallengeSubmission)
class ChallengeSubmissionAdmin(admin.ModelAdmin):
    list_display = ['learner', 'challenge', 'status', 'score', 'submitted_at']
    list_filter = ['status']
    readonly_fields = ['submitted_at', 'completed_at']