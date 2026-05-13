from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import InstructorProfile, LearnerProfile
from .serializers import (
    UserSerializer, UserCreateSerializer, LearnerSignupSerializer, LoginSerializer,
    InstructorProfileSerializer, LearnerProfileSerializer
)

User = get_user_model()


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsAdminOrInstructorRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {'admin', 'instructor'}
        )


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet for User model."""

    queryset = User.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role', 'is_active']
    search_fields = ['first_name', 'last_name', 'email', 'username']

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action == 'signup':
            return LearnerSignupSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in {'create', 'register', 'update', 'partial_update', 'destroy'}:
            return [IsAdminRole()]
        if self.action == 'signup':
            return [permissions.AllowAny()]
        if self.action in {'me', 'change_password'}:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.role == 'instructor':
            return queryset.filter(role='learner')
        elif user.role == 'learner':
            return queryset.filter(id=user.id)
        return queryset

    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        """Get or update current user."""
        if request.method.lower() == 'patch':
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Register new user."""
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def signup(self, request):
        """Public learner signup."""
        serializer = LearnerSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'detail': 'Account created successfully. You can now sign in.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='change-password')
    def change_password(self, request):
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        if not request.user.check_password(current_password or ''):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new_password, request.user)
        except ValidationError as exc:
            return Response({'error': exc.messages}, status=status.HTTP_400_BAD_REQUEST)
        request.user.set_password(new_password)
        request.user.save()
        return Response({'detail': 'Password updated successfully'})


class LoginViewSet(viewsets.ViewSet):
    """ViewSet for login."""

    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def login(self, request):
        """Login and get tokens."""
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            from django.contrib.auth import authenticate
            user = authenticate(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            if user:
                if not user.is_active:
                    return Response(
                        {'error': 'This account is inactive'},
                        status=status.HTTP_403_FORBIDDEN
                    )
                from rest_framework_simplejwt.tokens import RefreshToken
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InstructorProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for InstructorProfile."""

    queryset = InstructorProfile.objects.all()
    serializer_class = InstructorProfileSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ['user__role']
    search_fields = ['user__first_name', 'user__last_name']


class LearnerProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for LearnerProfile."""

    queryset = LearnerProfile.objects.all()
    serializer_class = LearnerProfileSerializer
    permission_classes = [IsAdminOrInstructorRole]
    filterset_fields = ['user__role']
    search_fields = ['user__first_name', 'user__last_name']
