import os

from django.utils.text import get_valid_filename
from django.db import models
from django.conf import settings

COUNTRY_CHOICES = [
    ('MLD', 'Moldova'),
    ('UKR', 'Ukraine'),
    ('UZB', 'Uzbekistan'),
    ('NIP', 'NotInProgram'),
]

def get_img_extension(filename):
    name, ext = os.path.splitext(filename)
    return f'passport.{ext}'

def directory_path(instance, filename):
    return f'Duration/SurrogacyMother/{get_valid_filename("_".join(instance.full_name.split()))}/{filename}'

def directory_path_for_date(instance, filename):

    return (f'Duration/SurrogacyMother/{get_valid_filename("_".join(instance.surrogacy.full_name.split()))}/'
            f'Date_{instance.country}/{get_img_extension(filename)}')


class SurrogacyMother(models.Model):
    full_name = models.CharField(max_length=50, unique=True)
    country = models.CharField(
        max_length=3,
        choices=COUNTRY_CHOICES,
        default='UZB',
    )
    file = models.ImageField(upload_to=directory_path)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name + ' ' + self.country

    def delete(self, *args, **kwargs):
        if settings.DEBUG:
            # Delete the associated file from the filesystem
            if self.file and os.path.isfile(self.file.path):
                os.remove(self.file.path)
        else:
            # Deletion form AWS S3
            self.file.delete(save=False)

        super().delete(*args, **kwargs)



class Date(models.Model):
    surrogacy = models.ForeignKey(SurrogacyMother, on_delete=models.CASCADE, related_name='related_dates')
    entry = models.DateTimeField()
    exit = models.DateTimeField()
    country = models.CharField(max_length=3, choices=COUNTRY_CHOICES)
    disable = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['surrogacy', 'country', 'exit']),
        ]

    def __str__(self):
        return f'{self.surrogacy.full_name} // {self.entry} -- {self.exit} {self.country}'