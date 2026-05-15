from django.core.management.base import BaseCommand
from courses.bootstrap import ensure_learning_seed_data

class Command(BaseCommand):
    help = 'Bootstrap initial data (categories and production admin)'

    def handle(self, *args, **options):
        self.stdout.write('Starting bootstrap process...')
        ensure_learning_seed_data()
        self.stdout.write(self.style.SUCCESS('Successfully bootstrapped initial data'))
