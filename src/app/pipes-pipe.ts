import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'testFilter', standalone: true })
export class TestFilterPipe implements PipeTransform {
  transform(tests: any[], status: string): number {
    return tests.filter(t => t.status === status).length;
  }
}