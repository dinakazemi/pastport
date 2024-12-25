from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("create_site/", views.create_site, name="create_site"),
    path("add_artefact/", views.add_artefact, name="add_artefact"),
    path("get_artefacts/", views.get_public_artefacts, name="get_artefacts"),
]
