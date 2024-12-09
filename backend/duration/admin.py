from django.contrib import admin

from duration.models import SurrogacyMother, Date


@admin.register(SurrogacyMother)
class SurrogacyMotherAdmin(admin.ModelAdmin):
    pass


@admin.register(Date)
class DateAdmin(admin.ModelAdmin):
    pass
