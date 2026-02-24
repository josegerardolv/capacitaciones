import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'umasToPesos', standalone: true })
export class UmasToPesosPipe implements PipeTransform {
  private readonly UMA_VALUE = 117.31;

  transform(umas: number): number {
    return umas * this.UMA_VALUE;
  }
}
