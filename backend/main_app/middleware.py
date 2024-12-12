from django.middleware.csrf import CsrfViewMiddleware

class CustomCsrfMiddleware(CsrfViewMiddleware):
    def process_view(self, request, callback, callback_args, callback_kwargs):
        # Exempt API endpoints from CSRF validation
        if request.path.startswith('/api/'):
            return None
        return super().process_view(request, callback, callback_args, callback_kwargs)
