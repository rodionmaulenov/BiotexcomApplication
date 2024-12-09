from datetime import datetime, timedelta
from babel.dates import format_date

from django.db.models import OuterRef, Subquery, Prefetch
from django.db import models

from duration.models import Date, SurrogacyMother
Date: models
SurrogacyMother: models


def formatted_date(value: datetime) -> str:
    update_date = (value + timedelta(days=91)).date()
    return format_date(update_date, format='d MMMM yy', locale='ru')


def get_country(country: str) -> str:
    country = country.capitalize()
    if country == 'Moldova':
        return 'MLD'
    elif country == 'Ukraine':
        return 'UKR'
    elif country == 'Uzbekistan':
        return 'UZB'
    else:
        return 'NIP'


def conv_db_to_readable_name(country: str) -> str:
    country = country.strip()
    if country == 'MLD':
        return 'Молдова'
    elif country == 'UKR':
        return 'Украина'
    elif country == 'UZB':
        return 'Узбекистан'
    else:
        return 'Не в программе'


def get_days_on_control_date(instance: SurrogacyMother, control_date: datetime, country: str) -> int | str:
    initial_control_date = control_date
    incremented_passed_date = initial_control_date.replace()

    dates = list(Date.objects.filter(
        surrogacy_id=instance.pk,
        entry__lte=incremented_passed_date,
        exit__gte=(incremented_passed_date - timedelta(days=179)),
        country=country
    ).only('entry', 'exit'))

    # Get the latest exit date from the date records
    last_exit_date = max((idate.exit for idate in dates), default=None)

    # Verification: Skip calculation if control dates are before the last exit date
    if last_exit_date and initial_control_date < last_exit_date:
        return 'Дата больше последнего вьезда'

    while True:
        # while True:
        beginning_180_days = incremented_passed_date - timedelta(days=179)

        # Filter dates for the current 180-day window
        filtered_dates = [
            idate for idate in dates
            if idate.entry <= incremented_passed_date and idate.exit >= beginning_180_days
        ]

        # Initialize total days stayed
        total_days_stayed = 0
        days_left = 0
        # Step 1: Calculate total days stayed from the filtered queryset
        for idate in filtered_dates:
            if filtered_dates:
                entry_date = max(idate.entry, beginning_180_days)
                exit_date = idate.exit

                if entry_date <= exit_date:
                    stay_duration = max(1, (exit_date - entry_date).days + 1)
                    total_days_stayed += stay_duration
                    if total_days_stayed >= 90:
                        return days_left

        emit_entry = initial_control_date
        emit_exit = incremented_passed_date

        difference = (max(1, (emit_exit - emit_entry).days + 1))
        total_days_stayed += difference

        if total_days_stayed <= 90:
            incremented_passed_date += timedelta(days=1)
        if total_days_stayed > 90:
            incremented_passed_date = incremented_passed_date - timedelta(days=1)
            days_left = max(1, (incremented_passed_date - initial_control_date).days + 1)
            return days_left


def get_days_remain_and_left(the_last_date: datetime, pre_fetched_dates: list[Date]) -> tuple[int, int]:
    initial_last_date: datetime = the_last_date
    incremented_passed_date = initial_last_date.replace()

    while True:
        beginning_180_days = incremented_passed_date - timedelta(days=179)

        filtered_dates = [
            idate for idate in pre_fetched_dates
            if idate.entry <= incremented_passed_date and idate.exit >= beginning_180_days
        ]

        # Initialize total days stayed
        total_days_stayed = 0
        days_left = 0
        last_exit_date = None
        # Step 1: Calculate total days stayed from the filtered queryset
        for i, idate in enumerate(filtered_dates):
            if filtered_dates:
                entry_date = max(idate.entry, beginning_180_days)
                exit_date = idate.exit

                if i == len(filtered_dates) - 1:
                    last_exit_date = exit_date

                if entry_date <= exit_date:
                    stay_duration = max(1, (exit_date - entry_date).days + 1)
                    total_days_stayed += stay_duration
                    if total_days_stayed >= 90:
                        return days_left, total_days_stayed

        emit_entry = last_exit_date
        emit_exit = incremented_passed_date

        difference = (max(1, (emit_exit - emit_entry).days + 1))
        total_days_stayed += difference

        if total_days_stayed <= 90:
            incremented_passed_date += timedelta(days=1)
        if total_days_stayed > 90:
            incremented_passed_date = incremented_passed_date - timedelta(days=1)
            days_left = max(1, (incremented_passed_date - last_exit_date).days + 1)
            total_days_stayed -= days_left
            return days_left, total_days_stayed


def get_uzb_queryset(queryset):
    from duration.serializers import UzbekistanSurrogacyListSerializer
    latest_date_mld_subquery = Date.objects.filter(
        surrogacy_id=OuterRef('pk'),
        country='MLD'
    ).order_by('-exit').values('exit')[:1]

    latest_date_ukr_subquery = Date.objects.filter(
        surrogacy_id=OuterRef('pk'),
        country='UKR'
    ).order_by('-exit').values('exit')[:1]

    latest_date_subquery = Date.objects.filter(
        surrogacy_id=OuterRef('pk'),
        country='UZB'
    ).order_by('-exit').values('id')[:1]

    queryset = queryset.annotate(
        latest_date_id=Subquery(latest_date_subquery),
        latest_date_mld=Subquery(latest_date_mld_subquery),
        latest_date_ukr=Subquery(latest_date_ukr_subquery),
    )

    latest_date = Date.objects.filter(
        id__in=queryset.values_list('latest_date_id', flat=True)
    ).only('id', 'entry', 'exit', 'surrogacy', 'country', 'disable')

    queryset = queryset.prefetch_related(
        Prefetch('related_dates', queryset=latest_date, to_attr='latest_date')
    )

    queryset = queryset.filter(country='UZB').only('full_name', 'file')

    sorted_queryset = sorted(
        queryset,
        key=lambda obj: (
            int(UzbekistanSurrogacyListSerializer().get_day_stayed(obj))
            if isinstance(UzbekistanSurrogacyListSerializer().get_day_stayed(obj), (int, str)) and
               UzbekistanSurrogacyListSerializer().get_day_stayed(obj) != '_'
            else 0
        ),
        reverse=True,
    )

    return sorted_queryset


def get_nip_queryset(queryset):
    return queryset.filter(country='NIP')


def get_ukr_or_mld_queryset(queryset, country):
    from duration.serializers import SurrogacyListSerializer
    all_dates_qs = Date.objects.filter(country__in=['MLD', 'UKR']).only(
        'surrogacy', 'entry', 'exit', 'disable')

    queryset = queryset.only('full_name', 'country', 'file').prefetch_related(
        Prefetch('related_dates', queryset=all_dates_qs, to_attr='prefetched_dates'),
    ).filter(country=country)

    sorted_queryset = sorted(
        queryset,
        key=lambda obj: (
            int(SurrogacyListSerializer().get_days_left(obj))
            if isinstance(SurrogacyListSerializer().get_days_left(obj), (int, str)) and
               SurrogacyListSerializer().get_days_left(obj) != '_'
            else 90
        )
    )
    return sorted_queryset
