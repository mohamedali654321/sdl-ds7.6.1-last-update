import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { SEARCH_CONFIG_SERVICE } from '../../../../../../my-dspace-page/my-dspace-page.component';
import { SearchConfigurationService } from '../../../../../../core/shared/search/search-configuration.service';
import { Item } from '../../../../../../core/shared/item.model';
import { SearchResult } from '../../../../../search/models/search-result.model';
import { PaginatedList } from '../../../../../../core/data/paginated-list.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { RelationshipOptions } from '../../../models/relationship-options.model';
import { PaginationComponentOptions } from '../../../../../pagination/pagination-component-options.model';
import { ListableObject } from '../../../../../object-collection/shared/listable-object.model';
import { SearchService } from '../../../../../../core/shared/search/search.service';
import { SelectableListService } from '../../../../../object-list/selectable-list/selectable-list.service';
import { hasValue } from '../../../../../empty.util';
import { filter, map, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { getAllSucceededRemoteData, getFirstSucceededRemoteData, getFirstSucceededRemoteDataPayload, getRemoteDataPayload } from '../../../../../../core/shared/operators';
import { CollectionElementLinkType } from '../../../../../object-collection/collection-element-link.type';
import { Context } from '../../../../../../core/shared/context.model';
import { LookupRelationService } from '../../../../../../core/data/lookup-relation.service';
import { PaginationService } from '../../../../../../core/pagination/pagination.service';
import { RelationshipDataService } from '../../../../../../core/data/relationship-data.service';
import { RelationshipType } from '../../../../../../core/shared/item-relationships/relationship-type.model';

import { Relationship } from '../../../../../../core/shared/item-relationships/relationship.model';
import { SearchObjects } from '../../../../../search/models/search-objects.model';
import { DSpaceObject } from '../../../../../../core/shared/dspace-object.model';
import { AuthService } from 'src/app/core/auth/auth.service';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Group } from 'src/app/core/eperson/models/group.model';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { EPersonDataService } from 'src/app/core/eperson/eperson-data.service';
import { FeatureID } from '../../../../../../core/data/feature-authorization/feature-id';
import { AuthorizationDataService } from '../../../../../../core/data/feature-authorization/authorization-data.service';

@Component({
  selector: 'ds-dynamic-lookup-relation-search-tab',
  styleUrls: ['./dynamic-lookup-relation-search-tab.component.scss'],
  templateUrl: './dynamic-lookup-relation-search-tab.component.html',
  providers: [
    {
      provide: SEARCH_CONFIG_SERVICE,
      useClass: SearchConfigurationService
    }
  ]
})

/**
 * Tab for inside the lookup model that represents the items that can be used as a relationship in this submission
 */
export class DsDynamicLookupRelationSearchTabComponent implements OnInit, OnDestroy {
  /**
   * Options for searching related items
   */
  @Input() relationship: RelationshipOptions;

  /**
   * The ID of the list to add/remove selected items to/from
   */
  @Input() listId: string;
  @Input() query: string;

  /**
   * Is the selection repeatable?
   */
  @Input() repeatable: boolean;

  /**
   * The list of selected items
   */
  @Input() selection$: Observable<ListableObject[]>;

  /**
   * The context to display lists
   */
  @Input() context: Context;

  /**
   * The type of relationship
   */
  @Input() relationshipType: RelationshipType;

  /**
   * The item being viewed
   */
  @Input() item: Item;

  /**
   * Check if is left type or right type
   */
  @Input() isLeft: boolean;

  /**
   * Check if is left type or right type
   */
  @Input() toRemove: SearchResult<Item>[];


  /**
   * Check if is being utilized by edit relationship component
   */
  @Input() isEditRelationship: boolean;

  /**
   * Send an event to deselect an object from the list
   */
  @Output() deselectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * Send an event to select an object from the list
   */
  @Output() selectObject: EventEmitter<ListableObject> = new EventEmitter<ListableObject>();

  /**
   * Search results
   */
  resultsRD$: BehaviorSubject<SearchObjects<DSpaceObject>> = new BehaviorSubject<SearchObjects<DSpaceObject>>(null);

