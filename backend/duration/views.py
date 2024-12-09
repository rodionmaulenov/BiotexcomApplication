import pytz

from datetime import datetime

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.generics import ListAPIView, get_object_or_404, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from django.db.models import Count
from django.db import models

from duration.models import SurrogacyMother
from duration.paginations import SurrogacyPagination
from duration.serializers import SurrogacyListSerializer, LastFiveProfilesSerializer, CreateProfileSerializer, \
    FetchSurrogacyMotherSerializer, UpdateProfileSerializer, UzbekistanSurrogacyListSerializer, \
    NotInProgramSurrogacyListSerializer
from duration.services import get_country, get_days_on_control_date, get_uzb_queryset, get_nip_queryset, \
    get_ukr_or_mld_queryset

SurrogacyMother: models
Date: models


class SurrogacyMotherDetailView(RetrieveAPIView):
    """
    Fetch individual instance.
    """
    queryset = SurrogacyMother.objects.all()
    serializer_class = FetchSurrogacyMotherSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    lookup_field = 'id'


class SurrogacyListView(ListAPIView):
    """
    Returns queryset based on country choice.
    """
    queryset = SurrogacyMother.objects.all()
    serializer_class = SurrogacyListSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = SurrogacyPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        country = self.request.GET.get('country', None)
        if len(country) > 3:
            country = get_country(country)
        if country == 'UZB':
            return get_uzb_queryset(queryset)
        elif country == 'NIP':
            return get_nip_queryset(queryset)
        else:
            return get_ukr_or_mld_queryset(queryset, country)

    def get_serializer_class(self):
        country = self.request.GET.get('country', None)
        if country and len(country) > 3:
            country = get_country(country)

        if country == 'UZB':
            return UzbekistanSurrogacyListSerializer
        elif country == 'NIP':
            return NotInProgramSurrogacyListSerializer

        return super().get_serializer_class()


class ControlDateView(APIView):
    def post(self, request, pk):

        date_str = request.data.get('date', None)
        date_country = request.data.get('country', None)
        if not date_str:
            return Response({"error": "No date provided. Please include a valid 'date' in the request."},
                            status=status.HTTP_400_BAD_REQUEST)

        surrogacy_mother = get_object_or_404(SurrogacyMother, pk=pk)
        if date_country:
            country = date_country
        else:
            country = 'UKR' if surrogacy_mother.country == 'MLD' else 'MLD'
        control_date = pytz.UTC.localize(datetime.strptime(date_str, '%Y-%m-%d'))

        days_left = get_days_on_control_date(
            instance=surrogacy_mother,
            control_date=control_date,
            country=country,
        )
        return Response({"days_left": days_left}, status=status.HTTP_200_OK)


class SearchProfileView(ListAPIView):
    queryset = SurrogacyMother.objects.all()
    serializer_class = SurrogacyListSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        queryset = super().get_queryset()
        country = self.request.GET.get('country', None)
        if len(country) > 3:
            country = get_country(country)
        if country == 'UZB':
            return get_uzb_queryset(queryset)
        elif country == 'NIP':
            return get_nip_queryset(queryset)
        else:
            return get_ukr_or_mld_queryset(queryset, country)

    def get_serializer_class(self):
        country = self.request.GET.get('country', None)
        if country and len(country) > 3:
            country = get_country(country)

        if country == 'UZB':
            return UzbekistanSurrogacyListSerializer
        elif country == 'NIP':
            return NotInProgramSurrogacyListSerializer

        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        name = request.GET.get('search', None)

        surrogacy_mother = [x for x in  self.get_queryset() if name.lower() in x.full_name.lower()]
        serializer = self.get_serializer(surrogacy_mother, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)


class LastFiveProfilesView(ListAPIView):
    queryset = SurrogacyMother.objects.all()
    serializer_class = LastFiveProfilesSerializer
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def list(self, request, *args, **kwargs):

        surrogacy_mother = None
        count_profile = request.GET.get('count_profile', None)
        name = request.GET.get('search', None)

        queryset = (self.get_queryset()
                    .annotate(dates_count=Count('related_dates'))
                    .filter(dates_count__gt=0)
                    )

        if count_profile is not None:
            surrogacy_mother = queryset.order_by('-created')[:int(count_profile)]

        if name is not None:
            surrogacy_mother = queryset.filter(full_name__icontains=name)[:8]

        serializer = self.get_serializer(surrogacy_mother, many=True)
        return Response({"results": serializer.data}, status=status.HTTP_200_OK)


class CreateProfileView(APIView):
    def post(self, request, *args, **kwargs):
        # Modify the incoming data
        data = request.data.copy()
        if 'country' in data:
            data['country'] = get_country(data['country'])

        serializer = CreateProfileSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        print("Validation Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProfileUpdateView(APIView):
    def put(self, request, id, *args, **kwargs):
        instance = get_object_or_404(SurrogacyMother, id=id)
        # Modify the incoming data
        data = request.data.copy()
        if 'country' in data:
            data['country'] = get_country(data['country'])

        serializer = UpdateProfileSerializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        print("Validation Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
