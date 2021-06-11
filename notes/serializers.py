from .models import *
from rest_framework import serializers


class NoteSerializer(serializers.ModelSerializer):
    """Сериализатор записей"""

    class Meta:
        model = Note
        fields = ('pk', 'title', 'content', 'last_edited_at', 'is_active', 'author', 'labels')


class LabelSerializer(serializers.ModelSerializer):
    """Сериализатор меток"""

    class Meta:
        model = Label
        fields = ('pk', 'author', 'title')
