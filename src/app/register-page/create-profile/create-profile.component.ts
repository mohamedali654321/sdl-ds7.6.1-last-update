import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Registration } from '../../core/shared/registration.model';
import { Observable } from 'rxjs';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { LangConfig } from '../../../config/lang-config.interface';
import { Store } from '@ngrx/store';
import { AuthenticateAction } from '../../core/auth/auth.actions';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { environment } from '../../../environments/environment';
import { isEmpty } from '../../shared/empty.util';
import { RemoteData } from '../../core/data/remote-data';
import {
  END_USER_AGREEMENT_METADATA_FIELD,
  EndUserAgreementService
} from '../../core/end-user-agreement/end-user-agreement.service';
import { getFirstCompletedRemoteData, getFirstSucceededRemoteDataPayload } from '../../core/shared/operators';
import { CoreState } from '../../core/core-state.model';

/**
 * Component that renders the create profile page to be used by a user registering through a token
 */
@Component({
  selector: 'ds-create-profile',
  styleUrls: ['./create-profile.component.scss'],
  templateUrl: './create-profile.component.html'
})
export class CreateProfileComponent implements OnInit {
  registration$: Observable<Registration>;

  email: string;
  token: string;

  isInValidPassword = true;
  password: string;

  userInfoForm: UntypedFormGroup;
  activeLangs: LangConfig[];

//   universties=[
//     {
//       label:'Saudi Digital Library | المكتبة الرقمية السعودية',
//       value:'Saudi Digital Library | المكتبة الرقمية السعودية'
//     },
//     {
//       label:'Imam Mohammad Ibn Saud Islamic University | جامعة الامام محمد بن سعود الاسلامية',
//       value:'Imam Mohammad Ibn Saud Islamic University | جامعة الامام محمد بن سعود الاسلامية'
//     }, 
//     {
//       label:'Najran University | جامعة نجران',
//       value:'Najran University | جامعة نجران'
//     },
//     {
//     label:'Taibah University | جامعة طيبة',
//     value:'Taibah University | جامعة طيبة'
//   }, {
//     label:'Tabuk University | جامعة تبوك',
//     value:'Tabuk University | جامعة تبوك'
//   } ,
//   {
//     label:'King Abdullah University of Science and Technology | جامعة الملك عبدالله للعلوم والتقنية',
//     value:'King Abdullah University of Science and Technology | جامعة الملك عبدالله للعلوم والتقنية'
//   }, {
//     label:'Qassim University | جامعة القصيم',
//     value:'Qassim University | جامعة القصيم'
//   }, {
//     label:'University of Bisha | جامعة بيشة',
//     value:'University of Bisha | جامعة بيشة',

//   }, 
//   {
//     label:'University of Hail | جامعة حائل',
//     value:'University of Hail | جامعة حائل',
   
//   }, 
//   {
//     label:'Saudi Electronic University | الجامعة السعودية الإلكترونية',
//     value:'Saudi Electronic University | الجامعة السعودية الإلكترونية'
//   },
//   {
//     label:'Prince Sattam Bin Abdulaziz University | جامعة الأمير سطام بن عبدالعزيز',
//     value:'Prince Sattam Bin Abdulaziz University | جامعة الأمير سطام بن عبدالعزيز'
//   },
//   {
//     label:'Princess Nourah bint Abdulrahman University | جامعة الأميرة نورة بنت عبدالرحمن',
//     value:'Princess Nourah bint Abdulrahman University | جامعة الأميرة نورة بنت عبدالرحمن'
//   },
//   {
//     label:'Jazan University | جامعة جازان',
//     value:'Jazan University | جامعة جازان'
//   },
//   {
//     label:'Al Jouf University | جامعة الجوف',
//     value:'Al Jouf University | جامعة الجوف'
//   },
//   {
//     label:'Majmaah University | جامعة المجمعة',
//     value:'Majmaah University | جامعة المجمعة'
//   },
//   {
//     label:'King Fahd University of Petroleum and Minerals | جامعة الملك فهد للبترول والمعادن',
//     value:'King Fahd University of Petroleum and Minerals | جامعة الملك فهد للبترول والمعادن'
//   },
//   {
//     label:'John Wiley & Sons | جون وايلي وأولاده',
//     value:'John Wiley & Sons | جون وايلي وأولاده'
//   },
//   {
//     label:'Obeikan Publishing | العبيكان للنشر',
//     value:'Obeikan Publishing | العبيكان للنشر'
//   },
//   {
//     label:'Al Baha University | جامعة الباحة',
//     value:'Al Baha University | جامعة الباحة'
//   },
//   {
//     label:'Taif University | جامعة الطائف',
//     value:'Taif University | جامعة الطائف'
//   },
//   {
//     label:'King Khalid University | جامعة الملك خالد',
//     value:'King Khalid University | جامعة الملك خالد'
//   },
//   {
//     label:'King Saud bin Abdulaziz University for Health Sciences | جامعة الملك سعود بن عبد العزيز للعلوم الصحية',
//     value:'King Saud bin Abdulaziz University for Health Sciences | جامعة الملك سعود بن عبد العزيز للعلوم الصحية'
//   },
 
//   {
//     label:'King Faisal University | جامعة الملك فيصل',
//     value:'King Faisal University | جامعة الملك فيصل'
//   },
//   {
//     label:'Shaqra University | جامعة شقراء',
//     value:'Shaqra University | جامعة شقراء'
//   },
//   {
//     label:'Imam Abdul Rahman bin Faisal University | جامعة الإمام عبدالرحمن بن فيصل',
//     value:'Imam Abdul Rahman bin Faisal University | جامعة الإمام عبدالرحمن بن فيصل'
//   },
//   {
//     label:'King Saud University | جامعة الملك سعود',
//     value:'King Saud University | جامعة الملك سعود'
//   },
//   {
//     label:'University of Hafr Al Batin | جامعة حفر الباطن',
//     value:'University of Hafr Al Batin | جامعة حفر الباطن'
//   },
//   {
//     label:'Ummul Qura University | جامعة أم القرى',
//     value:'Ummul Qura University | جامعة أم القرى'
//   },
//   {
//     label:'Jeddah University | جامعة جدة',
//     value:'Jeddah University | جامعة جدة'
//   },
//   {
//     label:'King Abdulaziz University | جامعة الملك عبد العزيز',
//     value:'King Abdulaziz University | جامعة الملك عبد العزيز'
//   },

//   {
//     label:'Northern Border University | جامعة الحدود الشمالية',
//     value:'Northern Border University | جامعة الحدود الشمالية'
//   },
//   {
//     label:'Islamic University | الجامعة الإسلامية',
//     value:'Islamic University | الجامعة الإسلامية'
//   },
//   {
//     label:'Saudi Data & Al Authority | الهيئة السعودية للبيانات والذكاء الاصطناعي',
//     value:'Saudi Data & Al Authority | الهيئة السعودية للبيانات والذكاء الاصطناعي'
//   },
 
// ]
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

