import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Item } from '../../../../core/shared/item.model';
import { getItemPageRoute } from '../../../item-page-routing-paths';
import { RouteService } from '../../../../core/services/route.service';
import { BehaviorSubject ,Subscription,Observable, of as observableOf } from 'rxjs';
import { getDSpaceQuery, isIiifEnabled, isIiifSearchEnabled } from './item-iiif-utils';
import { filter, map, take ,catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/app.reducer';
import { isAuthenticated } from 'src/app/core/auth/selectors';
import { hasValue } from 'src/app/shared/empty.util';
import { MediaViewerService } from 'src/app/shared/kware-media-viewer/services/media-viewer.service';
import { HostWindowService } from 'src/app/shared/host-window.service';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { LinkService } from 'src/app/core/cache/builders/link.service';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { AccessStatusDataService } from 'src/app/core/data/access-status-data.service';
import { AccessStatusObject } from 'src/app/shared/object-collection/shared/badges/access-status-badge/access-status.model';
import { LocaleService } from 'src/app/core/locale/locale.service';



@Component({
  selector: 'ds-item',
  template: ''
})
/**
 * A generic component for displaying metadata and relations of an item
 */
export class ItemComponent implements OnInit {
  @Input() object: Item;

  /**
   * This regex matches previous routes. The button is shown
   * for matching paths and hidden in other cases.
   */
  previousRoute = /^(\/search|\/browse|\/collections|\/admin\/search|\/mydspace)/;

  /**
   * Used to show or hide the back to results button in the view.
   */
  showBackButton: Observable<boolean>;

  /**
   * Route to the item page
   */
  itemPageRoute: string;

  /**
   * Enables the mirador component.
   */
  iiifEnabled: boolean;

  /**
   * Used to configure search in mirador.
   */
  iiifSearchEnabled: boolean;

  /**
   * The query term from the previous dspace search.
   */
  iiifQuery$: Observable<string>;

  mediaViewer;

  isAuthorized$: Observable<boolean>;  //kware-edit

  fileUrl: string;  //kware-edit

  locale:any;  //kware-edit

  lang:boolean  //kware-edit


  accessStatus$: Observable<string>;

  accessStatusConfigs={
    'access-status.unknown.listelement.badge':{ icon: 'fa-solid fa-question' , style:'background-color: #767676 !important;' },
    'access-status.restricted.listelement.badge':{ icon: 'fa-solid fa-ban' , style:'background-color: #d33b36 !important;' },
    'access-status.open.access.listelement.badge':{ icon: 'fa-solid fa-unlock' , style:'background-color: #3a833a !important;' },
    'access-status.metadata.only.listelement.badge':{ icon: 'fa-solid fa-file-invoice' , style:'background-color: #2f6fa7  !important;' },
    'access-status.embargo.listelement.badge':{ icon: 'fa-regular fa-clock' , style:'background-color: #eb9419 !important;' },
  }
  private subs: Subscription[] = [];

    /**
   * A boolean that indicate if is an extra small devices viewport.
   */
    public isXs = new BehaviorSubject<boolean>(false);;


  isFilesMenuOpen=new  BehaviorSubject<boolean>(false);
  isViewerPanelOpen =new  BehaviorSubject<boolean>(false);
  constructor(protected routeService: RouteService,
    protected cdRef: ChangeDetectorRef,
    public store: Store<AppState>, //kware-edit
              protected router: Router,
              private accessStatusDataService: AccessStatusDataService,
              public hostWindowService: HostWindowService,
              protected linkService: LinkService, //kware-edit
              public localeService: LocaleService, //kware-edit
              protected mediaViewerService:MediaViewerService) {
    this.mediaViewer = environment.mediaViewer;
  }

  /**
   * The function used to return to list from the item.
   */
  back = () => {
    this.routeService.getPreviousUrl().pipe(
          take(1)
        ).subscribe(
          (url => {
            this.router.navigateByUrl(url);
          })
        );
  };

  ngOnInit(): void {
    
    this.linkService.resolveLink<Item>(this.object, followLink('accessStatus')); //kware-edit

    const item = this.object as Item;
    if (item.accessStatus == null) {
      // In case the access status has not been loaded, do it individually.
      item.accessStatus = this.accessStatusDataService.findAccessStatusFor(item);
    }
    this.accessStatus$ = item.accessStatus.pipe(
      map((accessStatusRD) => {
        if (accessStatusRD.statusCode !== 401 && hasValue(accessStatusRD.payload)) {
          return accessStatusRD.payload;
        } else {
          return [];
        }
      }),
      map((accessStatus: AccessStatusObject) => hasValue(accessStatus.status) ? accessStatus.status : 'unknown'),
      map((status: string) => `access-status.${status.toLowerCase()}.listelement.badge`),
      catchError(() => observableOf('access-status.unknown.listelement.badge'))
    );


   
    this.subs.push(this.hostWindowService.isXs()
    .subscribe((status: boolean) => {
      this.isXs.next(status) ;
      
      this.cdRef.markForCheck();
    }));
    
    this.mediaViewerService.viewerPanelsStatus.subscribe(status => {this.isFilesMenuOpen.next(status.isFilesMenuOpen); this.isViewerPanelOpen.next(status.isViewerPanelOpen)})
    if (typeof window === 'object' && hasValue(window.localStorage)) {
      this.locale = window.localStorage.getItem('selectedLangCode');
     }

     //kware-edit
     this.lang =this.locale ==='ar'? true : false;
     this.isAuthorized$ = this.store.pipe(select(isAuthenticated)); //kware-edi

    this.itemPageRoute = getItemPageRoute(this.object);
    // hide/show the back button
    this.showBackButton = this.routeService.getPreviousUrl().pipe(
      filter(url => this.previousRoute.test(url)),
      take(1),
      map(() => true)
    );
    // check to see if iiif viewer is required.
    this.iiifEnabled = isIiifEnabled(this.object);
    this.iiifSearchEnabled = isIiifSearchEnabled(this.object);
    if (this.iiifSearchEnabled) {
      this.iiifQuery$ = getDSpaceQuery(this.object, this.routeService);
    }
  }
  getCreativeCommonsIcons(uri:string):any[]{
    if(typeof uri === 'string' && uri && (uri?.includes('licenses/')|| uri?.includes('publicdomain/'))){
       return uri?.includes('licenses/') ?  uri?.split('licenses/')[1]?.split('/')[0]?.split('-') : uri?.split('publicdomain/')[1]?.split('/')[0]?.split('-') ;
    }
    else{return;}

  }

  translateDate():any{
    let date=new Date(this.object.firstMetadataValue('dc.date.accessioned').split('T')[0]);
   if(date && this.localeService.getCurrentLanguageCode() === 'ar'){
     var months = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو",
     "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
   ];
   var delDateString =date.getDate() + ' ' + months[date.getMonth()] + '، ' + date.getFullYear(); 
   
   return delDateString;
   }
   else return null;
   
     }
}
