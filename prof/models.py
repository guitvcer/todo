from django.db import models
from django.contrib.auth.models import AbstractUser


class ToDoUser(AbstractUser):
    """Модель пользователя"""

    avatar = models.ImageField(null=True, blank=True, verbose_name="Avatar")
    THEMES = (
        ('a', 'Light'),
        ('b', 'Dark'),
    )
    theme = models.CharField(max_length=1, choices=THEMES, default='a', verbose_name='Theme')
    LANGUAGES = (
        ('a', 'Русский'),
        ('b', 'English'),
    )
    language = models.CharField(max_length=1, choices=LANGUAGES, default='a', verbose_name='Language')
    SORTS = (
        ('a', 'Grid'),
        ('b', 'List'),
    )
    sort = models.CharField(max_length=1, choices=SORTS, default='a', verbose_name="Sorting")

    def __str__(self):
        return self.username

    class Meta:
        ordering = ('username', )
