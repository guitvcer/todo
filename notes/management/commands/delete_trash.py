from django.core.management.base import BaseCommand
from django.utils import timezone
from notes.models import Note
import datetime
import schedule
import time


class Command(BaseCommand):
	help = 'Deletes trash after 1 week'

	def handle(self, *args, **kwargs):
		now = timezone.now()

def job():
	Note.objects.filter(is_active=False, last_edited_at__lt=now + datetime.timedelta(days=7)).delete()

schedule.every().day.at('00.00').do(job)

while True:
	schedule.run_pending()
	time.sleep(1)