  roles=[{value:'Studen',label:'Studen | طالب'},{value:'Researcher',label:'Researcher | باحث'},{value:'Faculty member',label:'Faculty member | عضو هيئة تدريس'},]

  colleges=[
    {
    label:'Social Sciences College | كلية العلوم الاجتماعية',
    value:'Social Sciences College',
  },
  {
    label:'College of Arabic Language | كلية اللغة العربية',
    value:'College of Arabic Language',
  },
  {
    label:'College of Dawah and Media | كلية الدعوة و الاعلام',
    value:'College of Dawah and Media',
  },
  {
    label:'College of Education | كلية التربية',
    value:'College of Education',
  },
  {
    label:'Faculty of Sharia and Fundamentals of Religion | كلية الشريعة وأصول الدين',
    value:'Faculty of Sharia and Fundamentals of Religion',
  },
  {
    label:'Applied College | الكلية التطبيقية',
    value:'Applied College',
  },
  {
    label:'College of Medicine | كلية الطب',
    value:'College of Medicine',
  },

  {
    label:'College of Computer and Information Sciences | كلية علوم الحاسب والمعلومات',
    value:'College of Computer and Information Sciences',
  },
];

  /**
   * Prefix for the notification messages of this security form
   */
  NOTIFICATIONS_PREFIX = 'register-page.create-profile.submit.';

