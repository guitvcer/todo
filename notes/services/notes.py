def save_serializer(serializer):
    """Сохранить форму"""

    if serializer.is_valid():
        serializer.save()
        return True
    else:
        return False


def delete_note(note):
    """Удалить запись"""

    if note.is_active:
        note.is_active = False
        note.save()
    else:
        note.delete()
