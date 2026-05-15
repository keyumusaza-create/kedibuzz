from rest_framework import serializers
from .models import Challenge, ChallengeCategory, ChallengeTestCase, ChallengeSubmission


class ChallengeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeCategory
        fields = ['id', 'name', 'slug', 'description']


class ChallengeTestCaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeTestCase
        fields = ['id', 'input_data', 'is_hidden', 'order']


class ChallengeListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    submissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = ['id', 'title', 'slug', 'description', 'category', 'category_name', 'difficulty', 'points', 'is_published', 'submissions_count']

    def get_submissions_count(self, obj):
        return obj.submissions.count()


class ChallengeDetailSerializer(serializers.ModelSerializer):
    category = ChallengeCategorySerializer(read_only=True)
    test_cases = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = ['id', 'title', 'slug', 'description', 'category', 'difficulty', 'points', 'is_published', 'test_cases']

    def get_test_cases(self, obj):
        return ChallengeTestCaseSerializer(obj.test_cases.filter(is_hidden=False), many=True).data


class ChallengeSubmissionSerializer(serializers.ModelSerializer):
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    learner_name = serializers.CharField(source='learner.get_full_name', read_only=True)

    class Meta:
        model = ChallengeSubmission
        fields = ['id', 'challenge', 'challenge_title', 'learner_name', 'code', 'language', 'status', 'score', 'output', 'error_message', 'submitted_at', 'completed_at']
        read_only_fields = ['id', 'status', 'score', 'output', 'error_message', 'submitted_at', 'completed_at']


class ChallengeSubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeSubmission
        fields = ['challenge', 'code', 'language']

    def create(self, validated_data):
        validated_data['learner'] = self.context['request'].user
        return super().create(validated_data)