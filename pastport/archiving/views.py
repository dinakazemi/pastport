import logging
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse
import json
from .models import Site, Artefact
from django.views.decorators.csrf import csrf_exempt

logger = logging.getLogger(__name__)


def index(request):
    return HttpResponse("Hello, world. You're at the pastport index.")


@csrf_exempt
def create_site(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            name = data.get("name")
            location = data.get("location")
            latitude = data.get("latitude")
            longitude = data.get("longitude")

            site = Site.objects.create(
                name=name, location=location, latitude=latitude, longitude=longitude
            )
            return JsonResponse(
                {"message": "Site created successfully", "site_id": site.id}, status=201
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