  /**
   * Are all results selected?
   */
  allSelected: boolean;

  /**
   * Are some results selected?
   */
  someSelected$: Observable<boolean>;

  /**
   * Is it currently loading to select all results?
   */
  selectAllLoading: boolean;

  /**
   * Subscription to unsubscribe from
   */
  subscription;

  /**
   * The initial pagination to use
   */
  initialPagination = {
    page: 1,
    pageSize: 5
  };

  /**
   * The type of links to display
   */
  linkTypes = CollectionElementLinkType;

  /**
   * Emits an event with the current search result entries
   */
  @Output() resultFound: EventEmitter<SearchObjects<DSpaceObject>> = new EventEmitter<SearchObjects<DSpaceObject>>();


  public user$: Observable<EPerson>;
    /**
   * The groups the user belongs to
   */
    groupsRD$: Observable<RemoteData<PaginatedList<Group>>>;

    /**
     * The special groups the user belongs to
     */
    specialGroupsRD$: Observable<RemoteData<PaginatedList<Group>>>;

    private currentUser: EPerson;

    isAdministrator =new BehaviorSubject<number>(0);

    filterFields ;


    universties=[
      {
        label:'Saudi Digital Library | المكتبة الرقمية السعودية',
        value:'Saudi Digital Library'
      },
      {
        label:'Imam Mohammad Ibn Saud Islamic University | جامعة الامام محمد بن سعود الاسلامية',
        value:'Imam Mohammad Ibn Saud Islamic University'
      }, 
      {
        label:'Najran University | جامعة نجران',
        value:'Najran University'
      },
      {
      label:'Taibah University | جامعة طيبة',
      value:'Taibah University'
    }, {
      label:'Tabuk University | جامعة تبوك',
      value:'Tabuk University'
    } ,
    {
      label:'King Abdullah University of Science and Technology | جامعة الملك عبدالله للعلوم والتقنية',
      value:'King Abdullah University of Science and Technology'
    }, {
      label:'Qassim University | جامعة القصيم',
      value:'Qassim University'
    }, {
      label:'University of Bisha | جامعة بيشة',
      value:'University of Bisha',
  
    }, 
    {
      label:'University of Hail | جامعة حائل',
      value:'University of Hail',
     
    }, 
    {
      label:'Saudi Electronic University | الجامعة السعودية الإلكترونية',
      value:'Saudi Electronic University'
    },
    {
      label:'Prince Sattam Bin Abdulaziz University | جامعة الأمير سطام بن عبدالعزيز',
      value:'Prince Sattam Bin Abdulaziz University'
    },
    {
      label:'Princess Nourah bint Abdulrahman University | جامعة الأميرة نورة بنت عبدالرحمن',
      value:'Princess Nourah bint Abdulrahman University'
    },
    {
      label:'Jazan University | جامعة جازان',
      value:'Jazan University'
    },
    {
      label:'Al Jouf University | جامعة الجوف',
      value:'Al Jouf University'
    },
    {
      label:'Majmaah University | جامعة المجمعة',
      value:'Majmaah University'
    },
    {
      label:'King Fahd University of Petroleum and Minerals | جامعة الملك فهد للبترول والمعادن',
      value:'King Fahd University of Petroleum and Minerals'
    },
    {
      label:'John Wiley & Sons | جون وايلي وأولاده',
      value:'John Wiley & Sons'
    },
    {
      label:'Obeikan Publishing | العبيكان للنشر',
      value:'Obeikan Publishing'
    },
    {
      label:'Al Baha University | جامعة الباحة',
      value:'Al Baha University'
    },
    {
      label:'Taif University | جامعة الطائف',
      value:'Taif University'
    },
    {
      label:'King Khalid University | جامعة الملك خالد',
      value:'King Khalid University'
    },
    {
      label:'King Saud bin Abdulaziz University for Health Sciences | جامعة الملك سعود بن عبد العزيز للعلوم الصحية',
      value:'King Saud bin Abdulaziz University for Health Sciences'
    },
   
    {
      label:'King Faisal University | جامعة الملك فيصل',
      value:'King Faisal University'
    },
    {
      label:'Shaqra University | جامعة شقراء',
      value:'Shaqra University'
    },
    {
      label:'Imam Abdul Rahman bin Faisal University | جامعة الإمام عبدالرحمن بن فيصل',
      value:'Imam Abdul Rahman bin Faisal University'
    },
    {
      label:'King Saud University | جامعة الملك سعود',
      value:'King Saud University'
    },
    {
      label:'University of Hafr Al Batin | جامعة حفر الباطن',
      value:'University of Hafr Al Batin'
    },
    {
      label:'Ummul Qura University | جامعة أم القرى',
      value:'Ummul Qura University'
    },
    {
      label:'Jeddah University | جامعة جدة',
      value:'Jeddah University'
    },
    {
      label:'King Abdulaziz University | جامعة الملك عبد العزيز',
      value:'King Abdulaziz University'
    },
  
    {
      label:'Northern Border University | جامعة الحدود الشمالية',
      value:'Northern Border University'
    },
    {
      label:'Islamic University | الجامعة الإسلامية',
      value:'Islamic University'
    },
    {
      label:'Saudi Data & Al Authority | الهيئة السعودية للبيانات والذكاء الاصطناعي',
      value:'Saudi Data & Al Authority'
    },
   
  ]
  isAdmin$: Observable<boolean>;
  constructor(
    protected searchService: SearchService,
    protected selectableListService: SelectableListService,
    public searchConfigService: SearchConfigurationService,
    public lookupRelationService: LookupRelationService,
    protected relationshipService: RelationshipDataService,
    protected paginationService: PaginationService,
    private authService: AuthService,
    protected authorizationService: AuthorizationDataService,
    public dsoNameService: DSONameService,
    private epersonService: EPersonDataService,
  ) {
  }

