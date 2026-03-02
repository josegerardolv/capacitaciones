import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DayPickerComponent } from './day-picker/day-picker.component';
import { RangeDayPickerComponent } from './range-day-picker/range-day-picker.component';
import { CompactDateInputComponent } from './compact-date-input/compact-date-input.component';
import { TimePickerComponent } from './time-picker/time-picker.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DayPickerComponent,
    RangeDayPickerComponent,
    CompactDateInputComponent,
    TimePickerComponent
  ],
  exports: [
    DayPickerComponent,
    RangeDayPickerComponent,
    CompactDateInputComponent,
    TimePickerComponent
  ]
})
export class DayPickerModule { }