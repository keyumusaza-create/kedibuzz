from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import InstructorProfile, LearnerProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""

    full_name = serializers.ReadOnlyField()
    profile_completed = serializers.ReadOnlyField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'role', 'is_active', 'phone', 'date_of_birth', 'sex',
            'avatar', 'avatar_url', 'created_at', 'updated_at', 'date_joined',
            'profile_completed',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'date_joined', 'profile_completed']

    def get_avatar_url(self, obj):
        if obj.avatar and hasattr(obj.avatar, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar.url)
            return obj.avatar.url
        return None


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for users updating their own profile (supports file upload)."""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone', 'date_of_birth',
            'sex', 'avatar',
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'phone'
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class LearnerSignupSerializer(serializers.ModelSerializer):
    """Serializer for public learner signup."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password_confirm',
            'first_name', 'last_name',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(role='learner', **validated_data)


class LoginSerializer(serializers.Serializer):
    """Serializer for login."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class InstructorProfileSerializer(serializers.ModelSerializer):
    """Serializer for InstructorProfile model."""

    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = InstructorProfile
        fields = [
            'id', 'user', 'full_name', 'employee_id',
            'qualification', 'hire_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class LearnerProfileSerializer(serializers.ModelSerializer):
    """Serializer for LearnerProfile model."""

    user = UserSerializer(read_only=True)
    full_name = serializers.ReadOnlyField(source='user.get_full_name')

    class Meta:
        model = LearnerProfile
        fields = [
            'id', 'user', 'full_name', 'learner_code',
            'date_of_birth', 'guardian_name', 'guardian_phone',
            'address', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
