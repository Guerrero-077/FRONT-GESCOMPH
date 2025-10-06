import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  EstablishmentCreate,
  EstablishmentSelect,
  EstablishmentUpdate,
  ImageSelectDto
} from '../models/establishment.models';
import { EstablishmentStore } from '../services/establishment/establishment.store';
import { ImageService } from '../services/image/image.service';
import { SquareStore } from '../services/square/square.store';
import { SweetAlertService } from '../../../shared/Services/sweet-alert/sweet-alert.service';

@Injectable({ providedIn: 'root' })
export class EstablishmentFormFacade {
  private readonly estStore = inject(EstablishmentStore);
  private readonly imageSvc = inject(ImageService);
  private readonly squareStore = inject(SquareStore);
  private readonly sweetAlert = inject(SweetAlertService);

  readonly busy = signal(false);
  readonly deletingImage = signal(false);
  readonly selectedFiles = signal<File[]>([]);
  readonly previews = signal<string[]>([]);
  readonly existingImages = signal<ImageSelectDto[]>([]);
  readonly squares = this.squareStore.items;

  readonly totalImages = computed(
    () => this.selectedFiles().length + this.existingImages().length
  );

  async init(editData?: EstablishmentSelect): Promise<void> {
    if (!this.squareStore.items().length) await this.squareStore.loadAll();
    if (editData?.images?.length) this.existingImages.set(editData.images);
  }

  addFiles(files: File[]): void {
    const curFiles = [...this.selectedFiles()];
    const curPrev = [...this.previews()];
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        this.sweetAlert.showNotification('Formato inválido', 'Solo imágenes', 'error');
        continue;
      }
      const url = URL.createObjectURL(file);
      curFiles.push(file);
      curPrev.push(url);
    }
    this.selectedFiles.set(curFiles);
    this.previews.set(curPrev);
  }

  removeLocal(i: number): void {
    const f = [...this.selectedFiles()];
    const p = [...this.previews()];
    const url = p[i];
    if (url) URL.revokeObjectURL(url);
    f.splice(i, 1);
    p.splice(i, 1);
    this.selectedFiles.set(f);
    this.previews.set(p);
  }

  async removeExisting(i: number): Promise<void> {
    const img = this.existingImages()[i];
    if (!img) return;
    this.deletingImage.set(true);
    try {
      await firstValueFrom(this.imageSvc.deleteImageById(img.id));
      this.existingImages.set(this.existingImages().filter((_, idx) => idx !== i));
      this.sweetAlert.showNotification('Éxito', 'Imagen eliminada', 'success');
    } catch (e) {
      this.sweetAlert.showApiError(e, 'No se pudo eliminar');
    } finally {
      this.deletingImage.set(false);
    }
  }

  async save(dto: EstablishmentCreate | EstablishmentUpdate, isEdit: boolean, id?: number): Promise<boolean> {
    this.busy.set(true);
    try {
      let estId = id ?? 0;
      if (isEdit && id) {
        await this.estStore.update({ ...dto, id });
        estId = id;
      } else {
        await this.estStore.create(dto as EstablishmentCreate);
        const created = this.estStore.items().find(e => e.name === dto.name);
        if (created) estId = created.id;
      }

      const files = this.selectedFiles();
      if (files.length) {
        const uploaded = await firstValueFrom(this.imageSvc.uploadImages(estId, files));
        this.estStore.applyImages(estId, uploaded);
      }

      this.sweetAlert.showNotification('Éxito', 'Guardado correctamente', 'success');
      return true;
    } catch (e) {
      this.sweetAlert.showApiError(e, 'No se pudo guardar');
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  cleanup(): void {
    for (const url of this.previews()) URL.revokeObjectURL(url);
    this.selectedFiles.set([]);
    this.previews.set([]);
  }
}