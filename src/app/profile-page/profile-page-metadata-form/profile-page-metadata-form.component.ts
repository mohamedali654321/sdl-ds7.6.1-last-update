import { Component, Input, OnInit } from '@angular/core';
import {
  DynamicFormControlModel,
  DynamicFormValueControlModel,
  DynamicInputModel,
  DynamicSelectModel
} from '@ng-dynamic-forms/core';
import { UntypedFormGroup } from '@angular/forms';
import { EPerson } from '../../core/eperson/models/eperson.model';
import { TranslateService } from '@ngx-translate/core';
import { hasValue, isNotEmpty } from '../../shared/empty.util';
import { LangConfig } from '../../../config/lang-config.interface';
import { EPersonDataService } from '../../core/eperson/eperson-data.service';
import cloneDeep from 'lodash/cloneDeep';
import { getRemoteDataPayload, getFirstSucceededRemoteData } from '../../core/shared/operators';
import { FormBuilderService } from '../../shared/form/builder/form-builder.service';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { environment } from '../../../environments/environment';
import { LocaleService } from 'src/app/core/locale/locale.service';

@Component({
  selector: 'ds-profile-page-metadata-form',
  templateUrl: './profile-page-metadata-form.component.html'
})
/**
 * Component for a user to edit their metadata
 * Displays a form containing:
 * - readonly email field,
 * - required first name text field
 * - required last name text field
 * - phone text field
 * - language dropdown
 */
export class ProfilePageMetadataFormComponent implements OnInit {
  /**
   * The user to display the form for
   */
  @Input() user: EPerson;

  
  @Input() isAdministrator;

  /**
   * The form's input models
   */
  formModel: DynamicFormControlModel[] = [
    new DynamicInputModel({
      id: 'email',
      name: 'email',
      readOnly: true
    }),
    new DynamicInputModel({
      id: 'firstname',
      name: 'eperson.firstname',
      required: true,
      validators: {
        required: null
      },
      errorMessages: {
        required: 'This field is required'
      },
    }),
    new DynamicInputModel({
      id: 'lastname',
      name: 'eperson.lastname',
      required: true,
      validators: {
        required: null
      },
      errorMessages: {
        required: 'This field is required'
      },
    }),
    new DynamicInputModel({
      id: 'phone',
      name: 'eperson.phone'
    }),
    new DynamicSelectModel({
      id: 'university',
      name: 'eperson.university',
      // readOnly: true,
      required: true,
      validators: {
        required: null
      },
      errorMessages: {
        required: 'This field is required'
      },
    }),
    new DynamicInputModel({
      id: 'college',
      name: 'eperson.college',
      // required: true,
      // validators: {
      //   required: null
      // },
      // errorMessages: {
      //   required: 'This field is required'
      // },
    }),
    new DynamicInputModel({
      id: 'department',
      name: 'eperson.department',
      // required: true,
      // validators: {
      //   required: null
      // },
      // errorMessages: {
      //   required: 'This field is required'
      // },
    }),
    new DynamicInputModel({
      id: 'role',
      name: 'eperson.role',
      // required: true,
      // validators: {
      //   required: null
      // },
      // errorMessages: {
      //   required: 'This field is required'
      // },
    }),
    new DynamicSelectModel<string>({
      id: 'language',
      name: 'eperson.language'
    })
  ];

  /**
   * The form group of this form
   */
  formGroup: UntypedFormGroup;

  /**
   * Prefix for the form's label messages of this component
   */
  LABEL_PREFIX = 'profile.metadata.form.label.';

  /**
   * Prefix for the form's error messages of this component
   */
  ERROR_PREFIX = 'profile.metadata.form.error.';

  /**
   * Prefix for the notification messages of this component
   */
  NOTIFICATION_PREFIX = 'profile.metadata.form.notifications.';

  /**
   * All of the configured active languages
   * Used to populate the language dropdown
   */
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

  constructor(protected formBuilderService: FormBuilderService,
              protected translate: TranslateService,
              protected epersonService: EPersonDataService,
              protected notificationsService: NotificationsService,
              public localeService: LocaleService , /* kware edit - call service from LocaleService */
              ) {
  }

