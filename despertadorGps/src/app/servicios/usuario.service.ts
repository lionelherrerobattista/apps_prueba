import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Usuario {
  correo:string,
  perfil:string,
  sexo:string,
  uid:string
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  coleccionUsuarios: AngularFirestoreCollection<Usuario>;
  listaUsuarios: Observable<any[]>;
  nombreUsuario:string;

  constructor(
    public afs: AngularFirestore,
    private authService:AuthService
  ) {
      //Me conecto a la colección de la base de datos
      this.coleccionUsuarios = this.afs.collection('usuariosApp');
      
      //Guardo el documento de los usuarios, el pipe es para tener el id
      this.listaUsuarios = this.coleccionUsuarios.snapshotChanges().pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
    }

    getUsuarios(): Observable<Usuario[]> {
      return this.listaUsuarios;
    }
  
    ///Devuelve el perfil del usuario
    getUsuario(uid: string): Observable<Usuario> {
      return this.coleccionUsuarios.doc<Usuario>(uid).valueChanges().pipe(
        take(1),
        map(usuario => {
          usuario.uid = uid;
          return usuario
        })
      );
    }

    devolverPerfilUser(uid:string): Promise<string> {

      return  new Promise((resolve, reject) => {
        this.getUsuarios().subscribe(listaUsuarios => {

          let encontroUsuario = false;
          let usuario:Usuario;

          for(usuario of listaUsuarios) {

            if(usuario.uid == uid) {
              encontroUsuario = true;
              break;
            }
          }

          if(encontroUsuario) {
            resolve(usuario.perfil);
          } else {
            reject("No encontró el usuario");
          }
        });
      });
    }
}
