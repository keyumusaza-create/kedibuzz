from rest_framework import serializers
from .models import SubscriptionPlan, Subscription, Payment, Transaction, Invoice


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ['id', 'name', 'slug', 'description', 'price', 'duration_days', 'features', 'is_active']


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.CharField(source='plan.name', read_only=True)
    plan_price = serializers.DecimalField(source='plan.price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Subscription
        fields = ['id', 'plan', 'plan_name', 'plan_price', 'status', 'started_at', 'expires_at', 'cancelled_at']
        read_only_fields = ['id', 'started_at', 'expires_at']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'amount', 'currency', 'status', 'payment_method', 'transaction_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'transaction_type', 'amount', 'timestamp']


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = ['id', 'invoice_number', 'issued_at', 'due_date', 'is_paid']


class CreateSubscriptionSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField()
    payment_method = serializers.CharField(default='stripe')