  /**
   * Sets up the pagination and fixed query parameters
   */
  ngOnInit(): void {


    if(this.relationship.searchConfiguration === 'orgunit'){
      this.filterFields='OrgUnit'
     }
     else{
      this.filterFields=this.capitalizeFirstLetter(this.relationship.searchConfiguration)
     }
  
    this.user$ = this.authService.getAuthenticatedUserFromStore().pipe(
      filter((user: EPerson) => hasValue(user.id)),
      switchMap((user: EPerson) => this.epersonService.findById(user.id, true, true, followLink('groups'))),
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      tap((user: EPerson) => this.currentUser = user)
    );
    this.isAdmin$ = this.authorizationService.isAuthorized(FeatureID.AdministratorOf);
    this.groupsRD$ = this.user$.pipe(switchMap((user: EPerson) => user.groups));
    this.specialGroupsRD$ = this.authService.getSpecialGroupsFromAuthStatus();

    this.groupsRD$.subscribe(group=>{
      if(hasValue(group)){
        this.isAdministrator.next(group.payload.page.filter(group=>{ return group.name === 'Administrator'}).length );
        // console.log(group.payload.page.filter(group=>{ return group.name === 'Administrator'}).length ) 
      }
     
    })

    this.resetRoute();
  }
  isHasValue(value:any):boolean{
    if(hasValue(value)){
      return true;
    }
    else{
      return false;
    }
  }

  capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

retriveUniversityLabel(universityName:string):any{
  if(universityName && !universityName.includes('|')){
   return this.universties.filter(university=>{return university.value === universityName ? university.label : null})[0].label
  }
  else if(universityName && universityName.includes('|'))
  {
    return universityName ;
  }
  else{
    return;
  }
  

}
  /**
   * Method to reset the route when the window is opened to make sure no strange pagination issues appears
   */
  resetRoute() {
    this.paginationService.updateRoute(this.searchConfigService.paginationID, this.initialPagination);
  }

  /**
   * Selects a page in the store
   * @param page The page to select
   */
  selectPage(page: SearchResult<DSpaceObject>[]) {
    this.selection$
      .pipe(take(1))
      .subscribe((selection: SearchResult<Item>[]) => {
        const filteredPage = page.filter((pageItem) => selection.findIndex((selected) => selected.equals(pageItem)) < 0);
        this.selectObject.emit(...filteredPage);
      });
    this.selectableListService.select(this.listId, page);
  }

