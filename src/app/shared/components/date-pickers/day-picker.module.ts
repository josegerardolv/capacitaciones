import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DayPickerComponent } from './day-picker/day-picker.component';
import { RangeDayPickerComponent } from './range-day-picker/range-day-picker.component';
import { CompactDateInputComponent } from './compact-date-input/compact-date-input.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DayPickerComponent,
    RangeDayPickerComponent,
    CompactDateInputComponent
  ],
  exports: [
    DayPickerComponent,
    RangeDayPickerComponent,
    CompactDateInputComponent
  ]
})
export class DayPickerModule { }