from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from .models import SubscriptionPlan, Subscription, Payment, Invoice
from .serializers import SubscriptionPlanSerializer, SubscriptionSerializer, PaymentSerializer, CreateSubscriptionSerializer


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(learner=self.request.user).select_related('plan')

    @action(detail=False, methods=['post'])
    def create_subscription(self, request):
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan_id = serializer.validated_data['plan_id']
        payment_method = serializer.validated_data['payment_method']
        
        try:
            plan = SubscriptionPlan.objects.get(id=plan_id, is_active=True)
        except SubscriptionPlan.DoesNotExist:
            return Response({'error': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        import uuid
        # Mocking Stripe Intent Creation for now until keys are added via .env
        transaction_id = f"pi_mock_{uuid.uuid4().hex[:12]}"
        
        # 1. Create the Payment
        payment = Payment.objects.create(
            learner=request.user,
            amount=plan.price,
            transaction_id=transaction_id,
            status='completed', # Auto-completed for MVP testing
            payment_method=payment_method or 'card'
        )
        
        # 2. Create the Subscription
        expires_at = timezone.now() + timedelta(days=plan.duration_days)
        subscription = Subscription.objects.create(
            learner=request.user,
            plan=plan,
            expires_at=expires_at
        )
        
        return Response({
            'subscription': SubscriptionSerializer(subscription).data,
            'payment': PaymentSerializer(payment).data,
            'client_secret': f"{transaction_id}_secret_mock",
            'status': 'active'
        }, status=status.HTTP_201_CREATED)


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(learner=self.request.user)