FROM nginx:stable
RUN chmod -R 755 ../static/angular/browser
COPY ../static/angular/browser /var/www/angular

COPY default.conf /etc/nginx/conf.d/default.conf