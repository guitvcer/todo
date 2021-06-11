import re

from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from django.contrib.auth.hashers import check_password
from django.contrib import messages
from django.conf import settings
from django.http import Http404
from django.core.mail import send_mail
from django.core.signing import Signer, BadSignature
from django.template.loader import render_to_string

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import *
from .forms import *


def login_vw(request, lang):
    """Страница авторизации"""

    # Redirect if logged in
    if 'username' in request.COOKIES:
        return redirect('/')

    if lang == 'ru' or lang == 'en':
        response = render(request, 'login_' + lang + '.html')
        if 'lang' in request.COOKIES:
            response.delete_cookie('lang')
        response.set_cookie('lang', lang)

        return response
    else:
        raise Http404('Page not found')


def login(request):
    """Авторизация"""

    # Redirect if logged in
    if 'username' in request.COOKIES:
        return redirect('/')

    if 'lang' in request.COOKIES:
        lang = request.COOKIES['lang']
    else:
        lang = 'ru'

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        def redirect_if_error():
            if 'lang' in request.COOKIES and request.COOKIES['lang'] == 'en':
                messages.error(request, "username or/and password aren't correct.")
            else:
                messages.error(request, "имя пользователя и/или пароль неверны.")
            return redirect(reverse_lazy('prof:login_vw', args=(lang,)))

        try:
            user = ToDoUser.objects.get(username=username)

            if check_password(password, user.password):
                response = redirect('/')
                response.set_cookie('username', username, domain=settings.ALLOWED_HOSTS[0])
                response.set_cookie('password', password, domain=settings.ALLOWED_HOSTS[0])
                return response
            else:
                redirect_if_error()
        except ToDoUser.DoesNotExist:
            redirect_if_error()

    # Redirect if 'GET'
    return redirect(reverse_lazy('prof:login_vw', args=(lang,)))


def logout(request):
    """Выход из аккаунта"""

    if 'username' in request.COOKIES:
        response = redirect('/')
        response.delete_cookie('username')
        response.delete_cookie('password')
        return response
    return redirect('/')


def signup_vw(request, lang):
    """Страница регистрации"""

    if lang == 'en' or lang == 'ru':
        response = render(request, 'signup_' + lang + '.html')
        if 'lang' in request.COOKIES:
            response.delete_cookie('lang')
        response.set_cookie('lang', lang)

        return response
    else:
        raise Http404('Page not found')


def signup(request):
    """Регистрация"""

    if 'lang' in request.COOKIES:
        lang = request.COOKIES['lang']
    else:
        lang = 'ru'

    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password1 = request.POST['password1']
        password2 = request.POST['password2']
        error_ru = error_en = False

        # Data validation
        if ToDoUser.objects.filter(username=username).count() > 0:
            error_ru = 'Пользователь с таким именем уже существует.'
            error_en = 'User with this name is already exists.'
        elif ToDoUser.objects.filter(email=email).count() > 0:
            error_ru = 'Эта эл. почта уже используется.'
            error_en = 'This email is already in use.'
        elif (
                len(password1) < 8 or
                username == password1 or
                not re.findall('[A-Z]', password1) or
                not re.findall('[()[\]{}|\\`~!@#$%^&*_\-+=;:\'",<>./?]', password1)
        ):
            error_ru = 'Ваш пароль слишком слабый.'
            error_en = 'Your password is too weak.'
        elif password1 != password2:
            error_ru = 'Ваши пароли не совпадают.'
            error_en = 'Your password do not match.'
        else:
            # Create user
            user = ToDoUser(username=username, email=email)
            user.set_password(password1)
            user.save()

        # If there is an error - signup again
        if error_ru != False:
            if lang == 'en':
                messages.error(request, error_en)
            else:
                messages.error(request, error_ru)
                return redirect(reverse_lazy('prof:signup_vw', args=(lang,)))

    # Redirect if 'GET' or user created
    return redirect(reverse_lazy('prof:login_vw', args=(lang,)))


class APIProfile(APIView):
    """API Профиля"""

    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = ToDoUser.objects.get(pk=request.user.pk)
        serializer = ProfileSerializer(user)
        return Response(serializer.data)

    def post(self, request):
        form = ProfileForm(request.data)
        if form.is_valid():
            form.save()
        return redirect('/')

    def put(self, request):
        user = ToDoUser.objects.get(pk=request.user.pk)

        if 'avatar' in request.data and request.data['avatar'] == 'None':
            user.avatar = None
            user.save()
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = ProfileSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        user = ToDoUser.objects.get(pk=request.user.pk)

        if check_password(request.data['password'], user.password):
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response(status=status.HTTP_400_BAD_REQUEST)


def profile_update(request):
    """Обновить профиль"""

    if 'username' in request.COOKIES:
        user = ToDoUser.objects.get(username=request.COOKIES['username'])

        if request.method == 'POST':
            # Data validation
            username = request.POST['username']
            email = request.POST['email']
            if ToDoUser.objects.filter(username=username).count() == 1 and user.username != username:
                if user.language == 'a':
                    messages.error(request, 'пользователь с таким именем уже существует.')
                else:
                    messages.error(request, 'user with this name already exists.')

            elif ToDoUser.objects.filter(email=email).count() == 1 and user.email != email:
                if user.language == 'a':
                    messages.error(request, 'пользователь с такой эл. почтой уже существует.')
                else:
                    messages.error(request, 'user with this email already exists.')

            else:
                # Profile Updating
                form = ProfileForm(request.POST, request.FILES, instance=user)
                if form.is_valid():
                    form.save()

                if user.language == 'a':
                    messages.success(request, 'ваш профиль был обновлен.')
                else:
                    messages.success(request, 'your profile was updated.')

                # Redirect if username was updated
                if request.COOKIES['username'] != request.POST['username']:
                    return redirect(reverse_lazy('prof:logout'))
        else:
            # Delete avatar if 'GET'
            if user.language == 'a':
                messages.success(request, 'ваш профиль был обновлен.')
            else:
                messages.success(request, 'your profile was updated.')

            user.avatar = None
            user.save()

    # Redirect if not authorizated or updated data (besides username)
    return redirect('/')


