import logging
from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login
from django.http import HttpResponse, JsonResponse
import json
from .models import JoinRequest, Site, Artefact, User
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Q
from django.contrib.auth.decorators import login_required

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
            # Authenticate and log the user in
            user = authenticate(email=email, password=password)
            if user is not None:
                login(request, user)  # Log the user in
                print(user.name)
                return JsonResponse(
                    {"useremail": user.email, "username": user.name}, status=201
                )
            else:
                return JsonResponse(
                    {"error": "Authentication failed after signup"}, status=500
                )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            user = authenticate(email=email, password=password)
            if not user:
                return JsonResponse({"error": "Invalid email or password"}, status=400)
            # Return success response
            login(request, user)
            return JsonResponse(
                {"useremail": user.email, "username": user.name}, status=200
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
@login_required
def create_site(request):
    logger.info(f"Request method: {request.method}")
    logger.info(f"Request body: {request.body}")
    if request.method == "POST":
        print(request.user)
        try:
            if not request.user.is_authenticated:
                return JsonResponse({"error": "User not authenticated"}, status=401)

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
            site = Site.objects.create(
                name=name,
                location=location,
                latitude=latitude,
                longitude=longitude,
            )
            # add the user as an admin
            site.admins.add(request.user)
            site.members.add(request.user)
            site.save()
            return JsonResponse(
                {"message": f"Site {name} created successfully"}, status=201
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


# saerching for sites
@csrf_exempt
@login_required
def search_sites(request):
    if request.method == "GET":
        name = request.GET.get("name", "").strip()
        location = request.GET.get("location", "").strip()

        # Filter sites based on name and location (case-insensitive)
        filters = Q()
        if name:
            filters &= Q(name__icontains=name)
        if location:
            filters &= Q(location__icontains=location)

        sites = Site.objects.filter(filters).values("site_id", "name", "location")
        return JsonResponse(list(sites), safe=False, status=200)

    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


# Submit join request
@csrf_exempt
@login_required
def request_to_join_site(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            site_id = data.get("site_id")
            message = data.get("message", "")
            join_as_admin = data.get("join_as_admin", False) in ["true", "True", True]

            if not site_id:
                return JsonResponse({"error": "Site ID is required"}, status=400)

            # Get the site
            site = Site.objects.filter(site_id=site_id).first()
            if not site:
                return JsonResponse({"error": "Site not found"}, status=404)

            # Check if the user is already an admin
            if site.admins.filter(id=request.user.id).exists():
                return JsonResponse(
                    {"error": "You are already an admin of this site"}, status=400
                )

            # Check if a join request already exists for this user and site
            existing_request = JoinRequest.objects.filter(
                site=site, user=request.user
            ).first()
            if existing_request:
                return JsonResponse(
                    {
                        "error": f"You already have a {existing_request.status} request for this site."
                    },
                    status=400,
                )

            # Create a new join request
            join_request = JoinRequest.objects.create(
                site=site,
                user=request.user,
                message=message,
                join_as_admin=join_as_admin,
            )
            return JsonResponse(
                {
                    "message": "Join request submitted successfully",
                    "request_id": join_request.id,
                },
                status=201,
            )

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


def get_site_details(request, site_id):
    if request.method == "GET":
        site = get_object_or_404(Site, site_id=site_id)
        admins = list(site.admins.values("email")) if site.admins.exists() else []
        members = list(site.members.values("email")) if site.members.exists() else []
        print(members)
        return JsonResponse(
            {
                "name": site.name,
                "location": site.location,
                "latitude": site.latitude,
                "longitude": site.longitude,
                "created_at": site.created_at,
                "admins": admins,
                "members": members,
            },
            status=200,
        )
    return JsonResponse({"error": "Invalid HTTP method"}, status=405)


@csrf_exempt
@login_required
def manage_join_request(request, request_id):
    if request.method == "POST":
        try:
            join_request = JoinRequest.objects.filter(
                id=request_id, site__admins=request.user
            ).first()
            if not join_request:
                return JsonResponse(
                    {"error": "Request not found or you are not authorized"}, status=404
                )

            action = json.loads(request.body).get("action")
            if action == "approve":
                join_request.status = "approved"
                join_request.site.admins.add(join_request.user)
                join_request.save()
                return JsonResponse({"message": "Request approved"}, status=200)
            elif action == "reject":
                join_request.status = "rejected"
                join_request.save()
                return JsonResponse({"message": "Request rejected"}, status=200)
            else:
                return JsonResponse({"error": "Invalid action"}, status=400)

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
@login_required
def add_artefact(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            site_id = data.get("site")
            user_generated_id = data.get("user_generated_id")
            photo_url = data.get("photo_url")
            context = data.get("context")
            condition = data.get("condition")
            material = data.get("material")
            is_public = data.get("is_public", False) in ["true", "True", True]
            description = data.get("description")
            image = request.FILES.get("image")

            site = get_object_or_404(Site, id=site_id)
            user = request.user
            print(user)

            artefact = Artefact.objects.create(
                site=site,
                user_generated_id=user_generated_id,
                photo_url=photo_url,
                context=context,
                condition=condition,
                material=material,
                description=description,
                is_public=is_public,
                image=image,
                added_by=user,
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
