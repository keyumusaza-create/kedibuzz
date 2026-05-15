from rest_framework import serializers
from .models import Category, Post, Comment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')

    class Meta:
        model = Comment
        fields = ['id', 'post', 'author', 'author_name', 'content', 'image', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.get_full_name')
    category_name = serializers.ReadOnlyField(source='category.name')
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    is_liked = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'author', 'author_name', 'category', 'category_name', 
            'title', 'content', 'image', 'post_type', 'tags', 'likes_count', 'is_liked',
            'comments_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['author', 'likes', 'created_at']

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False
