import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, LoadingController, MenuController, NavController, ToastController } from '@ionic/angular';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Veiculo } from '../home/veiculo.model';
import { Storage } from '@ionic/storage';
import { StorageService } from '../nucleo/services/storage-service';
import { Usuario } from '../nucleo/models/usuario.model';

@Component({
  selector: 'app-cadastrar-veiculo',
  templateUrl: './cadastrar-veiculo.page.html',
  styleUrls: ['./cadastrar-veiculo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule],
  providers: [HttpClient, Storage, StorageService]
})
export class CadastrarVeiculoPage implements OnInit {

  public usuario: Usuario = new Usuario();
  public instancia: Veiculo = new Veiculo();

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
    }
    else{
      this.controle_navegacao.navigateRoot('/login');
    }
  }

  async enviarVeiculo() {
   
    // Inicializa interface com efeito de carregamento
    const loading = await this.controle_carregamento.create({message: 'Enviando...', duration: 15000});
    await loading.present();

    // Define informações do cabeçalho da requisição
    let http_headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization':`Token ${this.usuario.token}`
    });

    // Envia instância para a API do sistema web
    this.http.post(
      'http://127.0.0.1:8000/veiculo/api/',
      this.instancia,
      {
        headers: http_headers
      }
    ).subscribe({
      next: async (resposta: any) => {

        // Finaliza o efeito de carregamento e redireciona para interface inicial
        loading.dismiss();
        this.controle_navegacao.navigateRoot('/home');
      },
      error: async (erro: any) => {
        loading.dismiss();
        this.apresentaMensagem(`Falha ao cadastrar veículo: ${erro.message}`);
      }
    });
  }

  public adicionarFoto(): void {
    Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 100
    }).then((imagem: Photo) => {
      this.instancia.foto = imagem.dataUrl;
    }).catch((erro: any) => {
      this.apresentaMensagem(`Nenhuma imagem foi capturada`);
    });
  }

  async apresentaMensagem(mensagem: string) {
    const toast = await this.controle_toast.create({
      message: mensagem,
      duration: 2000
    });
    toast.present();
  }

  public isFormularioValido(): boolean {
    return this.instancia.marca != 0 &&
           this.instancia.modelo != '' &&
           this.instancia.ano != 0 &&
           this.instancia.cor != 0 &&
           this.instancia.combustivel != 0;
  }
}
