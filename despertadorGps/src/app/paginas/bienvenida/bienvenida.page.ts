import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { Subscription, Observable } from 'rxjs';
import { DireccionService, Direccion } from 'src/app/servicios/direccion.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { UsuarioService } from 'src/app/servicios/usuario.service';
import { ToastController } from '@ionic/angular';




@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.page.html',
  styleUrls: ['./bienvenida.page.scss'],
})
export class BienvenidaPage implements OnInit {

  listaDireccionesUsuario:Direccion[];
  suscripcionGeolocalizacion:Subscription;
  suscripcionAlarma:Subscription;
  latitudActual:number;
  longitudActual:number;
  latitudDestino:number;
  longitudDestino:number;
  direccionIngresada:string;
  distanciaMinima:number;
  id_usuario:string;
  distanciaActual;
  direccionActual;
  alarmaActivada:boolean;
  alarmaSonando;
  sonidoAlarma;
  
  

  constructor(
    private geolocation: Geolocation,
    private nativeGeocoder: NativeGeocoder,
    private direccionService: DireccionService,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    private toastController:ToastController,
  
  ) {
    this.alarmaActivada = false;
    this.alarmaSonando = false;
   }

  ngOnInit() {

    this.listaDireccionesUsuario = [];

    this.direccionService.getDirecciones().subscribe( listaDirecciones => {

      console.log("Busco las direcciones");

      this.authService.devolverUserLogeado().subscribe( user => {

        this.listaDireccionesUsuario = [];

        for(let direccion of listaDirecciones) {

          console.log("Busco al usuario");
          this.id_usuario = user.uid;

          if(direccion.id_usuario == user.uid) {

            console.log("Busco el perfil");
            this.usuarioService.devolverPerfilUser(user.uid).then( perfil => {

              console.log("Coloco en la lista");
              console.log(perfil);

              direccion.perfil_usuario = perfil;

              this.listaDireccionesUsuario.push(direccion);
            });           
          }
        }
      })
    });


    this.suscripcionGeolocalizacion = this.observarPosicion().subscribe( geolocalizacion => {

      this.latitudActual = geolocalizacion.coords.latitude;
      this.longitudActual = geolocalizacion.coords.longitude;

      console.log(this.latitudActual);
      console.log(this.longitudActual);

    });

  

  }

  ngOnDestroy() {
    this.suscripcionGeolocalizacion.unsubscribe();
    
  }

  obtenerPosicionActual(){
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  observarPosicion() {
   return this.geolocation.watchPosition();

  }

  guardarDireccion() {

    if(this.direccionIngresada != '' && this.direccionIngresada != undefined && this.distanciaMinima != undefined) {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth()).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
  
      today = new Date(yyyy, +mm, +dd);
  
      let direccion = {
        id_usuario: this.id_usuario,
        fecha: today,
        direccion: this.direccionIngresada,
        distancia: this.distanciaMinima,
      }
  
      this.direccionService.agregarDireccion(direccion);
    }

    
  }

  async programarAlarma() {
    if(this.direccionIngresada != '' && this.direccionIngresada != undefined && this.distanciaMinima != undefined)
    {
      this.alarmaActivada= true;
      console.log(this.direccionIngresada);
      let direccionTransformada = await this.transformarDireccion(this.direccionIngresada);

      //Guardar la dirección transformada
      this.longitudDestino = +direccionTransformada[0].longitude;
      this.latitudDestino = +direccionTransformada[0].latitude;

      this.suscripcionAlarma =  this.calcularDistancia().subscribe( distancia => {

        this.distanciaActual = ((distancia - this.distanciaMinima) / 1000).toFixed(2); //en kilometros para mostrar
        console.log("Distancia:" + distancia);
        if(distancia < this.distanciaMinima && this.alarmaSonando == false) {
          console.log("Sonar alarma");
          this.alarmaSonando = true;
          
            this.sonidoAlarma = new Audio();
            this.sonidoAlarma.src = 'assets/audio/alarmaDespertador.mp3'
            this.sonidoAlarma.loop = true;
            this.sonidoAlarma.load();
            this.sonidoAlarma.play()

            setTimeout( () => {
              this.sonidoAlarma.pause();
              this.cancelarAlarma();
            }, 1000 * 8);
          
        }
      })

    } else {
      this.mostrarToast("No ingresó todos los datos");
    }
    
  }

  ///Calcula la distancia entre los dos puntos cada segundo
  calcularDistancia():Observable<number> {
    
    return new Observable( (observer) => {
      
      let distancia;
      setInterval( () => {

          //sacar distancia entre dos puntos
        distancia = this.distanceInKmBetweenEarthCoordinates(this.latitudActual, this.longitudActual,
          this.latitudDestino, this.longitudDestino) * 1000;

        this.devolverDireccionActual().then(resultado => {
          this.direccionActual = resultado[0].thoroughfare + ' ' + resultado[0].subThoroughfare;
        })

        console.log(distancia);

        observer.next(distancia);   

      }, 1000 * 5);
     
      
    });
  }

  degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }
  
  distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;
  
    var dLat = this.degreesToRadians(lat2-lat1);
    var dLon = this.degreesToRadians(lon2-lon1);
  
    lat1 = this.degreesToRadians(lat1);
    lat2 = this.degreesToRadians(lat2);
  
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return earthRadiusKm * c;
  }

  ///Transforma la dirección que pasa el usuario como input
  transformarDireccion(direccion:string):Promise<NativeGeocoderResult[]> {

    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };
  
    return this.nativeGeocoder.forwardGeocode(direccion, options);
  
  }

  devolverDireccionActual() {
    return this.nativeGeocoder.reverseGeocode(this.latitudActual, this.longitudActual);
  }

  cancelarAlarma() {

    this.suscripcionAlarma.unsubscribe();
    this.alarmaActivada = false;
    this.direccionIngresada= "";
    this.distanciaMinima= undefined;
    this.sonidoAlarma.pause();

  }

  async mostrarToast(mensaje:string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000
    });

    toast.present();
  }

  
 

}
