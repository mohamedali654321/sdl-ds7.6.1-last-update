import { Component, OnInit } from '@angular/core';

import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';
import { BrowseEntry } from '../../../core/shared/browse-entry.model';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { PaginationService } from '../../../core/pagination/pagination.service';
import { ActivatedRoute, Params } from '@angular/router';
import { BBM_PAGINATION_ID } from '../../../browse-by/browse-by-metadata-page/browse-by-metadata-page.component';
import { RouteService } from 'src/app/core/services/route.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { hasValue } from '../../empty.util';

@Component({
  selector: 'ds-browse-entry-list-element',
  styleUrls: ['./browse-entry-list-element.component.scss'],
  templateUrl: './browse-entry-list-element.component.html'
})

/**
 * This component is automatically used to create a list view for BrowseEntry objects when used in ObjectCollectionComponent
 */
@listableObjectComponent(BrowseEntry, ViewMode.ListElement)
export class BrowseEntryListElementComponent extends AbstractListableElementComponent<BrowseEntry> implements OnInit {
  /**
   * Emits the query parameters for the link of this browse entry list element
   */
  queryParams$: Observable<Params>;

  entryType:any;
  EntityUrl:string;
  isEntity:boolean;
  isRights:boolean;
  isAuthor:BehaviorSubject<boolean> = new BehaviorSubject(false);;
  constructor(
    public dsoNameService: DSONameService,
    protected paginationService: PaginationService,
    protected routeService: RouteService,
    protected route: ActivatedRoute,
  ) {
    super(dsoNameService);
  }

  ngOnInit() {
    this.route.data.subscribe(data=>{
      data.id == 'author' ? this.isAuthor.next(true) : this.isAuthor.next(false) ;
      console.log(data.id)
      console.log(this.isAuthor)
    })

    this.queryParams$ = this.getQueryParams();
    this.entryType=this.object._links;
    this.EntityUrl= this.entryType.items.href;
    this.isEntity= this.EntityUrl.includes('entityType');
    this.isRights= this.EntityUrl.includes('rights');
  }

  /**
   * Get the query params to access the item page of this browse entry.
   */
  private getQueryParams(): Observable<Params> {
    const pageParamName = this.paginationService.getPageParam(BBM_PAGINATION_ID);
    return this.routeService.getQueryParameterValue(pageParamName).pipe(
      map((currentPage) => {
        return {
          value: this.object.value,
          authority: !!this.object.authority ? this.object.authority : undefined,
          startsWith: undefined,
          [pageParamName]: null,
          [BBM_PAGINATION_ID + '.return']: currentPage
        };
      })
    );
  }
  getEntity(name:string):string{
    return 'search.filters.entityType.'+name;
  }

  getRights(name:string):string{
    return 'search.filters.rights.'+name;
  }

  convertComma(str: string): string{
    let newstr = '';
    if ((typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode')  === 'ar'){
      let regx = /;|,/gi;
     newstr = str.replace(regx, '،');
     return newstr;

    } else {
      return str;
    }
  }
}
