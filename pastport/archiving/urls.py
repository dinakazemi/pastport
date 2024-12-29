from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("create-site/", views.create_site, name="create_site"),
    path("add-artefact/", views.add_artefact, name="add_artefact"),
    path("get-artefacts/", views.get_public_artefacts, name="get_artefacts"),
    path("get-sites/", views.get_sites, name="get_sites"),
    path("signup/", views.signup, name="signup"),
    path("login/", views.login, name="login"),
]
