import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DSpaceObjectDataService } from 'src/app/core/data/dspace-object-data.service';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';

@Component({
  selector: 'ds-publictaion-count',
  templateUrl: './publictaion-count.component.html',
  styleUrls: ['./publictaion-count.component.scss'],
})
export class PublictaionCountComponent {
  @Input() dso: DSpaceObject;
  publicationRelation = [];
  // data = new BehaviorSubject<any[]>([]);
  data = new BehaviorSubject<any[]>([]);
  issueRelation = new BehaviorSubject<any[]>([]);
  issuesIds = [];
  countLength = new BehaviorSubject<number>(0);
  constructor(
    protected dsoService: DSpaceObjectDataService // publication counter
  ) {}
  
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    if (
      this.dso.firstMetadataValue('dspace.entity.type') === 'Journal' &&
      this.dso.allMetadataValues('relation.isVolumeOfJournal').length > 0
    ) {
      let itemIds = this.dso.allMetadataValues('relation.isVolumeOfJournal');
      itemIds.forEach((itemId) => {
        this.dsoService.findById(itemId).subscribe((res) => {
          res?.payload?.metadataAsList.filter((md) => {
            md &&
            md.key?.includes('relation.isIssueOfJournalVolume') &&
            !md.key?.includes('latestForDiscovery')
              ? this.dsoService.findById(md.value).subscribe(res=>{
                res?.payload?.metadataAsList.filter((metadata)=>{
                  metadata &&
                  metadata.key?.includes('relation.isPublicationOfJournalIssue') &&
              !metadata.key?.includes('latestForDiscovery')
                ? this.data.next(this.data.getValue().concat([metadata.uuid]))
                : null;
                })
              })
              : null;
          });
        });

        
      });

    } else if (
      this.dso.firstMetadataValue('dspace.entity.type') === 'JournalVolume' &&
      this.dso.allMetadataValues('relation.isIssueOfJournalVolume').length > 0
    ) {
      let itemIds = this.dso.allMetadataValues(
        'relation.isIssueOfJournalVolume'
      );
      itemIds.forEach((itemId) => {
        this.dsoService.findById(itemId).subscribe((res) => {
          res?.payload?.metadataAsList.filter((md) => {
            md &&
            md.key?.includes('relation.isPublicationOfJournalIssue') &&
            !md.key?.includes('latestForDiscovery')
              ? this.data.next(this.data.getValue().concat([md.uuid]))
              : null;
          });
        });
      });
    } 
    else if (this.dso.firstMetadataValue('dspace.entity.type') === 'Person') {
      this.dso.metadataAsList.filter((md) => {
        md &&
        (md.key?.includes(
          'relation.isPublicationOf' +
            this.dso.firstMetadataValue('dspace.entity.type')
        ) ||         
          md.key?.includes('relation.isPublicationOf')) &&
        !md.key?.includes('latestForDiscovery')
          ? this.data.next(this.data.getValue().concat([md.uuid]))
          : null;
      });
    } 
    else {
      this.dso.metadataAsList.filter((md) => {
        md &&
        (md.key?.includes(
          'relation.isPublicationOf' +
            this.dso.firstMetadataValue('dspace.entity.type')
        ) ||         
          md.key?.includes('relation.isPublicationOf')) &&
        !md.key?.includes('latestForDiscovery')
          ? this.data.next(this.data.getValue().concat([md.uuid]))
          : null;
      });
    }
    
    this.data.subscribe((res) => {
      this.publicationRelation= this.removeDuplicates(res);
      this.countLength.next(this.publicationRelation.length) ;
    });
  }
  removeDuplicates(arr) {
    return arr.filter((item,
        index) => arr.indexOf(item) === index);
}
  
}
