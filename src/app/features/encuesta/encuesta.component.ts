import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InstitutionalCardComponent } from '@/app/shared/components/institutional-card/institutional-card.component';
import { UniversalIconComponent } from '@/app/shared/components/universal-icon/universal-icon.component';
import { BreadcrumbComponent } from '@/app/shared/components/breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '@/app/shared/components/breadcrumb/breadcrumb.model';
import { SelectComponent } from '@/app/shared/components';
import { CommonModule } from '@angular/common';
import { SelectOption } from '@/app/shared/services/select-data.service';
import { InputComponent } from "@/app/shared/components/inputs/input.component";
import { ButtonGroupComponent, ButtonGroupButton } from '@/app/shared/components/buttons';
import { AlertModalComponent } from '@/app/shared/components/modals';
import { ModalFormComponent } from '@/app/shared/components';
import { SelectMultiComponent } from '@/app/shared/components/inputs/select-multi.component';
import { DayPickerComponent } from '@/app/shared/components';

@Component({
  selector: 'app-encuesta',
  imports: [CommonModule, ReactiveFormsModule, InstitutionalCardComponent, UniversalIconComponent, BreadcrumbComponent, SelectComponent, InputComponent, ButtonGroupComponent, AlertModalComponent, ModalFormComponent, SelectMultiComponent, DayPickerComponent],
  templateUrl: './encuesta.component.html'
})
export class EncuestaComponent implements OnInit {
  private readonly STORAGE_KEY = 'encuesta_preguntas_dinamicas';
  
