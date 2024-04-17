import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuService } from '../shared/menu/menu.service';
import { MenuID } from '../shared/menu/menu-id.model';
import { HostWindowService } from '../shared/host-window.service';
import { LocaleService } from '../core/locale/locale.service';
import { HostListener } from '@angular/core';
/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
})
export class HeaderComponent implements OnInit {
  handleScroll = new BehaviorSubject<boolean>(false);
  topPosToStartShowing = 50;
  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;
  public isXsOrSm$: Observable<boolean>;
  menuID = MenuID.PUBLIC;

  constructor(
    protected menuService: MenuService,
    protected windowService: HostWindowService,
    public localeService: LocaleService , /* kware edit - call service from LocaleService */
  ) {
  }

  ngOnInit(): void {
    this.isXsOrSm$ = this.windowService.isXsOrSm();
    this.checkScroll();
  }

  public toggleNavbar(): void {
    this.menuService.toggleMenu(this.menuID);
  }

  @HostListener('window:scroll')
  checkScroll(){
    const scrollPosition =
    window.pageYOffset ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;

    if (scrollPosition > this.topPosToStartShowing) {
      this.handleScroll.next(true);    }
    else {
      this.handleScroll.next(false)
    }
  }
}
