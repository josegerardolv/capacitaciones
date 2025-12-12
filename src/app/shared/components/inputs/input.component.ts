// ...existing code...
import { Component, Input, OnInit, OnDestroy, AfterViewInit, DoCheck, Optional, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, ControlContainer, FormControl, ValidatorFn, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

type ValidatorSpec = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  integer?: boolean;
  positive?: boolean;
  pattern?: string | RegExp;
  email?: boolean;
  rfc?: boolean;
  curp?: boolean;
  nss?: boolean; // número de seguridad social (NSS) - 11 dígitos
  phone?: boolean;
  postalCode?: boolean;
  uuid?: boolean;
  securePassword?: boolean; // contraseña segura: mayúscula, minúscula, dígito, especial, minLength
  url?: boolean;
  creditCard?: boolean;
  ine?: boolean; // clave de elector INE
  imss?: boolean; // número IMSS
  clabe?: boolean; // clave bancaria estandarizada
  ipAddress?: boolean;
  macAddress?: boolean;
  dateRange?: { min?: string; max?: string }; // formato ISO date
  timeRange?: { min?: string; max?: string }; // formato HH:mm
  fileSize?: number; // tamaño máximo en bytes
  fileTypes?: string[]; // extensiones permitidas
  alphanumeric?: boolean;
  noSpaces?: boolean;
  onlyLetters?: boolean;
  custom?: (value: any) => string | null; // return error message or null
  messages?: { [key: string]: string };
};