  // Breadcrumb
  breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Encuesta' }
  ];

  encuestaForm!: FormGroup;
  showSuccessModal = false;
  showAddQuestionModal = false;
  newQuestionForm!: FormGroup;
  hasPendingChanges = false;
  datePickerForm!: FormGroup;
  selectedSendDate: Date | null = null;
  showDatePickerModal = false;
  today: Date = new Date();


  //Opciones de la primer pregunta
  cursosOptions: SelectOption[] = [
    { value: 'curso1', label: 'A01' },
    { value: 'curso2', label: 'Z25' },
    { value: 'curso3', label: 'E00' },
    { value: 'curso4', label: 'C32' },
  ];

  //Opciones de la segunda pregunta
  relevanciaOptions: SelectOption[] = [
    { value: 'excelente', label: 'Excelente: Los temas actuales son muy útiles' },
    { value: 'buena', label: 'Buena: La mayoria de los temas son relevantes' },
    { value: 'regular', label: 'Regular: Algunos temas están desactualizados o no son claros' },
    { value: 'mala', label: 'Mala: El contenido no fue relevante para mis necesidades' },
  ];

  //Opciones de la tercera pregunta
  desempenioOptions: SelectOption[] = [
    { value: 'muy_clara', label: 'Muy clara: Explicó de forma sencilla y resolvió todas las dudas' },
    { value: 'clara', label: 'Clara: Se entendió la mayor parte de la exposición' },
    { value: 'poco_clara', label: 'Poco clara: El lenguaje fue muy técnico o confuso' },
    { value: 'nada_clara', label: 'Nada clara: No se entendieron los puntos principales' }
  ];

  //Opciones de la cuarta pregunta
  materialOptions: SelectOption[] = [
    { value: 'muy_util', label: 'Muy útil: Facilitó mucho el aprendizaje' },
    { value: 'util', label: 'Útil: Sirvió como buen complemento' },
    { value: 'poco_util', label: 'Poco útil: El material era escaso o difícil de entender' },
    { value: 'nada', label: 'No se proporcionó material' }
  ];

  //Opciones de la quinta pregunta
  preparacionOptions: SelectOption[] = [
    { value: 'muy_preparado', label: 'Muy preparado(a): Puedo aplicarlo de inmediato' },
    { value: 'preparado', label: 'Preparado(a): Conozco los conceptos básicos para empezar' },
    { value: 'poco_preparado', label: 'Poco preparado(a): Necesito más capacitación o refuerzo' },
    { value: 'nada_preparado', label: 'Nada preparado(a): No siento que haya aprendido algo aplicable' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.initNewQuestionForm();
    this.loadPreguntasDinamicas();
    this.updateConfirmButton();
    this.initDatePickerForm();
  }

  private initDatePickerForm(): void {
    this.datePickerForm = this.fb.group({
      selectedDate: [this.selectedSendDate, Validators.required]
    });
  }

  private initForm(): void {
    this.encuestaForm = this.fb.group({ 
      curso: [[], Validators.required],
      relevancia: [[], Validators.required],
      desempenio: [[], Validators.required],
      material: [[], Validators.required],
      preparacion: [[], Validators.required],
      mejora: ['']
    });
  }

  private initNewQuestionForm(): void {
    this.newQuestionForm = this.fb.group({
      tipoPregunta: ['', Validators.required],
      pregunta: ['', Validators.required],
      opciones: ['']
    });

    this.newQuestionForm.get('tipoPregunta')?.valueChanges.subscribe(tipo => {
      const opcionesControl = this.newQuestionForm.get('opciones');
      if (tipo === 'multiple' || tipo === 'multiple_multi'){
        opcionesControl?.setValidators([Validators.required])
      } else {
        opcionesControl?.clearValidators();
        opcionesControl?.setValue('');
      }
      opcionesControl?.updateValueAndValidity();
    });
  }

  private loadPreguntasDinamicas(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.preguntasDinamicas = JSON.parse(saved);

        this.preguntasDinamicas.forEach(pregunta => {
          if (pregunta.tipo === 'multiple') {
            this.encuestaForm.addControl(pregunta.id, this.fb.control([]));
          } else if (pregunta.tipo === 'multiple_multi') {
            this.encuestaForm.addControl(pregunta.id, this.fb.control([]));
          } else {
            this.encuestaForm.addControl(pregunta.id, this.fb.control(''));
          }
        });
        
        this.updateConfirmButton();
      } catch (error) {
        console.error('Error al cargar las preguntas dinámicas:', error);
      }
    }
  }

  private savePreguntasDinamicas(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preguntasDinamicas));
  }

  tipoPreguntaOptions: SelectOption[] = [
    { value: 'multiple', label: 'Pregunta de opción multiple (una respuesta)' },
    { value: 'multiple_multi', label: 'Pregunta de opción multiple (múltiples respuestas)' },
    { value: 'texto', label: 'Pregunta abierta' }
  ]

  // Mapa de validaciones para el formulario de nueva pregunta
  newQuestionValidationMap = {
    pregunta: {
      required: true,
      minLength: 10,
      maxLength: 200,
      messages: {
        required: 'Por favor, escriba la pregunta',
        minLength: 'La pregunta debe tener al menos 10 caracteres',
        maxLength: 'Máximo 200 caracteres'
      }
    },
    opciones: {
      required: true,
      minLength: 5,
      messages: {
        required: 'Por favor, ingrese las opciones separadas por comas',
        minLength: 'Escribe al menos dos opciones'
      }
    }
  };

  get mostrarOpciones(): boolean {
    const tipo = this.newQuestionForm.get('tipoPregunta')?.value;
    return tipo === 'multiple' || tipo === 'multiple_multi';
  }

  onSubmit(): void {
    if (this.hasPendingChanges){
      this.showSuccessModal = true;
    }
  }

  // Botones del formulario con el tipo correcto
  formButtons: ButtonGroupButton[] = [
    {
      id: 'añadir',
      label: 'Añadir Pregunta',
      config: {
        variant: 'info',
        icon: 'add',
        iconPosition: 'left',
        size: 'medium'
      }
    },
    {
      id: 'confirm',
      label: 'Confirmar',
      config: {
        variant: 'success',
        icon: 'save',
        iconPosition: 'left',
        size: 'medium',
        type: 'submit',
        disabled: true
      }
    },
    {
      id: 'cancel',
      label: 'Cancelar',
      config: {
        variant: 'light',
        size: 'medium',
      }
    },
    {
      id: 'sendDate',
      label: 'Fecha de envio',
      config: {
        variant: 'primary',
        size: 'medium',
      }
    }
  ];

