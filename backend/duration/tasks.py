from celery.app import shared_task

from django.db.models import OuterRef, Subquery
from django.utils import timezone
from django.db import transaction, models

from duration.models import Date

Date: models


def get_latest_non_disabled_date_for_tracking():
    with transaction.atomic():
        latest_entry_subquery = Date.objects.filter(
            surrogacy_id=OuterRef('surrogacy_id'),
            disable=True
        ).order_by('-exit').values('exit')[:1]

        latest_dates = Date.objects.filter(
            exit=Subquery(latest_entry_subquery),
            disable=True
        )
        return latest_dates


@shared_task
def set_up_that_day():
    with transaction.atomic():
        latest_dates = get_latest_non_disabled_date_for_tracking()
        if latest_dates:
            # Update the exit date for the latest dates
            latest_dates.update(exit=timezone.now())
