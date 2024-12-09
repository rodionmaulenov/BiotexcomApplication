from django.urls import path

from duration.views import SurrogacyListView, ControlDateView, SearchProfileView, \
    LastFiveProfilesView, CreateProfileView, SurrogacyMotherDetailView, ProfileUpdateView

urlpatterns = [
    path('countries/', SurrogacyListView.as_view(), name='countries'),
    path('countries/search_profile/', SearchProfileView.as_view(), name='search_profile'),
    path('countries/<int:pk>/control_date/', ControlDateView.as_view(), name='control-date'),
    path('create/', CreateProfileView.as_view(), name='create'),
    path('update/<int:id>', ProfileUpdateView.as_view(), name='update'),
    path('profile/<int:id>/', SurrogacyMotherDetailView.as_view(), name='profile-detail'),
    path('last_five_profiles/', LastFiveProfilesView.as_view(), name='last_five_profiles'),
]
