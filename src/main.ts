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
import { MockAuthService } from './app/core/services/mocks/mock-auth.service';
import { GroupsService } from './app/features/cursos/services/groups.service';
import { MockGroupsService } from './app/features/cursos/services/mocks/mock-groups.service';
import { CourseTypeService } from './app/core/services/course-type.service';
import { MockCourseTypeService } from './app/core/services/mocks/mock-course-type.service';
import { CoursesService } from './app/features/cursos/services/courses.service';
import { MockCoursesService } from './app/features/cursos/services/mocks/mock-courses.service';
import { TemplateService } from './app/features/configurations/templates/services/template.service';
import { MockTemplateService } from './app/features/configurations/templates/services/mocks/mock-template.service';
import { RequirementsService } from './app/core/services/requirements.service';
import { MockRequirementsService } from './app/core/services/mocks/mock-requirements.service';

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
    // Provider conditional for Mocking
    {
      provide: AuthService,
      useClass: environment.useMocks ? MockAuthService : AuthService
    },
    {
      provide: GroupsService,
      useClass: environment.useMocks ? MockGroupsService : GroupsService
    },
    {
      provide: CourseTypeService,
      useClass: environment.useMocks ? MockCourseTypeService : CourseTypeService
    },
    {
      provide: CoursesService,
      useClass: environment.useMocks ? MockCoursesService : CoursesService
    },
    {
      provide: TemplateService,
      useClass: environment.useMocks ? MockTemplateService : TemplateService
    },
    {
      provide: RequirementsService,
      useClass: environment.useMocks ? MockRequirementsService : RequirementsService
    }
  ]
}).catch(err => console.error(err));
