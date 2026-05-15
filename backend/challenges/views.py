from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Challenge, ChallengeCategory, ChallengeSubmission
from .serializers import ChallengeListSerializer, ChallengeDetailSerializer, ChallengeSubmissionSerializer, ChallengeSubmissionCreateSerializer, ChallengeCategorySerializer


class IsInstructorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in {'instructor', 'admin'}


class ChallengeCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ChallengeCategory.objects.all()
    serializer_class = ChallengeCategorySerializer
    permission_classes = [permissions.IsAuthenticated]


class ChallengeViewSet(viewsets.ModelViewSet):
    queryset = Challenge.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsInstructorOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChallengeDetailSerializer
        return ChallengeListSerializer

    def get_queryset(self):
        queryset = self.queryset.select_related('category')
        if self.action == 'list':
            user = self.request.user
            if user.role == 'learner':
                queryset = queryset.filter(is_published=True)
            category = self.request.query_params.get('category')
            if category:
                queryset = queryset.filter(category__slug=category)
            search = self.request.query_params.get('search')
            if search:
                queryset = queryset.filter(title__icontains=search)
        return queryset.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save()


class ChallengeSubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = ChallengeSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = ChallengeSubmission.objects.select_related('challenge', 'learner')
        if user.role == 'learner':
            return queryset.filter(learner=user).order_by('-submitted_at')
        if user.role == 'instructor':
            return queryset.filter(challenge__category__courses__instructor=user).order_by('-submitted_at')
        return queryset.order_by('-submitted_at')

    def get_serializer_class(self):
        if self.action == 'create':
            return ChallengeSubmissionCreateSerializer
        return ChallengeSubmissionSerializer

    def perform_create(self, serializer):
        submission = serializer.save(learner=self.request.user)
        return submission