  /**
   * Deselects a page in the store
   * @param page the page to deselect
   */
  deselectPage(page: SearchResult<DSpaceObject>[]) {
    this.allSelected = false;
    this.selection$
      .pipe(take(1))
      .subscribe((selection: SearchResult<Item>[]) => {
        const filteredPage = page.filter((pageItem) => selection.findIndex((selected) => selected.equals(pageItem)) >= 0);
        this.deselectObject.emit(...filteredPage);
      });
    this.selectableListService.deselect(this.listId, page);
  }

  /**
   * Select all items that were found using the current search query
   */
  selectAll() {
    this.allSelected = true;
    this.selectAllLoading = true;
    const fullPagination = Object.assign(new PaginationComponentOptions(), {
      currentPage: 1,
      pageSize: 9999
    });
    const fullSearchConfig = Object.assign(this.lookupRelationService.searchConfig, { pagination: fullPagination });
    const results$ = this.searchService.search<Item>(fullSearchConfig);
    results$.pipe(
      getFirstSucceededRemoteData(),
      map((resultsRD) => resultsRD.payload.page),
      tap(() => this.selectAllLoading = false),
      switchMap((results) => this.selection$.pipe(
        take(1),
        tap((selection: SearchResult<Item>[]) => {
          const filteredResults = results.filter((pageItem) => selection.findIndex((selected) => selected.equals(pageItem)) < 0);
          this.selectObject.emit(...filteredResults);
        }),
        mapTo(results)
      ))
    ).subscribe((results) => {
        this.selectableListService.select(this.listId, results);
    });
  }

  /**
   * setSelectedIds select all the items from the results that have relationship
   * @param idOfItems the uuid of items that are being checked
   * @param resultListOfItems the list of results of the items
   */
  setSelectedIds(idOfItems: string[], resultListOfItems: SearchResult<DSpaceObject>[]) {
    let relationType = this.relationshipType.rightwardType;
    if ( this.isLeft ) {
      relationType = this.relationshipType.leftwardType;
    }
    this.relationshipService.searchByItemsAndType( this.relationshipType.id, this.item.uuid, relationType ,idOfItems ).pipe(
        getFirstSucceededRemoteData(),
        getRemoteDataPayload(),
      ).subscribe( (res: PaginatedList<Relationship>) => {

        let selectableObject = res.page.map( (relationship: any) => {

          let arrUrl = [];
          if ( this.isLeft ) {
            arrUrl = relationship._links.rightItem.href.split('/');
          } else {
            arrUrl = relationship._links.leftItem.href.split('/');
          }
          const uuid = arrUrl[ arrUrl.length - 1 ];

          return this.getRelatedItem(uuid, resultListOfItems);
        });

        selectableObject = selectableObject.filter( (selObject) => {
          return !this.getIfInRemove(selObject.indexableObject.uuid);
        });

        if ( selectableObject.length > 0 ) {
          this.selectableListService.select(this.listId, selectableObject);
        }
    });
  }

  /**
   * Deselect all items
   */
  deselectAll() {
    this.allSelected = false;
    this.selection$
      .pipe(take(1))
      .subscribe((selection: SearchResult<DSpaceObject>[]) => this.deselectObject.emit(...selection));
    this.selectableListService.deselectAll(this.listId);
  }

  getRelatedItem(uuid: string, resultList: SearchResult<DSpaceObject>[]) {
    return resultList.find( (resultItem) => {
      return resultItem.indexableObject.uuid === uuid;
    });
  }

  getIfInRemove(uuid: string) {
    return !!this.toRemove.find( (searchResult) => searchResult.indexableObject.uuid === uuid);
  }

  ngOnDestroy(): void {
    if (hasValue(this.subscription)) {
      this.subscription.unsubscribe();
    }
  }

  onResultFound($event: SearchObjects<DSpaceObject>) {
    this.resultsRD$.next($event);
    this.resultFound.emit($event);
    if (this.isEditRelationship ) {
      const idOfItems = $event.page.map( itemSearchResult => {
        return itemSearchResult.indexableObject.uuid;
      });
      this.setSelectedIds(idOfItems, $event.page);
    }
  }
}
