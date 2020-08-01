import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/servicios/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email:string;
  password:string;

  constructor(
    private authService:AuthService,
    public router: Router,
    private toastController:ToastController,
  ) {}

  ngOnInit() {

  }

  onIniciarSesion() {
    
    //Llamar al servicio de login:
    this.authService.login(this.email, this.password).then( respuesta => {
      this.router.navigate(['/bienvenida']); //Promise resolve
    }).catch(error => this.mostrarToast('Datos incorrectos')); //Promise rejected
  }

  completarUsuario (tipoUsuario:string) {
    switch(tipoUsuario)
    {
      case 'admin':
        this.email = "admin@admin.com";
        this.password = "111111";
        break;
      case 'invitado':
        this.email = "invitado@invitado.com";
        this.password = "222222";
        break;
      case 'usuario':
        this.email = "usuario@usuario.com";
        this.password = "333333";
        break;
      case 'anonimo':
        this.email = "anonimo@anonimo.com";
        this.password = "444444";
        break;
      case 'tester':
        this.email = "tester@tester.com";
        this.password = "555555";
        break;
    }
    
  }

  Limpiar() {

    //Bindeo
    this.email = "";
    this.password = "";

  }

  
  async mostrarToast(mensaje:string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });

    toast.present();
  }



}
