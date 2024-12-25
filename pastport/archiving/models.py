from django.db import models


# Models
class Site(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Artefact(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    artefact_id = models.CharField(max_length=50, unique=True)
    photo_url = models.URLField(blank=True, null=True, max_length=500)
    context = models.TextField(blank=True, null=True)
    condition = models.CharField(max_length=100, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)
    is_public = models.BooleanField(default=False)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.artefact_id
