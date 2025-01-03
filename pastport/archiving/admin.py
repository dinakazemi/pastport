from django.contrib import admin

from .models import Artefact, Site, User

admin.site.register(Artefact)
admin.site.register(Site)
admin.site.register(User)
