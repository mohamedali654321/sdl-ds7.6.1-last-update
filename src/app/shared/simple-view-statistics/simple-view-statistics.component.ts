import { Component, Input } from '@angular/core';
import {
  HttpHeaders,
  HttpClient,
  HttpResponse
} from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Item } from 'src/app/core/shared/item.model';
import { BehaviorSubject } from 'rxjs';
import { RelationshipDataService } from 'src/app/core/data/relationship-data.service';
import { FindListOptions } from 'src/app/core/data/find-list-options.model';
import { getFirstSucceededRemoteDataPayload } from 'src/app/core/shared/operators';
@Component({
  selector: 'ds-simple-view-statistics',
  templateUrl: './simple-view-statistics.component.html',
  styleUrls: ['./simple-view-statistics.component.scss']
})
export class SimpleViewStatisticsComponent {

  @Input() object: Item;
  options = new FindListOptions();
  TotalVisits = new BehaviorSubject<number>(0);
  TotalDownloads = new BehaviorSubject<number>(0);
  constructor(private httpClient: HttpClient,public relationshipService: RelationshipDataService,){}

  ngOnInit(): void {
    if(this.object.firstMetadataValue('dspace.entity.type') === 'JournalIssue'){
      this.relationshipService.getRelatedItemsByLabel(this.object ,'isPublicationOfJournalIssue', Object.assign(this.options,
        { elementsPerPage: -1, currentPage: 1, fetchThumbnail: false })).pipe(getFirstSucceededRemoteDataPayload()).subscribe(res=>{
          res.page.forEach(item=>{
            this.getStatisticsOfJournal(item.uuid).then(statistic=>{
              statistic.subscribe(res=>{
               res._embedded.usagereports.filter(visit=>{visit['report-type'] == 'TotalVisits' ? this.TotalVisits.next(this.TotalVisits.getValue()+visit.points[0].values.views)  : null})
               res._embedded.usagereports.filter(download=>{download['report-type'] == 'TotalDownloads' ? download.points.forEach(values=>{
                this.TotalDownloads.next(this.TotalDownloads.getValue()+values.values.views );
               }) : null})
        
              })
             })
          })
        })

    }
    else if (this.object.firstMetadataValue('dspace.entity.type') === 'JournalVolume'){
      this.relationshipService.getRelatedItemsByLabel(this.object ,'isIssueOfJournalVolume', Object.assign(this.options,
        { elementsPerPage: -1, currentPage: 1, fetchThumbnail: false })).pipe(getFirstSucceededRemoteDataPayload()).subscribe((data) => {
          data.page.forEach((issue)=>{

            this.relationshipService.getRelatedItemsByLabel(issue ,'isPublicationOfJournalIssue', Object.assign(this.options,
              { elementsPerPage: -1, currentPage: 1, fetchThumbnail: false })).pipe(getFirstSucceededRemoteDataPayload()).subscribe(res=>{
                res.page.forEach(item=>{
                  this.getStatisticsOfJournal(item.uuid).then(statistic=>{
                    statistic.subscribe(res=>{
                     res._embedded.usagereports.filter(visit=>{visit['report-type'] == 'TotalVisits' ? this.TotalVisits.next(this.TotalVisits.getValue()+visit.points[0].values.views)  : null})
                     res._embedded.usagereports.filter(download=>{download['report-type'] == 'TotalDownloads' ? download.points.forEach(values=>{
                      this.TotalDownloads.next(this.TotalDownloads.getValue()+values.values.views );
                     }) : null})
              
                    })
                   })
                })
              })

          })
        })

    }
    else if(this.object.firstMetadataValue('dspace.entity.type') === 'Journal'){
      this.relationshipService.getRelatedItemsByLabel(this.object ,'isVolumeOfJournal', Object.assign(this.options,
        { elementsPerPage: -1, currentPage: 1, fetchThumbnail: false })).pipe(getFirstSucceededRemoteDataPayload()).subscribe((journal) => {
          journal.page.forEach((volume) => {
            this.relationshipService.getRelatedItemsByLabel(volume ,'isIssueOfJournalVolume', Object.assign(this.options,
              { elementsPerPage: -1, currentPage: 1, fetchThumbnail: false })).pipe(getFirstSucceededRemoteDataPayload()).subscribe((data) => {
                data.page.forEach((issue)=>{
      
                  this.relationshipService.getRelatedItemsByLabel(issue ,'isPublicationOfJournalIssue', Object.assign(this.options,
                    { elementsPerPage: -1, currentPage: 1, fetchThumbnail: false })).pipe(getFirstSucceededRemoteDataPayload()).subscribe(res=>{
                      res.page.forEach(item=>{
                        this.getStatisticsOfJournal(item.uuid).then(statistic=>{
                          statistic.subscribe(res=>{
                           res._embedded.usagereports.filter(visit=>{visit['report-type'] == 'TotalVisits' ? this.TotalVisits.next(this.TotalVisits.getValue()+visit.points[0].values.views)  : null})
                           res._embedded.usagereports.filter(download=>{download['report-type'] == 'TotalDownloads' ? download.points.forEach(values=>{
                            this.TotalDownloads.next(this.TotalDownloads.getValue()+values.values.views );
                           }) : null})
                    
                          })
                         })
                      })
                    })
      
                })
              })
      

          })

        })

    }
    else{
      this.getStatistics().then(statistic=>{
        statistic.subscribe(res=>{
         res._embedded.usagereports.filter(visit=>{visit['report-type'] == 'TotalVisits' ? this.TotalVisits.next(visit.points[0].values.views)  : null})
         res._embedded.usagereports.filter(download=>{download['report-type'] == 'TotalDownloads' ? download.points.forEach(values=>{
          this.TotalDownloads.next(this.TotalDownloads.getValue()+values.values.views );
         }) : null})
  
        })
       })
    }


  }
  async getStatistics(): Promise<any>{
    const  data= await this.httpClient.get(`${environment.rest.baseUrl}/api/statistics/usagereports/search/object?uri=${environment.rest.baseUrl}/api/core/item/${this.object.uuid}`);
     return await data;
   }

   async getStatisticsOfJournal(itemId:string): Promise<any>{
    const  data= await this.httpClient.get(`${environment.rest.baseUrl}/api/statistics/usagereports/search/object?uri=${environment.rest.baseUrl}/api/core/item/${itemId}`);
     return await data;
   }

}