  constructor(
    private translateService: TranslateService,
    private ePersonDataService: EPersonDataService,
    private store: Store<CoreState>,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private notificationsService: NotificationsService,
    private endUserAgreementService: EndUserAgreementService
  ) {

  }

  ngOnInit(): void {
    this.registration$ = this.route.data.pipe(
      map((data) => data.registration as RemoteData<Registration>),
      getFirstSucceededRemoteDataPayload(),
    );
    this.registration$.subscribe((registration: Registration) => {
      this.email = registration.email;
      this.token = registration.token;
    });
    this.activeLangs = environment.languages.filter((MyLangConfig) => MyLangConfig.active === true);

    this.userInfoForm = this.formBuilder.group({
      firstName: new UntypedFormControl('', {
        validators: [Validators.required],
      }),
      lastName: new UntypedFormControl('', {
        validators: [Validators.required],
      }),
      contactPhone: new UntypedFormControl(''),
      language: new UntypedFormControl(''),
      university: new UntypedFormControl('', {
        validators: [Validators.required],
      }),
      college: new UntypedFormControl(''),
      department: new UntypedFormControl(''),
      role:new UntypedFormControl(''),
    });

  }

  /**
   * Sets the validity of the password based on a value emitted from the form
   * @param $event
   */
  setInValid($event: boolean) {
    this.isInValidPassword = $event || isEmpty(this.password);
  }

  /**
   * Sets the value of the password based on a value emitted from the form
   * @param $event
   */
  setPasswordValue($event: string) {
    this.password = $event;
    this.isInValidPassword = this.isInValidPassword || isEmpty(this.password);
  }

  get firstName() {
    return this.userInfoForm.get('firstName');
  }

  get lastName() {
    return this.userInfoForm.get('lastName');
  }

  get contactPhone() {
    return this.userInfoForm.get('contactPhone');
  }

  get language() {
    return this.userInfoForm.get('language');
  }

  get university() {
    return this.userInfoForm.get('university');
  }

  get college() {
    return this.userInfoForm.get('college');
  }

  get department() {
    return this.userInfoForm.get('department');
  }

  get role() {
    return this.userInfoForm.get('role');
  }
  /**
   * Submits the eperson to the service to be created.
   * The submission will not be made when the form or the password is not valid.
   */
  submitEperson() {
    if (!(this.userInfoForm.invalid || this.isInValidPassword)) {
      const values = {
        metadata: {
          'eperson.firstname': [
            {
              value: this.firstName.value
            }
          ],
          'eperson.lastname': [
            {
              value: this.lastName.value
            },
          ],
          'eperson.phone': [
            {
              value: this.contactPhone.value
            }
          ],
          'eperson.language': [
            {
              value: this.language.value
            }
          ],
          'eperson.university': [
            {
              value: this.university.value
            }
          ],
          'eperson.college': [
            {
              value: this.college.value
            }
          ],
          'eperson.department': [
            {
              value: this.department.value
            }
          ],
          'eperson.role': [
            {
              value: this.role.value
            }
          ],
        },
        email: this.email,
        password: this.password,
        canLogIn: true,
        requireCertificate: false
      };

      // If the End User Agreement cookie is accepted, add end-user agreement metadata to the user
      if (this.endUserAgreementService.isCookieAccepted()) {
        values.metadata[END_USER_AGREEMENT_METADATA_FIELD] = [
          {
            value: String(true)
          }
        ];
        this.endUserAgreementService.removeCookieAccepted();
      }

      const eperson = Object.assign(new EPerson(), values);
      this.ePersonDataService.createEPersonForToken(eperson, this.token).pipe(
        getFirstCompletedRemoteData(),
      ).subscribe((rd: RemoteData<EPerson>) => {
        if (rd.hasSucceeded) {
          this.notificationsService.success(this.translateService.get(this.NOTIFICATIONS_PREFIX + 'success.head'),
            this.translateService.get(this.NOTIFICATIONS_PREFIX + 'success.content'));
          this.store.dispatch(new AuthenticateAction(this.email, this.password));
          this.router.navigate(['/home']);
        } else {
          this.notificationsService.error(this.translateService.get(this.NOTIFICATIONS_PREFIX + 'error.head'), rd.errorMessage);
        }
      });
    }
  }

}
