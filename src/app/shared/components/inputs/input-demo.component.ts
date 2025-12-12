import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { InputEnhancedComponent } from './input-enhanced.component';
import { InputWrapperComponent } from './input-wrapper.component';
import { InstitutionalButtonComponent } from '../buttons/institutional-button.component';

@Component({
  selector: 'app-input-enhanced-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputEnhancedComponent, InputWrapperComponent, InstitutionalButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-6xl">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Input Enhanced Component Demo</h1>
        <p class="text-gray-600">Un componente de input potente y flexible con validaciones avanzadas</p>
      </header>

      <form [formGroup]="demoForm" (ngSubmit)="onSubmit()" class="space-y-8">
        
        <!-- Sección: Inputs Básicos -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800 border-b pb-2">Inputs Básicos</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Text Input básico -->
            <app-input-enhanced
              [control]="getFormControl('nombreEnhanced')"
              controlName="nombreEnhanced"
              label="Nombre completo"
              placeholder="Ingrese su nombre"
              type="text"
              [floating]="true"
              [required]="true"
              [validationMap]="validationMap"
              helperText="Ingrese su nombre y apellidos">
            </app-input-enhanced>

            <!-- Text Input con floating label -->
            <app-input-enhanced
              [control]="getFormControl('emailEnhanced')"
              controlName="emailEnhanced"
              label="Correo electrónico"
              type="email"
              [floating]="true"
              [required]="true"
              iconLeft="📧"
              [clear]="true"
              [validationMap]="validationMap"
              helperText="Será usado para notificaciones">
            </app-input-enhanced>
          </div>
        </section>

        <!-- Sección: Más Inputs -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800 border-b pb-2">Más Tipos de Input</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Password -->
            <app-input-enhanced
              [control]="getFormControl('passwordEnhanced')"
              controlName="passwordEnhanced"
              label="Contraseña"
              type="password"
              [floating]="true"
              [required]="true"
              iconLeft="🔒"
              [clear]="true"
              [validationMap]="validationMap"
              helperText="Mínimo 8 caracteres">
            </app-input-enhanced>

            <!-- Teléfono -->
            <app-input-enhanced
              [control]="getFormControl('telefonoEnhanced')"
              controlName="telefonoEnhanced"
              label="Teléfono"
              type="tel"
              placeholder="(000) 000-0000"
              iconLeft="📞"
              [validationMap]="validationMap">
            </app-input-enhanced>

            <!-- Edad -->
            <app-input-enhanced
              [control]="getFormControl('edadEnhanced')"
              controlName="edadEnhanced"
              label="Edad"
              type="number"
              [min]="18"
              [max]="100"
              [required]="true"
              iconLeft="🎂"
              [floating]="true"
              [validationMap]="validationMap"
              helperText="Debe ser mayor de edad">
            </app-input-enhanced>

            <!-- Fecha -->
            <app-input-enhanced
              [control]="getFormControl('fechaNacimientoEnhanced')"
              controlName="fechaNacimientoEnhanced"
              label="Fecha de nacimiento"
              type="date"
              [floating]="true"
              iconLeft="📅"
              [required]="true"
              [validationMap]="validationMap">
            </app-input-enhanced>
          </div>
        </section>

        <!-- Sección: Validaciones Especializadas -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800 border-b pb-2">Validaciones Especializadas de México</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- RFC -->
            <app-input-enhanced
              [control]="getFormControl('rfcEnhanced')"
              controlName="rfcEnhanced"
              label="RFC"
              type="text"
              placeholder="XAXX010101000"
              [floating]="true"
              iconLeft="🏛️"
              [validationMap]="validationMap"
              helperText="Registro Federal de Contribuyentes">
            </app-input-enhanced>

            <!-- CURP -->
            <app-input-enhanced
              [control]="getFormControl('curpEnhanced')"
              controlName="curpEnhanced"
              label="CURP"
              type="text"
              placeholder="XEXX010101HNEXXXA4"
              [floating]="true"
              iconLeft="🆔"
              [validationMap]="validationMap"
              helperText="Clave Única de Registro de Población">
            </app-input-enhanced>

            <!-- NSS -->
            <app-input-enhanced
              [control]="getFormControl('nssEnhanced')"
              controlName="nssEnhanced"
              label="NSS"
              type="text"
              placeholder="12345678901"
              iconLeft="🏥"
              [validationMap]="validationMap"
              helperText="Número de Seguridad Social">
            </app-input-enhanced>

            <!-- INE -->
            <app-input-enhanced
              [control]="getFormControl('ineEnhanced')"
              controlName="ineEnhanced"
              label="Clave de Elector"
              type="text"
              placeholder="SLRCRD02051965H100"
              [floating]="true"
              iconLeft="🗳️"
              [validationMap]="validationMap"
              helperText="Clave de Elector INE">
            </app-input-enhanced>

            <!-- CLABE -->
            <app-input-enhanced
              [control]="getFormControl('clabeEnhanced')"
              controlName="clabeEnhanced"
              label="CLABE Bancaria"
              type="text"
              placeholder="123456789012345678"
              [floating]="true"
              iconLeft="🏦"
              [validationMap]="validationMap"
              helperText="Clave Bancaria Estandarizada">
            </app-input-enhanced>

            <!-- Código Postal -->
            <app-input-enhanced
              [control]="getFormControl('codigoPostalEnhanced')"
              controlName="codigoPostalEnhanced"
              label="Código Postal"
              type="text"
              placeholder="12345"
              iconLeft="📮"
              [validationMap]="validationMap"
              helperText="5 dígitos">
            </app-input-enhanced>
          </div>
        </section>

        <!-- Sección: Otros Tipos de Input -->
        <section class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-800 border-b pb-2">Otros Tipos de Input</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- URL -->
            <app-input-enhanced
              [control]="getFormControl('urlEnhanced')"
              controlName="urlEnhanced"
              label="Sitio Web"
              type="url"
              placeholder="https://ejemplo.com"
              [floating]="true"
              iconLeft="🌐"
              [validationMap]="validationMap"
              helperText="URL completa">
            </app-input-enhanced>

            <!-- Tarjeta de Crédito -->
            <app-input-enhanced
              [control]="getFormControl('tarjetaEnhanced')"
              controlName="tarjetaEnhanced"
              label="Tarjeta de Crédito"
              type="text"
              placeholder="1234 5678 9012 3456"
              [floating]="true"
              iconLeft="💳"
              [validationMap]="validationMap"
              helperText="Número de tarjeta válido">
            </app-input-enhanced>

            <!-- Color -->
            <app-input-enhanced
              [control]="getFormControl('colorEnhanced')"
              controlName="colorEnhanced"
              label="Color Favorito"
              type="color"
              [floating]="true"
              iconLeft="🎨"
              [validationMap]="validationMap">
            </app-input-enhanced>

            <!-- Range -->
            <app-input-enhanced
              [control]="getFormControl('rangoEnhanced')"
              controlName="rangoEnhanced"
              label="Calificación"
              type="range"
              [min]="1"
              [max]="100"
              [showRangeLabels]="true"
              [validationMap]="validationMap"
              helperText="Del 1 al 100">
            </app-input-enhanced>

            <!-- Archivo -->
            <app-input-enhanced
              [control]="getFormControl('archivoEnhanced')"
              controlName="archivoEnhanced"
              label="Documento"
              type="file"
              accept=".pdf,.doc,.docx"
              [validationMap]="validationMap"
              helperText="PDF o Word únicamente">
            </app-input-enhanced>

            <!-- Textarea -->
            <app-input-enhanced
              [control]="getFormControl('comentariosEnhanced')"
              controlName="comentariosEnhanced"
              label="Comentarios"
              type="textarea"
              [rows]="4"
              [floating]="true"
              [showCharCount]="true"
              [validationMap]="validationMap"
              helperText="Comparte tus comentarios">
            </app-input-enhanced>
          </div>
        </section>

        <!-- Controles -->
        <section class="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Controles de Demo</h3>
          
          <div class="flex flex-wrap gap-4 mb-6">
            <app-institutional-button
              [config]="{
                variant: 'primary'
              }"
              (clicked)="fillSampleData()">
              📝 Llenar Datos de Ejemplo
            </app-institutional-button>
            
            <app-institutional-button
              [config]="{
                variant: 'secondary'
              }"
              (clicked)="clearForm()">
              🗑️ Limpiar Formulario
            </app-institutional-button>
            
            <app-institutional-button
              [config]="{
                type: 'submit',
                variant: 'primary',
                disabled: demoForm.invalid
              }">
              🚀 Enviar Formulario
            </app-institutional-button>
          </div>

          <!-- Estado del formulario -->
          <div class="text-sm text-gray-600">
            <p><strong>Estado del formulario:</strong> {{ demoForm.valid ? 'Válido' : 'Inválido' }}</p>
          </div>
        </section>
      </form>
    </div>
  `
})
export class InputEnhancedDemoComponent implements OnInit {
  
  demoForm!: FormGroup;

  // Helper method para casting de tipo
  getFormControl(controlName: string): FormControl {
    return this.demoForm.get(controlName) as FormControl;
  }

  // Configuración de validaciones
  validationMap = {
    nombreEnhanced: {
      required: true,
      minLength: 2,
      maxLength: 100,
      onlyLetters: true,
      messages: {
        required: 'El nombre es obligatorio',
        minLength: 'El nombre debe tener al menos 2 caracteres',
        maxLength: 'El nombre no puede exceder 100 caracteres',
        onlyLetters: 'Solo se permiten letras y espacios'
      }
    },
    emailEnhanced: {
      required: true,
      email: true,
      maxLength: 150,
      messages: {
        required: 'El email es obligatorio',
        email: 'Formato de email inválido',
        maxLength: 'El email es demasiado largo'
      }
    },
    passwordEnhanced: {
      required: true,
      minLength: 8,
      securePassword: true,
      messages: {
        required: 'La contraseña es obligatoria',
        minLength: 'Mínimo 8 caracteres',
        securePassword: 'Debe contener mayúscula, minúscula, número y carácter especial'
      }
    },
    telefonoEnhanced: {
      phone: true,
      messages: {
        phone: 'Formato de teléfono inválido (10 dígitos)'
      }
    },
    edadEnhanced: {
      required: true,
      min: 18,
      max: 99,
      integer: true,
      positive: true,
      messages: {
        required: 'La edad es obligatoria',
        min: 'Debe ser mayor de edad (18+)',
        max: 'Edad máxima permitida: 99',
        integer: 'Debe ser un número entero',
        positive: 'Debe ser un número positivo'
      }
    },
    fechaNacimientoEnhanced: {
      required: true,
      dateRange: {
        min: '1900-01-01',
        max: new Date().toISOString().split('T')[0]
      },
      messages: {
        required: 'La fecha de nacimiento es obligatoria',
        dateRange: 'Fecha inválida'
      }
    },
    // Validaciones especializadas de México
    rfcEnhanced: {
      rfc: true
    },
    curpEnhanced: {
      curp: true
    },
    nssEnhanced: {
      nss: true
    },
    ineEnhanced: {
      ine: true
    },
    clabeEnhanced: {
      clabe: true
    },
    codigoPostalEnhanced: {
      postalCode: true
    },
    // Otros tipos de validación
    urlEnhanced: {
      url: true,
      messages: {
        url: 'URL inválida (debe incluir protocolo)'
      }
    },
    tarjetaEnhanced: {
      creditCard: true,
      messages: {
        creditCard: 'Número de tarjeta inválido'
      }
    },
    colorEnhanced: {
      pattern: /^#[0-9A-F]{6}$/i,
      messages: {
        pattern: 'Color en formato hexadecimal (#RRGGBB)'
      }
    },
    rangoEnhanced: {
      min: 1,
      max: 100,
      integer: true,
      messages: {
        min: 'Valor mínimo: 1',
        max: 'Valor máximo: 10',
        integer: 'Debe ser un número entero'
      }
    },
    archivoEnhanced: {
      fileTypes: ['pdf', 'doc', 'docx'],
      fileSize: 5 * 1024 * 1024, // 5MB
      messages: {
        fileTypes: 'Solo se permiten archivos PDF, DOC o DOCX',
        fileSize: 'El archivo no debe exceder 5MB'
      }
    },
    comentariosEnhanced: {
      maxLength: 500,
      messages: {
        maxLength: 'Máximo 500 caracteres'
      }
    }
  };

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  private createForm(): void {
    this.demoForm = this.fb.group({
      nombreEnhanced: [''],
      emailEnhanced: [''],
      passwordEnhanced: [''],
      telefonoEnhanced: [''],
      edadEnhanced: [null],
      fechaNacimientoEnhanced: [''],
      // Nuevos campos especializados
      rfcEnhanced: [''],
      curpEnhanced: [''],
      nssEnhanced: [''],
      ineEnhanced: [''],
      clabeEnhanced: [''],
      codigoPostalEnhanced: [''],
      // Otros tipos
      urlEnhanced: [''],
      tarjetaEnhanced: [''],
      colorEnhanced: ['#8b1538'],
      rangoEnhanced: [5],
      archivoEnhanced: [null],
      comentariosEnhanced: ['']
    });
  }

  fillSampleData(): void {
    this.demoForm.patchValue({
      nombreEnhanced: 'Juan Carlos Pérez García',
      emailEnhanced: 'juan.perez@example.com',
      passwordEnhanced: 'MiPassword123!',
      telefonoEnhanced: '9511234567',
      edadEnhanced: 35,
      fechaNacimientoEnhanced: '1988-05-15',
      // Datos especializados de México
      rfcEnhanced: 'PEGJ880515ABC',
      curpEnhanced: 'PEGJ880515HOCRRN09',
      nssEnhanced: '12345678901',
      ineEnhanced: 'SLRCRD02051965H100',
      clabeEnhanced: '012345678901234567',
      codigoPostalEnhanced: '68000',
      // Otros tipos
      urlEnhanced: 'https://www.example.com',
      tarjetaEnhanced: '4111111111111111',
      colorEnhanced: '#8b1538',
      rangoEnhanced: 8,
      comentariosEnhanced: 'Este es un comentario de ejemplo para demostrar el componente de textarea.'
    });
  }

  clearForm(): void {
    this.demoForm.reset();
  }

  onSubmit(): void {
    if (this.demoForm.valid) {
      console.log('Formulario válido:', this.demoForm.value);
      alert('¡Formulario enviado correctamente! Revisa la consola para ver los datos.');
    } else {
      console.log('Formulario inválido:', this.demoForm.errors);
      this.markAllFieldsAsTouched();
      alert('Por favor, corrija los errores en el formulario.');
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.demoForm.controls).forEach(field => {
      this.demoForm.get(field)?.markAsTouched();
    });
  }
}

// Export alias para compatibilidad con rutas
export { InputEnhancedDemoComponent as InputDemoComponent };
