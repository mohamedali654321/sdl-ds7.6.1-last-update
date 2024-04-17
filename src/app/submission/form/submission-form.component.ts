import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import { Observable, of as observableOf, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { SubmissionDefinitionsModel } from '../../core/config/models/config-submission-definitions.model';
import { Collection } from '../../core/shared/collection.model';
import { HALEndpointService } from '../../core/shared/hal-endpoint.service';
import { SubmissionObject } from '../../core/submission/models/submission-object.model';
import { WorkspaceitemSectionsObject } from '../../core/submission/models/workspaceitem-sections.model';

import { hasValue, isNotEmpty, isNotUndefined } from '../../shared/empty.util';
import { UploaderOptions } from '../../shared/upload/uploader/uploader-options.model';
import { SubmissionObjectEntry } from '../objects/submission-objects.reducer';
import { SectionDataObject } from '../sections/models/section-data.model';
import { SubmissionService } from '../submission.service';
import { Item } from '../../core/shared/item.model';
import { SectionsType } from '../sections/sections-type';
import { SectionsService } from '../sections/sections.service';
import { SubmissionError } from '../objects/submission-error.model';
import { SubmissionSectionVisibility } from './../../core/config/models/config-submission-section.model';
import { SubmissionSectionModel } from './../../core/config/models/config-submission-section.model';
import { VisibilityType } from '../sections/visibility-type';
import isEqual from 'lodash/isEqual';
import { EPerson } from 'src/app/core/eperson/models/eperson.model';
import { EPersonDataService } from 'src/app/core/eperson/eperson-data.service';
import { getAllSucceededRemoteData, getRemoteDataPayload } from 'src/app/core/shared/operators';
import { followLink } from 'src/app/shared/utils/follow-link-config.model';
import { AuthorizationDataService } from '../../core/data/feature-authorization/authorization-data.service';
import { FeatureID } from '../../core/data/feature-authorization/feature-id';
/**
 * This component represents the submission form.
 */
@Component({
  selector: 'ds-submission-form',
  styleUrls: ['./submission-form.component.scss'],
  templateUrl: './submission-form.component.html',
})
export class SubmissionFormComponent implements OnChanges, OnDestroy {

  /**
   * The collection id this submission belonging to
   * @type {string}
   */
  @Input() collectionId: string;

  @Input() item: Item;

  /**
   * Checks if the collection can be modifiable by the user
   * @type {booelan}
   */
  @Input() collectionModifiable: boolean | null = null;


  /**
   * The list of submission's sections
   * @type {WorkspaceitemSectionsObject}
   */
  @Input() sections: WorkspaceitemSectionsObject;

  /**
   * The submission errors present in the submission object
   * @type {SubmissionError}
   */
  @Input() submissionErrors: SubmissionError;

  /**
   * The submission self url
   * @type {string}
   */
  @Input() selfUrl: string;

  /**
   * The configuration object that define this submission
   * @type {SubmissionDefinitionsModel}
   */
  @Input() submissionDefinition: SubmissionDefinitionsModel;

  /**
   * The submission id
   * @type {string}
   */
  @Input() submissionId: string;

  /**
   * The configuration id that define this submission
   * @type {string}
   */
  public definitionId: string;

  /**
   * A boolean representing if a submission form is pending
   * @type {Observable<boolean>}
   */
  public loading: Observable<boolean> = observableOf(true);

  /**
   * Emits true when the submission config has bitstream uploading enabled in submission
   */
  public uploadEnabled$: Observable<boolean>;

  /**
   * Observable of the list of submission's sections
   * @type {Observable<WorkspaceitemSectionsObject>}
   */
  public submissionSections: Observable<WorkspaceitemSectionsObject>;

  /**
   * The uploader configuration options
   * @type {UploaderOptions}
   */
  public uploadFilesOptions: UploaderOptions = new UploaderOptions();

  /**
   * A boolean representing if component is active
   * @type {boolean}
   */
  protected isActive: boolean;

  /**
   * Array to track all subscriptions and unsubscribe them onDestroy
   * @type {Array}
   */
  protected subs: Subscription[] = [];

  public user$: Observable<EPerson>;
  private currentUser: EPerson;
  isAdmin$: Observable<boolean>;

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

  /**
   * Initialize instance variables
   *
   * @param {AuthService} authService
   * @param {ChangeDetectorRef} changeDetectorRef
   * @param {HALEndpointService} halService
   * @param {SubmissionService} submissionService
   * @param {SectionsService} sectionsService
   */
  constructor(
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private halService: HALEndpointService,
    private submissionService: SubmissionService,
    private epersonService: EPersonDataService,
    protected authorizationService: AuthorizationDataService,
    private sectionsService: SectionsService) {
    this.isActive = true;
    // set user
    this.user$ = this.authService.getAuthenticatedUserFromStore().pipe(
      filter((user: EPerson) => hasValue(user.id)),
      switchMap((user: EPerson) => this.epersonService.findById(user.id, true, true, followLink('groups'))),
      getAllSucceededRemoteData(),
      getRemoteDataPayload(),
      tap((user: EPerson) => this.currentUser = user)
    );
    this.isAdmin$ = this.authorizationService.isAuthorized(FeatureID.AdministratorOf);
  }

  isHasValue(value:any):boolean{
    if(hasValue(value)){
      return true;
    }
    else{
      return false;
    }
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
   * Initialize all instance variables and retrieve form configuration
   */
  ngOnChanges(changes: SimpleChanges) {
    if ((changes.collectionId && this.collectionId) && (changes.submissionId && this.submissionId)) {
      this.isActive = true;

      // retrieve submission's section list
      this.submissionSections = this.submissionService.getSubmissionObject(this.submissionId).pipe(
        filter(() => this.isActive),
        map((submission: SubmissionObjectEntry) => submission.isLoading),
        map((isLoading: boolean) => isLoading),
        distinctUntilChanged(),
        switchMap((isLoading: boolean) => {
          if (!isLoading) {
            return this.getSectionsList();
          } else {
            return observableOf([]);
          }
        }));
      this.uploadEnabled$ = this.sectionsService.isSectionTypeAvailable(this.submissionId, SectionsType.Upload);

      // check if is submission loading
      this.loading = this.submissionService.getSubmissionObject(this.submissionId).pipe(
        filter(() => this.isActive),
        map((submission: SubmissionObjectEntry) => submission.isLoading),
        map((isLoading: boolean) => isLoading),
        distinctUntilChanged());

      // init submission state
      this.subs.push(
        this.halService.getEndpoint(this.submissionService.getSubmissionObjectLinkName()).pipe(
          filter((href: string) => isNotEmpty(href)),
          distinctUntilChanged())
          .subscribe((endpointURL) => {
            this.uploadFilesOptions.authToken = this.authService.buildAuthHeader();
            this.uploadFilesOptions.url = endpointURL.concat(`/${this.submissionId}`);
            this.definitionId = this.submissionDefinition.name;
            this.submissionService.dispatchInit(
              this.collectionId,
              this.submissionId,
              this.selfUrl,
              this.submissionDefinition,
              this.sections,
              this.item,
              this.submissionErrors);
            this.changeDetectorRef.detectChanges();
          })
      );

      // start auto save
      this.submissionService.startAutoSave(this.submissionId);
    }
  }
  

  /**
   *  Returns the visibility object of the collection section
   */
  private getCollectionVisibility(): SubmissionSectionVisibility {
    const submissionSectionModel: SubmissionSectionModel =
      this.submissionDefinition.sections.page.find(
        (section) => isEqual(section.sectionType, SectionsType.Collection)
      );

   return isNotUndefined(submissionSectionModel.visibility) ? submissionSectionModel.visibility : null;
  }

  /**
   * Getter to see if the collection section visibility is hidden
   */
  get isSectionHidden(): boolean {
    const visibility = this.getCollectionVisibility();
    return (
      hasValue(visibility) &&
      isEqual(visibility.main, VisibilityType.HIDDEN) &&
      isEqual(visibility.other, VisibilityType.HIDDEN)
    );
  }

  /**
   * Getter to see if the collection section visibility is readonly
   */
  get isSectionReadonly(): boolean {
    const visibility = this.getCollectionVisibility();
    return (
      hasValue(visibility) &&
      isEqual(visibility.main, VisibilityType.READONLY) &&
      isEqual(visibility.other, VisibilityType.READONLY)
    );
  }

  /**
   * Unsubscribe from all subscriptions, destroy instance variables
   * and reset submission state
   */
  ngOnDestroy() {
    this.isActive = false;
    this.submissionService.stopAutoSave();
    this.submissionService.resetAllSubmissionObjects();
    this.subs
      .filter((subscription) => hasValue(subscription))
      .forEach((subscription) => subscription.unsubscribe());
  }

  /**
   * On collection change reset submission state in case of it has a different
   * submission definition
   *
   * @param submissionObject
   *    new submission object
   */
  onCollectionChange(submissionObject: SubmissionObject) {
    this.collectionId = (submissionObject.collection as Collection).id;
    if (this.definitionId !== (submissionObject.submissionDefinition as SubmissionDefinitionsModel).name) {
      this.sections = submissionObject.sections;
      this.submissionDefinition = (submissionObject.submissionDefinition as SubmissionDefinitionsModel);
      this.definitionId = this.submissionDefinition.name;
      this.submissionService.resetSubmissionObject(
        this.collectionId,
        this.submissionId,
        submissionObject._links.self.href,
        this.submissionDefinition,
        this.sections,
        this.item);
    } else {
      this.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Check if submission form is loading
   */
  isLoading(): Observable<boolean> {
    return this.loading;
  }

  /**
   * Check if submission form is loading
   */
  protected getSectionsList(): Observable<any> {
    return this.submissionService.getSubmissionSections(this.submissionId).pipe(
      filter((sections: SectionDataObject[]) => isNotEmpty(sections)),
      map((sections: SectionDataObject[]) =>
        sections.filter((section: SectionDataObject) => !isEqual(section.sectionType,SectionsType.Collection))),
    );
  }
}
