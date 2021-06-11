from django.db import models
from prof.models import ToDoUser


class Note(models.Model):
    """Модель записей"""

    author = models.ForeignKey(ToDoUser, on_delete=models.CASCADE, verbose_name="Author")
    title = models.CharField(max_length=50, verbose_name="Title")
    content = models.TextField(null=True, blank=True, verbose_name="Content")
    last_edited_at = models.DateTimeField(auto_now=True, verbose_name="Last edited at")
    is_active = models.BooleanField(default=True, verbose_name="Is Active?")
    labels = models.ManyToManyField('Label', blank=True, verbose_name="Labels")

    def __str__(self):
        return self.title

    class Meta:
        ordering = ('-last_edited_at',)


class Label(models.Model):
    """Модель меток"""

    author = models.ForeignKey(ToDoUser, on_delete=models.CASCADE, verbose_name="Author")
    title = models.CharField(max_length=15, verbose_name="Title")

    def __str__(self):
        return self.title
