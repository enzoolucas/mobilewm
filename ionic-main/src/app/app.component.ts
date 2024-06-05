import { App } from '@capacitor/app';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AlertController, IonicModule, NavController } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterLink],
})
export class AppComponent {
  
  public paginas_menu = [
    { title: 'Início', url: '/home', icon: 'home-outline' },
    { title: 'Cadastrar veículo', url: '/cadastrar-veiculo', icon: 'add' },
  ];
  
  constructor(
    private controle_alerta: AlertController,
    private controle_navegacao: NavController,
  ) {}

  async fecharAplicativo() {
    const alerta = await this.controle_alerta.create({
      header: 'Fechar',
      message: 'Deseja finalizar o aplicativo?',
      buttons: [
        {
          text: 'Sim',
          handler: (resultado) => {
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

  public efetuarLogoff(): void {
    // this.storage_service.remove('ultimo_usuario');
    this.controle_navegacao.navigateRoot('/login');
  }
}