  ngOnInit(): void {
    this.activeLangs = environment.languages.filter((MyLangConfig) => MyLangConfig.active === true);

    this.setFormValues();
    this.updateFieldTranslations();
    this.translate.onLangChange
      .subscribe(() => {
        this.updateFieldTranslations();
      });
  }

  /**
   * Loop over all the form's input models and set their values depending on the user's metadata
   * Create the FormGroup
   */
  setFormValues() {
    this.formModel.forEach(
      (fieldModel: any) => {
        if (fieldModel.name === 'email') {
          fieldModel.value = this.user.email;
        } else {
          fieldModel.value = this.user.firstMetadataValue(fieldModel.name);
        }
        if (fieldModel.id === 'language') {
          (fieldModel as DynamicSelectModel<string>).options =
            this.activeLangs.map((langConfig) => Object.assign({ value: langConfig.code, label: langConfig.label }));
        }

        if (fieldModel.id === 'university') {
          (fieldModel as DynamicSelectModel<string>).disabled = this.isAdministrator ? false :true;
          (fieldModel as DynamicSelectModel<string>).options =
            this.universties.map((university) => Object.assign({ value: university.value, label:this.localeService.getStringByLocale(university.label)  }));
        }

        
        // if (fieldModel.id === 'college') {
        //   // this.colleges =this.universties.filter((university)=>{ return university.value === this.formModel[4]['_value'] ? university.colleges : null });

        //   (fieldModel as DynamicSelectModel<string>).options =
        //     this.colleges.map((college) => Object.assign({ value: college.value, label:this.localeService.getStringByLocale(college.label)  }));
        // }

        // if (fieldModel.id === 'role') {

        //   (fieldModel as DynamicSelectModel<string>).options =
        //     this.roles.map((role) => Object.assign({ value: role.value, label:this.localeService.getStringByLocale(role.label)  }));
        // }
      }
    );
    this.formGroup = this.formBuilderService.createFormGroup(this.formModel);
  }

  /**
   * Update the translations of the field labels and error messages
   */
  updateFieldTranslations() {
    this.formModel.forEach(
      (fieldModel: DynamicInputModel) => {
        fieldModel.label = this.translate.instant(this.LABEL_PREFIX + fieldModel.id);
        if (isNotEmpty(fieldModel.validators)) {
          fieldModel.errorMessages = {};
          Object.keys(fieldModel.validators).forEach((key) => {
            fieldModel.errorMessages[key] = this.translate.instant(this.ERROR_PREFIX + fieldModel.id + '.' + key);
          });
        }
      }
    );
  }

  /**
   * Update the user's metadata
   *
   * Sends a patch request for updating the user's metadata when at least one value changed or got added/removed and the
   * form is valid.
   * Nothing happens when the form is invalid or no metadata changed.
   *
   * Returns false when nothing happened.
   */
  updateProfile(): boolean {
    if (!this.formGroup.valid) {
      return false;
    }

    const newMetadata = cloneDeep(this.user.metadata);
    let changed = false;
    this.formModel.filter((fieldModel) => fieldModel.id !== 'email').forEach((fieldModel: DynamicFormValueControlModel<string>) => {
      if (newMetadata.hasOwnProperty(fieldModel.name) && newMetadata[fieldModel.name].length > 0) {
        if (hasValue(fieldModel.value)) {
          if (newMetadata[fieldModel.name][0].value !== fieldModel.value) {
            newMetadata[fieldModel.name][0].value = fieldModel.value;
            changed = true;
          }
        } else {
          newMetadata[fieldModel.name] = [];
          changed = true;
        }
      } else if (hasValue(fieldModel.value)) {
        newMetadata[fieldModel.name] = [{
          value: fieldModel.value,
          language: null
        } as any];
        changed = true;
      }
    });

    if (changed) {
      this.epersonService.update(Object.assign(cloneDeep(this.user), {metadata: newMetadata})).pipe(
        getFirstSucceededRemoteData(),
        getRemoteDataPayload()
      ).subscribe((user) => {
        this.user = user;
        this.setFormValues();
        this.notificationsService.success(
          this.translate.instant(this.NOTIFICATION_PREFIX + 'success.title'),
          this.translate.instant(this.NOTIFICATION_PREFIX + 'success.content')
        );
      });
    }

    return changed;
  }
}
