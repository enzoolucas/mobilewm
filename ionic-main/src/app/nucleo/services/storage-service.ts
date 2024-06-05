import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable()
export class StorageService {

  constructor(public storage: Storage) {
    this.init();
  }

  async init() {
    await this.storage.create();
  }

  public get(chave: string): any {
    return this.storage?.get(chave);
  }

  public set(chave: string, valor: any) {
    this.storage?.set(chave, valor);
  }

  public remove(chave: string) {
    this.storage?.remove(chave);
  }
}