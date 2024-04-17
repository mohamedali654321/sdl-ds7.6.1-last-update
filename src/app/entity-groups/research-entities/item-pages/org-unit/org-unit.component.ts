import { Component } from '@angular/core';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { ItemComponent } from '../../../../item-page/simple/item-types/shared/item.component';
import { getItemPageRoute } from 'src/app/item-page/item-page-routing-paths';
@listableObjectComponent('OrgUnit', ViewMode.StandalonePage)
@Component({
  selector: 'ds-org-unit',
  styleUrls: ['./org-unit.component.scss'],
  templateUrl: './org-unit.component.html'
})
/**
 * The component for displaying metadata and relations of an item of the type Organisation Unit
 */
export class OrgUnitComponent extends ItemComponent {

  relatedItems;


  getRelatedItems($event: any){
    this.relatedItems=$event;    
  }

  ngOnInit(): void {
    
  }

  getItemPageRoute(object :any) :any{
    return getItemPageRoute(object)+ '/full';
   }
}
