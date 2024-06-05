import { Storage } from '@ionic/storage';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { IonicModule, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';

import { Veiculo } from './veiculo.model';
import { Usuario } from '../nucleo/models/usuario.model';
import { StorageService } from '../nucleo/services/storage-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
  providers: [HttpClient, Storage, StorageService]
})
export class HomePage implements OnInit {

  public usuario: Usuario = new Usuario();
  public lista_veiculos: Veiculo[] = [];

  constructor(
    public http: HttpClient,
    public controle_menu: MenuController,
    public controle_toast: ToastController,
    public controle_navegacao: NavController,
    public controle_armazenamento: StorageService,
    public controle_carregamento: LoadingController
  ) {
    this.controle_menu.enable(true);
  }

  async ngOnInit() {
    
    // Verifica se existe registro de configuração para o último usuário autenticado
    const registro = await this.controle_armazenamento.get('usuario');
    if(registro) {
      this.usuario = Object.assign(new Usuario(), registro);
      this.consultarVeiculosSistemaWeb();
    }
    else{
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  async consultarVeiculosSistemaWeb() {

    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Autenticando...', duration: 15000});
    await loading.present();

    let http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Token ${this.usuario.token}`
    });

    // Requisita lista de veículos para a API do sistema web
    this.http.get(
      'http://127.0.0.1:8000/veiculo/api/',
      {
        headers: http_headers
      }
    ).subscribe({
      next: async (resposta: any) => {

        this.lista_veiculos = resposta;
        
        // Finaliza interface com efeito de carregamento
        loading.dismiss();
      },
      error: async (erro: any) => {
        loading.dismiss();
        const mensagem = await this.controle_toast.create({
          message: `Falha ao consultar veículos: ${erro.message}`,
          cssClass: 'ion-text-center',
          duration: 2000
        });
        mensagem.present();
      }
    });
  }

  async excluirVeiculo(id: number) {

    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Autenticando...', duration: 15000});
    await loading.present();

    let http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Token ${this.usuario.token}`
    });

    // Deleta instância de veículo via API do sistema web
    this.http.delete(
      `http://127.0.0.1:8000/veiculo/api/${id}/`,
      {
        headers: http_headers
      }
    ).subscribe({
      next: async (resposta: any) => {

        this.consultarVeiculosSistemaWeb();

        // Finaliza interface com efeito de carregamento
        loading.dismiss();
      },
      error: async (erro: any) => {
        loading.dismiss();
        const mensagem = await this.controle_toast.create({
          message: `Falha ao excluir o veículo: ${erro.message}`,
          cssClass: 'ion-text-center',
          duration: 2000
        });
        mensagem.present();
      }
    });
  }
}