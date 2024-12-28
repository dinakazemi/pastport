import uuid
from django.db import models


# Models
class Site(models.Model):
    site_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Artefact(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    artefact_id = models.AutoField(primary_key=True)
    user_generated_id = models.CharField(max_length=100, blank=True, unique=True)
    photo_url = models.URLField(blank=True, null=True, max_length=500)
    context = models.TextField(blank=True)
    condition = models.CharField(max_length=100, blank=True)
    material = models.CharField(max_length=100, blank=True)
    is_public = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.artefact_id