def change_password(request):
    """Изменить пароль"""

    if 'username' in request.COOKIES:
        user = ToDoUser.objects.get(username=request.COOKIES['username'])

        if request.method == 'POST':
            oldpassword = request.POST['oldpassword']
            newpassword1 = request.POST['newpassword1']
            newpassword2 = request.POST['newpassword2']

            # Password validation
            if not check_password(oldpassword, user.password):
                error_ru = 'неверный старый пароль.'
                error_en = 'invalid old password.'

            elif (
                    len(newpassword1) < 8 or
                    user.username == newpassword1 or
                    not re.findall('[A-Z]', newpassword1) or
                    not re.findall('[()[\]{}|\\`~!@#$%^&*_\-+=;:\'",<>./?]', newpassword1)
            ):
                error_ru = 'ваш пароль слишком слабый.'
                error_en = 'your password is too weak.'

            elif newpassword1 != newpassword2:
                error_ru = 'пароли не совпадают.'
                error_en = 'password do not match.'

            else:
                user.set_password(newpassword1)
                user.save()
                if user.language == 'a':
                    messages.success(request, 'вы успешно изменили пароль.')
                else:
                    messages.success(request, 'you have successfully updated your password.')
                return redirect(reverse_lazy('prof:logout'))

            if user.language == 'a':
                messages.error(request, error_ru)
            else:
                messages.error(request, error_en)
            return redirect(reverse_lazy('prof:change_password'))
        else:
            # Return template like always
            if user.language == 'a':
                return render(request, 'change_password_ru.html')
            else:
                return render(request, 'change_password_en.html')
    else:
        # Redirect if not authorizated
        return redirect('/')


def reset_password_1(request, lang):
    """Отправить письмо для сброса пароля"""

    if 'username' in request.COOKIES:
        return redirect('/')

    if request.method == 'POST':
        email = request.POST['email']
        signer = Signer()
        user = None

        try:
            user = ToDoUser.objects.get(email=email)
        except ToDoUser.DoesNotExist:
            # Return with error if no user whis this email
            if lang == 'en':
                messages.error(request, 'user with this email does not exist.')
            else:
                messages.error(request, 'пользователь с такой эл. почтой не существует.')

        # Sending link
        if not settings.DEBUG:
            host = 'https://' + settings.ALLOWED_HOSTS[0]
        else:
            host = 'http://127.0.0.1:8000'

        context = {
            'user': user,
            'host': host,
            'sign': signer.sign(user.username)
        }

        subject_template = 'email/reset_password_subject_' + lang + '.txt'
        body_template = 'email/reset_password_body_' + lang + '.txt'

        subject = render_to_string(subject_template, context)
        body = render_to_string(body_template, context)
        send_mail(subject, body, settings.EMAIL_HOST_USER, [user.email])

        if lang == 'en':
            messages.success(request, 'a password reset link has been sent to your e-mail.')
        elif lang == 'ru':
            messages.success(request, 'на вашу эл.почту была отправлена ссылка для восстановления пароля.')

        return redirect(reverse_lazy('prof:reset_password_1', args=(lang,)))
    else:
        if lang == 'en' or lang == 'ru':
            return render(request, 'reset_password_1_' + lang + '.html')
        else:
            return Http404('Page not found!')


def reset_password_2(request, lang, sign):
    """Смена пароля"""

    if 'username' in request.COOKIES:
        return redirect('/')

    if lang != 'ru' and lang != 'en':
        return Http404('Page not found!')

    signer = Signer()

    try:
        username = signer.unsign(sign)
    except BadSignature:
        # Return with error if bad sign
        if lang == 'ru':
            messages.error(request, 'Плохая подпись. Повторите еще раз.')
        elif lang == 'en':
            messages.error(request, 'Bad signature. Repeat one more time.')
        return redirect(reverse_lazy('prof:reset_password_1', lang=(lang,)))

    if request.method == 'POST':
        user = ToDoUser.objects.get(username=username)
        password1 = request.POST['password1']
        password2 = request.POST['password2']

        # Password Validation
        if (
                len(password1) < 8 or
                username == password1 or
                not re.findall('[A-Z]', password1) or
                not re.findall('[()[\]{}|\\`~!@#$%^&*_\-+=;:\'",<>./?]', password1)
        ):
            error_ru = 'Ваш пароль слишком слабый.'
            error_en = 'Your password is too weak.'
        elif password1 != password2:
            error_ru = 'Ваши пароли не совпадают.'
            error_en = 'Your password do not match.'
        else:
            # Saving password
            user.set_password(password1)
            user.save()

            if lang == 'en':
                messages.success(request, 'your password has been reset.')
            elif lang == 'ru':
                messages.success(request, 'ваш пароль был сброшен.')
            return redirect('/')

        # Return with error if password is not valid
        if lang == 'en':
            messages.error(request, error_en)
        elif lang == 'ru':
            messages.error(request, error_ru)

        return redirect(reverse_lazy('prof:reset_password_2', args=(lang, sign)))
    else:
        # Return if not 'POST'
        return render(request, 'reset_password_2_' + lang + '.html')
