from .models import *
from rest_framework import serializers


class ProfileSerializer(serializers.ModelSerializer):
	"""Сериализатор профиля пользователя"""

	class Meta:
		model = ToDoUser
		fields = ('username', 'email', 'avatar', 'sort', 'theme', 'language')
