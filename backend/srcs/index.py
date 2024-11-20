import os
import django
from django.core.wsgi import get_wsgi_application
from django.core.management import execute_from_command_line

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

application = get_wsgi_application()

if __name__ == "__main__":
	execute_from_command_line(sys.argv)