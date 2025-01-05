import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager


# Models
class Site(models.Model):
    site_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    admins = models.ManyToManyField(
        "User", related_name="admin_sites"
    )  # Admins of the site
    members = models.ManyToManyField(
        "User", related_name="member_sites"
    )  # Members of the site

    def __str__(self):
        return self.name


class Artefact(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    artefact_id = models.AutoField(primary_key=True)
    user_generated_id = models.CharField(max_length=100, blank=True, unique=True)
    photo_url = models.URLField(blank=True, null=True, max_length=500)
    image = models.ImageField(upload_to="uploads/images/", blank=True, null=True)
    context = models.TextField(blank=True)
    condition = models.CharField(max_length=100, blank=True)
    material = models.CharField(max_length=100, blank=True)
    is_public = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(
        "User", on_delete=models.SET_NULL, related_name="artefacts", null=True
    )

    def __str__(self):
        return self.artefact_id


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    institution = models.CharField(max_length=200)
    is_active = models.BooleanField(default=True)
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name", "institution"]

    def __str__(self):
        return self.email


class JoinRequest(models.Model):
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    join_as_admin = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    status = models.CharField(
        max_length=50,
        choices=[
            ("pending", "Pending"),
            ("approved", "Approved"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Request by {self.user.email} for {self.site.name}"
