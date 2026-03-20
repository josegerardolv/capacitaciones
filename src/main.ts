import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { routes } from './app/app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { errorInterceptor } from './app/core/interceptors/error.interceptor';

import { environment } from './environments/environment';
import { AuthService } from './app/core/services/auth.service';
import { GroupsService } from './app/features/cursos/services/groups.service';
import { CourseTypeService } from './app/core/services/course-type.service';
import { CoursesService } from './app/features/cursos/services/courses.service';
import { TemplateService } from './app/features/configurations/templates/services/template.service';
import { RequirementsService } from './app/core/services/requirements.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimations(),
    importProvidersFrom(MatIconModule),
    AuthService,
    GroupsService,
    CourseTypeService,
    CoursesService,
    TemplateService,
    RequirementsService
  ]
}).catch(err => console.error(err));
