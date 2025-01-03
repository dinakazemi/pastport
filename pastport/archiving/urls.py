from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("create-site/", views.create_site, name="create_site"),
    path("add-artefact/", views.add_artefact, name="add_artefact"),
    path("get-artefacts/", views.get_public_artefacts, name="get_artefacts"),
    path("get-sites/", views.get_sites, name="get_sites"),
    path("signup/", views.signup, name="signup"),
    path("login/", views.login_view, name="login"),
    path(
        "search-sites/", views.search_sites, name="search_sites"
    ),  # Search for sites by name/location
    path(
        "request-to-join-site/", views.request_to_join_site, name="request_to_join_site"
    ),
    path("get-site/<int:site_id>/", views.get_site_details, name="get_site_details"),
    path(
        "manage-join-request/<int:request_id>/",
        views.manage_join_request,
        name="manage_join_request",
    ),
]
