from datetime import date
from typing import Type

from django.core.files.base import ContentFile
from django.db import models
from django.db.models import QuerySet

from duration.models import SurrogacyMother, Date

Date: models
SurrogacyMother: models


class CreateSurrogacyMotherWithProfileName:

    def __init__(self, profile_name: str, surrogacy_mother_obj: SurrogacyMother):
        self.profile_name = profile_name
        self.surrogacy_mother_obj = surrogacy_mother_obj

    def get_dates_for_this_profile_name(self) -> SurrogacyMother:
        fetched_mother_obj = self._get_surrogacy_mother()
        if not fetched_mother_obj:
            return self.surrogacy_mother_obj

        surrogacy_mother_dates = self._get_related_dates(fetched_mother_obj)
        if not surrogacy_mother_dates:
            return self.surrogacy_mother_obj

        self._create_same_dates_for_instance(surrogacy_mother_dates)
        surrogacy_mother_obj = self._update_country_from_last_date(surrogacy_mother_dates)
        return surrogacy_mother_obj

    def create_the_same_dates_for_specific_instance(self, dates_queryset: QuerySet[Date]) -> None:
        """Create copies of Date instances from the provided queryset and link to the given SurrogacyMother instance."""
        date_objects = [

            Date(surrogacy=self.surrogacy_mother_obj,
                 entry=date_obj.entry,
                 exit=date_obj.exit,
                 country=date_obj.country,
                 disable=date_obj.disable,
                 created=date_obj.created,
                 )
            for date_obj in dates_queryset
        ]

        Date.objects.bulk_create(date_objects)

    def _get_surrogacy_mother(self) -> SurrogacyMother:
        """Fetch the SurrogacyMother instance based on profile name."""
        return SurrogacyMother.objects.filter(full_name=self.profile_name).first()

    @staticmethod
    def _get_related_dates(mother_obj: SurrogacyMother) -> QuerySet[Date]:
        """Fetch related dates for a given SurrogacyMother instance."""
        return mother_obj.related_dates.all()

    def _create_same_dates_for_instance(self, dates_queryset: QuerySet[Date]) -> None:
        """Create the same Date instances for the current SurrogacyMother instance."""
        self.create_the_same_dates_for_specific_instance(dates_queryset=dates_queryset)

    def _update_country_from_last_date(self, dates_queryset: QuerySet[Date]) -> None:
        """Update the country of surrogacy_mother_obj based on the last date in the queryset."""
        last_date = dates_queryset.order_by('id').last()
        if last_date:
            self.surrogacy_mother_obj.country = last_date.country
            self.surrogacy_mother_obj.save()


Files = list[dict[str, ContentFile]] | list[[]]
Dates = list[dict[str, date, bool, Files]]
Surrogacy = dict[str, Dates] | dict[str, []]


class CreateSurrogacyMother:

    def __init__(self, profile_clss: Type[CreateSurrogacyMotherWithProfileName]) -> None:
        self.profile_clss = profile_clss
        self.sur_mother_obj = None

    def process_surrogacy_dict(self, surrogacy_data_dict: Surrogacy) -> SurrogacyMother:
        profile_name: str = surrogacy_data_dict.pop('profileName', '')
        dates_list: Dates | [] = surrogacy_data_dict.pop('datesTable', [])
        self.sur_mother_obj = SurrogacyMother.objects.create(**surrogacy_data_dict)


        if profile_name:
            self.profile_clss(profile_name, self.sur_mother_obj).get_dates_for_this_profile_name()

        if dates_list:
            self._process_date_entries(date_list=dates_list, surrogacy_mother_obj=self.sur_mother_obj)

        return self.sur_mother_obj

    def _process_date_entries(self, date_list: Dates, surrogacy_mother_obj: SurrogacyMother) -> None:

        for i, date_dict in enumerate(date_list):
            if len(date_list) - 1 == i:
                self._update_country_from_last_date(last_date_dict=date_dict,
                                                                           surrogacy_mother_obj=surrogacy_mother_obj)
            self._create_date(date_dict=date_dict, surrogacy_mother_obj=surrogacy_mother_obj)



    @staticmethod
    def _create_date(date_dict: dict, surrogacy_mother_obj: SurrogacyMother) -> None:
        """Create a Date instance without file fields."""
        Date.objects.create(
            surrogacy=surrogacy_mother_obj,
            entry=date_dict.get('entry'),
            exit=date_dict.get('exit'),
            country=date_dict.get('country'),
            disable=date_dict.get('disable'),
            created=date_dict.get('created')
        )


    @staticmethod
    def _update_country_from_last_date(last_date_dict: dict, surrogacy_mother_obj: SurrogacyMother) -> None:
        """Update the country of surrogacy_mother_obj based on the last date in the queryset."""
        surrogacy_mother_obj.country = last_date_dict.get('country')
        surrogacy_mother_obj.save()