//Configuración del grupo de botones principal (Añadir pregunta, Confirmar, Cancelar)
  buttonGroupConfig = {
    orientation: 'horizontal' as const,
    size: 'medium' as const,
    separated: true,
    fullWidth: false,
    alignment: 'start' as const
  };

  // Configuracion del modal para añadir las preguntas
  addQuestionModalConfig = {
    title: 'Añadir Nueva Pregunta',
    size: 'lg' as const
  };

  //Configuración del modal de éxito
  successModalConfig = {
    title: 'Operación Exitosa',
    message: '¡Se han guardado sus preguntas correctamente!',
    type: 'success' as const,
    showIcon: true,
    size: 'md' as const
  };

  // Maneja los clicks de los botones del grupo
  onButtonGroupClick(event: { buttonId: string; event: Event }): void {
    switch (event.buttonId) {
      case 'añadir':
        this.onAñadirPregunta();
        break;
      case 'cancel':
        this.onCancelar(event.event);
        break;
      case 'sendDate':
        this.onSelectSendDate();
        break;
    }
  }

  private onSelectSendDate(): void {
    this.showDatePickerModal = true;
  }

  onDatePickerModalClose(): void {
    this.showDatePickerModal = false;
  }

  onDateSelected(date: Date): void {
    this.selectedSendDate = date;
    this.datePickerForm.patchValue({ selectedDate: date });
    console.log('Fecha de envío seleccionada:', date);
  }

  onDatePickerModalSubmit(event: any): void {
    if (this.selectedSendDate) {
      console.log('Fecha confirmada para envío:', this.selectedSendDate);
      this.showDatePickerModal = false;
    } else {
      console.warn('No se ha seleccionado ninguna fecha');
    }
  }

  private updateConfirmButton(): void {
    this.formButtons[1].config!.disabled = !this.hasPendingChanges;
  }

  private onAñadirPregunta(): void {
    this.showAddQuestionModal = true;
  }

  private onCancelar(event: Event): void {
    event.preventDefault();
    this.encuestaForm.reset();
  }

  onModalClose(): void {
    this.showSuccessModal = false;
    this.encuestaForm.reset();
    this.hasPendingChanges = false;
    this.updateConfirmButton();
  }

  onAddQuestionModalClose(): void {
    this.showAddQuestionModal = false;
    this.newQuestionForm.reset();
  }

  onAddQuestionSubmit(formValue: any): void {
    const {tipoPregunta, pregunta, opciones} = formValue;
    const preguntaId = `pregunta_dinamica_${Date.now()}`;
    const nuevaPregunta: any = {
      id: preguntaId,
      tipo: tipoPregunta,
      pregunta: pregunta
    };

    if (tipoPregunta === 'multiple' || tipoPregunta === 'multiple_multi'){
      nuevaPregunta.opciones = opciones.split(',').map((opcion: string, index: number) =>({
        value: `opcion_${index + 1}`, label: opcion.trim()
      })).filter((opt: SelectOption) => opt.label !== '');
    }
    
    this.preguntasDinamicas.push(nuevaPregunta);
    this.hasPendingChanges = true;
    this.updateConfirmButton();
    this.savePreguntasDinamicas();

    if (tipoPregunta === 'multiple' || tipoPregunta === 'multiple_multi'){
      this.encuestaForm.addControl(preguntaId, this.fb.control([]));
    } else {
      this.encuestaForm.addControl(preguntaId, this.fb.control(''));
    }
    
    this.showAddQuestionModal = false;
    this.newQuestionForm.reset();
  }


  preguntasDinamicas: Array<{
    id: string;
    tipo: 'multiple' | 'multiple_multi' | 'texto';
    pregunta: string;
    opciones?: SelectOption[];
  }> = [];
}