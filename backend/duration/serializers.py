import base64

from datetime import datetime, timedelta
from PIL import Image
from io import BytesIO

from django.core.files.base import ContentFile
from django.db import models

from rest_framework import serializers

from duration.serializers_services.services import CreateSurrogacyMotherWithProfileName, CreateSurrogacyMother
from duration.services import formatted_date, conv_db_to_readable_name, get_days_remain_and_left, get_country
from duration.models import Date, SurrogacyMother

Date: models
SurrogacyMother: models


class NotInProgramSurrogacyListSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurrogacyMother
        fields = ['id', "full_name", "file"]


class UzbekistanSurrogacyListSerializer(serializers.ModelSerializer):
    day_stayed = serializers.SerializerMethodField(read_only=True)
    day_update_ukr = serializers.SerializerMethodField(read_only=True)
    day_update_mld = serializers.SerializerMethodField(read_only=True)
    disable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SurrogacyMother
        fields = ['id', "full_name", "file", 'day_update_ukr', 'day_update_mld', 'day_stayed', 'disable']

    def get_day_stayed(self, obj):
        last_date = self.fetch_last_date(obj)
        if not last_date:
            return '_'
        return ((last_date.exit - last_date.entry) + timedelta(days=1)).days

    def get_disable(self, obj) -> bool:
        last_date = self.fetch_last_date(obj)
        if not last_date:
            return False
        return last_date.disable

    @staticmethod
    def get_day_update_ukr(obj):
        if not obj.latest_date_ukr:
            return "_"
        return formatted_date(obj.latest_date_ukr)

    @staticmethod
    def get_day_update_mld(obj):
        if not obj.latest_date_mld:
            return "_"
        return formatted_date(obj.latest_date_mld)

    @staticmethod
    def fetch_last_date(obj: SurrogacyMother) -> Date | None:
        if obj is not None and hasattr(obj, "latest_date") and obj.latest_date:
            return obj.latest_date[0]
        return None


class SurrogacyListSerializer(serializers.ModelSerializer):
    days_passed = serializers.SerializerMethodField(read_only=True)
    days_left = serializers.SerializerMethodField(read_only=True)
    date_update = serializers.SerializerMethodField(read_only=True)
    date_update_in_ukr_or_mld = serializers.SerializerMethodField(read_only=True)
    disable = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SurrogacyMother
        fields = [
            'id', "full_name", "file", "days_passed", "days_left", "date_update", "date_update_in_ukr_or_mld",
            'disable'
                  ]

    def get_disable(self, obj) -> bool:
        prefetched_dates = self.filter_prefetched_dates(obj)
        if prefetched_dates:
            latest_date = max(prefetched_dates, key=lambda d: d.exit, default=None)
            return latest_date.disable
        return False

    def get_last_exit_and_prefetched_dates(self, obj: SurrogacyMother):
        dates = self.filter_prefetched_dates(obj, obj.country)
        if dates is not None:
            last_exit = self.check_last_exit_dates(obj)
            if last_exit:
                return last_exit, dates
        return '', ''

    def get_days_passed(self, obj: SurrogacyMother) -> str:
        last_exit, prefetched_dates = self.get_last_exit_and_prefetched_dates(obj)
        if last_exit and prefetched_dates:
            _, total_days_stayed = get_days_remain_and_left(last_exit, pre_fetched_dates=prefetched_dates)

            return total_days_stayed if total_days_stayed or total_days_stayed == 0 else '_'
        return '_'

    def get_days_left(self, obj: SurrogacyMother) -> str:
        last_exit, prefetched_dates = self.get_last_exit_and_prefetched_dates(obj)
        if last_exit and prefetched_dates:
            days_left, _ = get_days_remain_and_left(last_exit, pre_fetched_dates=prefetched_dates)
            return days_left if days_left or days_left == 0 else '_'
        return '_'

    def get_date_update(self, obj: SurrogacyMother) -> str | None:
        last_exit = self.check_last_exit_dates(obj)
        if last_exit is not None:
            return formatted_date(last_exit)
        return '_'

    def get_date_update_in_ukr_or_mld(self, obj: SurrogacyMother) -> str | None:
        country = None
        if obj.country == 'MLD':
            country = 'UKR'
        if obj.country == 'UKR':
            country = 'MLD'

        latest_date = self.check_last_exit_dates(obj, country)
        if latest_date is not None:
            return formatted_date(latest_date)
        return '_'

    @staticmethod
    def fetch_prefetched_dates(obj: SurrogacyMother) -> list:
        if obj is not None:
            if hasattr(obj, "prefetched_dates"):
                return obj.prefetched_dates
        return []

    def filter_prefetched_dates(self, obj: SurrogacyMother, country: str = '') -> list:
        if obj is not None:
            prefetched_dates = self.fetch_prefetched_dates(obj)
            if prefetched_dates:
                country = country if country != '' else obj.country
                filtered_prefetched_dates = [d for d in prefetched_dates if d.country == country]
                return filtered_prefetched_dates
        return []

    def check_last_exit_dates(self, obj: SurrogacyMother, country: str = '') -> datetime | None:
        prefetched_dates = self.filter_prefetched_dates(obj, country)
        if prefetched_dates:
            latest_date = max(prefetched_dates, key=lambda d: d.exit, default=None)
            return latest_date.exit if latest_date else None
        return None


class LastFiveProfilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurrogacyMother
        fields = ["full_name"]


