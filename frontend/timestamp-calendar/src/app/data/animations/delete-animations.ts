import {trigger, transition, style, animate, keyframes, query, stagger} from '@angular/animations';

export const fadeOut = trigger('fadeOut', [
  transition(':leave', [
    animate(
      '600ms ease-in-out',
      keyframes([
        style({ opacity: 1, transform: 'scale(1)', offset: 0 }),
        style({ opacity: 0.8, transform: 'scale(0.98)', offset: 0.5 }),
        style({ opacity: 0.3, transform: 'scale(0.96)', offset: 0.8 }),
        style({ opacity: 0, transform: 'scale(0.95)', offset: 1 }),
      ])
    ),
  ]),
]);

export const staggeredFadeIn = trigger('staggeredFadeIn', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-10px)' }),
      stagger('100ms', [
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ], { optional: true }),
  ]),
]);
