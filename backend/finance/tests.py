from django.test import TestCase
from accounts.models import User
from finance.models import Payment, SubscriptionPlan, Subscription
from rest_framework.test import APIClient
from django.utils import timezone
from datetime import timedelta

class FinanceTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='tester', email='t@t.com', password='pwd', role='learner')
        self.client.force_authenticate(user=self.user)
        self.plan = SubscriptionPlan.objects.create(name='Pro', duration_days=30, price=29.99, is_active=True)

    def test_checkout_creates_payment_and_subscription(self):
        response = self.client.post('/api/finance/subscriptions/create_subscription/', {
            'plan_id': self.plan.id,
            'payment_method': 'card'
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue('client_secret' in response.data)
        
        # Verify db logic
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Subscription.objects.count(), 1)
        self.assertEqual(Payment.objects.first().learner, self.user)
