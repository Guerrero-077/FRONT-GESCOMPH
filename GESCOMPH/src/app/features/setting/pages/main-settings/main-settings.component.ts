import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { PageHeaderService } from '../../../../shared/Services/PageHeader/page-header.service';
import { HasRoleAndPermissionDirective } from '../../../../shared/directives/roles-permission/HasRoleAndPermission.directive';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-main-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    HasRoleAndPermissionDirective,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './main-settings.component.html',
  styleUrl: './main-settings.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class MainSettingsComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);

  ngOnInit(): void {
    this.pageHeaderService.setPageHeader('Configuración', 'Seleccione el área que desea configurar');
  }
}

