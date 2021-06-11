from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from notes.services.notes import *
from notes.serializers import *
from notes.models import *


def home_page(request):
    """Главная страница"""

    if not 'username' in request.COOKIES:
        if 'lang' in request.COOKIES:
            lang = request.COOKIES['lang']
        else:
            lang = 'ru'
        return redirect(reverse_lazy('prof:login_vw', args=(lang, )))

    user = ToDoUser.objects.get(username=request.COOKIES['username'])

    if user.language == 'a':
        return render(request, 'home_ru.html')
    else:
        return render(request, 'home_en.html')


class APINote(APIView):
    """Создать или смотреть записи"""

    permission_classes = (IsAuthenticated, )

    def get(self, request):
        notes = Note.objects.filter(is_active=True, author=request.user.pk)
        serializer = NoteSerializer(notes, many=True)

        return Response(serializer.data)

    def post(self, request):
        request.data['author'] = request.user.pk
        serializer = NoteSerializer(data=request.data)

        if save_serializer(serializer):
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class APINoteDetail(APIView):
    """Смотреть, изменить или удалить запись"""

    permission_classes = (IsAuthenticated, )

    def get(self, request, pk):
        note = Note.objects.get(pk=pk)

        if note.author.pk != request.user.pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        serializer = NoteSerializer(note)

        return Response(serializer.data)

    def put(self, request, pk):
        note = Note.objects.get(pk=pk)

        if note.author.pk != request.user.pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        request.data['author'] = request.user.pk
        serializer = NoteSerializer(note, data=request.data)

        if save_serializer(serializer):
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        note = Note.objects.get(pk=pk)

        if note.author.pk != request.user.pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        delete_note(note)

        return Response(status=status.HTTP_204_NO_CONTENT)


class APISearch(APIView):
    """API поиска"""

    permission_classes = (IsAuthenticated, )

    def post(self, request):
        filter = Q(title__icontains=request.data['keyword']) | Q(content__icontains=request.data['keyword'])
        notes = Note.objects.all().filter(filter)
        serializer = NoteSerializer(notes, many=True)

        return Response(serializer.data)


''' Get deleted notes '''
class APITrashes(APIView):
    """API записей в корзине"""

    permission_classes = (IsAuthenticated, )

    def get(self, request):
        notes = Note.objects.filter(is_active=False, author=request.user)
        serializer = NoteSerializer(notes, many=True)

        return Response(serializer.data)


class APITrashRecovery(APIView):
    """API для восстановления записей из корзины"""

    permission_classes = (IsAuthenticated, )

    def put(self, request, pk):
        note = Note.objects.get(pk=pk)

        if note.author.pk != request.user.pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        note.is_active = True
        note.save()

        return Response(status=status.HTTP_201_CREATED)


class APILabels(APIView):
    """API для списка меток"""

    permission_classes = (IsAuthenticated, )

    def get(self, request):
        labels = Label.objects.filter(author=request.user)
        serializer = LabelSerializer(labels, many=True)

        return Response(serializer.data)

    def post(self, request):
        request.data['author'] = request.user.pk
        serializer = LabelSerializer(data=request.data)

        if save_serializer(serializer):
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class APILabelsDetail(APIView):
    """API записей определенной метки"""

    permission_classes = (IsAuthenticated, )

    def get(self, request, pk):
        label = Label.objects.get(pk=pk)
        notes = Note.objects.filter(labels=label)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)

    def put(self, request, pk):
        label = Label.objects.get(pk=pk)

        if label.author.pk != request.user.pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        request.data['author'] = request.user.pk
        serializer = LabelSerializer(label, data=request.data)

        if save_serializer(serializer):
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        label = Label.objects.get(pk=pk)

        if label.author.pk != request.user.pk:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        label.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)


def e_handler404(request, exception):
    """Страница 404"""

    context = {'user': request.user}
    return render(request, '404notfound.html', context)
