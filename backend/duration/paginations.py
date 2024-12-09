from rest_framework.pagination import PageNumberPagination

class SurrogacyPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'  # Allow frontend to set page size
    max_page_size = 100