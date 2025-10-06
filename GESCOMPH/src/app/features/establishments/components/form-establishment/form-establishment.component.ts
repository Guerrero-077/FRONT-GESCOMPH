import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  inject
} from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormErrorComponent } from '../../../../shared/components/form-error/form-error.component';
import { StandardButtonComponent } from '../../../../shared/components/standard-button/standard-button.component';
import { FileDropDirective } from '../../../../shared/directives/file-drop.directive';
import { AppValidators } from '../../../../shared/utils/AppValidators';
import { EstablishmentFormFacade } from '../../facades/establishment-form.facade';
import { EstablishmentCreate, EstablishmentSelect } from '../../models/establishment.models';

@Component({
  selector: 'app-form-establishment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,
    FileDropDirective,
    FormErrorComponent,
    StandardButtonComponent
  ],
  templateUrl: './form-establishment.component.html',
  styleUrls: ['./form-establishment.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormEstablishmentComponent implements OnInit, OnDestroy {

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<FormEstablishmentComponent, boolean>);
  private readonly dialog = inject(MatDialog);
  public readonly facade = inject(EstablishmentFormFacade);

  readonly generalGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100), AppValidators.notOnlySpaces()]],
    description: ['', [Validators.required, Validators.maxLength(500), AppValidators.notOnlySpaces()]],
    uvtQty: [0, [Validators.required, AppValidators.numberRange({ min: 1, max: 9999 })]],
    areaM2: [0, [Validators.required, AppValidators.numberRange({ min: 1, max: 1_000_000 })]]
  });

  readonly ubicacionGroup = this.fb.group({
    plazaId: [0, [Validators.required]],
    address: ['', [Validators.maxLength(150), AppValidators.address()]]
  });

  readonly busy = this.facade.busy;
  readonly deletingImage = this.facade.deletingImage;
  readonly previews = this.facade.previews;
  readonly existingImages = this.facade.existingImages;
  readonly squares = this.facade.squares;

  isEdit = false;
  editId?: number;

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) private data?: EstablishmentSelect) {
    this.isEdit = !!data?.id;
    this.editId = data?.id;
  }

  async ngOnInit(): Promise<void> {
    await this.facade.init(this.data);
    if (this.data) {
      this.generalGroup.patchValue({
        name: this.data.name,
        description: this.data.description,
        uvtQty: this.data.uvtQty,
        areaM2: this.data.areaM2
      });
      this.ubicacionGroup.patchValue({
        plazaId: this.data.plazaId,
        address: this.data.address
      });
    }
  }

  ngOnDestroy(): void {
    this.facade.cleanup();
  }

  // ==========================================================
  // 📁 Archivos (input + dropzone)
  // ==========================================================
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.facade.addFiles(Array.from(input.files));
  }

  removeExisting(i: number) {
    this.facade.removeExisting(i);
  }

  removeLocal(i: number) {
    this.facade.removeLocal(i);
  }

  // ==========================================================
  // 🧩 Form normalizers (reusables para blur)
  // ==========================================================
  onTrim(control: AbstractControl | null) {
    if (!control) return;
    const v = (control.value ?? '') as string;
    const trimmed = v.trim().replace(/\s+/g, ' ');
    if (trimmed !== v) control.setValue(trimmed);
  }

  onNumberBlur(control: AbstractControl | null) {
    if (!control) return;
    const v = control.value;
    if (v === null || v === undefined || v === '') return;
    const s = String(v).replace(',', '.');
    const n = Number(s);
    if (!Number.isNaN(n)) control.setValue(n, { emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
  }

  // ==========================================================
  // 🖼️ Previsualización de imágenes (lazy import)
  // ==========================================================
  openPreviewFromExisting(index: number): void {
    if (index < 0 || index >= this.existingImages().length) return;
    this.openPreview('Imagen existente', index);
  }

  openPreviewFromNew(index: number): void {
    if (index < 0 || index >= this.previews().length) return;
    const offsetExisting = this.existingImages()?.length ?? 0;
    this.openPreview('Imagen nueva', offsetExisting + index);
  }

  private openPreview(title: string, startIndex: number): void {
    import('../image-preview-dialog-component/image-preview-dialog-component.component').then(m => {
      this.dialog.open(m.ImagePreviewDialogComponent, {
        data: {
          title,
          imageList: [
            ...this.existingImages().map(i => i.filePath),
            ...this.previews()
          ],
          startIndex
        },
        panelClass: 'image-preview-dialog',
        maxWidth: '95vw',
        width: 'auto',
        autoFocus: false
      });
    });
  }

  // ==========================================================
  // 💾 Guardado final
  // ==========================================================
  async onSubmit(): Promise<void> {
    if (this.generalGroup.invalid || this.ubicacionGroup.invalid) {
      this.generalGroup.markAllAsTouched();
      this.ubicacionGroup.markAllAsTouched();
      return;
    }

    const dto: EstablishmentCreate = {
      ...this.generalGroup.getRawValue(),
      ...this.ubicacionGroup.getRawValue()
    };

    const ok = await this.facade.save(dto, this.isEdit, this.editId);
    if (ok) this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  trackByIndex(i: number) {
    return i;
  }
}
