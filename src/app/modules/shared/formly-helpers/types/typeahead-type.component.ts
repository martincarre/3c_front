import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { FieldType, FieldTypeConfig } from '@ngx-formly/core';
import { Subject, takeUntil, startWith, filter, debounceTime, distinctUntilChanged, switchMap, map, Observable, of, OperatorFunction } from 'rxjs';
import { TypeaheadService } from '../../services/typeahead.service';


@Component({
  selector: 'formly-field-typeahead',
  template: `
  <ng-template #rt let-r="result" let-t="term">
    <ngb-highlight [result]="r.fiscalName" [term]="t"></ngb-highlight> 
    <!-- TODO: Adapt for other types of results -->
  </ng-template>
    <input 
    type="text" 
    class="form-control" 
    [ngbTypeahead]="search" 
    [formControl]="formControl" 
    [formlyAttributes]="field"
    [resultTemplate]="rt"
    [editable]="false"
    [inputFormatter]="formatter"
    >
  `,
})
export class FormlyFieldTypeahead extends FieldType<FieldTypeConfig> implements OnInit  {
  private typeSearched: string = '';
  constructor(private typeaheadService: TypeaheadService) {
    super();
    
  }
  
  ngOnInit(): void {
    this.typeSearched = this.props['typeSearched'];
  }

  formatter = (result: any) => result.fiscalName; // Todo: adapt for other types of results

  search: OperatorFunction<string, readonly any[]> = (query$: Observable<string>) =>
    query$.pipe(
      debounceTime(200), // Debounce the user input
      distinctUntilChanged(),
      switchMap(term => term.length < 0 ? of([]) : this.typeaheadService.search(term, this.typeSearched)),
    );
}
