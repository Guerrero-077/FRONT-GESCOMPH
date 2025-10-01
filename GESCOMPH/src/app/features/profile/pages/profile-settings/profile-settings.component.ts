import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    ProfileFormComponent,
    ChangePasswordComponent
  ],
  templateUrl: './profile-settings.component.html',
  styleUrls: [],
  encapsulation: ViewEncapsulation.None
})
export class ProfileSettingsComponent {}