@Component({
  selector: 'app-input-enhanced',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [class]="wrapperClass + ' input-wrapper'" [ngClass]="getWrapperClasses()">
      <!-- Helper text superior -->
      <div *ngIf="helperText && helperPosition === 'top'" 
           class="helper-text mb-1 flex items-center">
        <svg *ngIf="helperIcon" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
        {{ helperText }}
      </div>

      <!-- SOLO renderiza uno: floating o normal, nunca ambos -->
      <ng-container *ngIf="isFloatingTrue()">
        <div class="relative">
          <ng-container *ngIf="control">
            <!-- Icono izquierdo -->
            <span *ngIf="iconLeft" 
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                  [ngClass]="getIconClasses('left')">
              {{ iconLeft }}
            </span>

            <!-- Input simplificado - solo un input por tipo -->
            <input *ngIf="type !== 'file' && type !== 'range' && type !== 'textarea'"
                [id]="controlId"
                [type]="type"
                class="peer floating-input"
                [class.has-icon-left]="iconLeft && type === 'color'"
                [class.has-icon-right]="iconRight && type === 'color'"
                [class]="inputClass"
                [ngClass]="getInputStateClasses()"
                [style.width]="getComputedWidth()"
                [style.height]="getComputedHeight()"
                [style.paddingLeft.px]="getLeftPadding()"
                [style.paddingRight.px]="getRightPadding()"
                [style.paddingTop.px]="14"
                [style.paddingBottom.px]="14"
                [placeholder]="' '"
                [attr.min]="min"
                [attr.max]="max"
                [attr.step]="step"
                [attr.accept]="accept"
                [attr.autocomplete]="autocomplete"
                [readonly]="readonly"
                [attr.aria-invalid]="invalidTouched"
                [attr.aria-describedby]="getAriaDescribedBy()"
                [formControl]="control"
                (focus)="onFocus()" 
                (blur)="onBlur()"
                (input)="onInput($event)"
                (paste)="onPaste($event)"
                (keydown)="onKeyDown($event)"
                (keyup)="onKeyUp($event)">

            <!-- Textarea para floating -->
            <textarea *ngIf="type === 'textarea'"
                [id]="controlId"
                class="peer floating-input resize-none"
                [class]="inputClass"
                [ngClass]="getInputStateClasses()"
                [style.width]="getComputedWidth()"
                [style.height]="getComputedHeight()"
                [style.paddingLeft.px]="getLeftPadding()"
                [style.paddingRight.px]="getRightPadding()"
                [style.paddingTop.px]="14"
                [style.paddingBottom.px]="14"
                [placeholder]="' '"
                [attr.rows]="rows"
                [readonly]="readonly"
                [attr.aria-invalid]="invalidTouched"
                [attr.aria-describedby]="getAriaDescribedBy()"
                [formControl]="control"
                (focus)="onFocus()" 
                (blur)="onBlur()"
                (input)="onInput($event)"
                (paste)="onPaste($event)"
                (keydown)="onKeyDown($event)"
                (keyup)="onKeyUp($event)">
            </textarea>

            <!-- File input para floating (mejorado) -->
            <div *ngIf="type === 'file'" class="file-picker border rounded-lg p-3 bg-white flex items-center" [style.width]="getComputedWidth()">
              <label class="file-btn cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors" [for]="controlId">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <span class="font-medium">Seleccionar archivo</span>
              </label>
              <input [id]="controlId" type="file" class="hidden" 
                     [accept]="accept" 
                     [multiple]="multiple"
                     (change)="onFileChange($event)" />

              <div class="file-info flex-1 ml-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="file-icon text-2xl text-gray-500">📄</span>
                  <div class="file-meta">
                    <div class="file-name text-sm text-gray-700">{{ getFileName() || 'Ningún archivo seleccionado' }}</div>
                    <div *ngIf="getFileSizeDisplay()" class="file-size text-xs text-gray-500">{{ getFileSizeDisplay() }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button *ngIf="lastFileName" type="button" class="file-remove text-sm text-red-500 hover:text-red-700" (click)="clearValue(); $event.stopPropagation()">Eliminar</button>
                  <span class="file-type text-xs text-gray-500">{{ getFileType() || '' }}</span>
                </div>
              </div>
            </div>

            <!-- Range input para floating -->
            <div *ngIf="type === 'range'" class="w-full relative">
              <div class="relative">
       <div class="range-bubble absolute -top-8 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded" 
         [style.left.%]="getRangeBubbleLeft()">{{ getRangeValue() }}</div>
                <input #rangeEl
                  [id]="controlId"
                  type="range"
                  class="range-input w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  [style.background]="getRangeBackground()"
                  [style.width]="getComputedWidth() || '100%'"
                  [attr.min]="getRangeMin()"
                  [attr.max]="getRangeMax()"
                  [attr.step]="step"
                  [attr.aria-valuemin]="getRangeMin()"
                  [attr.aria-valuemax]="getRangeMax()"
                  [attr.aria-valuenow]="getRangeValue()"
                  [attr.aria-describedby]="getAriaDescribedBy()"
                  [formControl]="control"
                  (input)="onInput($event)">
              </div>
              <div *ngIf="showRangeLabels" class="flex justify-between text-xs text-gray-500 mt-1">
                <span>{{ getRangeMin() }}</span>
                <span>{{ getRangeMax() }}</span>
              </div>
            </div>
          </ng-container>

          <!-- Label flotante -->
          <label
            [for]="controlId"
            [style.left.px]="getLeftPadding()"
            class="floating-label absolute text-gray-500 pointer-events-none transition-all duration-200 ease-out bg-white px-1"
            [class.label--shifted]="labelShifted"
            [class.label--focused]="isFocused"
            [ngClass]="getLabelClasses()">
            {{ label }} 
            <span *ngIf="isRequired" class="text-red-500 ml-1">*</span>
            <span *ngIf="optional && !isRequired" class="text-gray-400 text-xs ml-1">(opcional)</span>
          </label>
        </div>
      </ng-container>

      <!-- Non-floating label -->
      <ng-container *ngIf="!isFloatingTrue()">
        <label *ngIf="label" [for]="controlId" class="form-label block text-sm font-medium text-gray-700 mb-1" [ngClass]="getLabelClasses()">
          {{ label }}
          <span *ngIf="isRequired" class="text-red-500 ml-1">*</span>
          <span *ngIf="optional && !isRequired" class="text-gray-400 text-xs ml-1">(opcional)</span>
        </label>

        <div class="relative flex items-center input-container" [ngClass]="getContainerClasses()">
          <!-- Icono izquierdo -->
          <span *ngIf="iconLeft" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                [ngClass]="getIconClasses('left')">
            {{ iconLeft }}
          </span>

          <ng-container *ngIf="control">
            <!-- Input simplificado para non-floating -->
            <input *ngIf="type !== 'file' && type !== 'range' && type !== 'textarea'"
                 [id]="controlId"
                 [type]="type"
                 [class]="inputClass"
                 [class.has-icon-left]="iconLeft && type === 'color'"
                 [class.has-icon-right]="iconRight && type === 'color'"
                 [ngClass]="getInputStateClasses()"
                 [style.width]="getComputedWidth()"
                 [style.height]="getComputedHeight()"
                 [style.paddingLeft.px]="getLeftPadding()"
                 [style.paddingRight.px]="getRightPadding()"
                 [placeholder]="placeholder"
                 [attr.min]="min"
                 [attr.max]="max"
                 [attr.step]="step"
                 [attr.accept]="accept"
                 [attr.autocomplete]="autocomplete"
                 [readonly]="readonly"
                 [attr.aria-invalid]="invalidTouched"
                 [attr.aria-describedby]="getAriaDescribedBy()"
                 [formControl]="control"
                 (focus)="onFocus()" 
                 (blur)="onBlur()"
                 (input)="onInput($event)"
                 (paste)="onPaste($event)"
                 (keydown)="onKeyDown($event)"
                 (keyup)="onKeyUp($event)">

            <!-- Textarea para non-floating -->
            <textarea *ngIf="type === 'textarea'"
                 [id]="controlId"
                 [class]="inputClass"
                 [ngClass]="getInputStateClasses()"
                 [style.width]="getComputedWidth()"
                 [style.height]="getComputedHeight()"
                 [style.paddingLeft.px]="getLeftPadding()"
                 [style.paddingRight.px]="getRightPadding()"
                 [placeholder]="placeholder"
                 [attr.rows]="rows"
                 [readonly]="readonly"
                 [attr.aria-invalid]="invalidTouched"
                 [attr.aria-describedby]="getAriaDescribedBy()"
                 [formControl]="control"
                 (focus)="onFocus()" 
                 (blur)="onBlur()"
                 (input)="onInput($event)"
                 (paste)="onPaste($event)"
                 (keydown)="onKeyDown($event)"
                 (keyup)="onKeyUp($event)">
            </textarea>

            <!-- File input para non-floating (mejorado) -->
            <div *ngIf="type === 'file'" class="file-picker border rounded-lg p-3 bg-white flex items-center" [style.width]="getComputedWidth()">
              <label class="file-btn cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors" [for]="controlId">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                </svg>
                <span class="font-medium">Seleccionar archivo</span>
              </label>
              <input [id]="controlId" type="file" class="hidden" 
                     [accept]="accept" 
                     [multiple]="multiple"
                     (change)="onFileChange($event)" />

              <div class="file-info flex-1 ml-3 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="file-icon text-2xl text-gray-500">📄</span>
                  <div class="file-meta">
                    <div class="file-name text-sm text-gray-700">{{ getFileName() || 'Ningún archivo seleccionado' }}</div>
                    <div *ngIf="getFileSizeDisplay()" class="file-size text-xs text-gray-500">{{ getFileSizeDisplay() }}</div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button *ngIf="lastFileName" type="button" class="file-remove text-sm text-red-500 hover:text-red-700" (click)="clearValue(); $event.stopPropagation()">Eliminar</button>
                  <span class="file-type text-xs text-gray-500">{{ getFileType() || '' }}</span>
                </div>
              </div>
            </div>

            <!-- Range input para non-floating -->
            <div *ngIf="type === 'range'" class="w-full relative">
              <div class="relative">
       <div class="range-bubble absolute -top-8 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded" 
         [style.left.%]="getRangeBubbleLeft()">{{ getRangeValue() }}</div>
                <input #rangeEl
                   [id]="controlId"
                   type="range"
                   class="range-input w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                   [style.background]="getRangeBackground()"
                   [style.width]="getComputedWidth() || '100%'"
                   [attr.min]="getRangeMin()"
                   [attr.max]="getRangeMax()"
                   [attr.step]="step"
                   [attr.aria-valuemin]="getRangeMin()"
                   [attr.aria-valuemax]="getRangeMax()"
                   [attr.aria-valuenow]="getRangeValue()"
                   [attr.aria-describedby]="getAriaDescribedBy()"
                   [formControl]="control"
                   (input)="onInput($event)">
              </div>
              <div *ngIf="showRangeLabels" class="flex justify-between text-xs text-gray-500 mt-1">
                <span>{{ getRangeMin() }}</span>
                <span>{{ getRangeMax() }}</span>
              </div>
            </div>
          </ng-container>

          <!-- Botón clear -->
          <button *ngIf="clear && control && control.value && !readonly" 
                  type="button" 
                  (click)="clearValue(); $event.stopPropagation()"
                  class="clear-button absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  [ngClass]="getClearButtonClasses()"
                  title="Limpiar">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Icono derecho -->
          <span *ngIf="iconRight" 
                class="absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                [ngClass]="getIconClasses('right')"
                [style.right.px]="getRightIconPosition()">
            {{ iconRight }}
          </span>

          <!-- Indicador de loading -->
          <div *ngIf="loading" 
               class="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
          </div>
        </div>
  </ng-container>

        <!-- Mensajes de validación -->
      <div *ngIf="invalidTouched" class="validation-errors mt-1" [id]="getErrorId()">
        <div *ngIf="control?.errors?.['required']" class="error-message flex items-center">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
          {{ getMessage('required') || 'Este campo es requerido' }}
        </div>
        <div *ngIf="control?.errors?.['minlength']" class="error-message">
          {{ getMessage('minLength') || ('Mínimo ' + control?.errors?.['minlength']?.requiredLength + ' caracteres') }}
        </div>
        <div *ngIf="control?.errors?.['maxlength']" class="error-message">
          {{ getMessage('maxLength') || ('Máximo ' + control?.errors?.['maxlength']?.requiredLength + ' caracteres') }}
        </div>
        <div *ngIf="control?.errors?.['min']" class="error-message">
          {{ getMessage('min') || ('Valor mínimo: ' + control?.errors?.['min']?.min) }}
        </div>
        <div *ngIf="control?.errors?.['max']" class="error-message">
          {{ getMessage('max') || ('Valor máximo: ' + control?.errors?.['max']?.max) }}
        </div>
        <div *ngIf="control?.errors?.['email']" class="error-message">
          {{ getMessage('email') || 'Correo electrónico inválido' }}
        </div>
        <div *ngIf="control?.errors?.['pattern']" class="error-message">
          {{ getMessage('pattern') || 'Formato inválido' }}
        </div>
        <!-- Validaciones personalizadas -->
        <div *ngIf="control?.errors?.['integer']" class="error-message">
          {{ getMessage('integer') || 'Debe ser un número entero' }}
        </div>
        <div *ngIf="control?.errors?.['positive']" class="error-message">
          {{ getMessage('positive') || 'Debe ser un número positivo' }}
        </div>
        <div *ngIf="control?.errors?.['rfc']" class="error-message">
          {{ getMessage('rfc') || 'RFC inválido' }}
        </div>
        <div *ngIf="control?.errors?.['curp']" class="error-message">
          {{ getMessage('curp') || 'CURP inválida' }}
        </div>
        <div *ngIf="control?.errors?.['nss']" class="error-message">
          {{ getMessage('nss') || 'NSS inválido' }}
        </div>
        <div *ngIf="control?.errors?.['phone']" class="error-message">
          {{ getMessage('phone') || 'Teléfono inválido' }}
        </div>
        <div *ngIf="control?.errors?.['postalCode']" class="error-message">
          {{ getMessage('postalCode') || 'Código postal inválido' }}
        </div>
        <div *ngIf="control?.errors?.['uuid']" class="error-message">
          {{ getMessage('uuid') || 'UUID inválido' }}
        </div>
        <div *ngIf="control?.errors?.['securePassword']" class="error-message">
          {{ getMessage('securePassword') || 'Contraseña insegura' }}
        </div>
        <div *ngIf="control?.errors?.['url']" class="error-message">
          {{ getMessage('url') || 'URL inválida' }}
        </div>
        <div *ngIf="control?.errors?.['creditCard']" class="error-message">
          {{ getMessage('creditCard') || 'Tarjeta de crédito inválida' }}
        </div>
        <div *ngIf="control?.errors?.['ine']" class="error-message">
          {{ getMessage('ine') || 'Clave de elector inválida' }}
        </div>
        <div *ngIf="control?.errors?.['imss']" class="error-message">
          {{ getMessage('imss') || 'Número IMSS inválido' }}
        </div>
        <div *ngIf="control?.errors?.['clabe']" class="error-message">
          {{ getMessage('clabe') || 'CLABE bancaria inválida' }}
        </div>
        <div *ngIf="control?.errors?.['ipAddress']" class="error-message">
          {{ getMessage('ipAddress') || 'Dirección IP inválida' }}
        </div>
        <div *ngIf="control?.errors?.['macAddress']" class="error-message">
          {{ getMessage('macAddress') || 'Dirección MAC inválida' }}
        </div>
        <div *ngIf="control?.errors?.['alphanumeric']" class="error-message">
          {{ getMessage('alphanumeric') || 'Solo caracteres alfanuméricos' }}
        </div>
        <div *ngIf="control?.errors?.['noSpaces']" class="error-message">
          {{ getMessage('noSpaces') || 'No se permiten espacios' }}
        </div>
        <div *ngIf="control?.errors?.['onlyLetters']" class="error-message">
          {{ getMessage('onlyLetters') || 'Solo se permiten letras' }}
        </div>
        <div *ngIf="control?.errors?.['dateRange']" class="error-message">
          {{ getMessage('dateRange') || 'Fecha fuera del rango permitido' }}
        </div>
        <div *ngIf="control?.errors?.['timeRange']" class="error-message">
          {{ getMessage('timeRange') || 'Hora fuera del rango permitido' }}
        </div>
        <div *ngIf="control?.errors?.['fileSize']" class="error-message">
          {{ getMessage('fileSize') || 'Archivo demasiado grande' }}
        </div>
        <div *ngIf="control?.errors?.['fileTypes']" class="error-message">
          {{ getMessage('fileTypes') || 'Tipo de archivo no permitido' }}
        </div>
        <div *ngIf="control?.errors?.['custom']" class="error-message">
          {{ control?.errors?.['custom'] }}
        </div>
      </div>      <!-- Helper text inferior -->
      <div *ngIf="helperText && helperPosition === 'bottom'" 
           class="helper-text mt-1 flex items-center">
        <svg *ngIf="helperIcon" class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
        </svg>
        {{ helperText }}
      </div>

      <!-- Contador de caracteres -->
      <div *ngIf="showCharCount && getMaxLength()" class="char-counter text-xs mt-1 text-right">
        <span [ngClass]="getCharCountClasses()">
          {{ getCharCount() }}/{{ getMaxLength() }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .input-wrapper {
      position: relative;
      margin-bottom: 1rem;
      font-family: 'Montserrat', sans-serif;
    }

    /* Floating label styles */
    .floating-label {
      top: 50%;
      transform: translateY(-50%);
      font-size: 1rem;
      z-index: 1;
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
    }

    .floating-input:focus + .floating-label,
    .floating-input:not(:placeholder-shown) + .floating-label,
    .label--shifted,
    .has-value .floating-label {
      top: 0;
      transform: translateY(-50%);
      font-size: 0.75rem;
      color: var(--institucional-primario);
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .label--focused {
      color: var(--institucional-primario);
    }

    /* Input base styles usando las clases del sistema */
    .form-input {
      display: block;
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: var(--gray-800);
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      font-family: 'Montserrat', sans-serif;
      box-shadow: var(--shadow-sm);
    }

    /* Color input specific size (requested) */
    input[type="color"].form-input,
    .floating-input[type="color"] {
      width: 100px !important;
      height: 60px !important;
      padding: 5px !important;
      border-radius: 6px !important;
      border: 1px solid var(--gray-300) !important;
      overflow: hidden;
    }

    /* Padding when color input has icons */
    input[type="color"].form-input.has-icon-left,
    .floating-input[type="color"].has-icon-left {
      padding-left: 48px !important;
    }

    input[type="color"].form-input.has-icon-right,
    .floating-input[type="color"].has-icon-right {
      padding-right: 48px !important;
    }

    /* Autofill detection */
    .form-input:-webkit-autofill,
    .form-input:-webkit-autofill:hover,
    .form-input:-webkit-autofill:focus {
      transition: background-color 5000s ease-in-out 0s;
    }

    /* Force floating label when autofilled */
    .form-input:-webkit-autofill + .floating-label,
    .floating-input:-webkit-autofill + .floating-label {
      top: 0 !important;
      transform: translateY(-50%) !important;
      font-size: 0.75rem !important;
      color: var(--institucional-primario) !important;
      font-weight: 600 !important;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--institucional-primario);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12), var(--shadow-institucional);
    }

    .form-input:disabled {
      background-color: var(--gray-50);
      color: var(--gray-400);
      cursor: not-allowed;
    }

    /* Range input styles */
    /* Range input styles (mejoradas) */
    .range-input {
      -webkit-appearance: none;
      appearance: none;
      height: 10px;
      border-radius: 999px; /* fully rounded track */
      outline: none;
      transition: filter 0.15s ease;
      /* background is set inline via getRangeBackground() to show filled portion */
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
    }

    .range-input:active {
      filter: brightness(0.98);
    }

    .range-input::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--institucional-primario);
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(139,21,56,0.25);
      margin-top: -6px; /* center the thumb over the thicker track */
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .range-input::-webkit-slider-thumb:active {
      transform: scale(1.05);
      box-shadow: 0 6px 14px rgba(139,21,56,0.32);
    }

    .range-input::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--institucional-primario);
      cursor: pointer;
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(139,21,56,0.25);
    }

    /* Range value bubble */
    .range-bubble {
      opacity: 1;
      transform: translateX(-50%);
      transition: transform 0.12s ease, opacity 0.12s ease;
      pointer-events: none;
      background: var(--institucional-primario);
      color: #fff;
      font-size: 0.75rem;
      padding: 4px 6px;
      border-radius: 999px;
      box-shadow: 0 6px 14px rgba(0,0,0,0.12);
      white-space: nowrap;
      top: -2.25rem; /* position above the thumb */
    }

    /* Error states usando variables institucionales */
    .form-input:invalid,
    .form-input.error {
      border-color: var(--error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
    }

    .error-message {
      animation: fadeIn 0.2s ease-in-out;
      color: var(--error);
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* File picker styles */
    .file-picker {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid var(--gray-300);
      border-radius: var(--border-radius);
      padding: 0.5rem;
      background-color: #fff;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .file-picker:hover {
      border-color: var(--institucional-primario);
      box-shadow: var(--shadow-institucional);
    }

    .file-btn {
      display: inline-flex;
      align-items: center;
      white-space: nowrap;
      background-color: var(--gray-100);
      color: var(--gray-700);
      padding: 0.25rem 0.75rem;
      border-radius: var(--border-radius);
      font-family: 'Montserrat', sans-serif;
      font-weight: 500;
      transition: all var(--transition-fast);
    }

    .file-btn:hover {
      background-color: var(--institucional-primario);
      color: white;
    }

    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--gray-600);
      font-family: 'Montserrat', sans-serif;
    }

    /* Clear button styles */
    .clear-button {
      z-index: 10;
      color: var(--gray-400);
      transition: all var(--transition-fast);
    }

    .clear-button:hover {
      color: var(--institucional-primario);
      transform: translate(-50%, -50%) scale(1.1);
    }

    /* Character counter styles */
    .char-counter .warning {
      color: var(--warning);
      font-weight: 600;
    }

    .char-counter .error {
      color: var(--error);
      font-weight: 600;
    }

    /* Size variants */
    .size-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }

    .size-lg {
      padding: 0.75rem 1rem;
      font-size: 1.125rem;
    }

    /* Variant styles usando variables institucionales */
    .variant-outline {
      background-color: transparent;
      border: 2px solid var(--gray-300);
    }

    .variant-outline:focus {
      border-color: var(--institucional-primario);
      box-shadow: 0 0 0 3px rgba(139, 21, 56, 0.12);
    }

    .variant-filled {
      background-color: var(--gray-100);
      border: 1px solid transparent;
    }

    .variant-filled:focus {
      background-color: #fff;
      border-color: var(--institucional-primario);
    }

    .variant-ghost {
      background-color: transparent;
      border: 1px solid transparent;
    }

    .variant-ghost:focus {
      background-color: #fff;
      border-color: var(--institucional-primario);
    }

    /* Loading spinner */
    .loading-spinner {
      color: var(--institucional-primario);
    }

    /* Helper text styles */
    .helper-text {
      color: var(--gray-600);
      font-family: 'Montserrat', sans-serif;
      font-size: 0.75rem;
    }

    /* Success states */
    .form-input.success {
      border-color: var(--success);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12);
    }
  `]
})
export class InputComponent implements OnInit, AfterViewInit, DoCheck, OnDestroy {
  @ViewChild('rangeEl') rangeEl?: ElementRef<HTMLInputElement>;

  // Propiedades básicas
  @Input() controlName = '';
  @Input() control?: FormControl;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() validationMap: { [key: string]: ValidatorSpec } = {};
  @Input() required = false;
  @Input() optional = false;
  
  // Dimensiones
  @Input() width?: string;
  @Input() height?: string;
  @Input() fullWidth = false;
  
  // Variantes visuales
  @Input() variant: 'default' | 'outline' | 'filled' | 'ghost' = 'default';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() floating = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() clear = false;
  @Input() extraClasses = '';
  
  // Estados
  @Input() loading = false;
  @Input() readonly = false;
  
  // Atributos HTML específicos
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number | string;
  @Input() accept?: string;
  @Input() multiple = false;
  @Input() autocomplete?: string;
  @Input() rows = 3;
  
  // Helper text y contador de caracteres
  @Input() helperText?: string;
  @Input() helperPosition: 'top' | 'bottom' = 'bottom';
  @Input() helperIcon = false;
  @Input() showCharCount = false;
  @Input() showRangeLabels = false;

  // Eventos
  @Output() focus = new EventEmitter<Event>();
  @Output() blur = new EventEmitter<Event>();
  @Output() keydown = new EventEmitter<KeyboardEvent>();
  @Output() keyup = new EventEmitter<KeyboardEvent>();

  controlId = '';
  isFocused = false;
  lastFileName: string | null = null;
  private _valueSub?: Subscription;
  private _shifted = false;
  private _mutationObserver?: MutationObserver;

  @HostBinding('class.has-value')
  get hasValue(): boolean {
    return this._shifted;
  }

  /**
   * Devuelve true solo si floating es booleano true (no string, no undefined)
   */
  isFloatingTrue(): boolean {
    // No permitir label flotante en tipos que no soportan floating (range, file, color)
    const unsupported = ['range', 'file', 'color'];
    if (unsupported.includes(this.type)) {
      return false;
    }
    return this.floating === true;
  }

  constructor(@Optional() private controlContainer: ControlContainer, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.controlId = this.controlName || `input-enhanced-${Math.random().toString(36).slice(2, 9)}`;

    if (!this.control && this.controlName) {
      const parent = this.controlContainer && (this.controlContainer.control as any);
      if (parent && parent.get) {
        this.control = parent.get(this.controlName) as FormControl;
      }
    }

    if (!this.control) return;

    this.applyValidations();

    // Inicializar estado de label flotante según valor actual
    this._shifted = !!(this.control && this.control.value !== null && this.control.value !== '');
    // Forzar una detección en el siguiente ciclo para asegurar que la clase se aplique en la primera renderización
    this.cdr.markForCheck();
    this.cdr.detectChanges();

    // Suscribir cambios de valor para actualizar el estado de la etiqueta flotante
    this._valueSub = this.control.valueChanges?.subscribe((val: any) => {
      const hasValue = !(val === null || val === undefined || val === '');
      if (hasValue !== this._shifted) {
        this._shifted = hasValue;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit(): void {
    // Re-evaluar después del primer render para capturar valores que el padre haya seteado tardíamente
    const hasValue = !!(this.control && this.control.value !== null && this.control.value !== '');
    if (hasValue !== this._shifted) {
      this._shifted = hasValue;
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }

    // Configurar observador de mutaciones para detectar cambios de autocompletado del navegador
    this.setupAutofillDetection();
  }

  private setupAutofillDetection(): void {
    // Encontrar el elemento input/textarea
    const inputElement = document.getElementById(this.controlId) as HTMLInputElement | HTMLTextAreaElement;
    if (!inputElement) return;

    // Escuchar el evento change para autocompletado
    inputElement.addEventListener('change', () => {
      this.checkAndUpdateShifted(inputElement.value);
    });

    // Escuchar el evento input para cambios programáticos
    inputElement.addEventListener('input', () => {
      this.checkAndUpdateShifted(inputElement.value);
    });

    // MutationObserver para detectar cambios en el atributo value (autofill del navegador)
    this._mutationObserver = new MutationObserver(() => {
      this.checkAndUpdateShifted(inputElement.value);
    });

    this._mutationObserver.observe(inputElement, {
      attributes: true,
      attributeFilter: ['value'],
      subtree: false
    });

    // Polling para casos extremos de autofill
    const pollForAutofill = () => {
      if (inputElement.value && !this._shifted) {
        this.checkAndUpdateShifted(inputElement.value);
      }
    };

    // Verificar después de un pequeño retraso para capturar autofill tardío
    setTimeout(pollForAutofill, 100);
    setTimeout(pollForAutofill, 500);
    setTimeout(pollForAutofill, 1000);
  }

  private checkAndUpdateShifted(value: string): void {
    const hasValue = !!(value && value.trim() !== '');
    if (hasValue !== this._shifted) {
      this._shifted = hasValue;
      // Actualizar también el control si es necesario
      if (this.control && this.control.value !== value) {
        // Actualizamos el valor sin causar un bucle de eventos desde el input nativo,
        // pero forzamos una re-evaluación de validadores para que el estado se actualice
        // inmediatamente (por ejemplo, para validadores como CURP).
        this.control.setValue(value, { emitEvent: false });
        try {
          this.control.updateValueAndValidity({ onlySelf: true, emitEvent: true });
        } catch (e) {
          // noop
        }
      }
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }
  }

  ngDoCheck(): void {
    // Verificar cambios en el valor del control en cada ciclo de detección
    if (this.control) {
      const hasValue = !!(this.control.value !== null && this.control.value !== '');
      if (hasValue !== this._shifted) {
        this._shifted = hasValue;
        this.cdr.markForCheck();
      }
    }
  }

  ngOnDestroy(): void {
    this._valueSub?.unsubscribe();
    this._mutationObserver?.disconnect();
  }

  private applyValidations(): void {
    const spec = this.validationMap?.[this.controlName];
    if (!spec || !this.control) return;

    if (!spec.messages) spec.messages = {};

    const fns: ValidatorFn[] = [];
    
    if (spec.required) fns.push(Validators.required);
    if (spec.minLength) fns.push(Validators.minLength(spec.minLength));
    if (spec.maxLength) fns.push(Validators.maxLength(spec.maxLength));
    if (spec.min !== undefined) fns.push(Validators.min(spec.min));
    if (spec.max !== undefined) fns.push(Validators.max(spec.max));
    if (spec.pattern) fns.push(Validators.pattern(spec.pattern));
    if (spec.email) fns.push(Validators.email);

    // Validaciones personalizadas
    if (spec.integer) fns.push(this.integerValidator);
    if (spec.positive) fns.push(this.positiveValidator);
    if (spec.rfc) fns.push(this.rfcValidator);
    if (spec.curp) fns.push(this.curpValidator);
    if (spec.nss) fns.push(this.nssValidator);
    if (spec.phone) fns.push(this.phoneValidator);
    if (spec.postalCode) fns.push(this.postalCodeValidator);
    if (spec.uuid) fns.push(this.uuidValidator);
    if (spec.securePassword) fns.push(this.securePasswordValidator);
    if (spec.url) fns.push(this.urlValidator);
    if (spec.creditCard) fns.push(this.creditCardValidator);
    if (spec.ine) fns.push(this.ineValidator);
    if (spec.imss) fns.push(this.imssValidator);
    if (spec.clabe) fns.push(this.clabeValidator);
    if (spec.ipAddress) fns.push(this.ipAddressValidator);
    if (spec.macAddress) fns.push(this.macAddressValidator);
    if (spec.alphanumeric) fns.push(this.alphanumericValidator);
    if (spec.noSpaces) fns.push(this.noSpacesValidator);
    if (spec.onlyLetters) fns.push(this.onlyLettersValidator);
    if (spec.dateRange) fns.push(this.dateRangeValidator(spec.dateRange));
    if (spec.timeRange) fns.push(this.timeRangeValidator(spec.timeRange));
    if (spec.fileSize && this.type === 'file') fns.push(this.fileSizeValidator(spec.fileSize));
    if (spec.fileTypes && this.type === 'file') fns.push(this.fileTypesValidator(spec.fileTypes));
    if (spec.custom) fns.push(this.customValidator(spec.custom));

    if (fns.length) {
      this.control.setValidators(fns);
      this.control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    }
  }

  // Getters y métodos de estado
  get invalidTouched(): boolean {
    // Mostrar errores cuando el control es inválido y ha sido tocado O modificado (dirty)
    // Esto permite que las validaciones (por ejemplo CURP) se muestren en tiempo real
    // mientras el usuario escribe, no sólo después del blur.
    return !!(this.control && this.control.invalid && (this.control.touched || this.control.dirty));
  }

  get labelShifted(): boolean {
  return this._shifted || this.isFocused;
  }

  get isRequired(): boolean {
    return this.required || !!(this.validationMap?.[this.controlName]?.required);
  }

  get wrapperClass(): string {
    return this.fullWidth ? 'w-full' : '';
  }

  get inputClass(): string {
    const base = 'form-input transition-all duration-200';
    const variantClass = `variant-${this.variant}`;
    const sizeClass = `size-${this.size}`;
    return [base, variantClass, sizeClass, this.extraClasses].filter(Boolean).join(' ');
  }

  // Métodos de clase CSS
  getWrapperClasses(): any {
    return {
      'w-full': this.fullWidth,
      'input-wrapper--floating': this.floating,
      'input-wrapper--error': this.invalidTouched,
      'input-wrapper--focused': this.isFocused,
      'input-wrapper--readonly': this.readonly
    };
  }

  getInputStateClasses(): any {
    return {
      'border-red-500 ring-red-500': this.invalidTouched,
      'success': this.control?.valid && this.control?.touched,
      'bg-gray-50': this.readonly
    };
  }

  getLabelClasses(): any {
    return {
      'text-red-500': this.invalidTouched,
      'text-gray-400': this.readonly
    };
  }

  getContainerClasses(): any {
    return {
      'opacity-50': this.readonly
    };
  }

  getIconClasses(position: 'left' | 'right'): any {
    return {
      'text-gray-300': this.readonly,
      'text-red-400': this.invalidTouched
    };
  }

  getClearButtonClasses(): any {
    return {
      'right-8': this.iconRight || this.loading,
      'right-2': !this.iconRight && !this.loading
    };
  }

  getCharCountClasses(): any {
    const count = this.getCharCount();
    const max = this.getMaxLength();
    if (!max) return {};

    const percentage = count / max;
    return {
      'warning': percentage > 0.8 && percentage <= 1,
      'error': percentage > 1
    };
  }

  // Métodos de cálculo
  getLeftPadding(): number {
    return this.iconLeft ? 48 : 12;
  }

  getRightPadding(): number {
    let padding = 12;
    if (this.clear && this.control?.value) padding += 36;
    if (this.iconRight) padding += 36;
    if (this.loading) padding += 36;
    return padding;
  }

  getRightIconPosition(): number {
    let position = 12;
    if (this.clear && this.control?.value) position += 36;
    if (this.loading) position += 36;
    return position;
  }

  getComputedWidth(): string | null {
    return this.width ?? null;
  }

  getComputedHeight(): string | null {
    if (this.type === 'textarea' && !this.height) {
      return `${this.rows * 1.5 + 1}rem`;
    }
    return this.height ?? null;
  }

  getMaxLength(): number | null {
    const spec = this.validationMap?.[this.controlName];
    return spec?.maxLength ?? null;
  }

  getCharCount(): number {
    const value = this.control?.value;
    return value ? String(value).length : 0;
  }

  getAriaDescribedBy(): string {
    const ids = [];
    if (this.invalidTouched) ids.push(this.getErrorId());
    if (this.helperText) ids.push(`${this.controlId}-helper`);
    return ids.join(' ');
  }

  getErrorId(): string {
    return `${this.controlId}-error`;
  }

  // Mensajes estáticos por defecto para las validaciones (español)
  private readonly defaultValidationMessages: { [key: string]: string } = {
    required: 'Este campo es requerido',
    minlength: 'Mínimo {requiredLength} caracteres',
    maxlength: 'Máximo {requiredLength} caracteres',
    min: 'Valor mínimo: {min}',
    max: 'Valor máximo: {max}',
    email: 'Correo electrónico inválido',
    pattern: 'Formato inválido',
    integer: 'Debe ser un número entero',
    positive: 'Debe ser un número positivo',
    rfc: 'RFC inválido',
    curp: 'CURP inválida',
    nss: 'NSS inválido',
    phone: 'Teléfono inválido',
    postalCode: 'Código postal inválido',
    uuid: 'UUID inválido',
    securePassword: 'Contraseña insegura',
    url: 'URL inválida',
    creditCard: 'Tarjeta de crédito inválida',
    ine: 'Clave de elector inválida',
    imss: 'Número IMSS inválido',
    clabe: 'CLABE bancaria inválida',
    ipAddress: 'Dirección IP inválida',
    macAddress: 'Dirección MAC inválida',
    alphanumeric: 'Solo caracteres alfanuméricos',
    noSpaces: 'No se permiten espacios',
    onlyLetters: 'Solo se permiten letras',
    dateRange: 'Fecha fuera del rango permitido',
    timeRange: 'Hora fuera del rango permitido',
    fileSize: 'Archivo demasiado grande',
    fileTypes: 'Tipo de archivo no permitido'
  };

  getMessage(key: string): string | undefined {
    const spec = this.validationMap?.[this.controlName];
    // Primero intentar mensajes personalizados en validationMap (soportando variantes camelCase)
    if (spec?.messages) {
      if (spec.messages[key]) return spec.messages[key];
      const normalized = key === 'minLength' ? 'minlength' : key === 'maxLength' ? 'maxlength' : key;
      if (spec.messages[normalized]) return spec.messages[normalized];
    }

    // Luego usar mensajes por defecto definidos en el componente
    const normalizedKey = key === 'minLength' ? 'minlength' : key === 'maxLength' ? 'maxlength' : key;
    const defaultMsg = this.defaultValidationMessages[normalizedKey];
    if (!defaultMsg) return undefined;

    // Reemplazar placeholders con datos del error (e.g., requiredLength, min, max)
    const errorObj = this.control?.errors?.[normalizedKey] ?? this.control?.errors?.[key];
    if (errorObj && typeof errorObj === 'object') {
      let msg = defaultMsg;
      Object.keys(errorObj).forEach(k => {
        msg = msg.replace(`{${k}}`, String((errorObj as any)[k]));
      });
      return msg;
    }

    return defaultMsg;
  }

  // Métodos para range input
  getRangeValue(): number | string {
    const v: any = this.control?.value;
    if (v === null || v === undefined || v === '') return this.getRangeMin();
    const n = typeof v === 'number' ? v : Number(v);
    return isNaN(n) ? this.getRangeMin() : n;
  }

  getRangeMin(): number {
    const spec = this.validationMap?.[this.controlName];
    return spec?.min ?? this.min ?? 0;
  }

  getRangeMax(): number {
    const spec = this.validationMap?.[this.controlName];
    return spec?.max ?? this.max ?? 100;
  }

  getRangePercent(): number {
    const min = this.getRangeMin();
    const max = this.getRangeMax();
    const val = Number(this.getRangeValue());
    const denom = Math.max(1, (max - min));
    const rawPct = ((val - min) / denom) * 100;
    return Math.max(0, Math.min(100, rawPct));
  }

  /**
   * Calcula la posición en % de la burbuja y la recorta para que no salga del contenedor
   */
  getRangeBubbleLeft(): number {
    const pct = this.getRangePercent();
    // Si no tenemos referencia al elemento, devolver el porcentaje directo
    try {
      const el = this.rangeEl?.nativeElement;
      if (!el) return pct;

      const trackWidth = el.getBoundingClientRect().width;
      // ancho estimado de la burbuja en px (aprox.)
      const bubbleWidth = 48; // coincide con padding/px usados en CSS

      // Convertir pct a px y recortar para que la burbuja no salga
      const px = (pct / 100) * trackWidth;
      const leftPx = Math.max(bubbleWidth / 2, Math.min(px, trackWidth - bubbleWidth / 2));
      const leftPct = (leftPx / trackWidth) * 100;
      return Math.max(0, Math.min(100, leftPct));
    } catch (e) {
      return pct;
    }
  }

  getRangeBackground(): string {
    const percent = this.getRangePercent();
    return `linear-gradient(90deg, var(--institucional-primario) 0%, var(--institucional-primario) ${percent}%, var(--gray-200) ${percent}%, var(--gray-200) 100%)`;
  }

  // Métodos para file input
  getFileName(): string | null {
  if (this.lastFileName) return this.lastFileName;
    const val: any = this.control?.value;
    if (val instanceof File) return val.name;
    if (typeof val === 'string' && val.length) return val.split('\\').pop() || val;
    return null;
  }

  getFileSizeDisplay(): string | null {
    const val: any = this.control?.value;
    const file = val instanceof File ? val : null;
    if (!file) return null;
    const size = file.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  getFileType(): string | null {
    const val: any = this.control?.value;
    const file = val instanceof File ? val : null;
    if (!file) return null;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ext ? ext.toUpperCase() : null;
  }

  // Manejadores de eventos
  onFocus(): void {
    this.isFocused = true;
    this.focus.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.blur.emit();
  }

  onInput(event: Event): void {
    const v = (event.target as HTMLInputElement | HTMLTextAreaElement)?.value;
    const hasValue = !(v === null || v === undefined || v === '');
    if (hasValue !== this._shifted) {
      this._shifted = hasValue;
    }
    // no emitimos valueChanges aquí, el FormControl ya lo hace
  }  onPaste(event: ClipboardEvent): void {
    // Lógica de paste aquí...
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keydown.emit(event);
  }

  onKeyUp(event: KeyboardEvent): void {
    this.keyup.emit(event);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input) return;
    
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      this.lastFileName = file.name;
      
      if (this.control) {
        this.control.setValue(this.multiple ? Array.from(files) : file);
        this.control.markAsDirty();
        this.control.markAsTouched();
      }
    }
  }

  clearValue(): void {
    if (!this.control) return;
    this.control.setValue('');
    this.control.markAsPristine();
    this.control.markAsUntouched();
  this.lastFileName = null;
  }

  // Validadores personalizados
  private integerValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const num = Number(control.value);
    return Number.isInteger(num) ? null : { integer: true };
  }

  private positiveValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const num = Number(control.value);
    return num > 0 ? null : { positive: true };
  }

  private rfcValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const rfc = control.value.toString().toUpperCase();
    const rfcPattern = /^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/;
    return rfcPattern.test(rfc) ? null : { rfc: true };
  }

  private curpValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const curp = control.value.toString().toUpperCase();
    const curpPattern = /^[A-Z]{1}[AEIOUX]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
    return curpPattern.test(curp) ? null : { curp: true };
  }

  private nssValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const nss = control.value.toString().replace(/\D/g, '');
    return nss.length === 11 ? null : { nss: true };
  }

  private phoneValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const phone = control.value.toString().replace(/\D/g, '');
    const phonePattern = /^(\+52)?[0-9]{10}$/;
    return phonePattern.test(phone) ? null : { phone: true };
  }

  private postalCodeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const cp = control.value.toString();
    const cpPattern = /^[0-9]{5}$/;
    return cpPattern.test(cp) ? null : { postalCode: true };
  }

  private uuidValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const uuid = control.value.toString();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(uuid) ? null : { uuid: true };
  }

  private securePasswordValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const password = control.value.toString();
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const minLength = password.length >= 8;
    
    return hasUpper && hasLower && hasNumber && hasSpecial && minLength ? null : { securePassword: true };
  }

  private urlValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const url = control.value.toString();
    try {
      new URL(url);
      return null;
    } catch {
      return { url: true };
    }
  }

  private creditCardValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const cc = control.value.toString().replace(/\D/g, '');
    // Algoritmo de Luhn
    let sum = 0;
    let alternate = false;
    for (let i = cc.length - 1; i >= 0; i--) {
      let n = parseInt(cc.charAt(i), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0 && cc.length >= 13 ? null : { creditCard: true };
  }

  private ineValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const ine = control.value.toString().toUpperCase();
    const inePattern = /^[A-Z]{6}[0-9]{8}[HM][0-9]{3}$/;
    return inePattern.test(ine) ? null : { ine: true };
  }

  private imssValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const imss = control.value.toString().replace(/\D/g, '');
    return imss.length === 11 ? null : { imss: true };
  }

  private clabeValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const clabe = control.value.toString().replace(/\D/g, '');
    if (clabe.length !== 18) return { clabe: true };
    
    // Algoritmo de verificación CLABE
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    let sum = 0;
    for (let i = 0; i < 17; i++) {
      sum += parseInt(clabe[i]) * weights[i];
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(clabe[17]) ? null : { clabe: true };
  }

  private ipAddressValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const ip = control.value.toString();
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip) ? null : { ipAddress: true };
  }

  private macAddressValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const mac = control.value.toString().toUpperCase();
    const macPattern = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
    return macPattern.test(mac) ? null : { macAddress: true };
  }

  private alphanumericValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.toString();
    const alphanumericPattern = /^[a-zA-Z0-9]+$/;
    return alphanumericPattern.test(value) ? null : { alphanumeric: true };
  }

  private noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.toString();
    return value.indexOf(' ') === -1 ? null : { noSpaces: true };
  }

  private onlyLettersValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const value = control.value.toString();
    const lettersPattern = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
    return lettersPattern.test(value) ? null : { onlyLetters: true };
  }

  private dateRangeValidator(range: { min?: string; max?: string }) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const date = new Date(control.value);
      if (isNaN(date.getTime())) return { dateRange: true };
      
      if (range.min && date < new Date(range.min)) return { dateRange: { min: range.min } };
      if (range.max && date > new Date(range.max)) return { dateRange: { max: range.max } };
      
      return null;
    };
  }

  private timeRangeValidator(range: { min?: string; max?: string }) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const time = control.value.toString();
      
      if (range.min && time < range.min) return { timeRange: { min: range.min } };
      if (range.max && time > range.max) return { timeRange: { max: range.max } };
      
      return null;
    };
  }

  private fileSizeValidator(maxSize: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const file = control.value as File;
      if (file && file.size > maxSize) {
        return { fileSize: { actualSize: file.size, maxSize } };
      }
      return null;
    };
  }

  private fileTypesValidator(allowedTypes: string[]) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const file = control.value as File;
      if (file) {
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (!extension || !allowedTypes.includes(extension)) {
          return { fileTypes: { allowedTypes, actualType: extension } };
        }
      }
      return null;
    };
  }

  private customValidator(fn: (value: any) => string | null) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const error = fn(control.value);
      return error ? { custom: error } : null;
    };
  }
}
