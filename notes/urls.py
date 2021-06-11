from django.urls import path
from . import views

app_name = 'notes'

urlpatterns = [
    path('search/', views.APISearch.as_view()),
    path('labels/<int:pk>/', views.APILabelsDetail.as_view()),
    path('labels/', views.APILabels.as_view()),
    path('note/<int:pk>/recovery/', views.APITrashRecovery.as_view()),
    path('note/<int:pk>/', views.APINoteDetail.as_view()),
    path('note/deleted/', views.APITrashes.as_view()),
    path('note/', views.APINote.as_view()),
    path('', views.home_page, name='home_page'),
]