class Base64AvatarImageField(serializers.ImageField):
    def to_internal_value(self, data):
        # Check if the input data is a base64 string
        if isinstance(data, str) and data.startswith('data:image'):
            # Process the base64 image string
            format, imgstr = data.split(';base64,')  # Split format and base64 content
            ext = format.split('/')[-1]  # Get the file extension (e.g., jpg, png)
            decoded_img = base64.b64decode(imgstr)

            # Open the image with Pillow
            img = Image.open(BytesIO(decoded_img))

            # Resize thecalculate_days_to_negative image to 132x132 pixels
            img = img.resize((132, 132), Image.LANCZOS)

            # Save the resized image to a buffer
            buffer = BytesIO()
            img_format = ext.upper()  # Use the file extension as format (e.g., 'JPEG', 'PNG')
            if img_format == 'JPG':  # PIL expects 'JPEG' instead of 'JPG'
                img_format = 'JPEG'
            img.save(buffer, format=img_format)  # Explicitly specify the format
            buffer.seek(0)

            # Convert the byte buffer back to a ContentFile
            return ContentFile(buffer.read(), name=f'avatar.{ext}')

        # If the data is a URL (assumed to be the existing file path), return it as-is
        elif isinstance(data, str) and data.startswith('http'):
            return data  # Skip processing if it's an existing URL

        # Otherwise, let the super method handle the data (e.g., when it's a file upload)
        return super().to_internal_value(data)


class CreateDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Date
        fields = ['entry', 'exit', 'country', 'disable']


class CreateProfileSerializer(serializers.ModelSerializer):
    avatar = Base64AvatarImageField(source='file')
    profileName = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    datesTable = CreateDateSerializer(many=True, required=False)

    class Meta:
        model = SurrogacyMother
        fields = ["full_name", 'avatar', 'country', 'profileName', 'datesTable']

    def create(self, validated_data):
        surrogacy_data = validated_data
        creation_instance = CreateSurrogacyMother(CreateSurrogacyMotherWithProfileName)
        instance = creation_instance.process_surrogacy_dict(surrogacy_data)
        return instance


class FetchDateSerializer(serializers.ModelSerializer):
    country = serializers.SerializerMethodField()
    days_left = serializers.SerializerMethodField()

    class Meta:
        model = Date
        fields = [
            'id', 'entry', 'exit', 'country', 'disable', 'created', 'days_left'
        ]

    @staticmethod
    def get_days_left(obj):
        return ((obj.exit - obj.entry) + timedelta(days=1)).days

    @staticmethod
    def get_country(obj):
        return conv_db_to_readable_name(obj.country)


class FetchSurrogacyMotherSerializer(serializers.ModelSerializer):
    related_dates = FetchDateSerializer(many=True)
    country = serializers.SerializerMethodField()

    class Meta:
        model = SurrogacyMother
        fields = ['id', 'full_name', 'country', 'file', 'related_dates']

    @staticmethod
    def get_country(obj):
        return conv_db_to_readable_name(obj.country)


class UpdateDateSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    status = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    deleted = serializers.BooleanField(required=False, allow_null=True)
    updated = serializers.BooleanField(required=False, allow_null=True)

    class Meta:
        model = Date
        fields = ['id', 'entry', 'exit', 'country', 'disable', 'created', 'status', 'deleted', 'updated', ]

    def create(self, validated_data):
        # Remove fields that are not part of the Date model
        validated_data.pop('status', None)
        validated_data.pop('deleted', None)
        validated_data.pop('updated', None)

        # Create and return the new Date instance
        return Date.objects.create(**validated_data)

    def update(self, instance, validated_data):
        status = validated_data.get('status')
        updated = validated_data.get('updated', False)

        if status == 'new':
            validated_data.pop('status', None)
            validated_data.pop('deleted', None)
            validated_data.pop('updated', None)
            new_instance = Date.objects.create(**validated_data)
            return new_instance

        if updated:
            for attr, value in validated_data.items():
                if attr not in ['status', 'deleted', 'updated']:
                    setattr(instance, attr, value)
            instance.save()
            return instance

        return instance


class UpdateProfileSerializer(serializers.ModelSerializer):
    datesTable = UpdateDateSerializer(many=True, required=False)
    updated = serializers.BooleanField(required=True, allow_null=True)
    file = Base64AvatarImageField()

    class Meta:
        model = SurrogacyMother
        fields = ['id', 'full_name', 'file', 'country', 'datesTable', 'updated']

    def update(self, instance, validated_data):
        # Process the 'file' field
        file_data = validated_data.get('file')

        if file_data and isinstance(file_data, ContentFile):
            # If the file is in Base64 format and converted to ContentFile, save it
            instance.file.save(file_data.name, file_data, save=False)
        elif file_data and isinstance(file_data, str) and file_data.startswith('http'):
            # If the file is a URL, skip saving (retain existing file)
            validated_data.pop('file')

        dates_data = validated_data.pop('datesTable', [])
        created_or_updated_dates = []

        # Process the incoming dates
        if dates_data:
            for date_data in dates_data:
                primary_key = date_data.get('id')
                deleted = date_data.get('deleted', False)
                status = date_data.get('status', 'old')

                if deleted and primary_key:
                    # Delete the Date instance
                    Date.objects.filter(id=primary_key, surrogacy=instance).delete()
                elif status == 'new':
                    # Create a new Date instance
                    date_serializer = UpdateDateSerializer(data=date_data)
                    if date_serializer.is_valid(raise_exception=True):
                        new_date = date_serializer.save(surrogacy=instance)
                        created_or_updated_dates.append(new_date)
                elif status == 'old' and primary_key:
                    # Update the existing Date instance
                    date_instance = Date.objects.filter(id=primary_key, surrogacy=instance).first()
                    if date_instance:
                        date_serializer = UpdateDateSerializer(date_instance, data=date_data, partial=True)
                        if date_serializer.is_valid(raise_exception=True):
                            updated_date = date_serializer.save()
                            created_or_updated_dates.append(updated_date)


        # Update the SurrogacyMother profile itself
        updated = validated_data.pop('updated', False)
        if updated:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

        return instance



