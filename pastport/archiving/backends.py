from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.hashers import check_password
from .models import User


class EmailAuthBackend(BaseBackend):
    def authenticate(self, email=None, password=None, **kwargs):
        print("authenticate")
        try:
            print(email)
            user = User.objects.get(email=email)
            if user.check_password(password):  # Verify the password
                return user
        except User.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            print("get_user")
            print(user_id)
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
