from django import forms
from prof.models import ToDoUser


class ProfileForm(forms.ModelForm):
	"""Форма для регистрации, смены пароля и т.д. пользователя"""

	class Meta:
		model = ToDoUser
		fields = ('username', 'email', 'avatar')
