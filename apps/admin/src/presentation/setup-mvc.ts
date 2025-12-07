import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import hbs from 'hbs';
import { join } from 'path';
import { NotFoundFilter } from '../shared/filters/not-found.filter';

export function setupMvcApp(
  app: NestExpressApplication,
  basePath: string,
): void {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  hbs.registerPartials(join(basePath, 'views/partials'));
  app.useStaticAssets(join(basePath, 'public'));
  app.setBaseViewsDir(join(basePath, 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layout' });

  if (process.env.NODE_ENV !== 'production') {
    app.set('view cache', false);
  }

  app.useGlobalFilters(new NotFoundFilter());
}
