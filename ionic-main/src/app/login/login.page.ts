import { AlertController, IonicModule, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { App } from '@capacitor/app';
import { Usuario } from '../nucleo/models/usuario.model';
import { StorageService } from '../nucleo/services/storage-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [HttpClient, Storage, StorageService]
})
export class LoginPage implements OnInit {

  public instancia: { username: string, password: string} = {
    username: 'izabela',
    password: 'izasenha'
  };

  constructor(
    public controle_carregamento: LoadingController,
    public controle_navegacao: NavController,
    public controle_alerta: AlertController,
    public controle_toast: ToastController,
    public controle_menu: MenuController,
    public controle_armazenamento: StorageService,
    public http: HttpClient
  ) { 
    this.controle_menu.enable(false);
  }

  ngOnInit() { }

  async autenticarUsuario() {

    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Autenticando...', duration: 15000});
    await loading.present();

    // Define informações do cabeçalho da requisição
    let http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Autentica usuário junto a API do sistema web
    this.http.post(
      'http://localhost:8000/autenticacao-api/',
      this.instancia,
      {
        headers: http_headers
      }
    ).subscribe({
      next: async (resposta: any) => {

        // Armazena localmente as credenciais de usuário
        let usuario = Object.assign(new Usuario(), resposta);
        this.controle_armazenamento.set('usuario', usuario);

        // // Finaliza autenticação e redireciona para interface inicial
        loading.dismiss();
        this.controle_navegacao.navigateRoot('/home');
      },
      error: async (erro: any) => {
        loading.dismiss();
        const mensagem = await this.controle_toast.create({
          message: `Falha ao autenticar usuário: ${erro.message}`,
          cssClass: 'ion-text-center',
          duration: 2000
        });
        mensagem.present();
      }
    });
  }

  async fecharAplicativo() {
    const alerta = await this.controle_alerta.create({
      header: 'Fechar',
      message: 'Deseja finalizar o aplicativo?',
      buttons: [
        {
          text: 'Sim',
          handler: (evento) => {
            App.exitApp();
          }
        }, {
          text: 'Não',
          role: 'cancel',
          handler: () => { }
        }
      ]
    });
    await alerta.present();
  }
}