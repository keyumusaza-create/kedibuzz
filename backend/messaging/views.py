from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from accounts.models import User
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.conversations.all().order_by('-updated_at')

    @action(detail=False, methods=['post'])
    def start(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'detail': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        if target_user == request.user:
            return Response({'detail': 'Cannot start conversation with yourself'}, status=status.HTTP_400_BAD_REQUEST)

        # Find existing conversation between these exactly two participants
        conversation = Conversation.objects.annotate(count=Count('participants')).filter(count=2)
        conversation = conversation.filter(participants=request.user).filter(participants=target_user).first()
        
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, target_user)

        return Response(self.get_serializer(conversation).data)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation_id')
        if conversation_id:
            try:
                conversation = self.request.user.conversations.get(id=conversation_id)
                # Mark as read when fetching
                conversation.messages.exclude(sender=self.request.user).filter(is_read=False).update(is_read=True)
                return conversation.messages.all().order_by('created_at')
            except Conversation.DoesNotExist:
                return Message.objects.none()
        return Message.objects.none()

    def perform_create(self, serializer):
        conversation_id = self.request.data.get('conversation')
        try:
            # Ensure user is part of the conversation
            conversation = self.request.user.conversations.get(id=conversation_id)
            serializer.save(sender=self.request.user, conversation=conversation)
            
            # Update conversation timestamp
            conversation.save() # auto_now=True will update updated_at
        except Conversation.DoesNotExist:
            pass
