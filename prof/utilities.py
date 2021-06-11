from prof.models import ToDoUser


def get_user(pk):
    """Получить пользователя"""

    user = ToDoUser.objects.get(pk=pk)
    return user
