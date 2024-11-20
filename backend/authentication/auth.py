from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def login_view(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		username = data.get('username')
		password = data.get('password')
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'Login successful'})
		else:
			return JsonResponse({'message': 'Invalid credentials'}, status=401)
	return JsonResponse({'message': 'Invalid request method'}, status=400)

@csrf_exempt
def logout_view(request):
	if request.method == 'POST':
		logout(request)
		return JsonResponse({'message': 'Logout successful'})
	return JsonResponse({'message': 'Invalid request method'}, status=400)