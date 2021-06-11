from django.urls import path
from . import views

app_name = 'prof'

urlpatterns = [
    path('signup/<str:lang>/', views.signup_vw, name="signup_vw"),
    path('signup/', views.signup, name="signup"),

    path('login/<str:lang>/', views.login_vw, name="login_vw"),
    path('login/', views.login, name="login"),
    path('logout/', views.logout, name="logout"),

    path('profile/update/', views.profile_update, name="profile_update"),
    path('profile/change_password/', views.change_password, name="change_password"),
    path('profile/reset_password/1/<str:lang>/', views.reset_password_1, name="reset_password_1"),
    path('profile/reset_password/2/<str:lang>/<str:sign>/', views.reset_password_2, name="reset_password_2"),
    path('profile/', views.APIProfile.as_view(), name="profile"),
]
