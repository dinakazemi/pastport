import logging
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate
from django.http import HttpResponse, JsonResponse
import json
from .models import Site, Artefact, User
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q

logger = logging.getLogger(__name__)


def index(request):
    return HttpResponse("Hello, world. You're at the pastport index.")


@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            name = data.get("name")
            institution = data.get("institution")
            password = data.get("password")

            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already exists"}, status=400)
            user = User.objects.create_user(
                email=email, name=name, institution=institution, password=password
            )
            return JsonResponse({"message": "User created successfully"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
def login(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            user = authenticate(email=email, password=password)
            if not user:
                return JsonResponse({"error": "Invalid email or password"}, status=400)
            # Return success response
            return JsonResponse({"message": "Login successful"}, status=200)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
def create_site(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name", "").strip().title()
            location = data.get("location", "").strip().title()
            latitude = data.get("latitude")
            longitude = data.get("longitude")

            # check for missing fields
            if not name or not location or not latitude or not longitude:
                return JsonResponse({"error": "All fields are required"}, status=400)

            # check if site already exists
            if Site.objects.filter(
                Q(name__iexact=name) | Q(latitude=latitude, longitude=longitude)
            ).exists():
                return JsonResponse({"error": "Site already exists"}, status=400)

            # Create the site
            Site.objects.create(
                name=name,
                location=location,
                latitude=latitude,
                longitude=longitude,
            )
            return JsonResponse(
                {"message": f"Site {name} created successfully"}, status=201
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


def get_sites(request):
    if request.method == "GET":
        sites = Site.objects.all()
        result = [
            {
                "site_id": site.site_id,
                "name": site.name,
                "location": site.location,
            }
            for site in sites
        ]
        return JsonResponse(result, safe=False, status=200)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
def add_artefact(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            site_id = data.get("site_id")
            artefact_id = data.get("artefact_id")
            user_generated_id = data.get("user_generated_id")
            photo_url = data.get("photo_url")
            context = data.get("context")
            condition = data.get("condition")
            material = data.get("material")
            is_public = data.get("is_public", False)
            description = data.get("description", "")

            site = get_object_or_404(Site, id=site_id)

            artefact = Artefact.objects.create(
                site=site,
                artefact_id=artefact_id,
                user_generated_id=user_generated_id,
                photo_url=photo_url,
                context=context,
                condition=condition,
                material=material,
                description=description,
                is_public=is_public,
            )
            return JsonResponse(
                {"message": "Artefact added successfully", "artefact_id": artefact.id},
                status=201,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


def get_public_artefacts(request):
    if request.method == "GET":
        artefacts = Artefact.objects.filter(is_public=True)
        result = [
            {
                "artefact_id": artefact.artefact_id,
                "user_generated_id": artefact.user_generated_id,
                "photo_url": artefact.photo_url,
                "context": artefact.context,
                "condition": artefact.condition,
                "material": artefact.material,
                "site": {
                    "name": artefact.site.name,
                    "location": artefact.site.location,
                },
                "description": artefact.description,
            }
            for artefact in artefacts
        ]
        return JsonResponse(result, safe=False, status=200)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)
